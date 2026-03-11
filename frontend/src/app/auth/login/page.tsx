'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Monitor, Eye, EyeOff, ArrowRight, Building2, User, Mail, Lock, Phone, BadgeCheck } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const [loginData, setLoginData] = useState({ email: '', senha: '' });
  const [regData, setRegData] = useState({
    nomeEmpresa: '', emailEmpresa: '', cnpj: '', telefone: '',
    nomeAdmin: '', emailAdmin: '', senhaAdmin: '',
  });

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginData.email, loginData.senha);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', regData);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar');
    } finally { setLoading(false); }
  };

  const fillDemo = () => setLoginData({ email: 'admin@demo.com', senha: 'demo123' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
            <Monitor className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">AtivoTech</span>
        </div>

        <div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Gestão de Ativos<br />
            <span className="text-indigo-300">Inteligente</span>
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed mb-10">
            Controle todos os ativos de TI da sua empresa com scanner mobile, inventário automatizado e assistente de IA.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '📊', label: 'Dashboard em tempo real' },
              { icon: '📱', label: 'Scanner mobile' },
              { icon: '🤖', label: 'Assistente de IA' },
              { icon: '🔔', label: 'Alertas automáticos' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur">
                <span className="text-2xl">{f.icon}</span>
                <span className="text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-indigo-300 text-sm">© 2024 AtivoTech. SaaS multi-tenant.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Logo mobile */}
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">AtivoTech</span>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              {['login', 'register'].map((m) => (
                <button key={m} onClick={() => { setMode(m as any); setError(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
                  {m === 'login' ? 'Entrar' : 'Cadastrar empresa'}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                      className="input pl-9" placeholder="seu@email.com" required />
                  </div>
                </div>
                <div>
                  <label className="label">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPwd ? 'text' : 'password'} value={loginData.senha}
                      onChange={e => setLoginData({ ...loginData, senha: e.target.value })}
                      className="input pl-9 pr-10" placeholder="••••••••" required />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? 'Entrando...' : <><span>Entrar</span><ArrowRight className="w-4 h-4" /></>}
                </button>
                <button type="button" onClick={fillDemo}
                  className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium py-1">
                  <BadgeCheck className="inline w-4 h-4 mr-1" />Usar conta demo
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Dados da empresa</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="label">Nome da empresa</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input className="input pl-9" placeholder="Tech Corp Ltda" required
                        value={regData.nomeEmpresa} onChange={e => setRegData({ ...regData, nomeEmpresa: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Email empresa</label>
                    <input type="email" className="input" placeholder="contato@empresa.com" required
                      value={regData.emailEmpresa} onChange={e => setRegData({ ...regData, emailEmpresa: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">CNPJ (opt.)</label>
                    <input className="input" placeholder="00.000.000/0001-00"
                      value={regData.cnpj} onChange={e => setRegData({ ...regData, cnpj: e.target.value })} />
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider pt-1">Dados do administrador</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Seu nome</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input className="input pl-9" placeholder="João Silva" required
                        value={regData.nomeAdmin} onChange={e => setRegData({ ...regData, nomeAdmin: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Seu email</label>
                    <input type="email" className="input" placeholder="joao@empresa.com" required
                      value={regData.emailAdmin} onChange={e => setRegData({ ...regData, emailAdmin: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Senha</label>
                    <input type="password" className="input" placeholder="Min. 6 caracteres" required minLength={6}
                      value={regData.senhaAdmin} onChange={e => setRegData({ ...regData, senhaAdmin: e.target.value })} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
                  {loading ? 'Criando...' : 'Criar empresa grátis'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
