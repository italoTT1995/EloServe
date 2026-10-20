import { ModificadorRapido } from '../types';

export const MODIFICADORES_RAPIDOS: ModificadorRapido[] = [
  // Carnes & Burgers
  { id: 'mod_ao_ponto', rotulo: 'Ao Ponto', texto: 'Ao ponto', icone: '🥩', categoriaAlvo: 'carnes' },
  { id: 'mod_mal_passada', rotulo: 'Mal Passada', texto: 'Mal passada', icone: '🥩', categoriaAlvo: 'carnes' },
  { id: 'mod_bem_passada', rotulo: 'Bem Passada', texto: 'Bem passada', icone: '🥩', categoriaAlvo: 'carnes' },

  // Cozinha & Lanches & Porções
  { id: 'mod_sem_cebola', rotulo: 'Sem Cebola', texto: 'Sem cebola', icone: '🧅', categoriaAlvo: 'cozinha' },
  { id: 'mod_sem_tomate', rotulo: 'Sem Tomate', texto: 'Sem tomate', icone: '🍅', categoriaAlvo: 'cozinha' },
  { id: 'mod_molho_a_parte', rotulo: 'Molho à Parte', texto: 'Molho à parte', icone: '🥫', categoriaAlvo: 'cozinha' },
  { id: 'mod_sem_sal', rotulo: 'Sem Sal', texto: 'Sem sal', icone: '🧂', categoriaAlvo: 'cozinha' },
  { id: 'mod_sem_pimenta', rotulo: 'Sem Pimenta', texto: 'Sem pimenta', icone: '🌶️', categoriaAlvo: 'cozinha' },
  { id: 'mod_queijo_extra', rotulo: 'Queijo Extra', texto: 'Queijo extra', icone: '🧀', categoriaAlvo: 'cozinha' },
  { id: 'mod_sem_gluten', rotulo: 'Sem Glúten', texto: 'Sem glúten', icone: '🌾', categoriaAlvo: 'cozinha' },

  // Bar & Bebidas
  { id: 'mod_gelo_limao', rotulo: 'Gelo e Limão', texto: 'Gelo e limão', icone: '🍋', categoriaAlvo: 'bar' },
  { id: 'mod_sem_gelo', rotulo: 'Sem Gelo', texto: 'Sem gelo', icone: '❄️', categoriaAlvo: 'bar' },
  { id: 'mod_bem_gelada', rotulo: 'Bem Gelada', texto: 'Bem gelada', icone: '🧊', categoriaAlvo: 'bar' },
  { id: 'mod_sem_acucar', rotulo: 'Sem Açúcar', texto: 'Sem açúcar', icone: '🚫', categoriaAlvo: 'bar' },
  { id: 'mod_adocante', rotulo: 'Adoçante à Parte', texto: 'Adoçante à parte', icone: '🍯', categoriaAlvo: 'bar' },
  { id: 'mod_copo_descartavel', rotulo: 'Copo Descartável', texto: 'Copo descartável', icone: '🥤', categoriaAlvo: 'bar' },

  // Gerais
  { id: 'mod_urgente', rotulo: 'Urgente', texto: 'Urgente', icone: '⚡', categoriaAlvo: 'geral' },
  { id: 'mod_viagem', rotulo: 'P/ Viagem', texto: 'Para viagem', icone: '📦', categoriaAlvo: 'geral' },
  { id: 'mod_compartilhar', rotulo: 'P/ Compartilhar', texto: 'Pratos para compartilhar', icone: '🍽️', categoriaAlvo: 'geral' },
];

/**
 * Retorna os modificadores rápidos mais adequados para o produto
 */
export function getModificadoresParaProduto(
  nomeProduto: string,
  setorPreparo?: 'cozinha' | 'bar' | 'nenhum'
): ModificadorRapido[] {
  const nomeLower = (nomeProduto || '').toLowerCase();
  const ehBar =
    setorPreparo === 'bar' ||
    /chopp|cerveja|vinho|refrigerante|suco|drink|caipirinha|saquê|água|refri|lata|garrafa/i.test(nomeLower);

  if (ehBar) {
    return MODIFICADORES_RAPIDOS.filter((m) => m.categoriaAlvo === 'bar' || m.id === 'mod_urgente');
  }

  const ehCarneOuBurger =
    /burger|hambúrguer|picanha|ancho|costela|carne|filé|bife|grelhado|churrasco|linguiça|espeto/i.test(nomeLower);
  if (ehCarneOuBurger) {
    return MODIFICADORES_RAPIDOS.filter(
      (m) =>
        m.categoriaAlvo === 'carnes' ||
        ['mod_sem_cebola', 'mod_molho_a_parte', 'mod_sem_sal', 'mod_urgente'].includes(m.id)
    );
  }

  // Cozinha padrão (pizzas, porções, saladas, etc.)
  return MODIFICADORES_RAPIDOS.filter(
    (m) => m.categoriaAlvo === 'cozinha' || ['mod_urgente', 'mod_viagem'].includes(m.id)
  );
}

/**
 * Alterna a presença de uma tag rápida no texto de observações
 */
export function alternarTagObservacao(obsAtual: string, textoTag: string): string {
  const tags = (obsAtual || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const idx = tags.findIndex((t) => t.toLowerCase() === textoTag.toLowerCase());
  if (idx >= 0) {
    tags.splice(idx, 1);
  } else {
    tags.push(textoTag);
  }

  return tags.join(', ');
}

/**
 * Verifica se uma tag já está presente na observação
 */
export function tagEstaAtivaNaObservacao(obsAtual: string, textoTag: string): boolean {
  if (!obsAtual) return false;
  const tags = obsAtual.split(',').map((t) => t.trim().toLowerCase());
  return tags.includes(textoTag.toLowerCase());
}
