import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  LancamentoFinanceiro,
  LancamentoRecorrente,
  CategoriaFinanceira,
  TipoLancamentoFinanceiro,
  StatusLancamentoFinanceiro,
  FormaPagamentoFinanceiro,
  HistoricoAlteracaoFinanceira,
} from '../types';

export const CATEGORIAS_PADRAO_SISTEMA: CategoriaFinanceira[] = [
  {
    id: 'cat_compras_alimentos_bebidas',
    nome: 'Compras de alimentos e bebidas',
    tipo: 'despesa',
    linhaDRE: 'cmv',
    descricao: 'Insumos de cozinha, feira, carnes, laticínios e bebidas para revenda.',
    corBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icone: 'Apple',
    sistema: true,
  },
  {
    id: 'cat_funcionarios_rh',
    nome: 'Funcionários, salários, encargos e benefícios',
    tipo: 'despesa',
    linhaDRE: 'pessoal',
    descricao: 'Folha de pagamento, diárias de garçom/cozinha, vales e encargos.',
    corBadge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    icone: 'Users',
    sistema: true,
  },
  {
    id: 'cat_aluguel',
    nome: 'Aluguel',
    tipo: 'despesa',
    linhaDRE: 'ocupacao',
    descricao: 'Locação do imóvel comercial, condomínio e IPTU do ponto.',
    corBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icone: 'Store',
    sistema: true,
  },
  {
    id: 'cat_utilidades',
    nome: 'Água, energia, internet e telefone',
    tipo: 'despesa',
    linhaDRE: 'ocupacao',
    descricao: 'Contas de luz (energia), água/esgoto, gás canalizado/botijão e telecomunicações.',
    corBadge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    icone: 'Lightbulb',
    sistema: true,
  },
  {
    id: 'cat_impostos_taxas',
    nome: 'Impostos e taxas',
    tipo: 'despesa',
    linhaDRE: 'deducoes',
    descricao: 'Simples Nacional (DAS), ICMS, tributos fiscais e alvarás municipais.',
    corBadge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    icone: 'Receipt',
    sistema: true,
  },
  {
    id: 'cat_fornecedores',
    nome: 'Fornecedores',
    tipo: 'despesa',
    linhaDRE: 'cmv',
    descricao: 'Pagamento de faturas de distribuidores e atacadistas de insumos.',
    corBadge: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    icone: 'Package',
    sistema: true,
  },
  {
    id: 'cat_manutencao_equipamentos',
    nome: 'Manutenção e equipamentos',
    tipo: 'despesa',
    linhaDRE: 'servicos',
    descricao: 'Reparos em fogões, coifas, freezers, ar-condicionado e maquinários.',
    corBadge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    icone: 'Wrench',
    sistema: true,
  },
  {
    id: 'cat_embalagens_consumo',
    nome: 'Embalagens e materiais de consumo',
    tipo: 'despesa',
    linhaDRE: 'comercial',
    descricao: 'Embalagens térmicas de delivery, sacolas, papel toalha e descartáveis.',
    corBadge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    icone: 'Bike',
    sistema: true,
  },
  {
    id: 'cat_marketing',
    nome: 'Marketing',
    tipo: 'despesa',
    linhaDRE: 'comercial',
    descricao: 'Anúncios em redes sociais, panfletagem, promoções e fotos do cardápio.',
    corBadge: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    icone: 'Megaphone',
    sistema: true,
  },
  {
    id: 'cat_taxas_cartao_delivery',
    nome: 'Taxas de cartão e delivery',
    tipo: 'despesa',
    linhaDRE: 'resultado_financeiro',
    descricao: 'Taxas de adquirência de máquinas de cartão, antecipações e comissões.',
    corBadge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    icone: 'CreditCard',
    sistema: true,
  },
  {
    id: 'cat_outras_despesas',
    nome: 'Outras despesas',
    tipo: 'despesa',
    linhaDRE: 'outros',
    descricao: 'Honorários contábeis, despesas bancárias e imprevistos gerais.',
    corBadge: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    icone: 'Layers',
    sistema: true,
  },
  {
    id: 'cat_receitas_adicionais',
    nome: 'Receitas adicionais',
    tipo: 'receita',
    linhaDRE: 'receita_bruta',
    descricao: 'Locação de espaço para eventos, rendimentos e outras receitas operacionais.',
    corBadge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    icone: 'TrendingUp',
    sistema: true,
  },
];

interface FinanceiroState {
  lancamentos: LancamentoFinanceiro[];
  recorrencias: LancamentoRecorrente[];
  categoriasCustomizadas: CategoriaFinanceira[];

