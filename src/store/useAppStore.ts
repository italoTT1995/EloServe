import { create } from 'zustand';
import { SessaoCaixa, Mesa, PedidoKDS } from '../types';

interface AppState {
  caixaAtual: SessaoCaixa;
  operadorAtivo: string;
  mesas: Mesa[];
  pedidosKDS: PedidoKDS[];
  abrirCaixa: (saldoInicial: number) => void;
  fecharCaixa: () => void;
  registrarVendaCaixa: (valor: number) => void;
  atualizarStatusMesa: (numero: number, status: Mesa['status']) => void;
  avancarStatusKDS: (pedidoId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  operadorAtivo: 'Italo Lemos (Gerente)',
  caixaAtual: {
    id: 'caixa-01',
    status: 'aberto',
    saldoInicial: 150.0,
    totalVendas: 1240.5,
    totalSangrias: 0,
    totalSuprimentos: 150.0,
    abertoEm: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    operador: 'Italo Lemos',
  },
  mesas: [
    { id: 'm1', numero: 1, capacidade: 4, setor: 'Salão', status: 'ocupada', tempoOcupadaMin: 42, totalConsumo: 168.9 },
    { id: 'm2', numero: 2, capacidade: 2, setor: 'Salão', status: 'livre' },
    { id: 'm3', numero: 3, capacidade: 6, setor: 'Varanda', status: 'ocupada', tempoOcupadaMin: 25, totalConsumo: 89.5 },
    { id: 'm4', numero: 4, capacidade: 4, setor: 'Salão', status: 'chamar_garcom', tempoOcupadaMin: 65, totalConsumo: 215.0 },
    { id: 'm5', numero: 5, capacidade: 4, setor: 'Deck', status: 'aguardando_pagamento', tempoOcupadaMin: 90, totalConsumo: 312.4 },
    { id: 'm6', numero: 6, capacidade: 2, setor: 'Deck', status: 'livre' },
    { id: 'm7', numero: 7, capacidade: 8, setor: 'Salão', status: 'livre' },
    { id: 'm8', numero: 8, capacidade: 4, setor: 'Varanda', status: 'ocupada', tempoOcupadaMin: 15, totalConsumo: 54.0 },
  ],
  pedidosKDS: [
    {
      id: 'k1',
      numero: 101,
      tipo: 'mesa',
      mesaNumero: 4,
      status: 'novo',
      minutosEspera: 3,
      criadoEm: '11:15',
      itens: [
        { nome: 'EloBurger Smash Bacon', quantidade: 2, observacoes: '1x sem picles' },
        { nome: 'Batata Rústica com Alecrim', quantidade: 1 },
      ],
    },
    {
      id: 'k2',
      numero: 102,
      tipo: 'balcao',
      nomeCliente: 'Lucas Silva',
      status: 'em_preparo',
      minutosEspera: 12,
      criadoEm: '11:06',
      itens: [
        { nome: 'Pizza Margherita Grande', quantidade: 1, observacoes: 'Massa fina bem tostada' },
        { nome: 'Coca-Cola Zero 350ml', quantidade: 2 },
      ],
    },
    {
      id: 'k3',
      numero: 103,
      tipo: 'delivery',
      nomeCliente: 'Mariana Costa',
      status: 'pronto',
      minutosEspera: 22,
      criadoEm: '10:56',
      itens: [
        { nome: 'Combo Família 4 Burgers + Fritas', quantidade: 1 },
      ],
    },
  ],

  abrirCaixa: (saldoInicial) =>
    set((state) => ({
      caixaAtual: {
        ...state.caixaAtual,
        status: 'aberto',
        saldoInicial,
        totalSuprimentos: saldoInicial,
        totalVendas: 0,
        abertoEm: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    })),

  fecharCaixa: () =>
    set((state) => ({
      caixaAtual: { ...state.caixaAtual, status: 'fechado' },
    })),

  registrarVendaCaixa: (valor) =>
    set((state) => ({
      caixaAtual: {
        ...state.caixaAtual,
        totalVendas: Number((state.caixaAtual.totalVendas + valor).toFixed(2)),
      },
    })),

  atualizarStatusMesa: (numero, status) =>
    set((state) => ({
      mesas: state.mesas.map((m) => (m.numero === numero ? { ...m, status } : m)),
    })),

  avancarStatusKDS: (pedidoId) =>
    set((state) => ({
      pedidosKDS: state.pedidosKDS.map((p) => {
        if (p.id !== pedidoId) return p;
        const prox = p.status === 'novo' ? 'em_preparo' : p.status === 'em_preparo' ? 'pronto' : 'pronto';
        return { ...p, status: prox };
      }),
    })),
}));
