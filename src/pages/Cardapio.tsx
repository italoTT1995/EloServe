import { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  DollarSign,
  UtensilsCrossed,
  Check,
  X,
} from 'lucide-react';
import { Produto } from '../types';

export default function Cardapio() {
  const [busca, setBusca] = useState('');
  const [itens, setItens] = useState([
    { id: '1', nome: 'EloBurger Smash Bacon', categoria: 'Burgers', preco: 34.9, setor: 'cozinha', ativo: true },
    { id: '2', nome: 'EloBurger Clássico Salada', categoria: 'Burgers', preco: 29.9, setor: 'cozinha', ativo: true },
    { id: '3', nome: 'Pizza Margherita Especial', categoria: 'Pizzas', preco: 58.0, setor: 'cozinha', ativo: true },
    { id: '4', nome: 'Pizza Calabresa Artesanal', categoria: 'Pizzas', preco: 52.0, setor: 'cozinha', ativo: true },
    { id: '5', nome: 'Batata Rústica com Alecrim', categoria: 'Porções', preco: 24.5, setor: 'cozinha', ativo: true },
    { id: '6', nome: 'Chopp IPA Artesanal 500ml', categoria: 'Bebidas', preco: 18.0, setor: 'bar', ativo: true },
    { id: '7', nome: 'Coca-Cola Original 350ml', categoria: 'Bebidas', preco: 7.5, setor: 'bar', ativo: true },
    { id: '8', nome: 'Brownie com Sorvete', categoria: 'Sobremesas', preco: 22.0, setor: 'cozinha', ativo: false },
  ]);

  const toggleAtivo = (id: string) => {
    setItens(itens.map((i) => (i.id === id ? { ...i, ativo: !i.ativo } : i)));
  };

  const itensFiltrados = itens.filter(
    (i) => i.nome.toLowerCase().includes(busca.toLowerCase()) || i.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-5 select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div>
          <h2 className="text-lg font-extrabold text-white">Engenharia de Cardápio & Preços</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastre pratos, bebidas, complementos e controle a disponibilidade em 1 clique.
          </p>
        </div>

        <button
          onClick={() => alert('Modal de novo prato em desenvolvimento!')}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Item no Cardápio</span>
        </button>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produto ou categoria..."
          className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-5">Produto</th>
              <th className="py-3.5 px-4">Categoria</th>
              <th className="py-3.5 px-4">Preço de Venda</th>
              <th className="py-3.5 px-4">Setor Impressão</th>
              <th className="py-3.5 px-4">Disponibilidade</th>
              <th className="py-3.5 px-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {itensFiltrados.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-5 font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <span>{item.nome}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold text-[11px]">
                    {item.categoria}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                  R$ {item.preco.toFixed(2)}
                </td>
                <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-slate-400">
                  {item.setor}
                </td>
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => toggleAtivo(item.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                      item.ativo
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {item.ativo ? 'Disponível' : 'Pausado'}
                  </button>
                </td>
                <td className="py-3.5 px-5 text-right space-x-1">
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
