import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FuncionarioCompleto, CargoUsuario } from '../types';

const FUNCIONARIOS_INICIAIS: FuncionarioCompleto[] = [];

interface FuncionarioState {
  funcionarios: FuncionarioCompleto[];
  adicionarFuncionario: (f: Omit<FuncionarioCompleto, 'id'>) => void;
  editarFuncionario: (id: string, dados: Partial<FuncionarioCompleto>) => void;
  alternarStatusAtivo: (id: string) => void;
  removerFuncionario: (id: string) => void;
  getAniversariantesDoMes: (mesNumero?: number) => FuncionarioCompleto[];
  getAniversariantesDeEmpresa: () => { funcionario: FuncionarioCompleto; anosDeEmpresa: number }[];
}

export const useFuncionarioStore = create<FuncionarioState>()(
  persist(
    (set, get) => ({
      funcionarios: [],

      adicionarFuncionario: (dados) => {
        const novo: FuncionarioCompleto = {
          ...dados,
          id: `func-${Date.now().toString().slice(-4)}`,
        };
        set((state) => ({ funcionarios: [novo, ...state.funcionarios] }));
      },

      editarFuncionario: (id, dados) => {
        set((state) => ({
          funcionarios: state.funcionarios.map((f) => (f.id === id ? { ...f, ...dados } : f)),
        }));
      },

      alternarStatusAtivo: (id) => {
        set((state) => ({
          funcionarios: state.funcionarios.map((f) => (f.id === id ? { ...f, ativo: !f.ativo } : f)),
        }));
      },

      removerFuncionario: (id) => {
        set((state) => ({
          funcionarios: state.funcionarios.filter((f) => f.id !== id),
        }));
      },

      getAniversariantesDoMes: (mesNumero = 10) => {
        return get().funcionarios.filter((f) => {
          if (!f.dataNascimento) return false;
          const partes = f.dataNascimento.split('/');
          const mes = parseInt(partes[1], 10);
          return mes === mesNumero;
        });
      },

      getAniversariantesDeEmpresa: () => {
        const mesAtual = 10;
        const anoAtual = 2026;
        const resultado: { funcionario: FuncionarioCompleto; anosDeEmpresa: number }[] = [];

        get().funcionarios.forEach((f) => {
          if (!f.dataAdmissao) return;
          const partes = f.dataAdmissao.split('/');
          const mesAdmissao = parseInt(partes[1], 10);
          const anoAdmissao = parseInt(partes[2], 10);
          if (mesAdmissao === mesAtual && anoAdmissao < anoAtual) {
            resultado.push({
              funcionario: f,
              anosDeEmpresa: anoAtual - anoAdmissao,
            });
          }
        });

        return resultado;
      },
    }),
    {
      name: 'eloserve_funcionarios_store_v3',
    }
  )
);
