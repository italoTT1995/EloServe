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

  // Ações de Integração Cardápio / PDV / Vendas / Salão & Mesas
  processarBaixaVenda: (venda: VendaRealizada) => { sucesso: boolean; movimentacoesGeradas: number };
  processarBaixaItensMesa: (numeroMesa: number, itensComanda: ItemComandaMesa[], operador: string) => { sucesso: boolean; movimentacoesGeradas: number };
  estornarBaixaVenda: (venda: VendaRealizada, motivo: string, operador: string) => { sucesso: boolean; itensRestaurados: number };
  registrarMovimentacao: (mov: Omit<MovimentacaoEstoque, 'id' | 'dataHora'>) => void;

  // Ações de Estoque
  baixarEstoquePorVenda: (produtoNome: string, quantidade: number) => void;
  registrarSaidaManual: (itemId: string, quantidade: number, motivo: string) => void;
  ajustarSobraDiaAnterior: (itemId: string, sobra: number) => void;
  adicionarItemEstoque: (item: Omit<ItemEstoque, 'id'>) => void;
  editarItemEstoque: (id: string, dados: Partial<ItemEstoque>) => void;
  removerItemEstoque: (id: string) => void;

  // Ações de Compras
  adicionarCompra: (compra: Omit<RegistroCompra, 'id'>) => void;

  // Ações de Fichas Técnicas
  salvarFichaTecnica: (ficha: FichaTecnica) => void;

  // Ações de Fornecedores
  adicionarFornecedor: (fornecedor: Omit<Fornecedor, 'id'>) => void;

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
      // BAIXA AUTOMÁTICA EM VENDAS COM FICHA TÉCNICA (SEÇÃO 2 E 4)
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

        venda.itens.forEach((itemVendido) => {
          // 1. Caso o item do prato possua Ficha Técnica / Ingredientes vinculados
          if (itemVendido.fichaTecnica && itemVendido.fichaTecnica.length > 0) {
            itemVendido.fichaTecnica.forEach((ing) => {
              const itemIdx = itensAtuais.findIndex((it) => it.id === ing.ingredienteId);
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
          } else {
            // 2. Se o prato não possui ficha técnica mas é um produto de controle individual (ex: cerveja/refrigerante)
            const itemIdx = itensAtuais.findIndex(
              (it) =>
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
      processarBaixaItensMesa: (numeroMesa, itensComanda, operador) => {
        const state = get();
        const itensAtuais = state.itens.map((it) => ({ ...it }));
        const novasMovimentacoes: MovimentacaoEstoque[] = [];
        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        itensComanda.forEach((itemLancado) => {
          // 1. Caso o prato possua Ficha Técnica cadastrada
          const ficha = state.fichasTecnicas.find((f) => f.produtoId === itemLancado.produtoId);

          if (ficha && ficha.componentes && ficha.componentes.length > 0) {
            ficha.componentes.forEach((comp) => {
              const itemIdx = itensAtuais.findIndex((it) => it.id === comp.ingredienteId);
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
          } else {
            // 2. Se não possui ficha técnica mas é um produto de controle individual (ex: cerveja/refrigerante)
            const itemIdx = itensAtuais.findIndex(
              (it) =>
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

        venda.itens.forEach((itemVendido) => {
          if (itemVendido.fichaTecnica && itemVendido.fichaTecnica.length > 0) {
            itemVendido.fichaTecnica.forEach((ing) => {
              const itemIdx = itensAtuais.findIndex((it) => it.id === ing.ingredienteId);
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
          } else {
            const itemIdx = itensAtuais.findIndex(
              (it) =>
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

      baixarEstoquePorVenda: (produtoNome, quantidade) => {
        if (!produtoNome) return;
        set((state) => ({
          itens: (state.itens || []).map((item) => {
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

      registrarSaidaManual: (itemId, quantidade, motivo) => {
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

      adicionarItemEstoque: (item) => {
        const novo: ItemEstoque = {
          ...item,
          id: `est-${Date.now().toString().slice(-4)}`,
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

      adicionarCompra: (compra) => {
        const novoId = `cmp-${Date.now().toString().slice(-4)}`;
        const novoRegistro: RegistroCompra = { ...compra, id: novoId };
        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        set((state) => {
          let itemComprado: ItemEstoque | null = null;
          const itensAtualizados = state.itens.map((item) => {
            if (item.nome.toLowerCase() === compra.produtoNome.toLowerCase()) {
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

      salvarFichaTecnica: (ficha) => {
        set((state) => {
          const existe = state.fichasTecnicas.some((f) => f.id === ficha.id || f.produtoId === ficha.produtoId);
          if (existe) {
            return {
              fichasTecnicas: state.fichasTecnicas.map((f) =>
                f.id === ficha.id || f.produtoId === ficha.produtoId ? ficha : f
              ),
            };
          }
          return { fichasTecnicas: [...state.fichasTecnicas, ficha] };
        });
      },

      adicionarFornecedor: (fornecedor) => {
        const novo: Fornecedor = {
          ...fornecedor,
          id: `forn-${Date.now().toString().slice(-4)}`,
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
      name: 'eloserve_estoque_store_v4',
    }
  )
);
