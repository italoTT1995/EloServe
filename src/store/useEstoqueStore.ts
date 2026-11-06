import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ItemEstoque,
  CategoriaEstoque,
  RegistroCompra,
  FichaTecnica,
  Fornecedor,
  MovimentacaoEstoque,
  VendaRealizada,
  ItemComandaMesa,
} from '../types';
import { converterParaUnidadeEstoque } from '../utils/estoqueUtils';
import { useProductStore } from './useProductStore';

export const CATEGORIAS_ESTOQUE_NOMES: Record<CategoriaEstoque, string> = {
  alimentos: 'Alimentos & Insumos',
  bebidas: 'Bebidas',
  higiene: 'Higiene & Proteção Individual',
  utensilios: 'Utensílios & Equipamentos de Cozinha',
  limpeza: 'Produtos & Utensílios de Limpeza',
  balcao: 'Materiais de Balcão & Atendimento',
};

const ITENS_ESTOQUE_INICIAIS: ItemEstoque[] = [];

interface EstoqueState {
  itens: ItemEstoque[];
  compras: RegistroCompra[];
  fichasTecnicas: FichaTecnica[];
  fornecedores: Fornecedor[];
  movimentacoes: MovimentacaoEstoque[];
  pedidosProcessados: string[];

  // Getters isolados por Estabelecimento / Restaurante (Tenant)
  getItensPorTenant: (tenantId?: string) => ItemEstoque[];
  getComprasPorTenant: (tenantId?: string) => RegistroCompra[];
  getFichasPorTenant: (tenantId?: string) => FichaTecnica[];
  getFornecedoresPorTenant: (tenantId?: string) => Fornecedor[];
  getMovimentacoesPorTenant: (tenantId?: string) => MovimentacaoEstoque[];

  // Ações de Integração Cardápio / PDV / Vendas / Salão & Mesas
  processarBaixaVenda: (venda: VendaRealizada) => { sucesso: boolean; movimentacoesGeradas: number };
  processarBaixaItensMesa: (numeroMesa: number, itensComanda: ItemComandaMesa[], operador: string, tenantId?: string) => { sucesso: boolean; movimentacoesGeradas: number };
  estornarBaixaVenda: (venda: VendaRealizada, motivo: string, operador: string) => { sucesso: boolean; itensRestaurados: number };
  estornarItemComandaMesa: (numeroMesa: number, itemCancelado: ItemComandaMesa, motivo: string, operador: string, tenantId?: string) => { sucesso: boolean; movimentacoesGeradas: number };
  registrarMovimentacao: (mov: Omit<MovimentacaoEstoque, 'id' | 'dataHora'>) => void;

  // Ações de Estoque
  baixarEstoquePorVenda: (produtoNome: string, quantidade: number, tenantId?: string) => void;
  registrarSaidaManual: (itemId: string, quantidade: number, motivo: string, tenantId?: string) => void;
  ajustarSobraDiaAnterior: (itemId: string, sobra: number) => void;
  adicionarItemEstoque: (item: Omit<ItemEstoque, 'id'>, tenantId?: string) => void;
  editarItemEstoque: (id: string, dados: Partial<ItemEstoque>) => void;
  removerItemEstoque: (id: string) => void;

  // Ações de Compras
  adicionarCompra: (compra: Omit<RegistroCompra, 'id'>, tenantId?: string) => void;

  // Ações de Fichas Técnicas
  salvarFichaTecnica: (ficha: FichaTecnica, tenantId?: string) => void;

  // Ações de Fornecedores
  adicionarFornecedor: (fornecedor: Omit<Fornecedor, 'id'>, tenantId?: string) => void;

  // Consumo diário automático na abertura
  processarAberturaDiaConsumoPrevisto: () => void;
}

