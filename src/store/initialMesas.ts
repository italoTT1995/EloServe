import { Mesa } from '../types';

export const MESAS_POR_TENANT: Record<string, Mesa[]> = {
  // =========================================================================
  // TENANT 01: Churrascaria & Parrilla Fogo de Minas
  // =========================================================================
  'tenant-01': [
    { id: 'm1_t1', tenantId: 'tenant-01', numero: 1, capacidade: 4, setor: 'Salão Principal', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm2_t1', tenantId: 'tenant-01', numero: 2, capacidade: 2, setor: 'Salão Principal', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm3_t1', tenantId: 'tenant-01', numero: 3, capacidade: 4, setor: 'Salão Principal', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm4_t1', tenantId: 'tenant-01', numero: 4, capacidade: 6, setor: 'Varanda', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm5_t1', tenantId: 'tenant-01', numero: 5, capacidade: 4, setor: 'Deck Parrilla', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm6_t1', tenantId: 'tenant-01', numero: 6, capacidade: 8, setor: 'Salão Nobre', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm7_t1', tenantId: 'tenant-01', numero: 7, capacidade: 4, setor: 'Varanda', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm8_t1', tenantId: 'tenant-01', numero: 8, capacidade: 2, setor: 'Deck Parrilla', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm9_t1', tenantId: 'tenant-01', numero: 9, capacidade: 4, setor: 'Salão Principal', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm10_t1', tenantId: 'tenant-01', numero: 10, capacidade: 6, setor: 'Varanda VIP', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
  ],

  // =========================================================================
  // TENANT 02: Pizzaria & Trattoria Bella Napoli
  // =========================================================================
  'tenant-02': [
    { id: 'm1_t2', tenantId: 'tenant-02', numero: 1, capacidade: 4, setor: 'Forno a Lenha', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm2_t2', tenantId: 'tenant-02', numero: 2, capacidade: 2, setor: 'Salão Napoli', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm3_t2', tenantId: 'tenant-02', numero: 3, capacidade: 4, setor: 'Salão Napoli', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm4_t2', tenantId: 'tenant-02', numero: 4, capacidade: 6, setor: 'Mezanino', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm5_t2', tenantId: 'tenant-02', numero: 5, capacidade: 4, setor: 'Forno a Lenha', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm6_t2', tenantId: 'tenant-02', numero: 6, capacidade: 4, setor: 'Mezanino', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm7_t2', tenantId: 'tenant-02', numero: 7, capacidade: 6, setor: 'Varanda Italiana', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm8_t2', tenantId: 'tenant-02', numero: 8, capacidade: 2, setor: 'Varanda Italiana', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
  ],

  // =========================================================================
  // TENANT 03: Smash Burguer Mania
  // =========================================================================
  'tenant-03': [
    { id: 'm1_t3', tenantId: 'tenant-03', numero: 1, capacidade: 4, setor: 'Salão Retrô', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm2_t3', tenantId: 'tenant-03', numero: 2, capacidade: 2, setor: 'Balcão Chapa', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm3_t3', tenantId: 'tenant-03', numero: 3, capacidade: 4, setor: 'Deck', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm4_t3', tenantId: 'tenant-03', numero: 4, capacidade: 4, setor: 'Salão Retrô', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm5_t3', tenantId: 'tenant-03', numero: 5, capacidade: 4, setor: 'Balcão Chapa', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm6_t3', tenantId: 'tenant-03', numero: 6, capacidade: 6, setor: 'Deck', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm7_t3', tenantId: 'tenant-03', numero: 7, capacidade: 4, setor: 'Salão Retrô', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm8_t3', tenantId: 'tenant-03', numero: 8, capacidade: 2, setor: 'Deck', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
  ],

  // =========================================================================
  // TENANT 04: Boteco & Cervejaria do Zé
  // =========================================================================
  'tenant-04': [
    { id: 'm1_t4', tenantId: 'tenant-04', numero: 1, capacidade: 4, setor: 'Calçada', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm2_t4', tenantId: 'tenant-04', numero: 2, capacidade: 4, setor: 'Salão Boêmio', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm3_t4', tenantId: 'tenant-04', numero: 3, capacidade: 2, setor: 'Calçada', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm4_t4', tenantId: 'tenant-04', numero: 4, capacidade: 4, setor: 'Salão Boêmio', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm5_t4', tenantId: 'tenant-04', numero: 5, capacidade: 6, setor: 'Calçada', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm6_t4', tenantId: 'tenant-04', numero: 6, capacidade: 4, setor: 'Deck', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm7_t4', tenantId: 'tenant-04', numero: 7, capacidade: 4, setor: 'Deck', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm8_t4', tenantId: 'tenant-04', numero: 8, capacidade: 2, setor: 'Salão Boêmio', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm9_t4', tenantId: 'tenant-04', numero: 9, capacidade: 4, setor: 'Calçada', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm10_t4', tenantId: 'tenant-04', numero: 10, capacidade: 8, setor: 'Deck', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
  ],

  // =========================================================================
  // TENANT 05: Sushi House Prime
  // =========================================================================
  'tenant-05': [
    { id: 'm1_t5', tenantId: 'tenant-05', numero: 1, capacidade: 4, setor: 'Salão Prime', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm2_t5', tenantId: 'tenant-05', numero: 2, capacidade: 2, setor: 'Balcão Sushi', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm3_t5', tenantId: 'tenant-05', numero: 3, capacidade: 4, setor: 'Salão Prime', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm4_t5', tenantId: 'tenant-05', numero: 4, capacidade: 6, setor: 'Tatame VIP', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm5_t5', tenantId: 'tenant-05', numero: 5, capacidade: 4, setor: 'Salão Prime', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm6_t5', tenantId: 'tenant-05', numero: 6, capacidade: 2, setor: 'Balcão Sushi', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm7_t5', tenantId: 'tenant-05', numero: 7, capacidade: 4, setor: 'Salão Prime', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
    { id: 'm8_t5', tenantId: 'tenant-05', numero: 8, capacidade: 6, setor: 'Tatame VIP', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
  ],
};
