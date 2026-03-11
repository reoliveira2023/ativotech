'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { Plus, ArrowLeftRight, X, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TransferenciasPage() {
  const [transferencias, setTransferencias] = useState<any[]>([]);
  const [ativos, setAtivos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [localizacoes, setLocalizacoes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ ativoId: '', motivo: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, a, u, d, l] = await Promise.all([
        api.get('/transferencias'),
        api.get('/ativos'),
        api.get('/usuarios'),
        api.get('/departamentos'),
        api.get('/localizacoes'),
      ]);
      setTransferencias(t.data);
      setAtivos(a.data);
      setUsuarios(u.data);
      setDepartamentos(d.data);
      setLocalizacoes(l.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.ativoId) return alert('Selecione um ativo');
    setSaving(true);
    try {
      await api.post('/transferencias', form);
      setShowForm(false);
      setForm({ ativoId: '', motivo: '' });
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao transferir');
    } finally { setSaving(false); }
  };

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Transferências</h1>
            <p className="text-slate-500 text-sm">Histórico de movimentações de ativos</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Nova transferência
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Ativo</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">De</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Para</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Motivo</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Data</th>
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>)}
                  </tr>
                )) : transferencias.map(t => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{t.ativo?.categoria?.icone || '📦'}</span>
                        <div>
                          <p className="font-medium text-slate-800">{t.ativo?.nome}</p>
                          <p className="text-xs text-slate-400">{t.ativo?.categoria?.nome}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {t.deUsuario?.nome && <div>{t.deUsuario.nome}</div>}
                      {t.deDepartamento?.nome && <div className="text-slate-400">{t.deDepartamento.nome}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {t.paraUsuario?.nome && <div className="font-medium text-indigo-700">{t.paraUsuario.nome}</div>}
                      {t.paraDepartamento?.nome && <div className="text-slate-500">{t.paraDepartamento.nome}</div>}
                      {t.paraLocalizacao?.nome && <div className="text-slate-400">{t.paraLocalizacao.nome}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-40 truncate">{t.motivo || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {format(new Date(t.createdAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && !transferencias.length && (
              <div className="text-center py-12 text-slate-400">
                <ArrowLeftRight className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma transferência registrada</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900">Nova Transferência</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Ativo *</label>
                <select className="input" value={form.ativoId} onChange={e => setForm({ ...form, ativoId: e.target.value })}>
                  <option value="">Selecione o ativo</option>
                  {ativos.map(a => <option key={a.id} value={a.id}>{a.categoria?.icone} {a.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Transferir para usuário</label>
                <select className="input" value={form.paraUsuarioId || ''} onChange={e => setForm({ ...form, paraUsuarioId: e.target.value || null })}>
                  <option value="">Nenhum</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Novo departamento</label>
                <select className="input" value={form.paraDepartamentoId || ''} onChange={e => setForm({ ...form, paraDepartamentoId: e.target.value || null })}>
                  <option value="">Sem alteração</option>
                  {departamentos.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Nova localização</label>
                <select className="input" value={form.paraLocalizacaoId || ''} onChange={e => setForm({ ...form, paraLocalizacaoId: e.target.value || null })}>
                  <option value="">Sem alteração</option>
                  {localizacoes.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Motivo</label>
                <input className="input" placeholder="Ex: Colaborador entrou no projeto..." value={form.motivo}
                  onChange={e => setForm({ ...form, motivo: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={save} disabled={!form.ativoId || saving} className="btn-primary flex-1 justify-center">
                  <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Transferir'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary px-5">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
