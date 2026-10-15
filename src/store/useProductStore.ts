import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Produto, Categoria } from '../types';

export const CATEGORIAS_POR_TENANT: Record<string, Categoria[]> = {
  // tenant-01: Churrascaria & Parrilla Fogo de Minas
  'tenant-01': [
    { id: 'c_fg_1', nome: 'Cortes Nobres na Brasa' },
    { id: 'c_fg_2', nome: 'Pratos Principais & Porções' },
    { id: 'c_fg_3', nome: 'Acompanhamentos' },
    { id: 'c_fg_4', nome: 'Bebidas & Vinhos' },
    { id: 'c_fg_5', nome: 'Sobremesas da Casa' },
  ],
  // tenant-02: Pizzaria & Trattoria Bella Napoli
  'tenant-02': [
    { id: 'c_bn_1', nome: 'Pizzas Tradicionais' },
    { id: 'c_bn_2', nome: 'Pizzas Especiais' },
    { id: 'c_bn_3', nome: 'Calzones & Massas' },
    { id: 'c_bn_4', nome: 'Vinhos & Bebidas' },
    { id: 'c_bn_5', nome: 'Dolci Italianos' },
  ],
  // tenant-03: Smash Burguer Mania
  'tenant-03': [
    { id: 'c_sm_1', nome: 'Smash Burgers' },
    { id: 'c_sm_2', nome: 'Burgers Artesanais' },
    { id: 'c_sm_3', nome: 'Porções & Fritas' },
    { id: 'c_sm_4', nome: 'Bebidas & Chopp' },
    { id: 'c_sm_5', nome: 'Shakes & Sobremesas' },
  ],
  // tenant-04: Boteco & Espetos do Silva
  'tenant-04': [
    { id: 'c_bs_1', nome: 'Espetinhos na Brasa' },
    { id: 'c_bs_2', nome: 'Petiscos de Boteco' },
    { id: 'c_bs_3', nome: 'Cervejas Geladas' },
    { id: 'c_bs_4', nome: 'Caipirinhas & Doses' },
    { id: 'c_bs_5', nome: 'Sobremesas' },
  ],
  // tenant-05: Sushi Prime Oriental
  'tenant-05': [
    { id: 'c_sp_1', nome: 'Combinados Prime' },
    { id: 'c_sp_2', nome: 'Temakis & Rolls' },
    { id: 'c_sp_3', nome: 'Sashimis Frescos' },
    { id: 'c_sp_4', nome: 'Bebidas Japonesas' },
    { id: 'c_sp_5', nome: 'Sobremesas Orientais' },
  ],
};

