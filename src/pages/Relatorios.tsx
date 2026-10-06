import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  Award,
  ArrowUpRight,
} from 'lucide-react';

export default function Relatorios() {
  return (
    <div className="space-y-6 max-w-5xl select-none">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <h2 className="text-lg font-extrabold text-white">Relatórios & Demonstração de Resultados</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Acompanhe seu ticket médio, produtos curva A e faturamento em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Ticket Médio por Mesa</p>
          <p className="text-2xl font-black text-white font-mono">R$ 94,80</p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" /> +12% em relação a ontem
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Total de Pedidos Hoje</p>
          <p className="text-2xl font-black text-emerald-400 font-mono">48</p>
          <span className="text-[10px] text-slate-400 font-semibold">24 balcão • 18 mesas • 6 delivery</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Produto Campeão de Vendas</p>
          <p className="text-sm font-extrabold text-white truncate">EloBurger Smash Bacon</p>
          <span className="text-[10px] text-amber-400 font-semibold">28 unidades vendidas hoje</span>
        </div>
      </div>

      {/* Tabela de Top Itens */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Curva ABC de Produtos Mais Lucrativos</span>
        </h3>

        <div className="divide-y divide-slate-800 text-xs">
          {[
            { nome: 'EloBurger Smash Bacon', qtd: 28, total: 'R$ 977,20', margem: '68%' },
            { nome: 'Pizza Margherita Especial', qtd: 14, total: 'R$ 812,00', margem: '72%' },
            { nome: 'Chopp IPA Artesanal 500ml', qtd: 35, total: 'R$ 630,00', margem: '62%' },
            { nome: 'Batata Rústica com Alecrim', qtd: 22, total: 'R$ 539,00', margem: '81%' },
          ].map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-mono font-bold flex items-center justify-center">
                  #{idx + 1}
                </span>
                <span className="font-bold text-white">{item.nome}</span>
              </div>
              <div className="flex items-center gap-6 font-mono">
                <span className="text-slate-400">{item.qtd}x vendidos</span>
                <span className="text-emerald-400 font-bold">{item.total}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                  {item.margem} margem
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
