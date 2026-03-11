'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import {
  Package, DollarSign, AlertTriangle, UserX, TrendingUp, Activity,
  CheckCircle, Wrench, Archive, Trash2, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; badge: string }> = {
  DISPONIVEL: { label: 'Disponível', color: '#10b981', icon: CheckCircle, badge: 'badge-green' },
  EM_USO: { label: 'Em Uso', color: '#6366f1', icon: Activity, badge: 'badge-blue' },
  MANUTENCAO: { label: 'Manutenção', color: '#f59e0b', icon: Wrench, badge: 'badge-yellow' },
  ESTOQUE: { label: 'Estoque', color: '#64748b', icon: Archive, badge: 'badge-gray' },
  DESCARTADO: { label: 'Descartado', color: '#ef4444', icon: Trash2, badge: 'badge-red' },
};

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#64748b', '#8b5cf6', '#06b6d4', '#f43f5e'];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await api.get('/dashboard');
      setData(r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  if (loading) return <AppLayout>
    <div className="p-6 animate-pulse space-y-4">
      {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}
    </div>
  </AppLayout>;

  const statusData = Object.entries(data?.statusMap || {}).map(([k, v]) => ({
    name: STATUS_CONFIG[k]?.label || k, value: v as number, color: STATUS_CONFIG[k]?.color || '#999',
  }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Visão geral dos seus ativos de TI</p>
          </div>
          <button onClick={load} className="btn-secondary">
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total de Ativos', value: data?.totalAtivos || 0, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Valor Total', value: formatCurrency(data?.valorTotal || 0), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Sem Responsável', value: data?.semResponsavel || 0, icon: UserX, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Garantia Vencendo', value: data?.garantiaVencendo || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((kpi) => (
            <div key={kpi.label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">{kpi.label}</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{kpi.value}</p>
                </div>
                <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Bar chart - by category */}
          <div className="card p-5 lg:col-span-2">
            <h2 className="text-sm font-bold text-slate-700 mb-4">Ativos por Categoria</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.ativosPorCategoria || []} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="categoria" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(v) => [v, 'Ativos']}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie - by status */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-slate-700 mb-4">Por Status</h2>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  dataKey="value" paddingAngle={3}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-slate-600">{s.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent assets */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Últimos Ativos Cadastrados</h2>
          <div className="space-y-2">
            {(data?.ultimosAtivos || []).map((ativo: any) => (
              <div key={ativo.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-base">
                  {ativo.categoria?.icone || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{ativo.nome}</p>
                  <p className="text-xs text-slate-400">{ativo.categoria?.nome || 'Sem categoria'}</p>
                </div>
                <span className={`badge ${STATUS_CONFIG[ativo.status]?.badge || 'badge-gray'}`}>
                  {STATUS_CONFIG[ativo.status]?.label || ativo.status}
                </span>
              </div>
            ))}
            {(!data?.ultimosAtivos?.length) && (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum ativo cadastrado ainda</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
