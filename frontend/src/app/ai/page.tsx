'use client';
import { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { Bot, Send, User, Sparkles, RefreshCw } from 'lucide-react';

interface Msg { role: 'user' | 'ai'; content: string; ts: Date; }

const SUGGESTIONS = [
  'Quantos ativos estão sem responsável?',
  'Qual departamento tem mais ativos?',
  'Quais ativos têm mais de 5 anos?',
  'Quantos notebooks temos no total?',
  'Quais ativos estão em manutenção?',
  'Qual o valor total dos ativos?',
];

export default function AIPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'ai', content: 'Olá! Sou seu assistente de gestão de ativos. Faça perguntas sobre seus ativos de TI, como quantidades, responsáveis, departamentos e muito mais! 🤖', ts: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = async (texto?: string) => {
    const pergunta = texto || input;
    if (!pergunta.trim() || loading) return;
    setInput('');

    setMsgs(prev => [...prev, { role: 'user', content: pergunta, ts: new Date() }]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { pergunta });
      setMsgs(prev => [...prev, { role: 'ai', content: data.resposta, ts: new Date() }]);
    } catch {
      setMsgs(prev => [...prev, { role: 'ai', content: 'Desculpe, ocorreu um erro. Tente novamente.', ts: new Date() }]);
    } finally { setLoading(false); }
  };

  const formatMsg = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Assistente IA</h1>
              <p className="text-xs text-slate-500">Pergunte sobre seus ativos de TI</p>
            </div>
            <div className="ml-auto">
              <span className="badge badge-green">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {msgs.map((msg, i) => (
            <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'ai' ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-slate-200'
              }`}>
                {msg.role === 'ai'
                  ? <Bot className="w-4 h-4 text-white" />
                  : <User className="w-4 h-4 text-slate-600" />
                }
              </div>
              <div className={`max-w-lg rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'
              }`}>
                <p dangerouslySetInnerHTML={{ __html: formatMsg(msg.content) }} />
                <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-indigo-300' : 'text-slate-400'}`}>
                  {msg.ts.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {msgs.length <= 2 && (
          <div className="px-5 pb-3">
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Sugestões
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs bg-white border border-slate-200 rounded-full px-3 py-1.5 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex gap-2 items-center">
            <input
              className="input flex-1"
              placeholder="Faça uma pergunta sobre seus ativos..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={loading}
            />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 transition-all active:scale-95">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Configure OPENAI_API_KEY no .env para respostas com GPT-4
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
