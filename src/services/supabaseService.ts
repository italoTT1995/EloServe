import { supabase } from '../lib/supabase';
import { TenantRestaurante, Usuario, Produto, Categoria, Mesa, PedidoKDS } from '../types';

/**
 * SERVIÇO DE SINCRONIZAÇÃO EM TEMPO REAL COM O SUPABASE POSTGRESQL
 */
export const supabaseService = {
  // -------------------------------------------------------------
  // CARGA COMPLETA (INICIALIZAÇÃO DO SISTEMA)
  // -------------------------------------------------------------
  async carregarTudoDoSupabase() {
    try {
      const [
        { data: tenantsData, error: errTenants },
        { data: usuariosData, error: errUsuarios },
        { data: categoriasData, error: errCategorias },
        { data: produtosData, error: errProdutos },
        { data: mesasData, error: errMesas },
      ] = await Promise.all([
        supabase.from('tenants').select('*'),
        supabase.from('usuarios').select('*'),
        supabase.from('categorias').select('*'),
        supabase.from('produtos').select('*'),
        supabase.from('mesas').select('*'),
      ]);

      if (errTenants) console.warn('Supabase: aviso ao carregar tenants', errTenants);
      if (errUsuarios) console.warn('Supabase: aviso ao carregar usuarios', errUsuarios);
      if (errCategorias) console.warn('Supabase: aviso ao carregar categorias', errCategorias);
      if (errProdutos) console.warn('Supabase: aviso ao carregar produtos', errProdutos);
      if (errMesas) console.warn('Supabase: aviso ao carregar mesas', errMesas);

      return {
        tenants: (tenantsData || []).map(this.converterTenantDoBanco),
        usuarios: (usuariosData || []).map(this.converterUsuarioDoBanco),
        categorias: (categoriasData || []).map(this.converterCategoriaDoBanco),
        produtos: (produtosData || []).map(this.converterProdutoDoBanco),
        mesas: (mesasData || []).map(this.converterMesaDoBanco),
      };
    } catch (e) {
      console.error('Erro na conexão com Supabase:', e);
      return null;
    }
  },

  // -------------------------------------------------------------
  // RESTAURANTES (TENANTS)
  // -------------------------------------------------------------
  async salvarTenant(tenant: TenantRestaurante) {
    try {
      const payload = {
        id: tenant.id,
        nome_fantasia: tenant.nomeFantasia,
        razao_social: tenant.razaoSocial,
        documento: tenant.documento,
        responsavel_nome: tenant.responsavelNome,
        telefone_whatsapp: tenant.telefoneWhatsApp,
        email: tenant.email,
        cidade_uf: tenant.cidadeUf,
        plano_id: tenant.planoId,
        status_assinatura: tenant.statusAssinatura,
        valor_mensalidade: tenant.valorMensalidade,
        data_inicio: tenant.dataInicio,
        proximo_vencimento: tenant.proximoVencimento,
        dias_restantes_trial: tenant.diasRestantesTrial ?? 7,
        instancia_whatsapp_conectada: tenant.instanciaWhatsAppConectada ?? false,
        dre_habilitado: tenant.dreHabilitado ?? true,
        couvert_artistico_ativo: tenant.couvertArtisticoAtivo ?? false,
        valor_couvert_por_pessoa: tenant.valorCouvertPorPessoa ?? 0,
      };

      const { data, error } = await supabase.from('tenants').upsert(payload).select().single();
      if (error) console.error('Erro ao salvar tenant no Supabase:', error);
      return data;
    } catch (e) {
      console.error('Falha ao comunicar com Supabase (Tenant):', e);
    }
  },

  async atualizarTenant(tenantId: string, dados: Partial<TenantRestaurante>) {
    try {
      const payload: any = {};
      if (dados.nomeFantasia !== undefined) payload.nome_fantasia = dados.nomeFantasia;
      if (dados.razaoSocial !== undefined) payload.razao_social = dados.razaoSocial;
      if (dados.documento !== undefined) payload.documento = dados.documento;
      if (dados.responsavelNome !== undefined) payload.responsavel_nome = dados.responsavelNome;
      if (dados.telefoneWhatsApp !== undefined) payload.telefone_whatsapp = dados.telefoneWhatsApp;
      if (dados.email !== undefined) payload.email = dados.email;
      if (dados.cidadeUf !== undefined) payload.cidade_uf = dados.cidadeUf;
      if (dados.planoId !== undefined) payload.plano_id = dados.planoId;
      if (dados.statusAssinatura !== undefined) payload.status_assinatura = dados.statusAssinatura;
      if (dados.valorMensalidade !== undefined) payload.valor_mensalidade = dados.valorMensalidade;
      if (dados.proximoVencimento !== undefined) payload.proximo_vencimento = dados.proximoVencimento;

      const { error } = await supabase.from('tenants').update(payload).eq('id', tenantId);
      if (error) console.error('Erro ao atualizar tenant no Supabase:', error);
    } catch (e) {
      console.error('Falha ao atualizar tenant no Supabase:', e);
    }
  },

  async removerTenant(tenantId: string) {
    try {
      const { error } = await supabase.from('tenants').delete().eq('id', tenantId);
      if (error) console.error('Erro ao remover tenant no Supabase:', error);
    } catch (e) {
      console.error('Falha ao remover tenant no Supabase:', e);
    }
  },

  // -------------------------------------------------------------
  // USUÁRIOS & CREDENCIAIS DE ACESSO
  // -------------------------------------------------------------
  async salvarUsuario(usuario: Usuario) {
    try {
      const payload = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email.toLowerCase().trim(),
        cargo: usuario.cargo,
        tenant_id: usuario.tenantId,
        avatar: usuario.avatar,
        pin: usuario.pin,
        senha: usuario.senha,
        ativo: usuario.ativo ?? true,
      };

      const { data, error } = await supabase.from('usuarios').upsert(payload).select().single();
      if (error) console.error('Erro ao salvar usuario no Supabase:', error);
      return data;
    } catch (e) {
      console.error('Falha ao salvar usuario no Supabase:', e);
    }
  },

  async atualizarUsuario(id: string, dados: Partial<Usuario>) {
    try {
      const payload: any = {};
      if (dados.nome !== undefined) payload.nome = dados.nome;
      if (dados.email !== undefined) payload.email = dados.email.toLowerCase().trim();
      if (dados.cargo !== undefined) payload.cargo = dados.cargo;
      if (dados.tenantId !== undefined) payload.tenant_id = dados.tenantId;
      if (dados.pin !== undefined) payload.pin = dados.pin;
      if (dados.senha !== undefined) payload.senha = dados.senha;
      if (dados.ativo !== undefined) payload.ativo = dados.ativo;
      if (dados.ultimoAcesso !== undefined) payload.ultimo_acesso = dados.ultimoAcesso;

      const { error } = await supabase.from('usuarios').update(payload).eq('id', id);
      if (error) console.error('Erro ao atualizar usuario no Supabase:', error);
    } catch (e) {
      console.error('Falha ao atualizar usuario no Supabase:', e);
    }
  },

  async removerUsuario(id: string) {
    try {
      const { error } = await supabase.from('usuarios').delete().eq('id', id);
      if (error) console.error('Erro ao remover usuario no Supabase:', error);
    } catch (e) {
      console.error('Falha ao remover usuario no Supabase:', e);
    }
  },

  // -------------------------------------------------------------
  // CATEGORIAS & PRODUTOS (CARDÁPIO)
  // -------------------------------------------------------------
  async salvarCategoria(categoria: Categoria, tenantId: string = 'tenant-01') {
    try {
      const payload = {
        id: categoria.id,
        tenant_id: tenantId,
        nome: categoria.nome,
        icone: categoria.icone,
        cor: categoria.cor,
      };
      const { error } = await supabase.from('categorias').upsert(payload);
      if (error) console.error('Erro ao salvar categoria no Supabase:', error);
    } catch (e) {
      console.error('Falha ao salvar categoria no Supabase:', e);
    }
  },

  async removerCategoria(id: string) {
    try {
      const { error } = await supabase.from('categorias').delete().eq('id', id);
      if (error) console.error('Erro ao remover categoria no Supabase:', error);
    } catch (e) {
      console.error('Falha ao remover categoria no Supabase:', e);
    }
  },

  async salvarProduto(produto: Produto, tenantId: string = 'tenant-01') {
    try {
      const payload = {
        id: produto.id,
        tenant_id: tenantId,
        categoria_id: produto.categoriaId,
        nome: produto.nome,
        descricao: produto.descricao,
        preco_venda: produto.precoVenda,
        preco_custo: produto.precoCusto ?? 0,
        foto_url: produto.fotoUrl,
        codigo_barras: produto.codigoBarras,
        setor_preparo: produto.setorPreparo ?? 'cozinha',
        disponivel: produto.disponivel ?? true,
        destaque: produto.destaque ?? false,
        ficha_tecnica: produto.fichaTecnica ?? [],
      };
      const { error } = await supabase.from('produtos').upsert(payload);
      if (error) console.error('Erro ao salvar produto no Supabase:', error);
    } catch (e) {
      console.error('Falha ao salvar produto no Supabase:', e);
    }
  },

  async atualizarProduto(id: string, dados: Partial<Produto>) {
    try {
      const payload: any = {};
      if (dados.nome !== undefined) payload.nome = dados.nome;
      if (dados.descricao !== undefined) payload.descricao = dados.descricao;
      if (dados.precoVenda !== undefined) payload.preco_venda = dados.precoVenda;
      if (dados.precoCusto !== undefined) payload.preco_custo = dados.precoCusto;
      if (dados.disponivel !== undefined) payload.disponivel = dados.disponivel;
      if (dados.categoriaId !== undefined) payload.categoria_id = dados.categoriaId;

      const { error } = await supabase.from('produtos').update(payload).eq('id', id);
      if (error) console.error('Erro ao atualizar produto no Supabase:', error);
    } catch (e) {
      console.error('Falha ao atualizar produto no Supabase:', e);
    }
  },

  async removerProduto(id: string) {
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) console.error('Erro ao remover produto no Supabase:', error);
    } catch (e) {
      console.error('Falha ao remover produto no Supabase:', e);
    }
  },

  // -------------------------------------------------------------
  // MESAS & COMANDAS
  // -------------------------------------------------------------
  async salvarMesa(mesa: Mesa, tenantId: string = 'tenant-01') {
    try {
      const payload = {
        id: mesa.id,
        tenant_id: tenantId,
        numero: mesa.numero,
        capacidade: mesa.capacidade,
        setor: mesa.setor,
        status: mesa.status,
        tempo_ocupada_min: mesa.tempoOcupadaMin ?? 0,
        total_consumo: mesa.totalConsumo ?? 0,
        qr_code_url: mesa.qrCodeUrl,
        quantidade_pessoas: mesa.quantidadePessoas ?? 0,
        responsavel_nome: mesa.responsavelNome,
        pessoas: mesa.pessoas ?? [],
        garcom_responsavel: mesa.garcomResponsavel,
        comanda_itens: mesa.comandaItens ?? [],
        taxa_servico_ativa: mesa.taxaServicoAtiva ?? true,
        historico_cancelamentos: mesa.historicoCancelamentos ?? [],
        couvert_artistico_ativo: mesa.couvertArtisticoAtivo ?? false,
        valor_couvert_por_pessoa: mesa.valorCouvertPorPessoa ?? 0,
      };

      const { error } = await supabase.from('mesas').upsert(payload);
      if (error) console.error('Erro ao salvar mesa no Supabase:', error);
    } catch (e) {
      console.error('Falha ao salvar mesa no Supabase:', e);
    }
  },

  async atualizarMesa(id: string, dados: Partial<Mesa>) {
    try {
      const payload: any = {};
      if (dados.status !== undefined) payload.status = dados.status;
      if (dados.totalConsumo !== undefined) payload.total_consumo = dados.totalConsumo;
      if (dados.quantidadePessoas !== undefined) payload.quantidade_pessoas = dados.quantidadePessoas;
      if (dados.responsavelNome !== undefined) payload.responsavel_nome = dados.responsavelNome;
      if (dados.garcomResponsavel !== undefined) payload.garcom_responsavel = dados.garcomResponsavel;
      if (dados.comandaItens !== undefined) payload.comanda_itens = dados.comandaItens;
      if (dados.pessoas !== undefined) payload.pessoas = dados.pessoas;

      const { error } = await supabase.from('mesas').update(payload).eq('id', id);
      if (error) console.error('Erro ao atualizar mesa no Supabase:', error);
    } catch (e) {
      console.error('Falha ao atualizar mesa no Supabase:', e);
    }
  },

  async removerMesa(id: string) {
    try {
      const { error } = await supabase.from('mesas').delete().eq('id', id);
      if (error) console.error('Erro ao remover mesa no Supabase:', error);
    } catch (e) {
      console.error('Falha ao remover mesa no Supabase:', e);
    }
  },

  // -------------------------------------------------------------
  // PEDIDOS (PDV, MESA E DELIVERY)
  // -------------------------------------------------------------
  async salvarPedido(pedido: {
    id: string;
    tenantId: string;
    numero: number;
    tipo: 'mesa' | 'balcao' | 'delivery';
    mesaNumero?: number;
    clienteNome?: string;
    clienteTelefone?: string;
    status?: string;
    statusKDS?: string;
    itens: any[];
    total: number;
    formaPagamento?: string;
    enderecoEntrega?: string;
    entregadorId?: string;
  }) {
    try {
      const payload = {
        id: pedido.id,
        tenant_id: pedido.tenantId,
        numero: pedido.numero,
        tipo: pedido.tipo,
        mesa_numero: pedido.mesaNumero,
        cliente_nome: pedido.clienteNome,
        cliente_telefone: pedido.clienteTelefone,
        status: pedido.status || 'pendente',
        status_kds: pedido.statusKDS || 'novo',
        itens: pedido.itens,
        total: pedido.total,
        forma_pagamento: pedido.formaPagamento,
        endereco_entrega: pedido.enderecoEntrega,
        entregador_id: pedido.entregadorId,
      };

      const { error } = await supabase.from('pedidos').upsert(payload);
      if (error) console.error('Erro ao salvar pedido no Supabase:', error);
    } catch (e) {
      console.error('Falha ao salvar pedido no Supabase:', e);
    }
  },

  // -------------------------------------------------------------
  // CONVERSORES (BANCO -> FORMATO TYPESCRIPT DO SISTEMA)
  // -------------------------------------------------------------
  converterTenantDoBanco(row: any): TenantRestaurante {
    return {
      id: row.id,
      nomeFantasia: row.nome_fantasia,
      razaoSocial: row.razao_social,
      documento: row.documento || '',
      responsavelNome: row.responsavel_nome || '',
      telefoneWhatsApp: row.telefone_whatsapp || '',
      email: row.email || '',
      cidadeUf: row.cidade_uf || 'Brasil',
      planoId: row.plano_id || 'pro',
      statusAssinatura: row.status_assinatura || 'ativo',
      valorMensalidade: Number(row.valor_mensalidade || 199),
      dataInicio: row.data_inicio || '',
      proximoVencimento: row.proximo_vencimento || '',
      diasRestantesTrial: row.dias_restantes_trial,
      instanciaWhatsAppConectada: !!row.instancia_whatsapp_conectada,
      criadoEm: row.criado_em || new Date().toISOString(),
      dreHabilitado: row.dre_habilitado ?? true,
      couvertArtisticoAtivo: !!row.couvert_artistico_ativo,
      valorCouvertPorPessoa: Number(row.valor_couvert_por_pessoa || 0),
    };
  },

  converterUsuarioDoBanco(row: any): Usuario {
    return {
      id: row.id,
      nome: row.nome,
      email: row.email,
      cargo: row.cargo,
      tenantId: row.tenant_id,
      avatar: row.avatar,
      pin: row.pin || '1234',
      senha: row.senha,
      ativo: row.ativo ?? true,
      criadoEm: row.criado_em,
      ultimoAcesso: row.ultimo_acesso,
    };
  },

  converterCategoriaDoBanco(row: any): Categoria {
    return {
      id: row.id,
      nome: row.nome,
      icone: row.icone,
      cor: row.cor,
    };
  },

  converterProdutoDoBanco(row: any): Produto {
    return {
      id: row.id,
      categoriaId: row.categoria_id,
      nome: row.nome,
      descricao: row.descricao,
      precoVenda: Number(row.preco_venda || 0),
      precoCusto: Number(row.preco_custo || 0),
      fotoUrl: row.foto_url,
      codigoBarras: row.codigo_barras,
      setorPreparo: row.setor_preparo || 'cozinha',
      disponivel: row.disponivel ?? true,
      destaque: !!row.destaque,
      fichaTecnica: Array.isArray(row.ficha_tecnica) ? row.ficha_tecnica : [],
    };
  },

  converterMesaDoBanco(row: any): Mesa {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      numero: row.numero,
      capacidade: row.capacidade || 4,
      setor: row.setor || 'Salão Principal',
      status: row.status || 'livre',
      tempoOcupadaMin: row.tempo_ocupada_min || 0,
      totalConsumo: Number(row.total_consumo || 0),
      qrCodeUrl: row.qr_code_url,
      quantidadePessoas: row.quantidade_pessoas || 0,
      responsavelNome: row.responsavel_nome,
      pessoas: Array.isArray(row.pessoas) ? row.pessoas : [],
      garcomResponsavel: row.garcom_responsavel,
      comandaItens: Array.isArray(row.comanda_itens) ? row.comanda_itens : [],
      taxaServicoAtiva: row.taxa_servico_ativa ?? true,
      historicoCancelamentos: Array.isArray(row.historico_cancelamentos) ? row.historico_cancelamentos : [],
      couvertArtisticoAtivo: !!row.couvert_artistico_ativo,
      valorCouvertPorPessoa: Number(row.valor_couvert_por_pessoa || 0),
    };
  },
};