  // Lançamentos Manuais
  adicionarLancamento: (
    dados: Omit<LancamentoFinanceiro, 'id' | 'criadoEm' | 'atualizadoEm' | 'historicoAlteracoes'>
  ) => LancamentoFinanceiro;
  editarLancamento: (
    id: string,
    dados: Partial<LancamentoFinanceiro>,
    usuarioNome?: string,
    motivo?: string
  ) => void;
  alternarStatusLancamento: (id: string, usuarioNome?: string) => void;
  cancelarLancamento: (id: string, usuarioNome?: string, motivo?: string) => void;
  excluirLancamento: (id: string) => void;

  // Lançamentos Recorrentes
  adicionarRecorrencia: (
    dados: Omit<LancamentoRecorrente, 'id' | 'criadoEm' | 'atualizadoEm'>
  ) => LancamentoRecorrente;
  editarRecorrencia: (
    id: string,
    dados: Partial<LancamentoRecorrente>,
    propagarParaFuturos?: boolean
  ) => void;
  alternarAtivoRecorrencia: (id: string) => void;
  excluirRecorrencia: (id: string, excluirFuturosPendentes?: boolean) => void;
  processarRecorrencias: (tenantId: string) => number; // Retorna quantidade de novos lançamentos gerados

  // Categorias
  adicionarCategoriaCustom: (
    dados: Omit<CategoriaFinanceira, 'id' | 'sistema'>
  ) => CategoriaFinanceira;
  removerCategoriaCustom: (id: string) => void;

  // Limpeza de dados de demonstração/testes
  limparDadosDemonstracao: () => void;

  // Consultas
  getCategorias: (tenantId?: string) => CategoriaFinanceira[];
  getLancamentosPorTenant: (tenantId?: string) => LancamentoFinanceiro[];
  getRecorrenciasPorTenant: (tenantId?: string) => LancamentoRecorrente[];
}

