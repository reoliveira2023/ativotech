'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { Plus, ClipboardList, CheckCircle2, Clock, AlertTriangle, Eye, X, Check, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function InventarioPage() {
  const [inventarios, setInventarios] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [nome, setNome] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/inventarios');
      setInventarios(data);
    } finally { setLoading(false); }
  };

  const openInventario = async (id: string) => {
    const { data } = await api.get(`/inventarios/${id}`);
    setSelected(data);
  };

  const criar = async () => {
    if (!nome) return;
    setCreating(true);
    try {
      const { data } = await api.post('/inventarios', { nome });
      setShowCreate(false);
      setNome('');
      load();
      openInventario(data.id);
    } finally { setCreating(false); }
  };

  const verificar = async (ativoId: string, status = 'VERIFICADO', divergencia?: string) => {
    if (!selected) return;
    await api.put(`/inventarios/${selected.id}/itens/${ativoId}`, { status, divergencia });
    openInventario(selected.id);
  };

  const finalizar = async () => {
    if (!selected || !confirm('Finalizar inventário?')) return;
    await api.put(`/inventarios/${selected.id}/finalizar`);
    setSelected(null);
    load();
  };

  useEffect(() => { load(); }, []);

  const STATUS_INV: any = {
    EM_ANDAMENTO: { l: 'Em andamento', b: 'badge-blue' },
    FINALIZADO: { l: 'Finalizado', b: 'badge-green' },
    CANCELADO: { l: 'Cancelado', b: 'badge-red' },
  };

  const ITEM_STATUS: any = {
    PENDENTE: { l: 'Pendente', b: 'badge-gray', icon: Clock },
    VERIFICADO: { l: 'Verificado', b: 'badge-green', icon: CheckCircle2 },
    DIVERGENTE: { l: 'Divergente', b: 'badge-yellow', icon: AlertTriangle },
    NAO_ENCONTRADO: { l: 'Não Encontrado', b: 'badge-red', icon: X },
  };

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Inventário</h1>
            <p className="text-slate-500 text-sm">Controle e verificação de ativos</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Novo inventário
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* List */}
          <div className="space-y-3">
            {loading ? [...Array(3)].map((_, i) => <div key={i} className="card p-4 h-20 animate-pulse bg-slate-100" />) :
              inventarios.map(inv => (
                <button key={inv.id} onClick={() => openInventario(inv.id)}
                  className={`card p-4 w-full text-left transition-all hover:shadow-md ${selected?.id === inv.id ? 'ring-2 ring-indigo-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{inv.nome}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {inv._count?.itens || 0} ativos • {format(new Date(inv.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <span className={`badge ${STATUS_INV[inv.status]?.b}`}>{STATUS_INV[inv.status]?.l}</span>
                  </div>
                </button>
              ))
            }
            {!loading && !inventarios.length && (
              <div className="card p-8 text-center text-slate-400">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum inventário</p>
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="card overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 text-white flex items-center justify-between">
                  <div>
                    <h2 className="font-bold">{selected.nome}</h2>
                    <p className="text-indigo-200 text-sm">
                      {selected.itens?.filter((i: any) => i.status === 'VERIFICADO').length} de {selected.itens?.length} verificados
                    </p>
                  </div>
                  {selected.status === 'EM_ANDAMENTO' && (
                    <button onClick={finalizar} className="bg-white text-indigo-700 font-semibold text-sm px-4 py-1.5 rounded-lg hover:bg-indigo-50">
                      Finalizar
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                <div className="px-5 pt-4">
                  {(() => {
                    const total = selected.itens?.length || 0;
                    const verified = selected.itens?.filter((i: any) => i.status === 'VERIFICADO').length || 0;
                    const pct = total ? Math.round((verified / total) * 100) : 0;
                    return (
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Progresso</span><span>{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="p-5 space-y-2 max-h-96 overflow-y-auto">
                  {(selected.itens || []).map((item: any) => {
                    const ItemIcon = ITEM_STATUS[item.status]?.icon || Clock;
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm">
                          {item.ativo?.categoria?.icone || '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{item.ativo?.nome}</p>
                          <p className="text-xs text-slate-400">{item.ativo?.responsavel?.nome || 'Sem responsável'}</p>
                        </div>
                        <span className={`badge ${ITEM_STATUS[item.status]?.b}`}>
                          <ItemIcon className="w-3 h-3" />
                          {ITEM_STATUS[item.status]?.l}
                        </span>
                        {selected.status === 'EM_ANDAMENTO' && item.status === 'PENDENTE' && (
                          <div className="flex gap-1">
                            <button onClick={() => verificar(item.ativoId, 'VERIFICADO')}
                              className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-100" title="Verificado">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => {
                              const d = prompt('Informe a divergência:');
                              if (d) verificar(item.ativoId, 'DIVERGENTE', d);
                            }}
                              className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center hover:bg-amber-100" title="Divergência">
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center text-slate-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Selecione um inventário para ver detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Novo Inventário</h2>
            <div className="mb-4">
              <label className="label">Nome do inventário *</label>
              <input className="input" placeholder="Ex: Inventário Q1 2024" value={nome}
                onChange={e => setNome(e.target.value)} autoFocus />
              <p className="text-xs text-slate-400 mt-1">Todos os ativos ativos serão incluídos automaticamente</p>
            </div>
            <div className="flex gap-3">
              <button onClick={criar} disabled={!nome || creating} className="btn-primary flex-1 justify-center">
                {creating ? 'Criando...' : 'Criar'}
              </button>
              <button onClick={() => setShowCreate(false)} className="btn-secondary px-5">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
