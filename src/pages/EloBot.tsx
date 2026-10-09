import { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  Phone,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export default function EloBot() {
  const [mensagens, setMensagens] = useState([
    { remetente: 'cliente', texto: 'Boa noite! Vocês têm opções vegetarianas no cardápio de hoje?', hora: '19:42' },
    { remetente: 'bot', texto: 'Olá! Sou o EloBot do restaurante. Temos sim! Nossa Pizza Margherita Especial e o EloBurger Veggie com blend de grão-de-bico são opções maravilhosas. Deseja que eu te envie o link do cardápio completo com fotos?', hora: '19:42' },
  ]);
  const [inputTexto, setInputTexto] = useState('');

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTexto.trim()) return;

    const nova = { remetente: 'cliente', texto: inputTexto, hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMensagens([...mensagens, nova]);
    setInputTexto('');

    setTimeout(() => {
      setMensagens((prev) => [
        ...prev,
        {
          remetente: 'bot',
          texto: 'Recebi sua mensagem! O EloBot está conectado ao cardápio em tempo real e pode responder dúvidas, confirmar pedidos de delivery ou chamar um atendente humano a qualquer momento.',
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>EloBot — Atendente IA 24h no WhatsApp</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-semibold border border-emerald-500/20">
                Ativo
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspirado no atendente "Mark" do iSolver: responde clientes, tira dúvidas e envia status de pedidos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">+55 (11) 99887-6655</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulador de WhatsApp */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col h-[520px] overflow-hidden shadow-2xl">
          {/* Header WhatsApp */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                EB
              </div>
              <div>
                <p className="text-xs font-bold text-white">EloBot • Atendimento Automático</p>
                <p className="text-[10px] text-emerald-400">Online 24h</p>
              </div>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Simulador de Testes</span>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
            {mensagens.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.remetente === 'cliente' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    msg.remetente === 'cliente'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-800 border border-slate-700/60 text-slate-100 rounded-bl-none'
                  }`}
                >
                  <p>{msg.texto}</p>
                  <span className="text-[9px] opacity-70 block text-right mt-1 font-mono">{msg.hora}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input de Envio */}
          <form onSubmit={enviar} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
            <input
              type="text"
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              placeholder="Digite uma mensagem como se fosse um cliente..."
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Configurações do Agente */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Configuração da IA</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nome do Agente:</label>
                <input
                  type="text"
                  defaultValue="EloBot"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tom de Voz:</label>
                <input
                  type="text"
                  defaultValue="Simpático, ágil e acolhedor"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Modelo de IA:</label>
                <select className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium">
                  <option>Google Gemini 1.5 Flash (Ultrarrápido)</option>
                  <option>OpenAI GPT-4o-mini</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Transbordo Humano</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Se o cliente digitar "falar com atendente", a IA pausa automaticamente e emite um alerta sonoro na Frente de Caixa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
