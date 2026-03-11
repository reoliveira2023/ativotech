'use client';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { QrCode, Search, Package, CheckCircle, AlertTriangle, Camera, X } from 'lucide-react';

const STATUS_LABELS: any = {
  DISPONIVEL: { l: 'Disponível', b: 'badge-green' },
  EM_USO: { l: 'Em Uso', b: 'badge-blue' },
  MANUTENCAO: { l: 'Manutenção', b: 'badge-yellow' },
  ESTOQUE: { l: 'Estoque', b: 'badge-gray' },
  DESCARTADO: { l: 'Descartado', b: 'badge-red' },
};

export default function ScannerPage() {
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef<any>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const buscar = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);
    try {
      const { data } = await api.get(`/ativos/scanner/${encodeURIComponent(code.trim())}`);
      if (data) setResult(data);
      else setNotFound(true);
    } catch {
      setNotFound(true);
    } finally { setLoading(false); }
  };

  const startScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (!divRef.current) return;

      setScannerActive(true);
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          stopScanner();
          setManualCode(decodedText);
          buscar(decodedText);
        },
        () => {}
      );
    } catch (e) {
      console.error('Scanner error:', e);
      setScannerActive(false);
      alert('Não foi possível acessar a câmera. Use o campo manual.');
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
    } catch {}
    setScannerActive(false);
  };

  useEffect(() => () => { stopScanner(); }, []);

  return (
    <AppLayout>
      <div className="p-6 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Scanner</h1>
          <p className="text-slate-500 text-sm">Escanear QR Code ou código de barras</p>
        </div>

        {/* Scanner area */}
        <div className="card p-5 mb-5">
          {!scannerActive ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-10 h-10 text-indigo-600" />
              </div>
              <p className="text-slate-600 font-medium mb-2">Escaneie um código</p>
              <p className="text-slate-400 text-sm mb-5">Use a câmera para ler QR Code ou código de barras</p>
              <button onClick={startScanner} className="btn-primary mx-auto">
                <Camera className="w-4 h-4" /> Abrir câmera
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700">Aponte para o código...</p>
                <button onClick={stopScanner} className="btn-secondary py-1 px-3 text-xs">
                  <X className="w-3 h-3" /> Fechar
                </button>
              </div>
              <div id="qr-reader" ref={divRef} className="rounded-xl overflow-hidden" />
            </div>
          )}
        </div>

        {/* Manual search */}
        <div className="card p-5 mb-5">
          <p className="text-sm font-semibold text-slate-700 mb-3">Busca manual</p>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Digite o código de barras ou número de série..."
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscar(manualCode)}
            />
            <button onClick={() => buscar(manualCode)} disabled={loading || !manualCode} className="btn-primary px-4">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="card p-8 text-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Buscando ativo...</p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="card p-5 border-l-4 border-l-emerald-500">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl">
                {result.categoria?.icone || '📦'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-semibold">ATIVO ENCONTRADO</span>
                </div>
                <h2 className="font-bold text-slate-900 mt-0.5">{result.nome}</h2>
                {result.fabricante && <p className="text-sm text-slate-500">{result.fabricante} {result.modelo}</p>}
              </div>
              <span className={`badge ${STATUS_LABELS[result.status]?.b || 'badge-gray'}`}>
                {STATUS_LABELS[result.status]?.l}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ['Categoria', result.categoria?.nome],
                ['Departamento', result.departamento?.nome],
                ['Localização', result.localizacao?.nome],
                ['Responsável', result.responsavel?.nome],
                ['Nº Série', result.numeroSerie],
                ['Código', result.codigoBarras],
              ].filter(([, v]) => v).map(([l, v]) => (
                <div key={l} className="bg-slate-50 rounded-lg p-2">
                  <p className="text-xs text-slate-400">{l}</p>
                  <p className="font-medium text-slate-700 truncate">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Not found */}
        {notFound && !loading && (
          <div className="card p-8 text-center border-l-4 border-l-amber-400">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Ativo não encontrado</p>
            <p className="text-sm text-slate-400 mt-1">Código: <code className="bg-slate-100 px-2 py-0.5 rounded font-mono">{manualCode}</code></p>
            <a href="/ativos" className="btn-primary mt-4 inline-flex mx-auto text-sm">
              <Package className="w-4 h-4" /> Cadastrar novo ativo
            </a>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
