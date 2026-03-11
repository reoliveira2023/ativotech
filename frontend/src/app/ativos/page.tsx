'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { Plus, Search, Filter, Edit, Trash2, Eye, ChevronLeft, X, Save } from 'lucide-react';

const STATUS_OPTS = ['DISPONIVEL', 'EM_USO', 'MANUTENCAO', 'ESTOQUE', 'DESCARTADO'];
const STATUS_LABELS: any = {
  DISPONIVEL: { l: 'Disponível', b: 'badge-green' },
  EM_USO: { l: 'Em Uso', b: 'badge-blue' },
  MANUTENCAO: { l: 'Manutenção', b: 'badge-yellow' },
  ESTOQUE: { l: 'Estoque', b: 'badge-gray' },
  DESCARTADO: { l: 'Descartado', b: 'badge-red' },
};

export default function AtivosPage() {
  const [ativos, setAtivos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [localizacoes, setLocalizacoes] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ nome: '', status: 'DISPONIVEL' });

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (catFilter) params.categoriaId = catFilter;
      const [a, c, d, l, u] = await Promise.all([
        api.get('/ativos', { params }),
        api.get('/categorias'),
        api.get('/departamentos'),
        api.get('/localizacoes'),
        api.get('/usuarios'),
      ]);
      setAtivos(a.data);
      setCategorias(c.data);
      setDepartamentos(d.data);
      setLocalizacoes(l.data);
      setUsuarios(u.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, statusFilter, catFilter]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ nome: '', status: 'DISPONIVEL' });
    setShowForm(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      nome: item.nome, fabricante: item.fabricante, modelo: item.modelo,
      numeroSerie: item.numeroSerie, codigoBarras: item.codigoBarras,
      valorCompra: item.valorCompra, status: item.status,
      categoriaId: item.categoriaId, departamentoId: item.departamentoId,
      localizacaoId: item.localizacaoId, responsavelId: item.responsavelId,
      observacoes: item.observacoes,
      dataCompra: item.dataCompra?.split('T')[0],
      garantiaFim: item.garantiaFim?.split('T')[0],
    });
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/ativos/${editItem.id}`, form);
      } else {
        await api.post('/ativos', form);
      }
      setShowForm(false);
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao salvar');
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Confirmar exclusão?')) return;
    await api.delete(`/ativos/${id}`);
    load();
  };

  const viewDetails = async (id: string) => {
    const { data } = await api.get(`/ativos/${id}`);
    setViewItem(data);
  };

  const formatCurrency = (v: any) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : '—';

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Ativos</h1>
            <p className="text-slate-500 text-sm">{ativos.length} ativos encontrados</p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> Novo ativo
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9" placeholder="Buscar por nome, série, código..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Todos os status</option>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]?.l}</option>)}
          </select>
          <select className="input w-auto" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Ativo</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Categoria</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Série / Código</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Responsável</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Valor</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>)}
                  </tr>
                )) : ativos.map(a => (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm">
                          {a.categoria?.icone || '📦'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{a.nome}</p>
                          {a.fabricante && <p className="text-xs text-slate-400">{a.fabricante} {a.modelo}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{a.categoria?.nome || '—'}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {a.numeroSerie || a.codigoBarras || '—'}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_LABELS[a.status]?.b || 'badge-gray'}`}>
                        {STATUS_LABELS[a.status]?.l || a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{a.responsavel?.nome || <span className="text-amber-500 text-xs font-medium">Sem responsável</span>}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{formatCurrency(a.valorCompra)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => viewDetails(a.id)} className="btn-ghost p-1.5 rounded-lg" title="Ver">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(a)} className="btn-ghost p-1.5 rounded-lg" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(a.id)} className="btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && !ativos.length && (
              <div className="text-center py-12 text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Nenhum ativo encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-end p-4">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto rounded-2xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">{editItem ? 'Editar Ativo' : 'Novo Ativo'}</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Nome *</label>
                <input className="input" placeholder="Ex: Notebook Dell Latitude 5530" value={form.nome || ''}
                  onChange={e => setForm({ ...form, nome: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Categoria</label>
                  <select className="input" value={form.categoriaId || ''} onChange={e => setForm({ ...form, categoriaId: e.target.value || null })}>
                    <option value="">Selecionar</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={form.status || 'DISPONIVEL'} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]?.l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Fabricante</label>
                  <input className="input" placeholder="Dell, HP, Apple..." value={form.fabricante || ''}
                    onChange={e => setForm({ ...form, fabricante: e.target.value })} />
                </div>
                <div>
                  <label className="label">Modelo</label>
                  <input className="input" placeholder="Latitude 5530" value={form.modelo || ''}
                    onChange={e => setForm({ ...form, modelo: e.target.value })} />
                </div>
                <div>
                  <label className="label">Número de Série</label>
                  <input className="input" placeholder="SN001234" value={form.numeroSerie || ''}
                    onChange={e => setForm({ ...form, numeroSerie: e.target.value })} />
                </div>
                <div>
                  <label className="label">Código de Barras</label>
                  <input className="input" placeholder="AT001" value={form.codigoBarras || ''}
                    onChange={e => setForm({ ...form, codigoBarras: e.target.value })} />
                </div>
                <div>
                  <label className="label">Valor de Compra (R$)</label>
                  <input type="number" className="input" placeholder="4500" value={form.valorCompra || ''}
                    onChange={e => setForm({ ...form, valorCompra: parseFloat(e.target.value) || null })} />
                </div>
                <div>
                  <label className="label">Data de Compra</label>
                  <input type="date" className="input" value={form.dataCompra || ''}
                    onChange={e => setForm({ ...form, dataCompra: e.target.value })} />
                </div>
                <div>
                  <label className="label">Fim da Garantia</label>
                  <input type="date" className="input" value={form.garantiaFim || ''}
                    onChange={e => setForm({ ...form, garantiaFim: e.target.value })} />
                </div>
                <div>
                  <label className="label">Departamento</label>
                  <select className="input" value={form.departamentoId || ''} onChange={e => setForm({ ...form, departamentoId: e.target.value || null })}>
                    <option value="">Selecionar</option>
                    {departamentos.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Localização</label>
                  <select className="input" value={form.localizacaoId || ''} onChange={e => setForm({ ...form, localizacaoId: e.target.value || null })}>
                    <option value="">Selecionar</option>
                    {localizacoes.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Responsável</label>
                  <select className="input" value={form.responsavelId || ''} onChange={e => setForm({ ...form, responsavelId: e.target.value || null })}>
                    <option value="">Sem responsável</option>
                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Observações</label>
                  <textarea className="input h-20 resize-none" placeholder="Informações adicionais..." value={form.observacoes || ''}
                    onChange={e => setForm({ ...form, observacoes: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={!form.nome || saving} className="btn-primary flex-1 justify-center py-2.5">
                  <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary px-6">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl mb-1">{viewItem.categoria?.icone || '📦'}</div>
                  <h2 className="font-bold text-lg">{viewItem.nome}</h2>
                  <p className="text-indigo-200 text-sm">{viewItem.fabricante} {viewItem.modelo}</p>
                </div>
                <button onClick={() => setViewItem(null)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {[
                ['Categoria', viewItem.categoria?.nome],
                ['Status', STATUS_LABELS[viewItem.status]?.l],
                ['Número de Série', viewItem.numeroSerie],
                ['Código de Barras', viewItem.codigoBarras],
                ['Departamento', viewItem.departamento?.nome],
                ['Localização', viewItem.localizacao?.nome],
                ['Responsável', viewItem.responsavel?.nome],
                ['Valor de Compra', viewItem.valorCompra ? `R$ ${Number(viewItem.valorCompra).toFixed(2)}` : null],
                ['Fim da Garantia', viewItem.garantiaFim?.split('T')[0]],
              ].filter(([, v]) => v).map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-slate-500">{l}</span>
                  <span className="font-medium text-slate-800">{v}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => { openEdit(viewItem); setViewItem(null); }} className="btn-primary flex-1 justify-center">
                <Edit className="w-4 h-4" /> Editar
              </button>
              <button onClick={() => setViewItem(null)} className="btn-secondary px-6">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