export const useEstoqueStore = create<EstoqueState>()(
  persist(
    (set, get) => ({
      itens: ITENS_ESTOQUE_INICIAIS,
      compras: [],
      fichasTecnicas: [],
      fornecedores: [],
      movimentacoes: [],
      pedidosProcessados: [],

      // ==============================================================
      // CONSULTAS ISOLADAS POR RESTAURANTE
      // ==============================================================
      getItensPorTenant: (tenantId?: string) => {
        const state = get();
        if (!tenantId || tenantId === 'global') return [];
        return (state.itens || []).filter((i) => !i.tenantId || i.tenantId === tenantId);
      },

      getComprasPorTenant: (tenantId?: string) => {
        const state = get();
        if (!tenantId || tenantId === 'global') return [];
        return (state.compras || []).filter((c) => !c.tenantId || c.tenantId === tenantId);
      },

      getFichasPorTenant: (tenantId?: string) => {
        const state = get();
        if (!tenantId || tenantId === 'global') return [];
        return (state.fichasTecnicas || []).filter((f) => !f.tenantId || f.tenantId === tenantId);
      },

      getFornecedoresPorTenant: (tenantId?: string) => {
        const state = get();
        if (!tenantId || tenantId === 'global') return [];
        return (state.fornecedores || []).filter((f) => !f.tenantId || f.tenantId === tenantId);
      },

      getMovimentacoesPorTenant: (tenantId?: string) => {
        const state = get();
        if (!tenantId || tenantId === 'global') return [];
        return (state.movimentacoes || []).filter((m) => !m.tenantId || m.tenantId === tenantId);
      },

      // ==============================================================
      // BAIXA AUTOMÁTICA EM VENDAS COM FICHA TÉCNICA OU VÍNCULO DIRETO
      // ==============================================================
      processarBaixaVenda: (venda) => {
        const state = get();
        // Proteção contra baixas duplicadas para o mesmo pedido (idempotência)
        if (state.pedidosProcessados.includes(venda.id)) {
          return { sucesso: false, movimentacoesGeradas: 0 };
        }

        const novasMovimentacoes: MovimentacaoEstoque[] = [];
        const itensAtuais = state.itens.map((item) => ({ ...item }));
        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const targetTenantId = venda.tenantId;

        venda.itens.forEach((itemVendido) => {
          let ficha = itemVendido.fichaTecnica;
          let itemEstoqueIdDireto: string | undefined = undefined;

          // Se a ficha técnica não veio inline no item de venda, consulta pelo catálogo de produtos
          if (!ficha || ficha.length === 0) {
            try {
              const prods = useProductStore.getState().getProdutosPorTenant(targetTenantId);
              const prod = prods.find((p) => p.id === itemVendido.produtoId);
              if (prod) {
                if (prod.fichaTecnica && prod.fichaTecnica.length > 0) {
                  ficha = prod.fichaTecnica;
                }
                if (prod.itemEstoqueId) {
                  itemEstoqueIdDireto = prod.itemEstoqueId;
                }
              }
            } catch (_) {}
          }

          // 1. Caso o item possua Ficha Técnica (receita de múltiplos ingredientes)
          if (ficha && ficha.length > 0) {
            ficha.forEach((ing) => {
              const itemIdx = itensAtuais.findIndex(
                (it) => it.id === ing.ingredienteId && (!targetTenantId || !it.tenantId || it.tenantId === targetTenantId)
              );
              if (itemIdx > -1) {
                const itemEst = itensAtuais[itemIdx];
                const qtdPorPorcaoNaUnidadeEstoque = converterParaUnidadeEstoque(
                  ing.quantidade,
                  ing.unidadeMedida,
                  itemEst.unidadeMedida
                );
                const totalConsumo = Number((qtdPorPorcaoNaUnidadeEstoque * itemVendido.quantidade).toFixed(4));
                const novoSaldo = Math.max(0, Number((itemEst.quantidadeAtual - totalConsumo).toFixed(4)));

                itemEst.quantidadeAtual = novoSaldo;
                let novoStatus = itemEst.statusDisponibilidade;
                if (itemEst.unidadeMedida === 'un' || itemEst.categoria === 'bebidas') {
                  if (novoSaldo <= 5) novoStatus = 'esgotado';
                  else if (novoSaldo <= itemEst.estoqueMinimo) novoStatus = 'esgotando';
                  else novoStatus = 'disponivel';
                } else {
                  if (novoSaldo <= 0.05) novoStatus = 'esgotado';
                  else if (novoSaldo <= itemEst.estoqueMinimo) novoStatus = 'esgotando';
                  else novoStatus = 'disponivel';
                }
                itemEst.statusDisponibilidade = novoStatus;

                novasMovimentacoes.push({
                  id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  tenantId: targetTenantId || itemEst.tenantId,
                  dataHora: agoraTexto,
                  itemId: itemEst.id,
                  itemNome: itemEst.nome,
                  tipo: 'saida_venda',
                  quantidade: totalConsumo,
                  unidadeMedida: itemEst.unidadeMedida,
                  motivo: `Venda #${venda.id}: ${itemVendido.quantidade}x ${itemVendido.nome}`,
                  pedidoId: venda.id,
                  responsavel: venda.operador || 'Operador Caixa',
                  saldoApos: novoSaldo,
                });
              }
            });
          } else if (itemEstoqueIdDireto) {
            // 2. Caso o item possua vínculo direto unitário no estoque (ex: cerveja, refrigerante, água)
            const itemIdx = itensAtuais.findIndex(
              (it) => it.id === itemEstoqueIdDireto && (!targetTenantId || !it.tenantId || it.tenantId === targetTenantId)
            );
            if (itemIdx > -1) {
              const itemEst = itensAtuais[itemIdx];
              const totalConsumo = itemVendido.quantidade;
              const novoSaldo = Math.max(0, Number((itemEst.quantidadeAtual - totalConsumo).toFixed(4)));
              itemEst.quantidadeAtual = novoSaldo;
              let novoStatus = itemEst.statusDisponibilidade;
              if (novoSaldo <= 5) novoStatus = 'esgotado';
              else if (novoSaldo <= itemEst.estoqueMinimo) novoStatus = 'esgotando';
              else novoStatus = 'disponivel';
              itemEst.statusDisponibilidade = novoStatus;

              novasMovimentacoes.push({
                id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                tenantId: targetTenantId || itemEst.tenantId,
                dataHora: agoraTexto,
                itemId: itemEst.id,
                itemNome: itemEst.nome,
                tipo: 'saida_venda',
                quantidade: totalConsumo,
                unidadeMedida: itemEst.unidadeMedida,
                motivo: `Venda #${venda.id}: ${itemVendido.quantidade}x ${itemVendido.nome} (Vínculo Direto)`,
                pedidoId: venda.id,
                responsavel: venda.operador || 'Operador Caixa',
                saldoApos: novoSaldo,
              });
            }
          } else {
            // 3. Fallback: Se não possui ficha técnica mas é item com controle individual pelo nome
            const itemIdx = itensAtuais.findIndex(
              (it) =>
                (!targetTenantId || !it.tenantId || it.tenantId === targetTenantId) &&
                it.metodoControle === 'individual' &&
                (it.nome.toLowerCase() === itemVendido.nome.toLowerCase() ||
                  it.nome.toLowerCase().includes(itemVendido.nome.toLowerCase()) ||
                  itemVendido.nome.toLowerCase().includes(it.nome.toLowerCase()))
            );

            if (itemIdx > -1) {
              const itemEst = itensAtuais[itemIdx];
              const totalConsumo = itemVendido.quantidade;
              const novoSaldo = Math.max(0, itemEst.quantidadeAtual - totalConsumo);
              itemEst.quantidadeAtual = novoSaldo;
              let novoStatus = itemEst.statusDisponibilidade;
              if (novoSaldo <= 5) novoStatus = 'esgotado';
              else if (novoSaldo <= itemEst.estoqueMinimo) novoStatus = 'esgotando';
              else novoStatus = 'disponivel';
              itemEst.statusDisponibilidade = novoStatus;

              novasMovimentacoes.push({
                id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                tenantId: targetTenantId || itemEst.tenantId,
                dataHora: agoraTexto,
                itemId: itemEst.id,
                itemNome: itemEst.nome,
                tipo: 'saida_venda',
                quantidade: totalConsumo,
                unidadeMedida: itemEst.unidadeMedida,
                motivo: `Venda #${venda.id}: ${itemVendido.quantidade}x ${itemVendido.nome} (Item Direto)`,
                pedidoId: venda.id,
                responsavel: venda.operador || 'Operador Caixa',
                saldoApos: novoSaldo,
              });
            }
          }
        });

        set({
          itens: itensAtuais,
          movimentacoes: [...novasMovimentacoes, ...state.movimentacoes],
          pedidosProcessados: [venda.id, ...state.pedidosProcessados],
        });

        return { sucesso: true, movimentacoesGeradas: novasMovimentacoes.length };
      },

      // ==============================================================
      // BAIXA AUTOMÁTICA EM ITENS LANÇADOS NA MESA (FICHA TÉCNICA / DIRETO)
      // ==============================================================
      processarBaixaItensMesa: (numeroMesa, itensComanda, operador, tenantId) => {
        const state = get();
        const itensAtuais = state.itens.map((it) => ({ ...it }));
        const novasMovimentacoes: MovimentacaoEstoque[] = [];
        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const targetTenantId = tenantId;

        itensComanda.forEach((itemLancado) => {
          let ficha = state.fichasTecnicas.find(
            (f) => f.produtoId === itemLancado.produtoId && (!targetTenantId || !f.tenantId || f.tenantId === targetTenantId)
          );
          let itemEstoqueIdDireto: string | undefined = undefined;

          // Se não achou na ficha técnica direta, consulta o produto
          try {
            const prods = useProductStore.getState().getProdutosPorTenant(targetTenantId);
            const prod = prods.find((p) => p.id === itemLancado.produtoId);
            if (prod) {
              if (prod.itemEstoqueId) itemEstoqueIdDireto = prod.itemEstoqueId;
              if (!ficha && prod.fichaTecnica && prod.fichaTecnica.length > 0) {
                ficha = {
                  id: `ft-${prod.id}`,
                  tenantId: targetTenantId,
                  produtoId: prod.id,
                  nomePrato: prod.nome,
                  componentes: prod.fichaTecnica.map((ing) => ({
                    ingredienteId: ing.ingredienteId,
                    ingredienteNome: ing.ingredienteNome,
                    pesoGramas: ing.quantidade,
                    custoPorGrama: 0,
                    custoTotalComponente: ing.custoUnitarioEstimado || 0,
                  })),
                  custoTotalEstimado: 0,
                  precoVenda: prod.precoVenda,
                  margemBrutaPercentual: 0,
                };
              }
            }
          } catch (_) {}

          if (ficha && ficha.componentes && ficha.componentes.length > 0) {
            ficha.componentes.forEach((comp) => {
              const itemIdx = itensAtuais.findIndex(
                (it) => it.id === comp.ingredienteId && (!targetTenantId || !it.tenantId || it.tenantId === targetTenantId)
              );
              if (itemIdx > -1) {
                const itemEst = itensAtuais[itemIdx];
                const qtdPorPorcaoNaUnidadeEstoque = converterParaUnidadeEstoque(
                  comp.pesoGramas,
                  'g',
                  itemEst.unidadeMedida
                );
                const totalConsumo = Number((qtdPorPorcaoNaUnidadeEstoque * itemLancado.quantidade).toFixed(4));
                const novoSaldo = Math.max(0, Number((itemEst.quantidadeAtual - totalConsumo).toFixed(4)));

                itemEst.quantidadeAtual = novoSaldo;
                let novoStatus = itemEst.statusDisponibilidade;
                if (itemEst.unidadeMedida === 'un' || itemEst.categoria === 'bebidas') {
                  if (novoSaldo <= 5) novoStatus = 'esgotado';
                  else if (novoSaldo <= itemEst.estoqueMinimo) novoStatus = 'esgotando';
                  else novoStatus = 'disponivel';
                } else {
                  if (novoSaldo <= 0.05) novoStatus = 'esgotado';
                  else if (novoSaldo <= itemEst.estoqueMinimo) novoStatus = 'esgotando';
                  else novoStatus = 'disponivel';
                }
                itemEst.statusDisponibilidade = novoStatus;

                novasMovimentacoes.unshift({
                  id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  tenantId: targetTenantId || itemEst.tenantId,
                  dataHora: agoraTexto,
                  tipo: 'saida_venda',
                  itemId: itemEst.id,
                  itemNome: itemEst.nome,
                  quantidade: totalConsumo,
                  unidadeMedida: itemEst.unidadeMedida,
                  motivo: `Mesa #${numeroMesa}: ${itemLancado.quantidade}x ${itemLancado.nome} (Ficha Técnica)`,
                  pedidoId: `Mesa-${numeroMesa}`,
                  responsavel: operador || 'Garçom',
                  saldoApos: novoSaldo,
                });
              }
            });
          } else if (itemEstoqueIdDireto) {
            const itemIdx = itensAtuais.findIndex(
              (it) => it.id === itemEstoqueIdDireto && (!targetTenantId || !it.tenantId || it.tenantId === targetTenantId)
            );
            if (itemIdx > -1) {
              const itemEst = itensAtuais[itemIdx];
              const totalConsumo = itemLancado.quantidade;
              const novoSaldo = Math.max(0, itemEst.quantidadeAtual - totalConsumo);
              itemEst.quantidadeAtual = novoSaldo;
              let novoStatus = itemEst.statusDisponibilidade;
              if (novoSaldo <= 5) novoStatus = 'esgotado';
              else if (novoSaldo <= itemEst.estoqueMinimo) novoStatus = 'esgotando';
              else novoStatus = 'disponivel';
              itemEst.statusDisponibilidade = novoStatus;

              novasMovimentacoes.unshift({
                id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                tenantId: targetTenantId || itemEst.tenantId,
                dataHora: agoraTexto,
                tipo: 'saida_venda',
                itemId: itemEst.id,
                itemNome: itemEst.nome,
                quantidade: totalConsumo,
                unidadeMedida: itemEst.unidadeMedida,
                motivo: `Mesa #${numeroMesa}: ${itemLancado.quantidade}x ${itemLancado.nome} (Vínculo Direto)`,
                pedidoId: `Mesa-${numeroMesa}`,
                responsavel: operador || 'Garçom',
                saldoApos: novoSaldo,
              });
            }
          } else {
            // Item individual pelo nome
            const itemIdx = itensAtuais.findIndex(
              (it) =>
                (!targetTenantId || !it.tenantId || it.tenantId === targetTenantId) &&
                it.metodoControle === 'individual' &&
                (it.nome.toLowerCase() === itemLancado.nome.toLowerCase() ||
                  it.nome.toLowerCase().includes(itemLancado.nome.toLowerCase()) ||
                  itemLancado.nome.toLowerCase().includes(it.nome.toLowerCase()))
            );

            if (itemIdx > -1) {
              const itemEst = itensAtuais[itemIdx];
              const totalConsumo = itemLancado.quantidade;
              const novoSaldo = Math.max(0, itemEst.quantidadeAtual - totalConsumo);
              itemEst.quantidadeAtual = novoSaldo;
              let novoStatus = itemEst.statusDisponibilidade;
              if (novoSaldo <= 5) novoStatus = 'esgotado';
              else if (novoSaldo <= itemEst.estoqueMinimo) novoStatus = 'esgotando';
              else novoStatus = 'disponivel';
              itemEst.statusDisponibilidade = novoStatus;

              novasMovimentacoes.unshift({
                id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                tenantId: targetTenantId || itemEst.tenantId,
                dataHora: agoraTexto,
                tipo: 'saida_venda',
                itemId: itemEst.id,
                itemNome: itemEst.nome,
                quantidade: totalConsumo,
                unidadeMedida: itemEst.unidadeMedida,
                motivo: `Mesa #${numeroMesa}: ${itemLancado.quantidade}x ${itemLancado.nome} (Item Direto)`,
                pedidoId: `Mesa-${numeroMesa}`,
                responsavel: operador || 'Garçom',
                saldoApos: novoSaldo,
              });
            }
          }
        });

        set({
          itens: itensAtuais,
          movimentacoes: [...novasMovimentacoes, ...state.movimentacoes],
        });

        return { sucesso: true, movimentacoesGeradas: novasMovimentacoes.length };
      },

      // ==============================================================
      // ESTORNO / RESTITUIÇÃO DE ITEM CANCELADO NA MESA
      // ==============================================================
      estornarItemComandaMesa: (numeroMesa, itemCancelado, motivo, operador, tenantId) => {
        const state = get();
        const novasMovimentacoes: MovimentacaoEstoque[] = [];
        const itensAtuais = state.itens.map((item) => ({ ...item }));
        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const targetTenantId = tenantId;

        let ficha = state.fichasTecnicas.find(
          (f) => f.produtoId === itemCancelado.produtoId && (!targetTenantId || !f.tenantId || f.tenantId === targetTenantId)
        );
        let itemEstoqueIdDireto: string | undefined = undefined;

        try {
          const prods = useProductStore.getState().getProdutosPorTenant(targetTenantId);
          const prod = prods.find((p) => p.id === itemCancelado.produtoId);
          if (prod) {
            if (prod.itemEstoqueId) itemEstoqueIdDireto = prod.itemEstoqueId;
            if (!ficha && prod.fichaTecnica && prod.fichaTecnica.length > 0) {
              ficha = {
                id: `ft-${prod.id}`,
                tenantId: targetTenantId,
                produtoId: prod.id,
                nomePrato: prod.nome,
                componentes: prod.fichaTecnica.map((ing) => ({
                  ingredienteId: ing.ingredienteId,
                  ingredienteNome: ing.ingredienteNome,
                  pesoGramas: ing.quantidade,
                  custoPorGrama: 0,
                  custoTotalComponente: ing.custoUnitarioEstimado || 0,
                })),
                custoTotalEstimado: 0,
                precoVenda: prod.precoVenda,
                margemBrutaPercentual: 0,
              };
            }
          }
        } catch (_) {}

        if (ficha && ficha.componentes && ficha.componentes.length > 0) {
          ficha.componentes.forEach((comp) => {
            const itemIdx = itensAtuais.findIndex(
              (it) => it.id === comp.ingredienteId && (!targetTenantId || !it.tenantId || it.tenantId === targetTenantId)
            );
            if (itemIdx > -1) {
              const itemEst = itensAtuais[itemIdx];
              const qtdPorPorcaoNaUnidadeEstoque = converterParaUnidadeEstoque(
                comp.pesoGramas,
                'g',
                itemEst.unidadeMedida
              );
              const totalDevolvido = Number((qtdPorPorcaoNaUnidadeEstoque * itemCancelado.quantidade).toFixed(4));
              const novoSaldo = Number((itemEst.quantidadeAtual + totalDevolvido).toFixed(4));
              itemEst.quantidadeAtual = novoSaldo;
              let novoStatus = itemEst.statusDisponibilidade;
              if (novoSaldo > itemEst.estoqueMinimo) novoStatus = 'disponivel';
              itemEst.statusDisponibilidade = novoStatus;

              novasMovimentacoes.push({
                id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                tenantId: targetTenantId || itemEst.tenantId,
                dataHora: agoraTexto,
                tipo: 'estorno_cancelamento',
                itemId: itemEst.id,
                itemNome: itemEst.nome,
                quantidade: totalDevolvido,
                unidadeMedida: itemEst.unidadeMedida,
                motivo: `Cancelamento Mesa #${numeroMesa}: ${motivo || 'Item Cancelado'} (${itemCancelado.quantidade}x ${itemCancelado.nome})`,
                pedidoId: `Mesa-${numeroMesa}`,
                responsavel: operador || 'Gerente',
                saldoApos: novoSaldo,
              });
            }
          });
        } else if (itemEstoqueIdDireto) {
          const itemIdx = itensAtuais.findIndex(
            (it) => it.id === itemEstoqueIdDireto && (!targetTenantId || !it.tenantId || it.tenantId === targetTenantId)
          );
          if (itemIdx > -1) {
            const itemEst = itensAtuais[itemIdx];
            const totalDevolvido = itemCancelado.quantidade;
            const novoSaldo = Number((itemEst.quantidadeAtual + totalDevolvido).toFixed(4));
            itemEst.quantidadeAtual = novoSaldo;
            let novoStatus = itemEst.statusDisponibilidade;
            if (novoSaldo > itemEst.estoqueMinimo) novoStatus = 'disponivel';
            itemEst.statusDisponibilidade = novoStatus;

            novasMovimentacoes.push({
              id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              tenantId: targetTenantId || itemEst.tenantId,
              dataHora: agoraTexto,
              tipo: 'estorno_cancelamento',
              itemId: itemEst.id,
              itemNome: itemEst.nome,
              quantidade: totalDevolvido,
              unidadeMedida: itemEst.unidadeMedida,
              motivo: `Cancelamento Mesa #${numeroMesa}: ${motivo || 'Item Cancelado'} (Vínculo Direto)`,
              pedidoId: `Mesa-${numeroMesa}`,
              responsavel: operador || 'Gerente',
              saldoApos: novoSaldo,
            });
          }
        } else {
          const itemIdx = itensAtuais.findIndex(
            (it) =>
              (!targetTenantId || !it.tenantId || it.tenantId === targetTenantId) &&
              it.metodoControle === 'individual' &&
              (it.nome.toLowerCase() === itemCancelado.nome.toLowerCase() ||
                it.nome.toLowerCase().includes(itemCancelado.nome.toLowerCase()) ||
                itemCancelado.nome.toLowerCase().includes(it.nome.toLowerCase()))
          );

          if (itemIdx > -1) {
            const itemEst = itensAtuais[itemIdx];
            const totalDevolvido = itemCancelado.quantidade;
            const novoSaldo = itemEst.quantidadeAtual + totalDevolvido;
            itemEst.quantidadeAtual = novoSaldo;
            let novoStatus = itemEst.statusDisponibilidade;
            if (novoSaldo > itemEst.estoqueMinimo) novoStatus = 'disponivel';
            itemEst.statusDisponibilidade = novoStatus;

            novasMovimentacoes.push({
              id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              tenantId: targetTenantId || itemEst.tenantId,
              dataHora: agoraTexto,
              tipo: 'estorno_cancelamento',
              itemId: itemEst.id,
              itemNome: itemEst.nome,
              quantidade: totalDevolvido,
              unidadeMedida: itemEst.unidadeMedida,
              motivo: `Cancelamento Mesa #${numeroMesa}: ${motivo || 'Item Cancelado'} (Item Direto)`,
              pedidoId: `Mesa-${numeroMesa}`,
              responsavel: operador || 'Gerente',
              saldoApos: novoSaldo,
            });
          }
        }

        set({
          itens: itensAtuais,
          movimentacoes: [...novasMovimentacoes, ...state.movimentacoes],
        });

        return { sucesso: true, movimentacoesGeradas: novasMovimentacoes.length };
      },

      // ==============================================================
      // ESTORNO / CANCELAMENTO DE VENDA COM RESTITUIÇÃO AO ESTOQUE
      // ==============================================================
      estornarBaixaVenda: (venda, motivo, operador) => {
        const state = get();
        const novasMovimentacoes: MovimentacaoEstoque[] = [];
        const itensAtuais = state.itens.map((item) => ({ ...item }));
        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const targetTenantId = venda.tenantId;

        venda.itens.forEach((itemVendido) => {
          let ficha = itemVendido.fichaTecnica;
          let itemEstoqueIdDireto: string | undefined = undefined;

          if (!ficha || ficha.length === 0) {
            try {
              const prods = useProductStore.getState().getProdutosPorTenant(targetTenantId);
              const prod = prods.find((p) => p.id === itemVendido.produtoId);
              if (prod) {
                if (prod.fichaTecnica && prod.fichaTecnica.length > 0) {
                  ficha = prod.fichaTecnica;
                }
                if (prod.itemEstoqueId) {
                  itemEstoqueIdDireto = prod.itemEstoqueId;
                }
              }
            } catch (_) {}
          }

          if (ficha && ficha.length > 0) {
            ficha.forEach((ing) => {
              const itemIdx = itensAtuais.findIndex(
                (it) => it.id === ing.ingredienteId && (!targetTenantId || !it.tenantId || it.tenantId === targetTenantId)
              );
              if (itemIdx > -1) {
                const itemEst = itensAtuais[itemIdx];
                const qtdPorPorcaoNaUnidadeEstoque = converterParaUnidadeEstoque(
                  ing.quantidade,
                  ing.unidadeMedida,
                  itemEst.unidadeMedida
                );
                const totalDevolvido = Number((qtdPorPorcaoNaUnidadeEstoque * itemVendido.quantidade).toFixed(4));
                const novoSaldo = Number((itemEst.quantidadeAtual + totalDevolvido).toFixed(4));
                itemEst.quantidadeAtual = novoSaldo;
                let novoStatus = itemEst.statusDisponibilidade;
                if (novoSaldo > itemEst.estoqueMinimo) novoStatus = 'disponivel';
                else if (novoSaldo > 0) novoStatus = 'esgotando';
                itemEst.statusDisponibilidade = novoStatus;

                novasMovimentacoes.push({
                  id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  tenantId: targetTenantId || itemEst.tenantId,
                  dataHora: agoraTexto,
                  itemId: itemEst.id,
                  itemNome: itemEst.nome,
                  tipo: 'estorno_cancelamento',
                  quantidade: totalDevolvido,
                  unidadeMedida: itemEst.unidadeMedida,
                  motivo: `Estorno Venda #${venda.id}: ${motivo || 'Cancelamento'} (${itemVendido.quantidade}x ${itemVendido.nome})`,
                  pedidoId: venda.id,
                  responsavel: operador || 'Operador / Admin',
                  saldoApos: novoSaldo,
                });
              }
            });
          } else if (itemEstoqueIdDireto) {
            const itemIdx = itensAtuais.findIndex(
              (it) => it.id === itemEstoqueIdDireto && (!targetTenantId || !it.tenantId || it.tenantId === targetTenantId)
            );
            if (itemIdx > -1) {
              const itemEst = itensAtuais[itemIdx];
              const totalDevolvido = itemVendido.quantidade;
              const novoSaldo = Number((itemEst.quantidadeAtual + totalDevolvido).toFixed(4));
              itemEst.quantidadeAtual = novoSaldo;
              let novoStatus = itemEst.statusDisponibilidade;
              if (novoSaldo > itemEst.estoqueMinimo) novoStatus = 'disponivel';
              itemEst.statusDisponibilidade = novoStatus;

              novasMovimentacoes.push({
                id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                tenantId: targetTenantId || itemEst.tenantId,
                dataHora: agoraTexto,
                itemId: itemEst.id,
                itemNome: itemEst.nome,
                tipo: 'estorno_cancelamento',
                quantidade: totalDevolvido,
                unidadeMedida: itemEst.unidadeMedida,
                motivo: `Estorno Venda #${venda.id}: ${motivo || 'Cancelamento'} (Vínculo Direto)`,
                pedidoId: venda.id,
                responsavel: operador || 'Operador / Admin',
                saldoApos: novoSaldo,
              });
            }
          } else {
            const itemIdx = itensAtuais.findIndex(
              (it) =>
                (!targetTenantId || !it.tenantId || it.tenantId === targetTenantId) &&
                it.metodoControle === 'individual' &&
                (it.nome.toLowerCase() === itemVendido.nome.toLowerCase() ||
                  it.nome.toLowerCase().includes(itemVendido.nome.toLowerCase()) ||
                  itemVendido.nome.toLowerCase().includes(it.nome.toLowerCase()))
            );

            if (itemIdx > -1) {
              const itemEst = itensAtuais[itemIdx];
              const totalDevolvido = itemVendido.quantidade;
              const novoSaldo = itemEst.quantidadeAtual + totalDevolvido;
              itemEst.quantidadeAtual = novoSaldo;
              let novoStatus = itemEst.statusDisponibilidade;
              if (novoSaldo > itemEst.estoqueMinimo) novoStatus = 'disponivel';
              itemEst.statusDisponibilidade = novoStatus;

              novasMovimentacoes.push({
                id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                tenantId: targetTenantId || itemEst.tenantId,
                dataHora: agoraTexto,
                itemId: itemEst.id,
                itemNome: itemEst.nome,
                tipo: 'estorno_cancelamento',
                quantidade: totalDevolvido,
                unidadeMedida: itemEst.unidadeMedida,
                motivo: `Estorno Venda #${venda.id}: ${motivo || 'Cancelamento'} (Item Direto)`,
                pedidoId: venda.id,
                responsavel: operador || 'Operador / Admin',
                saldoApos: novoSaldo,
              });
            }
          }
        });

        set({
          itens: itensAtuais,
          movimentacoes: [...novasMovimentacoes, ...state.movimentacoes],
          pedidosProcessados: state.pedidosProcessados.filter((id) => id !== venda.id),
        });

        return { sucesso: true, itensRestaurados: novasMovimentacoes.length };
      },

      registrarMovimentacao: (mov) => {
        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const novaMov: MovimentacaoEstoque = {
          ...mov,
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          dataHora: agoraTexto,
        };
        set((state) => ({ movimentacoes: [novaMov, ...state.movimentacoes] }));
      },

      baixarEstoquePorVenda: (produtoNome, quantidade, tenantId) => {
        if (!produtoNome) return;
        set((state) => ({
          itens: (state.itens || []).map((item) => {
            if (tenantId && item.tenantId && item.tenantId !== tenantId) {
              return item;
            }
            if (
              item &&
              item.nome &&
              (item.nome.toLowerCase().includes(produtoNome.toLowerCase()) ||
                produtoNome.toLowerCase().includes(item.nome.toLowerCase()))
            ) {
              const novaQtd = Math.max(0, Number((item.quantidadeAtual - quantidade).toFixed(2)));
              let novoStatus: ItemEstoque['statusDisponibilidade'] = 'disponivel';
              if (item.unidadeMedida === 'un' || item.categoria === 'bebidas') {
                if (novaQtd <= 5) novoStatus = 'esgotado';
                else if (novaQtd <= item.estoqueMinimo) novoStatus = 'esgotando';
              } else {
                if (novaQtd <= 0) novoStatus = 'esgotado';
                else if (novaQtd <= item.estoqueMinimo) novoStatus = 'esgotando';
              }
              return { ...item, quantidadeAtual: novaQtd, statusDisponibilidade: novoStatus };
            }
            return item;
          }),
        }));
      },

      registrarSaidaManual: (itemId, quantidade, motivo, tenantId) => {
        const state = get();
        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let itemModificado: ItemEstoque | null = null;
        const itensAtualizados = state.itens.map((item) => {
          if (item.id === itemId) {
            const novaQtd = Math.max(0, item.quantidadeAtual - quantidade);
            let novoStatus = item.statusDisponibilidade;
            if (novaQtd <= 5 && (item.unidadeMedida === 'un' || item.categoria === 'bebidas')) novoStatus = 'esgotado';
            else if (novaQtd <= item.estoqueMinimo) novoStatus = 'esgotando';
            itemModificado = { ...item, quantidadeAtual: novaQtd, statusDisponibilidade: novoStatus };
            return itemModificado;
          }
          return item;
        });

        const novasMovimentacoes = [...state.movimentacoes];
        if (itemModificado) {
          const itemCast = itemModificado as ItemEstoque;
          novasMovimentacoes.unshift({
            id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            tenantId: tenantId || itemCast.tenantId,
            dataHora: agoraTexto,
            itemId: itemCast.id,
            itemNome: itemCast.nome,
            tipo: 'saida_manual',
            quantidade,
            unidadeMedida: itemCast.unidadeMedida,
            motivo: motivo || 'Uso operacional / descarte interno',
            responsavel: 'Operador / Cozinha',
            saldoApos: itemCast.quantidadeAtual,
          });
        }

        set({
          itens: itensAtualizados,
          movimentacoes: novasMovimentacoes,
        });
      },

      ajustarSobraDiaAnterior: (itemId, sobra) => {
        set((state) => ({
          itens: state.itens.map((item) => {
            if (item.id === itemId) {
              return { ...item, sobraDiaAnterior: sobra };
            }
            return item;
          }),
        }));
      },

      adicionarItemEstoque: (item, tenantId) => {
        const novo: ItemEstoque = {
          ...item,
          id: `est-${Date.now().toString().slice(-4)}`,
          tenantId: tenantId || item.tenantId,
        };
        set((state) => ({ itens: [novo, ...state.itens] }));
      },

      editarItemEstoque: (id, dados) => {
        set((state) => ({
          itens: state.itens.map((item) => (item.id === id ? { ...item, ...dados } : item)),
        }));
      },

      removerItemEstoque: (id) => {
        set((state) => ({
          itens: state.itens.filter((item) => item.id !== id),
        }));
      },

      adicionarCompra: (compra, tenantId) => {
        const novoId = `cmp-${Date.now().toString().slice(-4)}`;
        const tId = tenantId || compra.tenantId;
        const novoRegistro: RegistroCompra = { ...compra, id: novoId, tenantId: tId };
        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        set((state) => {
          let itemComprado: ItemEstoque | null = null;
          const itensAtualizados = state.itens.map((item) => {
            if (
              item.nome.toLowerCase() === compra.produtoNome.toLowerCase() &&
              (!tId || !item.tenantId || item.tenantId === tId)
            ) {
              const qtdAdicionada = compra.quantidade;
              const novaQtd = item.quantidadeAtual + qtdAdicionada;
              let novoStatus = item.statusDisponibilidade;
              if (novaQtd > item.estoqueMinimo) novoStatus = 'disponivel';
              itemComprado = {
                ...item,
                quantidadeAtual: novaQtd,
                precoCusto: compra.precoUnitario,
                statusDisponibilidade: novoStatus,
              };
              return itemComprado;
            }
            return item;
          });

          const novasMovimentacoes = [...state.movimentacoes];
          if (itemComprado) {
            const itemCast = itemComprado as ItemEstoque;
            novasMovimentacoes.unshift({
              id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              tenantId: tId || itemCast.tenantId,
              dataHora: agoraTexto,
              itemId: itemCast.id,
              itemNome: itemCast.nome,
              tipo: 'entrada_compra',
              quantidade: compra.quantidade,
              unidadeMedida: compra.unidadeMedida,
              motivo: `Compra NF / Fornecedor: ${compra.fornecedorOuLocal}`,
              responsavel: 'Compras / Almoxarifado',
              saldoApos: itemCast.quantidadeAtual,
            });
          }

          return {
            compras: [novoRegistro, ...state.compras],
            itens: itensAtualizados,
            movimentacoes: novasMovimentacoes,
          };
        });
      },

      salvarFichaTecnica: (ficha, tenantId) => {
        const tId = tenantId || ficha.tenantId;
        const fichaComTenant = { ...ficha, tenantId: tId };
        set((state) => {
          const existe = state.fichasTecnicas.some(
            (f) => f.id === ficha.id || (f.produtoId === ficha.produtoId && (!tId || f.tenantId === tId))
          );
          if (existe) {
            return {
              fichasTecnicas: state.fichasTecnicas.map((f) =>
                f.id === ficha.id || (f.produtoId === ficha.produtoId && (!tId || f.tenantId === tId))
                  ? fichaComTenant
                  : f
              ),
            };
          }
          return { fichasTecnicas: [...state.fichasTecnicas, fichaComTenant] };
        });
      },

      adicionarFornecedor: (fornecedor, tenantId) => {
        const novo: Fornecedor = {
          ...fornecedor,
          id: `forn-${Date.now().toString().slice(-4)}`,
          tenantId: tenantId || fornecedor.tenantId,
        };
        set((state) => ({ fornecedores: [...state.fornecedores, novo] }));
      },

      processarAberturaDiaConsumoPrevisto: () => {
        set((state) => ({
          itens: state.itens.map((item) => {
            if (item.metodoControle === 'recorrente' && item.consumoDiarioPrevisto) {
              const descontoEfetivo = Math.max(0, item.consumoDiarioPrevisto - (item.sobraDiaAnterior || 0));
              const novaQtd = Math.max(0, item.quantidadeAtual - descontoEfetivo);
              return {
                ...item,
                quantidadeAtual: Number(novaQtd.toFixed(2)),
                sobraDiaAnterior: 0,
              };
            }
            return item;
          }),
        }));
      },
    }),
    {
      name: 'eloserve_estoque_store_v5',
    }
  )
);