export const useFinanceiroStore = create<FinanceiroState>()(
  persist(
    (set, get) => ({
      lancamentos: [],
      recorrencias: [],
      categoriasCustomizadas: [],

      getCategorias: (tenantId?: string) => {
        const state = get();
        const custom = (state.categoriasCustomizadas || []).filter(
          (c) => !c.tenantId || c.tenantId === 'global' || c.tenantId === tenantId
        );
        return [...CATEGORIAS_PADRAO_SISTEMA, ...custom];
      },

      getLancamentosPorTenant: (tenantId?: string) => {
        const state = get();
        if (!tenantId || tenantId === 'todos') {
          return state.lancamentos || [];
        }
        const idAlvo = tenantId === 'global' ? 'tenant-01' : tenantId;
        return (state.lancamentos || []).filter((l) => !l.tenantId || l.tenantId === idAlvo);
      },

      getRecorrenciasPorTenant: (tenantId?: string) => {
        const state = get();
        if (!tenantId || tenantId === 'todos') {
          return state.recorrencias || [];
        }
        const idAlvo = tenantId === 'global' ? 'tenant-01' : tenantId;
        return (state.recorrencias || []).filter((r) => !r.tenantId || r.tenantId === idAlvo);
      },

      adicionarLancamento: (dados) => {
        const agora = new Date().toISOString();
        const novo: LancamentoFinanceiro = {
          ...dados,
          id: `lanc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          criadoEm: agora,
          atualizadoEm: agora,
          historicoAlteracoes: [
            {
              id: `hist-${Date.now()}`,
              dataHora: agora,
              usuarioNome: dados.cadastradoPor || 'Sistema',
              campoAlterado: 'Criação do lançamento',
              valorNovo: `Valor R$ ${dados.valor.toFixed(2)} (${dados.status})`,
            },
          ],
        };

        set((state) => ({
          lancamentos: [novo, ...(state.lancamentos || [])],
        }));

        return novo;
      },

      editarLancamento: (id, dados, usuarioNome = 'Usuário', motivo = 'Edição manual') => {
        const agora = new Date().toISOString();
        set((state) => {
          const lista = state.lancamentos || [];
          const index = lista.findIndex((l) => l.id === id);
          if (index === -1) return state;

          const lancAtual = lista[index];
          const alteracoes: HistoricoAlteracaoFinanceira[] = [...(lancAtual.historicoAlteracoes || [])];

          // Registra quais campos foram alterados no histórico
          Object.keys(dados).forEach((campo) => {
            const valAntigo = (lancAtual as any)[campo];
            const valNovo = (dados as any)[campo];
            if (valAntigo !== valNovo && campo !== 'atualizadoEm' && campo !== 'historicoAlteracoes') {
              alteracoes.unshift({
                id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                dataHora: agora,
                usuarioNome,
                campoAlterado: campo,
                valorAntigo: String(valAntigo ?? ''),
                valorNovo: String(valNovo ?? ''),
                motivo,
              });
            }
          });

          const atualizado: LancamentoFinanceiro = {
            ...lancAtual,
            ...dados,
            atualizadoEm: agora,
            historicoAlteracoes: alteracoes.slice(0, 30), // Guarda até 30 registros de auditoria
          };

          const novaLista = [...lista];
          novaLista[index] = atualizado;

          return { lancamentos: novaLista };
        });
      },

      alternarStatusLancamento: (id, usuarioNome = 'Usuário') => {
        const agora = new Date().toISOString();
        const dataHojeStr = agora.split('T')[0];

        set((state) => {
          const lista = state.lancamentos || [];
          return {
            lancamentos: lista.map((l) => {
              if (l.id !== id) return l;

              let novoStatus: StatusLancamentoFinanceiro;
              let novaDataPagamento = l.dataPagamento;

              if (l.tipo === 'despesa') {
                novoStatus = l.status === 'pago' ? 'pendente' : 'pago';
                novaDataPagamento = novoStatus === 'pago' ? dataHojeStr : undefined;
              } else {
                novoStatus = l.status === 'recebido' ? 'pendente' : 'recebido';
                novaDataPagamento = novoStatus === 'recebido' ? dataHojeStr : undefined;
              }

              const historico: HistoricoAlteracaoFinanceira[] = [
                {
                  id: `hist-${Date.now()}`,
                  dataHora: agora,
                  usuarioNome,
                  campoAlterado: 'status',
                  valorAntigo: l.status,
                  valorNovo: novoStatus,
                  motivo: 'Alternância de status de liquidação',
                },
                ...(l.historicoAlteracoes || []),
              ];

              return {
                ...l,
                status: novoStatus,
                dataPagamento: novaDataPagamento,
                atualizadoEm: agora,
                historicoAlteracoes: historico.slice(0, 30),
              };
            }),
          };
        });
      },

      cancelarLancamento: (id, usuarioNome = 'Usuário', motivo = 'Cancelamento') => {
        const agora = new Date().toISOString();
        set((state) => {
          const lista = state.lancamentos || [];
          return {
            lancamentos: lista.map((l) => {
              if (l.id !== id) return l;
              const historico: HistoricoAlteracaoFinanceira[] = [
                {
                  id: `hist-${Date.now()}`,
                  dataHora: agora,
                  usuarioNome,
                  campoAlterado: 'status',
                  valorAntigo: l.status,
                  valorNovo: 'cancelado',
                  motivo,
                },
                ...(l.historicoAlteracoes || []),
              ];

              return {
                ...l,
                status: 'cancelado',
                atualizadoEm: agora,
                historicoAlteracoes: historico.slice(0, 30),
              };
            }),
          };
        });
      },

      excluirLancamento: (id) => {
        set((state) => ({
          lancamentos: (state.lancamentos || []).filter((l) => l.id !== id),
        }));
      },

      // Lançamentos Recorrentes
      adicionarRecorrencia: (dados) => {
        const agora = new Date().toISOString();
        const novaRec: LancamentoRecorrente = {
          ...dados,
          id: `rec-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          criadoEm: agora,
          atualizadoEm: agora,
        };

        set((state) => ({
          recorrencias: [novaRec, ...(state.recorrencias || [])],
        }));

        // Imediatamente gera os lançamentos futuros sem duplicidade
        setTimeout(() => {
          get().processarRecorrencias(dados.tenantId);
        }, 10);

        return novaRec;
      },

      editarRecorrencia: (id, dados, propagarParaFuturos = false) => {
        const agora = new Date().toISOString();
        const hojeStr = agora.split('T')[0];

        set((state) => {
          const lista = state.recorrencias || [];
          const recIndex = lista.findIndex((r) => r.id === id);
          if (recIndex === -1) return state;

          const recAtual = lista[recIndex];
          const recAtualizada: LancamentoRecorrente = {
            ...recAtual,
            ...dados,
            atualizadoEm: agora,
          };

          const novaLista = [...lista];
          novaLista[recIndex] = recAtualizada;

          let novosLancamentos = state.lancamentos || [];

          // Se o usuário optou por propagar alterações para lançamentos futuros pendentes
          if (propagarParaFuturos) {
            novosLancamentos = novosLancamentos.map((l) => {
              if (
                l.recorrenciaId === id &&
                l.status === 'pendente' &&
                (l.dataVencimento || l.dataCompetencia) >= hojeStr
              ) {
                return {
                  ...l,
                  descricao: dados.descricao !== undefined ? dados.descricao : l.descricao,
                  valor: dados.valorEstimado !== undefined ? dados.valorEstimado : l.valor,
                  categoriaId: dados.categoriaId !== undefined ? dados.categoriaId : l.categoriaId,
                  categoriaNome: dados.categoriaNome !== undefined ? dados.categoriaNome : l.categoriaNome,
                  formaPagamento: dados.formaPagamento !== undefined ? dados.formaPagamento : l.formaPagamento,
                  fornecedorBeneficiario:
                    dados.fornecedorBeneficiario !== undefined
                      ? dados.fornecedorBeneficiario
                      : l.fornecedorBeneficiario,
                  atualizadoEm: agora,
                };
              }
              return l;
            });
          }

          return {
            recorrencias: novaLista,
            lancamentos: novosLancamentos,
          };
        });

        // Reprocessa para preencher eventuais lacunas
        setTimeout(() => {
          const rec = get().recorrencias.find((r) => r.id === id);
          if (rec) get().processarRecorrencias(rec.tenantId);
        }, 10);
      },

      alternarAtivoRecorrencia: (id) => {
        const agora = new Date().toISOString();
        set((state) => ({
          recorrencias: (state.recorrencias || []).map((r) =>
            r.id === id
              ? {
                  ...r,
                  ativo: !r.ativo,
                  atualizadoEm: agora,
                }
              : r
          ),
        }));

        const rec = get().recorrencias.find((r) => r.id === id);
        if (rec && rec.ativo) {
          get().processarRecorrencias(rec.tenantId);
        }
      },

      excluirRecorrencia: (id, excluirFuturosPendentes = false) => {
        const hojeStr = new Date().toISOString().split('T')[0];
        set((state) => {
          let listaLancamentos = state.lancamentos || [];
          if (excluirFuturosPendentes) {
            listaLancamentos = listaLancamentos.filter(
              (l) =>
                !(
                  l.recorrenciaId === id &&
                  l.status === 'pendente' &&
                  (l.dataVencimento || l.dataCompetencia) >= hojeStr
                )
            );
          }
          return {
            recorrencias: (state.recorrencias || []).filter((r) => r.id !== id),
            lancamentos: listaLancamentos,
          };
        });
      },

      // GERADOR DE RECORRÊNCIA AUTOMÁTICO (SEM DUPLICIDADE)
      processarRecorrencias: (tenantId: string) => {
        const state = get();
        const idAlvo = !tenantId || tenantId === 'todos' || tenantId === 'global' ? 'tenant-01' : tenantId;
        const recorrenciasAtivas = (state.recorrencias || []).filter(
          (r) => (r.tenantId === idAlvo || !r.tenantId) && r.ativo
        );

        if (recorrenciasAtivas.length === 0) return 0;

        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const mesAtual = agora.getMonth() + 1;

        // Iremos gerar parcelas do mês atual até 3 meses no futuro
        const periodosAlvo: { ano: number; mes: number }[] = [];
        for (let i = 0; i <= 3; i++) {
          let a = anoAtual;
          let m = mesAtual + i;
          if (m > 12) {
            a += Math.floor((m - 1) / 12);
            m = ((m - 1) % 12) + 1;
          }
          periodosAlvo.push({ ano: a, mes: m });
        }

        const novosParaInserir: LancamentoFinanceiro[] = [];
        const lancamentosExistentes = state.lancamentos || [];

        recorrenciasAtivas.forEach((rec) => {
          const dataInicio = new Date(rec.dataInicio);
          const dataTermino = rec.dataTermino ? new Date(rec.dataTermino) : null;

          periodosAlvo.forEach(({ ano, mes }) => {
            const mesStr = mes.toString().padStart(2, '0');
            const diaVenc = Math.min(Math.max(rec.diaVencimento || 10, 1), 28);
            const diaStr = diaVenc.toString().padStart(2, '0');

            const dataCompetenciaAlvo = `${ano}-${mesStr}-01`;
            const dataVencimentoAlvo = `${ano}-${mesStr}-${diaStr}`;
            const dataVencObj = new Date(dataVencimentoAlvo);

            // Verifica se está dentro da vigência
            if (dataVencObj < new Date(rec.dataInicio.split('T')[0])) return;
            if (dataTermino && dataVencObj > dataTermino) return;

            // Proteção contra duplicação: verifica se já existe lançamento para essa recorrência e mês
            const jaExiste = lancamentosExistentes.some(
              (l) =>
                l.recorrenciaId === rec.id &&
                (l.dataCompetencia.startsWith(`${ano}-${mesStr}`) ||
                  (l.dataVencimento && l.dataVencimento.startsWith(`${ano}-${mesStr}`)))
            );

            const jaEnfileirado = novosParaInserir.some(
              (l) =>
                l.recorrenciaId === rec.id &&
                l.dataCompetencia.startsWith(`${ano}-${mesStr}`)
            );

            if (!jaExiste && !jaEnfileirado) {
              const agoraIso = new Date().toISOString();
              novosParaInserir.push({
                id: `lanc-rec-${rec.id}-${ano}${mesStr}`,
                tenantId: rec.tenantId || idAlvo,
                descricao: rec.descricao,
                tipo: rec.tipo,
                categoriaId: rec.categoriaId,
                categoriaNome: rec.categoriaNome,
                valor: rec.valorEstimado,
                dataCompetencia: dataCompetenciaAlvo,
                dataVencimento: dataVencimentoAlvo,
                dataPagamento: undefined, // Nunca pago automaticamente!
                formaPagamento: rec.formaPagamento || 'boleto',
                status: 'pendente', // Sempre inicia como pendente até confirmação
                fornecedorBeneficiario: rec.fornecedorBeneficiario,
                observacoes: rec.observacoes ? `[Recorrência Automática] ${rec.observacoes}` : '[Recorrência Automática]',
                origem: 'recorrente',
                recorrenciaId: rec.id,
                parcelaInfo: `${mes}/${ano}`,
                cadastradoPor: 'Sistema (Recorrência Automática)',
                criadoEm: agoraIso,
                atualizadoEm: agoraIso,
                historicoAlteracoes: [
                  {
                    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    dataHora: agoraIso,
                    usuarioNome: 'Sistema (Recorrência Automática)',
                    campoAlterado: 'Geração automática de parcela',
                    valorNovo: `Parcela de ${mesStr}/${ano} criada com status pendente`,
                  },
                ],
              });
            }
          });
        });

        if (novosParaInserir.length > 0) {
          set((prev) => ({
            lancamentos: [...novosParaInserir, ...(prev.lancamentos || [])],
          }));
        }

        return novosParaInserir.length;
      },

      // Categorias Customizadas
      adicionarCategoriaCustom: (dados) => {
        const novaCat: CategoriaFinanceira = {
          ...dados,
          id: `cat_custom_${Date.now().toString(36)}`,
          sistema: false,
          corBadge: dados.corBadge || 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        };

        set((state) => ({
          categoriasCustomizadas: [...(state.categoriasCustomizadas || []), novaCat],
        }));

        return novaCat;
      },

      removerCategoriaCustom: (id) => {
        set((state) => ({
          categoriasCustomizadas: (state.categoriasCustomizadas || []).filter((c) => c.id !== id),
        }));
      },

      limparDadosDemonstracao: () => {
        set((state) => ({
          lancamentos: (state.lancamentos || []).filter((l) => {
            const desc = (l.descricao || '').toLowerCase();
            const cad = (l.cadastradoPor || '').toLowerCase();
            return (
              !desc.includes('feira semanal') &&
              !desc.includes('locação salão') &&
              !desc.includes('link dedicado') &&
              !desc.includes('aluguel comercial do imóvel') &&
              !desc.includes('teste financeiro') &&
              !cad.includes('audit')
            );
          }),
          recorrencias: (state.recorrencias || []).filter((r) => {
            const desc = (r.descricao || '').toLowerCase();
            return (
              !desc.includes('feira semanal') &&
              !desc.includes('locação salão') &&
              !desc.includes('link dedicado') &&
              !desc.includes('aluguel comercial do imóvel')
            );
          }),
        }));
      },
    }),
    {
      name: 'eloserve_financeiro_store_v1',
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (Array.isArray(state.lancamentos)) {
            state.lancamentos = state.lancamentos.filter((l) => {
              const desc = (l.descricao || '').toLowerCase();
              const cad = (l.cadastradoPor || '').toLowerCase();
              return (
                !desc.includes('feira semanal') &&
                !desc.includes('locação salão') &&
                !desc.includes('link dedicado') &&
                !desc.includes('aluguel comercial do imóvel') &&
                !desc.includes('teste financeiro') &&
                !cad.includes('audit')
              );
            });
          }
          if (Array.isArray(state.recorrencias)) {
            state.recorrencias = state.recorrencias.filter((r) => {
              const desc = (r.descricao || '').toLowerCase();
              return (
                !desc.includes('feira semanal') &&
                !desc.includes('locação salão') &&
                !desc.includes('link dedicado') &&
                !desc.includes('aluguel comercial do imóvel')
              );
            });
          }
        }
      },
    }
  )
);
