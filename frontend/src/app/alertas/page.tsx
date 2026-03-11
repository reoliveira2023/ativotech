'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { Bell, BellOff, CheckCheck, AlertTriangle, ShieldAlert, ClipboardX, Wrench, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIPO_CONFIG: any = {
  GARANTIA_VENCENDO: { label: 'Garantia Vencendo', icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50', badge: 'badge-yellow' },
  SEM_RESPONSAVEL: { label: 'Sem Responsável', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', badge: 'badge-yellow' },
  SEM_INVENTARIO: { label: 'Sem Inventário', icon: ClipboardX, color: 'text-red-600', bg: 'bg-red-50', badge: 'badge-red' },
  MANUTENCAO: { label: 'Manutenção', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50', badge: 'badge-blue' },
};

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/alertas'); setAlertas(data); }
    finally { setLoading(false); }
  };

  const gerar = async () => {
    setGenerating(true);
    try { await api.post('/alertas/gerar'); load(); }
    finally { setGenerating(false); }
  };

  const marcarLido = async (id: string) => {
    await api.put(`/alertas/${id}/lido`);
    load();
  };

  const marcarTodos = async () => {
    await api.put('/alertas/todos/lidos');
    load();
  };

  useEffect(() => { load(); }, []);

  const naoLidos = alertas.filter(a => !a.lido).length;

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Alertas</h1>
            <p className="text-slate-500 text-sm">{naoLidos} não lidos</p>
          </div>
          <div className="flex gap-2">
            <button onClick={gerar} disabled={generating} className="btn-secondary">
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Gerando...' : 'Gerar alertas'}
            </button>
            {naoLidos > 0 && (
              <button onClick={marcarTodos} className="btn-secondary">
                <CheckCheck className="w-4 h-4" /> Marcar todos como lidos
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="card h-16 animate-pulse bg-slate-100" />)}
          </div>
        ) : alertas.length === 0 ? (
          <div className="card p-16 text-center text-slate-400">
            <BellOff className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Nenhum alerta</p>
            <p className="text-sm mt-1">Clique em "Gerar alertas" para verificar pendências</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alertas.map(alerta => {
              const cfg = TIPO_CONFIG[alerta.tipo] || TIPO_CONFIG.MANUTENCAO;
              const Icon = cfg.icon;
              return (
                <div key={alerta.id}
                  className={`card p-4 flex items-start gap-4 transition-all ${alerta.lido ? 'opacity-60' : ''}`}>
                  <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-slate-800 text-sm">{alerta.titulo}</p>
                      {!alerta.lido && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
                      <span className={`badge ${cfg.badge} ml-auto`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm text-slate-600">{alerta.mensagem}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {format(new Date(alerta.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  {!alerta.lido && (
                    <button onClick={() => marcarLido(alerta.id)}
                      className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-slate-600 flex-shrink-0" title="Marcar como lido">
                      <Bell className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
