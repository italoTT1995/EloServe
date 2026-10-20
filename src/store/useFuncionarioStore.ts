import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FuncionarioCompleto, CargoUsuario } from '../types';

const FUNCIONARIOS_INICIAIS: FuncionarioCompleto[] = [
  {
    id: 'func-01',
    nome: 'Carlos',
    sobrenome: 'Eduardo Ribeiro',
    telefoneWhatsApp: '(31) 98888-1122',
    dataNascimento: '14/10/1985', // Aniversariante deste mês!
    dataAdmissao: '15/10/2024',  // Completa 2 anos de empresa este mês!
    email: 'gerente@eloserve.com.br',
    cargo: 'admin_restaurante',
    salario: 4200.0,
    fgts: 336.0,
    inss: 462.0,
    periodoFerias: '10/01/2027 a 30/01/2027',
    ativo: true,
    pin: '1234',
  },
  {
    id: 'func-02',
    nome: 'Juliana',
    sobrenome: 'Mendes Castro',
    telefoneWhatsApp: '(31) 97777-3344',
    dataNascimento: '28/05/1996',
    dataAdmissao: '01/03/2025',
    email: 'caixa@eloserve.com.br',
    cargo: 'caixa',
    salario: 2100.0,
    fgts: 168.0,
    inss: 189.0,
    periodoFerias: 'Nenhum agendado',
    ativo: true,
    pin: '2233',
  },
  {
    id: 'func-03',
    nome: 'Lucas',
    sobrenome: 'Oliveira Santos',
    telefoneWhatsApp: '(31) 99222-5566',
    dataNascimento: '22/10/1998', // Aniversariante deste mês!
    dataAdmissao: '12/04/2025',
    email: 'garcom@eloserve.com.br',
    cargo: 'garcom',
    salario: 1800.0,
    fgts: 144.0,
    inss: 162.0,
    ativo: true,
    pin: '3344',
  },
  {
    id: 'func-04',
    nome: 'Chef Rodrigo',
    sobrenome: 'Albuquerque',
    telefoneWhatsApp: '(31) 99333-7788',
    dataNascimento: '03/08/1982',
    dataAdmissao: '15/10/2025', // Completa 1 ano de admissão este mês!
    email: 'cozinha@eloserve.com.br',
    cargo: 'cozinha',
    salario: 3500.0,
    fgts: 280.0,
    inss: 385.0,
    ativo: true,
    pin: '5566',
  },
  {
    id: 'func-05',
    nome: 'Thiago',
    sobrenome: 'Silva Pereira',
    telefoneWhatsApp: '(31) 99444-9900',
    dataNascimento: '19/11/1997',
    dataAdmissao: '20/06/2025',
    email: 'thiago.moto@eloserve.com.br',
    cargo: 'entregador',
    salario: 1950.0,
    fgts: 156.0,
    inss: 175.5,
    veiculo: {
      modelo: 'Honda CG 160 Fan',
      ano: 2023,
      cor: 'Vermelha',
      placa: 'RTE-4E29',
    },
    ativo: true,
    pin: '7788',
  },
];

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
      name: 'eloserve_funcionarios_store_v2',
    }
  )
);