export const PRODUTOS_POR_TENANT: Record<string, Produto[]> = {
  // Churrascaria & Parrilla Fogo de Minas
  'tenant-01': [
    {
      id: 'p_fg_1',
      categoriaId: 'c_fg_1',
      nome: 'Picanha Angus na Brasa (2 pessoas)',
      descricao: '600g de picanha importada maturada com sal de parrilla e chimichurri.',
      precoVenda: 128.0,
      precoCusto: 35.97,
      fotoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80',
      setorPreparo: 'cozinha',
      disponivel: true,
      destaque: true,
      fichaTecnica: [
        { ingredienteId: 'est-picanha', ingredienteNome: 'Picanha Bovina Angus Resfriada', quantidade: 600, unidadeMedida: 'g', custoUnitarioEstimado: 34.8 },
        { ingredienteId: 'est-sal', ingredienteNome: 'Sal de Parrilla Grosso Especial', quantidade: 10, unidadeMedida: 'g', custoUnitarioEstimado: 0.09 },
        { ingredienteId: 'est-farofa', ingredienteNome: 'Farofa Especial da Casa na Manteiga', quantidade: 150, unidadeMedida: 'g', custoUnitarioEstimado: 1.08 },
      ],
    },
    { id: 'p_fg_2', categoriaId: 'c_fg_1', nome: 'Bife Ancho com Chimichurri Uruguaio', descricao: '400g de corte nobre ancho grelhado na brasa viva ao ponto do cliente.', precoVenda: 79.0, precoCusto: 28.0, fotoUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=300&auto=format&fit=crop&q=80', setorPreparo: 'cozinha', disponivel: true, destaque: true },
    { id: 'p_fg_9', categoriaId: 'c_fg_1', nome: 'Filé Mignon com Manteiga de Ervas', descricao: '350g de medalhão grelhado na manteiga clarificada.', precoVenda: 89.0, precoCusto: 32.0, fotoUrl: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=300&auto=format&fit=crop&q=80', setorPreparo: 'cozinha', disponivel: true },
    { id: 'p_fg_3', categoriaId: 'c_fg_2', nome: 'Costela no Bafo com Mandioca na Manteiga', descricao: 'Costela bovina desmanchando, marinada 12h na cerveja preta e ervas.', precoVenda: 84.0, precoCusto: 30.0, fotoUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=300&auto=format&fit=crop&q=80', setorPreparo: 'cozinha', disponivel: false },
    { id: 'p_fg_4', categoriaId: 'c_fg_2', nome: 'Linguiça Artesanal de Pernil na Brasa', descricao: 'Feita na casa com pimenta biquinho, servida com pão de alho crocante.', precoVenda: 34.0, precoCusto: 10.0, fotoUrl: 'https://images.unsplash.com/photo-1597393353415-b3730f3719fe?w=300&auto=format&fit=crop&q=80', setorPreparo: 'cozinha', disponivel: true },
    { id: 'p_fg_10', categoriaId: 'c_fg_2', nome: 'Frango Grelhado na Brasa com Limão', descricao: 'Sobrecoxa desossada marinada com ervas frescas.', precoVenda: 42.0, precoCusto: 14.0, fotoUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&auto=format&fit=crop&q=80', setorPreparo: 'cozinha', disponivel: true },
    {
      id: 'p_fg_5',
      categoriaId: 'c_fg_3',
      nome: 'Farofa de Ovos com Bacon & Couve Crocante',
      descricao: 'Farofa crocante na manteiga de garrafa.',
      precoVenda: 19.0,
      precoCusto: 2.48,
      fotoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80',
      setorPreparo: 'cozinha',
      disponivel: true,
      fichaTecnica: [
        { ingredienteId: 'est-farofa', ingredienteNome: 'Farofa Especial da Casa na Manteiga', quantidade: 150, unidadeMedida: 'g', custoUnitarioEstimado: 1.08 },
        { ingredienteId: 'est-bacon', ingredienteNome: 'Bacon Especial Fatiado', quantidade: 50, unidadeMedida: 'g', custoUnitarioEstimado: 1.4 },
      ],
    },
    {
      id: 'p_fg_11',
      categoriaId: 'c_fg_3',
      nome: 'Batata Rústica com Alecrim e Alho',
      descricao: 'Batatas douradas com casca e molho aioli.',
      precoVenda: 24.0,
      precoCusto: 3.44,
      fotoUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=300&auto=format&fit=crop&q=80',
      setorPreparo: 'cozinha',
      disponivel: true,
      fichaTecnica: [
        { ingredienteId: 'est-03', ingredienteNome: 'Batata Pré-Frita Congelada (1kg)', quantidade: 400, unidadeMedida: 'g', custoUnitarioEstimado: 3.4 },
        { ingredienteId: 'est-sal', ingredienteNome: 'Sal de Parrilla Grosso Especial', quantidade: 5, unidadeMedida: 'g', custoUnitarioEstimado: 0.04 },
      ],
    },
    { id: 'p_fg_6', categoriaId: 'c_fg_4', nome: 'Chopp Brahma 500ml', descricao: 'Chopp claro tirado com colarinho cremoso a -2°C.', precoVenda: 15.0, precoCusto: 5.5, fotoUrl: 'https://images.unsplash.com/photo-1608270546103-976214151a56?w=300&auto=format&fit=crop&q=80', setorPreparo: 'bar', disponivel: true },
    { id: 'p_fg_12', categoriaId: 'c_fg_4', nome: 'Cerveja Heineken 600ml Garrafa', descricao: 'Puro malte estupidamente gelada no balde.', precoVenda: 18.0, precoCusto: 8.5, fotoUrl: 'https://images.unsplash.com/photo-1618886614638-80e3c153d31a?w=300&auto=format&fit=crop&q=80', setorPreparo: 'bar', disponivel: true },
    { id: 'p_fg_7', categoriaId: 'c_fg_4', nome: 'Vinho Tinto Malbec Reserva 750ml', descricao: 'Vinho argentino encorpado de Mendoza, ideal para carnes.', precoVenda: 95.0, precoCusto: 42.0, fotoUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&auto=format&fit=crop&q=80', setorPreparo: 'bar', disponivel: true },
    { id: 'p_fg_13', categoriaId: 'c_fg_4', nome: 'Refrigerante Lata 350ml', descricao: 'Coca-Cola, Guaraná Antarctica ou Zero.', precoVenda: 8.0, precoCusto: 3.0, fotoUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80', setorPreparo: 'bar', disponivel: true },
    { id: 'p_fg_8', categoriaId: 'c_fg_5', nome: 'Pudim de Leite com Calda de Queijo Canastra', descricao: 'Receita mineira tradicional cremosa sem furinhos.', precoVenda: 16.0, precoCusto: 4.0, fotoUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=300&auto=format&fit=crop&q=80', setorPreparo: 'cozinha', disponivel: true },
    { id: 'p_fg_14', categoriaId: 'c_fg_5', nome: 'Petit Gâteau de Chocolate com Sorvete', descricao: 'Bolo quente com recheio cremoso e sorvete de creme.', precoVenda: 24.0, precoCusto: 7.0, fotoUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&auto=format&fit=crop&q=80', setorPreparo: 'cozinha', disponivel: false },
  ],
  // Pizzaria & Trattoria Bella Napoli
  'tenant-02': [
    { id: 'p_bn_1', categoriaId: 'c_bn_1', nome: 'Pizza Margherita Tradizionale', descricao: 'Molho pelati italiano, mozzarella di bufala e manjericão fresco ao azeite.', precoVenda: 58.0, precoCusto: 16.0, setorPreparo: 'cozinha', disponivel: true, destaque: true },
    { id: 'p_bn_2', categoriaId: 'c_bn_1', nome: 'Pizza Calabresa Curada com Cebola Roxa', descricao: 'Calabresa artesanal defumada fatiada fina e azeitonas pretas.', precoVenda: 52.0, precoCusto: 14.0, setorPreparo: 'cozinha', disponivel: true },
    { id: 'p_bn_3', categoriaId: 'c_bn_2', nome: 'Pizza Quatro Queijos D.O.C.', descricao: 'Gorgonzola doce, parmesão reggiano, catupiry original e mozzarella.', precoVenda: 64.0, precoCusto: 19.0, setorPreparo: 'cozinha', disponivel: true, destaque: true },
    { id: 'p_bn_4', categoriaId: 'c_bn_3', nome: 'Calzone Presunto Di Parma & Catupiry', descricao: 'Massa dobrada e assada no forno a lenha recheada com queijo derretido.', precoVenda: 48.0, precoCusto: 15.0, setorPreparo: 'cozinha', disponivel: true },
    { id: 'p_bn_5', categoriaId: 'c_bn_3', nome: 'Lasanha Bolonhesa Clássica ao Forno', descricao: 'Massa fresca artesanal e molho de carne com 6h de cozimento lento.', precoVenda: 46.0, precoCusto: 13.0, setorPreparo: 'cozinha', disponivel: true },
    { id: 'p_bn_6', categoriaId: 'c_bn_4', nome: 'Vinho Chianti Tinto Italiano 750ml', descricao: 'Vinho clássico toscano com aroma frutado e taninos macios.', precoVenda: 89.0, precoCusto: 38.0, setorPreparo: 'bar', disponivel: true },
    { id: 'p_bn_7', categoriaId: 'c_bn_4', nome: 'Refrigerante Lata 350ml', descricao: 'Coca-Cola, Guaraná Antarctica ou Soda gelada.', precoVenda: 8.0, precoCusto: 3.2, setorPreparo: 'bar', disponivel: true },
    { id: 'p_bn_8', categoriaId: 'c_bn_5', nome: 'Tiramisù Clássico Italiano', descricao: 'Biscoito champanhe embebido em café expresso, queijo mascarpone e cacau.', precoVenda: 22.0, precoCusto: 6.5, setorPreparo: 'cozinha', disponivel: true },
  ],
  // Smash Burguer Mania
  'tenant-03': [
    { id: 'p_sm_1', categoriaId: 'c_sm_1', nome: 'Smash Burger Bacon Especial', descricao: 'Dois blends de 90g prensados na chapa, queijo cheddar inglês e bacon crocante.', precoVenda: 34.9, precoCusto: 11.2, setorPreparo: 'cozinha', disponivel: true, destaque: true },
    { id: 'p_sm_2', categoriaId: 'c_sm_1', nome: 'Burger Clássico & Salada Fresca', descricao: 'Blend 160g, queijo prato derretido, alface americana e picles artesanal.', precoVenda: 29.9, precoCusto: 9.8, setorPreparo: 'cozinha', disponivel: true },
    { id: 'p_sm_3', categoriaId: 'c_sm_2', nome: 'Smash Duplo Cheddar Inglês', descricao: 'Dois blends de 100g smash com camada dupla de cheddar melt cremoso.', precoVenda: 36.0, precoCusto: 12.0, setorPreparo: 'cozinha', disponivel: true, destaque: true },
    { id: 'p_sm_4', categoriaId: 'c_sm_3', nome: 'Batata Rústica com Alecrim e Sal Grosso', descricao: 'Batatas com casca sequinhas com maionese verde da casa.', precoVenda: 24.5, precoCusto: 4.8, setorPreparo: 'cozinha', disponivel: true },
    { id: 'p_sm_5', categoriaId: 'c_sm_3', nome: 'Onion Rings Crocantes com Barbecue', descricao: 'Anéis de cebola empanados e dourados na hora.', precoVenda: 22.0, precoCusto: 5.0, setorPreparo: 'cozinha', disponivel: true },
    { id: 'p_sm_6', categoriaId: 'c_sm_4', nome: 'Chopp IPA Artesanal 500ml', descricao: 'Chopp artesanal fresco, notas cítricas e amargor balanceado.', precoVenda: 18.0, precoCusto: 6.5, setorPreparo: 'bar', disponivel: true },
    { id: 'p_sm_7', categoriaId: 'c_sm_5', nome: 'Milk-shake de Nutella com Ninho 400ml', descricao: 'Feito com sorvete de baunilha, Nutella pura e finalizado com leite Ninho.', precoVenda: 23.0, precoCusto: 7.2, setorPreparo: 'bar', disponivel: true },
  ],
  // Boteco & Espetos do Silva
  'tenant-04': [
    { id: 'p_bs_1', categoriaId: 'c_bs_1', nome: 'Espetinho de Picanha com Farofa & Vinagrete', descricao: 'Carne macia na brasa com o tempero e farofa caseira do Silva.', precoVenda: 18.0, precoCusto: 6.0, setorPreparo: 'cozinha', disponivel: true, destaque: true },
    { id: 'p_bs_2', categoriaId: 'c_bs_1', nome: 'Espetinho de Queijo Coalho com Melaço de Cana', descricao: 'Dourado na brasa com crosta crocante e melaço de cana.', precoVenda: 14.0, precoCusto: 4.2, setorPreparo: 'cozinha', disponivel: true },
    { id: 'p_bs_3', categoriaId: 'c_bs_1', nome: 'Espetinho de Coração de Frango Temperado', descricao: 'Temperado com ervas finas, alho e limão taiti.', precoVenda: 13.0, precoCusto: 3.8, setorPreparo: 'cozinha', disponivel: true },
    { id: 'p_bs_4', categoriaId: 'c_bs_2', nome: 'Torresmo de Rolo Super Crocante', descricao: 'Panceta pururucada e fatiada na hora com gomos de limão, serve 2 pessoas.', precoVenda: 38.0, precoCusto: 12.0, setorPreparo: 'cozinha', disponivel: true, destaque: true },
    { id: 'p_bs_5', categoriaId: 'c_bs_2', nome: 'Frango a Passarinho com Alho Dourado', descricao: 'Pedaços crocantes de frango frito com lâminas de alho douradas.', precoVenda: 34.0, precoCusto: 10.5, setorPreparo: 'cozinha', disponivel: true },
    { id: 'p_bs_6', categoriaId: 'c_bs_3', nome: 'Cerveja Original 600ml Garrafa', descricao: 'Estupidamente gelada servida no balde de gelo.', precoVenda: 16.0, precoCusto: 8.5, setorPreparo: 'bar', disponivel: true },
    { id: 'p_bs_7', categoriaId: 'c_bs_4', nome: 'Caipirinha Tradicional de Limão 51', descricao: 'Cachaça mineira de alambique, limão taiti fresco e açúcar.', precoVenda: 18.0, precoCusto: 4.0, setorPreparo: 'bar', disponivel: true },
  ],
  // Sushi Prime Oriental
  'tenant-05': [
    { id: 'p_sp_1', categoriaId: 'c_sp_1', nome: 'Combinado Prime Salmão 20 Peças', descricao: '6 sashimis, 4 niguiris, 6 uramakis philadelphia e 4 hossomakis de salmão fresco.', precoVenda: 78.0, precoCusto: 26.0, setorPreparo: 'cozinha', disponivel: true, destaque: true },
    { id: 'p_sp_2', categoriaId: 'c_sp_2', nome: 'Temaki Salmão Completo com Cream Cheese & Cebolinha', descricao: 'Cone de alga crocante, arroz temperado shari, salmão fresco e cream cheese.', precoVenda: 34.0, precoCusto: 11.5, setorPreparo: 'cozinha', disponivel: true, destaque: true },
    { id: 'p_sp_3', categoriaId: 'c_sp_2', nome: 'Uramaki Philadelphia Salmão (8 un)', descricao: 'Enrolado invertido com salmão fresco, cream cheese e gergelim torrado.', precoVenda: 29.9, precoCusto: 9.0, setorPreparo: 'cozinha', disponivel: true },
    { id: 'p_sp_4', categoriaId: 'c_sp_2', nome: 'Hot Roll Especial com Molho Tarê (8 un)', descricao: 'Empanado na farinha panko, frito na hora com cream cheese e calda tarê.', precoVenda: 28.0, precoCusto: 8.5, setorPreparo: 'cozinha', disponivel: true },
    { id: 'p_sp_5', categoriaId: 'c_sp_3', nome: 'Sashimi de Salmão Fresco (10 fatias)', descricao: 'Lâminas nobres de salmão fresco com wasabi e gengibre gari importado.', precoVenda: 45.0, precoCusto: 16.0, setorPreparo: 'cozinha', disponivel: true },
    { id: 'p_sp_6', categoriaId: 'c_sp_4', nome: 'Saquê Dourado Tradicional 150ml', descricao: 'Saquê japonês servido quente ou gelado no copinho ochoko.', precoVenda: 22.0, precoCusto: 7.0, setorPreparo: 'bar', disponivel: true },
    { id: 'p_sp_7', categoriaId: 'c_sp_4', nome: 'Cerveja Asahi Super Dry Japonesa 330ml', descricao: 'Cerveja japonesa puro malte leve e refrescante.', precoVenda: 19.0, precoCusto: 9.5, setorPreparo: 'bar', disponivel: true },
    { id: 'p_sp_8', categoriaId: 'c_sp_5', nome: 'Petit Gâteau de Chá Verde Matcha com Sorvete', descricao: 'Bolo quente oriental de matcha recheado com sorvete de baunilha.', precoVenda: 26.0, precoCusto: 7.5, setorPreparo: 'cozinha', disponivel: true },
  ],
};

interface ProductState {
  produtosPorTenant: Record<string, Produto[]>;
  categoriasPorTenant: Record<string, Categoria[]>;
  getProdutosPorTenant: (tenantId?: string) => Produto[];
  getCategoriasPorTenant: (tenantId?: string) => Categoria[];
  produtos: Produto[];
  categorias: Categoria[];
  adicionarProduto: (produto: Omit<Produto, 'id'>, tenantId?: string) => Produto;
  editarProduto: (id: string, dados: Partial<Produto>, tenantId?: string) => void;
  removerProduto: (id: string, tenantId?: string) => void;
  atualizarPreco: (id: string, novoPreco: number, tenantId?: string) => void;
  alternarDisponibilidade: (id: string, tenantId?: string) => void;
  adicionarCategoria: (nome: string, tenantId?: string) => Categoria;
  removerCategoria: (id: string, tenantId?: string) => void;
}

function sincronizarComWhatsAppServer(tenantId?: string) {
  try {
    const tId = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
    setTimeout(async () => {
      try {
        const { useEloBotStore } = await import('./useEloBotStore');
        const { useSaaSStore } = await import('./useSaaSStore');
        const prods = useProductStore.getState().getProdutosPorTenant(tId);
        const tenant = useSaaSStore.getState().tenants.find((t) => t.id === tId);
        useEloBotStore.getState().sincronizarConfigComServidor(tId, prods, tenant?.nomeFantasia);
      } catch (err) {}
    }, 150);
  } catch (e) {}
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      produtosPorTenant: PRODUTOS_POR_TENANT,
      categoriasPorTenant: CATEGORIAS_POR_TENANT,

      // Fallbacks globais para retrocompatibilidade
      produtos: PRODUTOS_POR_TENANT['tenant-01'],
      categorias: CATEGORIAS_POR_TENANT['tenant-01'],

      getProdutosPorTenant: (tenantId?: string) => {
        const state = get();
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        if (state.produtosPorTenant && state.produtosPorTenant[idAlvo]) {
          return state.produtosPorTenant[idAlvo];
        }
        if (PRODUTOS_POR_TENANT[idAlvo]) {
          return PRODUTOS_POR_TENANT[idAlvo];
        }
        return [];
      },

      getCategoriasPorTenant: (tenantId?: string) => {
        const state = get();
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        if (state.categoriasPorTenant && state.categoriasPorTenant[idAlvo]) {
          return state.categoriasPorTenant[idAlvo];
        }
        if (CATEGORIAS_POR_TENANT[idAlvo]) {
          return CATEGORIAS_POR_TENANT[idAlvo];
        }
        return [
          { id: `c-${idAlvo}-pratos`, nome: 'Pratos Principais' },
          { id: `c-${idAlvo}-bebidas`, nome: 'Bebidas' },
          { id: `c-${idAlvo}-sobremesas`, nome: 'Sobremesas' },
        ];
      },

      adicionarProduto: (novo, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const novoProduto: Produto = {
          ...novo,
          id: `p-${idAlvo}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        };

        set((state) => {
          const listaAtual = state.produtosPorTenant[idAlvo] || PRODUTOS_POR_TENANT[idAlvo] || [];
          const novaLista = [novoProduto, ...listaAtual];
          return {
            produtosPorTenant: {
              ...state.produtosPorTenant,
              [idAlvo]: novaLista,
            },
            produtos: novaLista,
          };
        });
        sincronizarComWhatsAppServer(idAlvo);
        return novoProduto;
      },

      editarProduto: (id, dados, tenantId) => {
        set((state) => {
          const novosPorTenant: Record<string, Produto[]> = { ...state.produtosPorTenant };
          let tenantAlvo = tenantId && tenantId !== 'global' ? tenantId : null;

          if (!tenantAlvo) {
            for (const tId of Object.keys(novosPorTenant)) {
              if (novosPorTenant[tId]?.some((p) => p.id === id)) {
                tenantAlvo = tId;
                break;
              }
            }
          }

          if (tenantAlvo && novosPorTenant[tenantAlvo]) {
            novosPorTenant[tenantAlvo] = novosPorTenant[tenantAlvo].map((p) =>
              p.id === id ? { ...p, ...dados } : p
            );
          }

          return {
            produtosPorTenant: novosPorTenant,
            produtos: tenantAlvo ? novosPorTenant[tenantAlvo] : state.produtos,
          };
        });
        sincronizarComWhatsAppServer(tenantId);
      },

      removerProduto: (id, tenantId) => {
        set((state) => {
          const novosPorTenant: Record<string, Produto[]> = { ...state.produtosPorTenant };
          let tenantAlvo = tenantId && tenantId !== 'global' ? tenantId : null;

          if (!tenantAlvo) {
            for (const tId of Object.keys(novosPorTenant)) {
              if (novosPorTenant[tId]?.some((p) => p.id === id)) {
                tenantAlvo = tId;
                break;
              }
            }
          }

          if (tenantAlvo && novosPorTenant[tenantAlvo]) {
            novosPorTenant[tenantAlvo] = novosPorTenant[tenantAlvo].filter((p) => p.id !== id);
          }

          return {
            produtosPorTenant: novosPorTenant,
            produtos: tenantAlvo ? novosPorTenant[tenantAlvo] : state.produtos,
          };
        });
        sincronizarComWhatsAppServer(tenantId);
      },

      atualizarPreco: (id, novoPreco, tenantId) => {
        set((state) => {
          const novosPorTenant: Record<string, Produto[]> = { ...state.produtosPorTenant };
          let tenantAlvo = tenantId && tenantId !== 'global' ? tenantId : null;

          if (!tenantAlvo) {
            for (const tId of Object.keys(novosPorTenant)) {
              if (novosPorTenant[tId]?.some((p) => p.id === id)) {
                tenantAlvo = tId;
                break;
              }
            }
          }

          if (tenantAlvo && novosPorTenant[tenantAlvo]) {
            novosPorTenant[tenantAlvo] = novosPorTenant[tenantAlvo].map((p) =>
              p.id === id ? { ...p, precoVenda: Number(novoPreco.toFixed(2)) } : p
            );
          }

          return {
            produtosPorTenant: novosPorTenant,
            produtos: tenantAlvo ? novosPorTenant[tenantAlvo] : state.produtos,
          };
        });
        sincronizarComWhatsAppServer(tenantId);
      },

      alternarDisponibilidade: (id, tenantId) => {
        set((state) => {
          const novosPorTenant: Record<string, Produto[]> = { ...state.produtosPorTenant };
          let tenantAlvo = tenantId && tenantId !== 'global' ? tenantId : null;

          if (!tenantAlvo) {
            for (const tId of Object.keys(novosPorTenant)) {
              if (novosPorTenant[tId]?.some((p) => p.id === id)) {
                tenantAlvo = tId;
                break;
              }
            }
          }

          if (tenantAlvo && novosPorTenant[tenantAlvo]) {
            novosPorTenant[tenantAlvo] = novosPorTenant[tenantAlvo].map((p) =>
              p.id === id ? { ...p, disponivel: !p.disponivel } : p
            );
          }

          return {
            produtosPorTenant: novosPorTenant,
            produtos: tenantAlvo ? novosPorTenant[tenantAlvo] : state.produtos,
          };
        });
        sincronizarComWhatsAppServer(tenantId);
      },

      adicionarCategoria: (nome, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const novaCat: Categoria = {
          id: `c-${idAlvo}-${Date.now()}`,
          nome: nome.trim(),
        };

        set((state) => {
          const listaAtual = state.categoriasPorTenant[idAlvo] || CATEGORIAS_POR_TENANT[idAlvo] || [];
          return {
            categoriasPorTenant: {
              ...state.categoriasPorTenant,
              [idAlvo]: [...listaAtual, novaCat],
            },
          };
        });
        return novaCat;
      },

      removerCategoria: (id, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        set((state) => {
          const novasPorTenant: Record<string, Categoria[]> = { ...state.categoriasPorTenant };
          if (novasPorTenant[idAlvo]) {
            novasPorTenant[idAlvo] = novasPorTenant[idAlvo].filter((c) => c.id !== id);
          }

          return {
            categoriasPorTenant: novasPorTenant,
          };
        });
      },
    }),
    {
      name: 'eloserve_produtos_multi_tenant_v4',
    }
  )
);
