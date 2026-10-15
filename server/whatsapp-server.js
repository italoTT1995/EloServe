import express from 'express';
import cors from 'cors';
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Tratamento global para impedir encerramento inesperado do processo
process.on('uncaughtException', (err) => {
  console.error('[EloBot Baileys] Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[EloBot Baileys] Unhandled Rejection:', reason);
});

// Estado global da sessão WhatsApp
let sock = null;
let isInitializing = false;
let reconnectTimer = null;
let connectionState = {
  status: 'desconectado', // 'desconectado' | 'qrcode' | 'conectando' | 'conectado'
  qrCodeDataUrl: '',
  qrRaw: '',
  telefone: '',
  nome: '',
  totalMensagensHoje: 0,
  ultimoErro: '',
};

// ====================================================================
// CONFIGURAÇÕES DO ROBÔ E DISCO (SINCRONIZADAS POR RESTAURANTE)
// ====================================================================
const BOT_CONFIG_FILE = path.join(__dirname, 'bot_config.json');

let botConfig = {
  tenantId: 'tenant-01',
  nomeAgente: 'EloBot Fogo de Minas',
  nomeLoja: 'Churrascaria & Parrilla Fogo de Minas',
  tomDeVoz: 'acolhedor',
  modeloIA: 'gemini-1.5-flash',
  chavePix: 'financeiro@fogodeminas.com.br',
  taxaEntregaFixa: 5.0,
  tempoMedioEntregaMin: 40,
  autoCriarPedido: true,
  transbordoHumanoAtivo: true,
  instrucoesCustomizadas: 'Especialista em carnes nobres, ponto da carne e chopp artesanal gelado.',
  palavrasCardapio: 'cardapio, cardápio, menu, carnes, pratos, opcoes, opções, precos, preços, cortes',
  palavrasAtendente: 'humano, atendente, garcom, garçom, ajuda, suporte, falar com atendente',
  palavrasPix: 'pix, chave, chave pix, pagar, conta, pagamento',
  mensagemBoasVindas: '',
  mensagemCardapio: '',
  mensagemTransbordo: '',
  mensagemPix: '',
  produtos: [
    { id: 'p1', nome: 'Picanha na Brasa Premium', preco: 89.90, categoria: 'Carnes' },
    { id: 'p2', nome: 'Costela Bovina no Bafo 12h', preco: 74.90, categoria: 'Carnes' },
    { id: 'p3', nome: 'Chopp Artesanal 500ml', preco: 14.00, categoria: 'Bebidas' },
    { id: 'p4', nome: 'Batata Rústica com Queijo', preco: 28.00, categoria: 'Porções' },
    { id: 'p5', nome: 'Pudim de Leite Condensado', preco: 16.00, categoria: 'Sobremesas' },
  ],
};

function carregarBotConfigDoDisco() {
  try {
    if (fs.existsSync(BOT_CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(BOT_CONFIG_FILE, 'utf8'));
      if (data && typeof data === 'object') {
        botConfig = { ...botConfig, ...data };
        console.log(`[EloBot Baileys] ⚙️ Configurações do robô carregadas do disco para "${botConfig.nomeLoja}" (${botConfig.nomeAgente} • Tom: ${botConfig.tomDeVoz}).`);
      }
    }
  } catch (err) {
    console.warn('[EloBot Baileys] Aviso ao carregar bot_config.json:', err.message);
  }
}

function salvarBotConfigNoDisco() {
  try {
    fs.writeFileSync(BOT_CONFIG_FILE, JSON.stringify(botConfig, null, 2), 'utf8');
  } catch (err) {
    console.warn('[EloBot Baileys] Aviso ao salvar bot_config.json:', err.message);
  }
}
carregarBotConfigDoDisco();

// ====================================================================
// CATÁLOGO MULTI-RESTAURANTE E AUTO-DETECÇÃO DE MESA & LOJA
// ====================================================================
const CATALOGO_LOJAS_FILE = path.join(__dirname, 'catalogo_lojas.json');
let catalogoLojas = {};

function carregarCatalogoLojasDoDisco() {
  try {
    if (fs.existsSync(CATALOGO_LOJAS_FILE)) {
      const data = JSON.parse(fs.readFileSync(CATALOGO_LOJAS_FILE, 'utf8'));
      if (data && typeof data === 'object') {
        catalogoLojas = data;
        console.log(`[EloBot Baileys] 🏪 Catálogo multi-lojas carregado: ${Object.keys(catalogoLojas).length} restaurantes disponíveis.`);
      }
    }
  } catch (err) {
    console.warn('[EloBot Baileys] Aviso ao carregar catalogo_lojas.json:', err.message);
  }
}

function salvarCatalogoLojasNoDisco() {
  try {
    fs.writeFileSync(CATALOGO_LOJAS_FILE, JSON.stringify(catalogoLojas, null, 2), 'utf8');
  } catch (err) {
    console.warn('[EloBot Baileys] Aviso ao salvar catalogo_lojas.json:', err.message);
  }
}
carregarCatalogoLojasDoDisco();

// Extrai identificação de mesa ou balcão da mensagem do cliente
function extrairMesaDoTexto(texto) {
  if (!texto || typeof texto !== 'string') return null;
  const textoLimpo = texto.trim();

  // 1. Padrões com "Mesa XX" (ex: "Mesa 04", "mesa 2", "mesa 15")
  const matchMesa = textoLimpo.match(/\bmesa\s*#?\s*(\d{1,3})\b/i);
  if (matchMesa && matchMesa[1]) {
    const num = parseInt(matchMesa[1], 10);
    const numPad = num < 10 ? `0${num}` : `${num}`;
    return `Mesa ${numPad}`;
  }

  // 2. Balcão
  if (/\b(?:balcao|balcão)\b/i.test(textoLimpo)) {
    return 'Balcão';
  }

  // 3. Lounge
  const matchLounge = textoLimpo.match(/\blounge(?:\s*#?\s*(\d{1,2}))?\b/i);
  if (matchLounge) {
    return matchLounge[1] ? `Lounge ${matchLounge[1]}` : 'Lounge';
  }

  // 4. Mesa VIP
  const matchVip = textoLimpo.match(/\bvip(?:\s*#?\s*(\d{1,2}))?\b/i);
  if (matchVip) {
    return matchVip[1] ? `Mesa VIP ${matchVip[1]}` : 'Mesa VIP';
  }

  return null;
}

// Detecta a loja/restaurante correspondente a partir do texto ou de fallback
function detectarLojaDoTexto(texto, fallbackTenantId = null) {
  if (texto && typeof texto === 'string') {
    const norm = normalizarTexto(texto);
    for (const [tId, loja] of Object.entries(catalogoLojas)) {
      if (norm.includes(normalizarTexto(loja.nomeLoja))) {
        return loja;
      }
      if (Array.isArray(loja.termosIdentificacao)) {
        for (const termo of loja.termosIdentificacao) {
          const termoNorm = normalizarTexto(termo);
          if (termoNorm && norm.includes(termoNorm)) {
            return loja;
          }
        }
      }
    }
  }

  if (fallbackTenantId && catalogoLojas[fallbackTenantId]) {
    return catalogoLojas[fallbackTenantId];
  }

  if (botConfig.tenantId && catalogoLojas[botConfig.tenantId]) {
    return catalogoLojas[botConfig.tenantId];
  }

  return catalogoLojas['tenant-01'] || {
    tenantId: botConfig.tenantId || 'tenant-01',
    nomeLoja: botConfig.nomeLoja || 'Restaurante',
    nomeAgente: botConfig.nomeAgente || 'EloBot',
    tomDeVoz: botConfig.tomDeVoz || 'acolhedor',
    chavePix: botConfig.chavePix || '',
    produtos: botConfig.produtos || [],
  };
}

// Formata apresentação de cardápio específica para cliente na mesa (sem taxa de entrega)
function gerarCardapioMesaTexto(loja, mesa, nomeCliente) {
  const temNome = Boolean(nomeCliente && !nomeCliente.includes('Cliente (') && nomeCliente !== 'Cliente');
  const clienteStr = temNome ? `*${nomeCliente}*` : 'você';

  let txt = `🍽️ *ATENDIMENTO NA ${mesa.toUpperCase()} — ${loja.nomeLoja.toUpperCase()}* 🍽️\n`;
  txt += `Olá, ${clienteStr}! Que alegria ter você aqui na *${mesa}*! ✨\n\n`;
  txt += `📋 *CARDÁPIO OFICIAL DA LOJA:*\n\n`;

  const todosProds = Array.isArray(loja.produtos) && loja.produtos.length > 0
    ? loja.produtos
    : (Array.isArray(botConfig.produtos) ? botConfig.produtos : []);

  const prods = todosProds.filter((p) => p.disponivel !== false);

  if (prods.length > 0) {
    const cats = new Map();
    prods.forEach((p) => {
      const cat = p.categoria || 'Pratos Principais';
      if (!cats.has(cat)) cats.set(cat, []);
      cats.get(cat).push(p);
    });

    for (const [cat, lista] of cats.entries()) {
      txt += `*${cat.toUpperCase()}*\n`;
      lista.forEach((p) => {
        const emoji = obterEmojiPrato(p.nome, p.categoria);
        const desc = p.descricao ? `\n   _${p.descricao}_` : '';
        txt += `${emoji} *${p.nome}* — R$ ${Number(p.preco).toFixed(2)}${desc}\n`;
      });
      txt += `\n`;
    }
  } else {
    txt += `🍽️ Nossos pratos do dia estão sendo atualizados pela cozinha.\n\n`;
  }

  txt += `🛎️ *Consumo Presencial na ${mesa}:*\n`;
  txt += `✅ *Taxa de Entrega:* R$ 0,00 (Grátis na Mesa)\n`;
  txt += `⚡ *Preparo:* Enviado diretamente para a Cozinha e Bar!\n\n`;
  const primeiroNomePrato = prods[0]?.nome || 'prato';
  txt += `👉 *Para pedir:* Basta digitar o prato ou bebida desejada (ex: "1x ${primeiroNomePrato}")\n`;
  txt += `🙋‍♂️ *Chamar Garçom:* Digite *Garçom* ou *B* para atendimento presencial na sua mesa.`;

  return txt;
}

// Formata apresentação de cardápio para entrega delivery
function gerarCardapioDeliveryTexto(loja, nomeCliente) {
  const temNome = Boolean(nomeCliente && !nomeCliente.includes('Cliente (') && nomeCliente !== 'Cliente');
  const clienteStr = temNome ? `*${nomeCliente}*` : 'você';

  let cabecalho = '';
  if (botConfig.mensagemCardapio && botConfig.mensagemCardapio.trim()) {
    cabecalho = botConfig.mensagemCardapio
      .replace(/\{nome\}/gi, clienteStr)
      .replace(/\{loja\}/gi, loja.nomeLoja);
  } else {
    cabecalho = `Olá, ${clienteStr}! 📋 Segue o Cardápio Selecionado do *${loja.nomeLoja}*:\n`;
  }

  let txt = `${cabecalho}\n`;
  const todosProds = Array.isArray(loja.produtos) && loja.produtos.length > 0
    ? loja.produtos
    : (Array.isArray(botConfig.produtos) ? botConfig.produtos : []);

  const prods = todosProds.filter((p) => p.disponivel !== false);

  if (prods.length > 0) {
    const cats = new Map();
    prods.forEach((p) => {
      const cat = p.categoria || 'Pratos Principais';
      if (!cats.has(cat)) cats.set(cat, []);
      cats.get(cat).push(p);
    });

    for (const [cat, lista] of cats.entries()) {
      txt += `*${cat.toUpperCase()}*\n`;
      lista.forEach((p) => {
        const emoji = obterEmojiPrato(p.nome, p.categoria);
        const desc = p.descricao ? ` _(${p.descricao})_` : '';
        txt += `${emoji} *${p.nome}* — R$ ${Number(p.preco).toFixed(2)}${desc}\n`;
      });
      txt += `\n`;
    }
  } else {
    txt += `🍽️ Nossos pratos do dia estão sendo atualizados pela cozinha.\n`;
  }

  txt += `\n🛵 Taxa de entrega fixa: R$ ${Number(botConfig.taxaEntregaFixa).toFixed(2)} para toda a região.`;
  txt += `\n⏱️ Prazo médio de entrega: ${botConfig.tempoMedioEntregaMin} minutos.`;

  if (botConfig.instrucoesCustomizadas) {
    txt += `\n\n💡 *Dica Especial:* ${botConfig.instrucoesCustomizadas}`;
  }

  txt += `\n\nQual opção você gostaria de pedir hoje? Basta digitar o nome do prato aqui!`;
  return txt;
}

// Remove acentos e caracteres especiais para comparação flexível
function normalizarTexto(txt) {
  if (!txt || typeof txt !== 'string') return '';
  return txt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Verifica se o texto do cliente bate com alguma das palavras-chave configuradas
function checarGatilho(texto, listaChavesSeparadasPorVirgula, fallbackPadrao = '') {
  const lista = (listaChavesSeparadasPorVirgula && String(listaChavesSeparadasPorVirgula).trim()) 
    ? String(listaChavesSeparadasPorVirgula) 
    : fallbackPadrao;
  if (!lista || !texto) return false;

  const textoNorm = normalizarTexto(texto);
  const chaves = lista
    .split(',')
    .map((k) => normalizarTexto(k))
    .filter((k) => k.length > 0);

  for (const chave of chaves) {
    const escaped = chave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Para letras ou dígitos únicos (ex: 'a', 'b', 'c', '1', '2', '3'):
    if (chave.length <= 2) {
      // 1. Mensagem exata igual à chave (ex: "a", "A", "1")
      if (textoNorm === chave) return true;

      // 2. Variações pontuadas ou prefixadas (ex: "a.", "a)", "opcao a", "letra a", "1 -", "1.")
      if (
        textoNorm === `${chave}.` ||
        textoNorm === `${chave})` ||
        textoNorm === `-${chave}` ||
        textoNorm === `- ${chave}` ||
        textoNorm === `opcao ${chave}` ||
        textoNorm === `opção ${chave}` ||
        textoNorm === `letra ${chave}` ||
        textoNorm === `opcao ${chave}.` ||
        textoNorm === `opção ${chave}.` ||
        textoNorm === `quero ${chave}` ||
        textoNorm === `escolho ${chave}`
      ) {
        return true;
      }

      // 3. Letra isolada (ex: "A", "b") apenas em mensagens curtas (até 3 palavras)
      const regexIsolado = new RegExp(`(^|\\s|[.,;()\\-_])${escaped}(\\s|[.,;()\\-_]|$)`, 'i');
      if (regexIsolado.test(textoNorm) && textoNorm.split(/\s+/).length <= 3) {
        return true;
      }
    } else {
      // Para termos de 3+ letras (ex: 'cardapio', 'menu', 'pix', 'humano'):
      const regex = new RegExp(`(^|\\b|\\s)${escaped}(\\b|\\s|$)`, 'i');
      if (regex.test(textoNorm) || textoNorm.includes(chave)) {
        return true;
      }
    }
  }
  return false;
}

// Retorna opções de menu dinâmicas adaptadas aos gatilhos configurados
function obterMenuOpcoesTexto() {
  const card = (botConfig.palavrasCardapio || '').toLowerCase();
  const chavesCard = card.split(',').map((s) => s.trim());
  const temLetraA = chavesCard.includes('a');
  const temNum1 = chavesCard.includes('1');

  if (temLetraA) {
    return `👉 Digite apenas a letra da sua opção:\n🅰️ *A* - Ver Cardápio e Preços\n🅱️ *B* - Falar com Atendente Humano\n🅲 *C* - Chave PIX do Restaurante`;
  }
  if (temNum1) {
    return `👉 Digite o número da sua opção:\n1️⃣ *1* - Ver Cardápio e Preços\n2️⃣ *2* - Falar com Atendente Humano\n3️⃣ *3* - Chave PIX do Restaurante`;
  }
  return `1️⃣ Digite *Cardápio* para ver nossos pratos\n2️⃣ Digite o prato desejado para fazer seu pedido\n3️⃣ Digite *Atendente* para falar com nossa equipe`;
}

// Formata tom de voz dinâmico respeitando a personalidade configurada no painel
function formatarSaudacaoPorTom(tom, nomeCliente, nomeLoja, nomeAgente) {
  const temNome = Boolean(nomeCliente && !nomeCliente.includes('Cliente (') && nomeCliente !== 'Cliente');
  const clienteStr = temNome ? `*${nomeCliente}*` : 'você';

  switch (tom) {
    case 'formal':
      return {
        abertura: temNome
          ? `Prezado(a) ${clienteStr}, seja muito bem-vindo(a) ao *${nomeLoja}*.`
          : `Seja muito bem-vindo(a) ao *${nomeLoja}*.`,
        apresentacao: `Sou ${nomeAgente}, assistente virtual de atendimento. Em que posso auxiliá-lo hoje?`,
        fechamento: 'Estamos à sua inteira disposição.',
      };
    case 'descontraido':
      return {
        abertura: temNome
          ? `Fala ${clienteStr}! Tudo bem? Bem-vindo(a) ao *${nomeLoja}*! 🎉`
          : `Fala aí! Tudo certo? Bem-vindo(a) ao *${nomeLoja}*! 🎉`,
        apresentacao: `Sou o ${nomeAgente}, seu atendente inteligente. Bora matar essa fome hoje?`,
        fechamento: 'Qual a boa de hoje?',
      };
    case 'vendedor':
      return {
        abertura: temNome
          ? `Olá ${clienteStr}! Que excelente momento para pedir no *${nomeLoja}*! ⭐`
          : `Olá! Que excelente momento para pedir no *${nomeLoja}*! ⭐`,
        apresentacao: `Sou o ${nomeAgente}! Nosso cardápio está repleto de delícias preparadas na hora.`,
        fechamento: 'Aproveite nossas opções exclusivas para hoje!',
      };
    case 'acolhedor':
    default:
      return {
        abertura: temNome
          ? `Olá, ${clienteStr}! Que alegria ter você aqui no *${nomeLoja}*! ✨`
          : `Olá! Que alegria ter você aqui no *${nomeLoja}*! ✨`,
        apresentacao: `Sou o ${nomeAgente}, seu atendente virtual. Como posso te ajudar hoje?`,
        fechamento: 'Fique à vontade para escolher seus pratos favoritos.',
      };
  }
}

// Emoji contextualmente adequado ao prato e restaurante
function obterEmojiPrato(nome, categoria) {
  const str = normalizarTexto(`${nome} ${categoria || ''}`);
  if (str.includes('pizza') || str.includes('calabresa') || str.includes('margherita') || str.includes('mozzarella') || str.includes('queijo')) return '🍕';
  if (str.includes('carne') || str.includes('picanha') || str.includes('costela') || str.includes('churrasco') || str.includes('bife') || str.includes('parrilla')) return '🥩';
  if (str.includes('chopp') || str.includes('cerveja')) return '🍺';
  if (str.includes('suco') || str.includes('refrigerante') || str.includes('coca') || str.includes('bebida') || str.includes('agua')) return '🥤';
  if (str.includes('hamburguer') || str.includes('burger')) return '🍔';
  if (str.includes('massa') || str.includes('macarrao') || str.includes('espaguete') || str.includes('lasanha')) return '🍝';
  if (str.includes('pudim') || str.includes('sobremesa') || str.includes('doce') || str.includes('torta') || str.includes('sorvete')) return '🍮';
  if (str.includes('batata') || str.includes('porcao') || str.includes('petisco')) return '🍟';
  return '🍽️';
}

// ====================================================================
// PERSISTÊNCIA E CACHE DE CONTATOS, LIDS E CONVERSAS
// ====================================================================
const CONTATOS_FILE = path.join(__dirname, 'contatos_cache.json');
const CONVERSAS_FILE = path.join(__dirname, 'conversas_memoria.json');

// Mapeamentos bidirecionais LID <-> Telefone Real
const lidToPhoneMap = new Map();
const phoneToLidMap = new Map();

// Carregar mapeamentos reversos gerados pelo Baileys na pasta de auth
function carregarMapeamentosLidDoDisco() {
  try {
    if (!fs.existsSync(AUTH_DIR)) return;
    const files = fs.readdirSync(AUTH_DIR);
    let count = 0;
    for (const f of files) {
      if (f.startsWith('lid-mapping-') && f.endsWith('_reverse.json')) {
        const lid = f.replace('lid-mapping-', '').replace('_reverse.json', '');
        try {
          const pn = JSON.parse(fs.readFileSync(path.join(AUTH_DIR, f), 'utf8'));
          if (pn) {
            const pnStr = String(pn).replace(/\D/g, '');
            lidToPhoneMap.set(lid, pnStr);
            lidToPhoneMap.set(`${lid}@lid`, `${pnStr}@s.whatsapp.net`);
            phoneToLidMap.set(pnStr, lid);
            phoneToLidMap.set(`${pnStr}@s.whatsapp.net`, `${lid}@lid`);
            count++;
          }
        } catch (e) {}
      }
    }
    console.log(`[EloBot Baileys] 📱 Carregados ${count} mapeamentos LID <-> Telefone do disco.`);
  } catch (err) {
    console.warn('[EloBot Baileys] Aviso ao carregar mapeamentos LID:', err.message);
  }
}
carregarMapeamentosLidDoDisco();

// Cache em memória de contatos da agenda do WhatsApp
const contatosCache = new Map(); // Número / JID / LID -> Nome

function carregarContatosCacheDoDisco() {
  try {
    if (fs.existsSync(CONTATOS_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONTATOS_FILE, 'utf8'));
      for (const [k, v] of Object.entries(data)) {
        if (v && typeof v === 'string') {
          contatosCache.set(k, v);
        }
      }
      console.log(`[EloBot Baileys] 👥 Carregados ${contatosCache.size} contatos persistidos do disco.`);
    }
  } catch (e) {}
}
carregarContatosCacheDoDisco();

let salvarContatosTimeout = null;
function salvarContatosCacheNoDisco() {
  if (salvarContatosTimeout) return;
  salvarContatosTimeout = setTimeout(() => {
    salvarContatosTimeout = null;
    try {
      const obj = {};
      for (const [k, v] of contatosCache.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(CONTATOS_FILE, JSON.stringify(obj, null, 2), 'utf8');
    } catch (e) {}
  }, 2000);
}

function guardarContatoNoCache(idOuNumero, nome) {
  if (!idOuNumero || !nome || typeof nome !== 'string') return;
  const nomeTrim = nome.trim();
  if (
    !nomeTrim ||
    nomeTrim.startsWith('Cliente (') ||
    nomeTrim.toLowerCase().includes('kkk') ||
    nomeTrim.toLowerCase().includes('muito bom')
  ) {
    return;
  }

  contatosCache.set(idOuNumero, nomeTrim);
  const numLimpo = idOuNumero.replace(/\D/g, '');
  if (numLimpo) {
    contatosCache.set(numLimpo, nomeTrim);
    if (numLimpo.startsWith('55') && numLimpo.length >= 12) {
      contatosCache.set(numLimpo.slice(2), nomeTrim);
    }
    if (numLimpo.length >= 8) {
      contatosCache.set(numLimpo.slice(-8), nomeTrim);
      contatosCache.set(numLimpo.slice(-9), nomeTrim);
    }
  }
  salvarContatosCacheNoDisco();
}

// Histórico de conversas em memória e persistência
const conversasMemoria = new Map(); // clienteTelefone -> { clienteTelefone, remoteJid, clienteNome, status, mensagens, pedidoRascunho }

function carregarConversasDoDisco() {
  try {
    if (fs.existsSync(CONVERSAS_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONVERSAS_FILE, 'utf8'));
      for (const [k, v] of Object.entries(data)) {
        if (v && v.clienteTelefone) {
          // Limpa qualquer resquício de nome corrompido "Kkk Muito Bom"
          if (v.clienteNome && (v.clienteNome.toLowerCase().includes('kkk') || v.clienteNome.toLowerCase().includes('muito bom'))) {
            v.clienteNome = '';
          }
          conversasMemoria.set(k, v);
        }
      }
      console.log(`[EloBot Baileys] 💬 Carregadas ${conversasMemoria.size} conversas persistidas do disco.`);
    }
  } catch (e) {}
}
carregarConversasDoDisco();

let salvarConversasTimeout = null;
function salvarConversasNoDisco() {
  if (salvarConversasTimeout) return;
  salvarConversasTimeout = setTimeout(() => {
    salvarConversasTimeout = null;
    try {
      const obj = {};
      for (const [k, v] of conversasMemoria.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(CONVERSAS_FILE, JSON.stringify(obj, null, 2), 'utf8');
    } catch (e) {}
  }, 2000);
}

// ====================================================================
// RESOLUÇÃO DE TELEFONE REAL E NOME DO CLIENTE
// ====================================================================
async function resolverNumeroReal(remoteJid) {
  if (!remoteJid) return '';
  if (remoteJid.includes('@s.whatsapp.net')) {
    return remoteJid.replace(/@.+/, '').split(':')[0];
  }
  if (remoteJid.includes('@lid')) {
    const lidUser = remoteJid.replace(/@.+/, '').split(':')[0];
    if (lidToPhoneMap.has(lidUser)) {
      return lidToPhoneMap.get(lidUser);
    }
    const reverseFile = path.join(AUTH_DIR, `lid-mapping-${lidUser}_reverse.json`);
    if (fs.existsSync(reverseFile)) {
      try {
        const pn = JSON.parse(fs.readFileSync(reverseFile, 'utf8'));
        if (pn) {
          const pnStr = String(pn).replace(/\D/g, '');
          lidToPhoneMap.set(lidUser, pnStr);
          return pnStr;
        }
      } catch (e) {}
    }
    try {
      if (sock?.signalRepository?.lidMapping?.getPNForLID) {
        const pnJid = await sock.signalRepository.lidMapping.getPNForLID(remoteJid);
        if (pnJid) {
          const pnStr = pnJid.replace(/@.+/, '').split(':')[0];
          lidToPhoneMap.set(lidUser, pnStr);
          return pnStr;
        }
      }
    } catch (e) {}
    return lidUser;
  }
  return remoteJid.replace(/@.+/, '').split(':')[0];
}

function resolverJidParaEnvio(telefone) {
  if (!telefone) return '';
  if (telefone.includes('@s.whatsapp.net') || telefone.includes('@lid')) return telefone;
  const numLimpo = telefone.replace(/\D/g, '');
  if (lidToPhoneMap.has(numLimpo)) {
    return `${numLimpo}@lid`;
  }
  if (phoneToLidMap.has(numLimpo)) {
    return `${phoneToLidMap.get(numLimpo)}@lid`;
  }
  return `${numLimpo}@s.whatsapp.net`;
}

function formatarCapitalizacao(str) {
  if (!str) return '';
  return str
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

const palavrasProibidas = [
  'oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'opa', 'e aí', 'e ai', 'fala',
  'kkk', 'kkkk', 'kkkkk', 'haha', 'hahaha', 'muito bom', 'bom', 'muito', 'mto',
  'cardapio', 'cardápio', 'menu', 'pedir', 'pedido', 'sim', 'nao', 'não', 'quero', 'gostaria',
  'quanto', 'onde', 'pix', 'cartao', 'cartão', 'obrigado', 'obrigada', 'valeu', 'ok', 'beleza', 'blz',
  'humano', 'atendente', 'cheguei', 'entrega', 'rua', 'ajuda', 'ola!', 'olá!', 'oi!', 'casa',
  'restaurante', 'churrascaria', 'picanha', 'carne', 'pizza', 'chopp', 'cerveja', 'bebida',
  'teste', 'testando', 'sistema', 'bugado', 'bot', 'elobot', 'comida', 'conta', 'pagar', 'pagamento'
];

function extrairNomeDoTexto(texto, botPerguntouNome = false) {
  if (!texto || typeof texto !== 'string') return null;
  const limpo = texto.trim();

  // Padrões estritos de apresentação (ex: "Meu nome é Carlos", "Me chamo Mariana", "Sou o Wendel")
  const padroes = [
    /(?:meu\s+nome\s+(?:é|e)|me\s+chamo|pode\s+me\s+chamar\s+de)\s+([A-Za-zÀ-ÿ]{2,20}(?:\s+[A-Za-zÀ-ÿ]{2,20})?)/i,
    /^(?:sou\s+(?:o|a)\s+|aqui\s+(?:é|e)\s+(?:o|a)\s*)([A-Za-zÀ-ÿ]{2,20}(?:\s+[A-Za-zÀ-ÿ]{2,20})?)/i,
  ];

  for (const regex of padroes) {
    const match = limpo.match(regex);
    if (match && match[1]) {
      const cand = match[1].trim();
      const candLower = cand.toLowerCase();
      const ehProibido = palavrasProibidas.some((p) => candLower === p || candLower.startsWith(p + ' '));
      if (!ehProibido && cand.length >= 2) {
        return formatarCapitalizacao(cand);
      }
    }
  }

  // Se o bot perguntou expressamente "Como posso te chamar?" na última mensagem e o cliente respondeu apenas seu nome (1 ou 2 palavras)
  if (botPerguntouNome) {
    const limpoSemPontuacao = limpo.replace(/[.,!?;:()]/g, '').trim();
    const palavras = limpoSemPontuacao.split(/\s+/);
    if (palavras.length >= 1 && palavras.length <= 2 && /^[A-Za-zÀ-ÿ]{2,20}(\s+[A-Za-zÀ-ÿ]{2,20})?$/.test(limpoSemPontuacao)) {
      const limpoLower = limpoSemPontuacao.toLowerCase();
      const ehProibido = palavrasProibidas.some((p) => limpoLower === p || limpoLower.startsWith(p + ' '));
      if (!ehProibido) {
        return formatarCapitalizacao(limpoSemPontuacao);
      }
    }
  }

  return null;
}

function formatarTelefoneExibicao(tel) {
  if (!tel) return '';
  const num = tel.replace(/\D/g, '');
  if (num.startsWith('55') && num.length >= 12) {
    const ddd = num.slice(2, 4);
    const resto = num.slice(4);
    if (resto.length === 9) {
      return `(${ddd}) ${resto.slice(0, 5)}-${resto.slice(5)}`;
    }
    return `(${ddd}) ${resto.slice(0, 4)}-${resto.slice(4)}`;
  }
  if (num.length === 11) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`;
  }
  if (num.length === 10) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`;
  }
  return tel;
}

function resolverNomeCliente(remoteJid, realPhone, rawPushName, isParaMimMesmo) {
  if (isParaMimMesmo) {
    return 'Você (Restaurante)';
  }

  // 1. Checar se já foi renomeado no sistema ou confirmado em memória
  const chaves = [realPhone, remoteJid, (remoteJid || '').replace(/@.+/, '')].filter(Boolean);
  for (const k of chaves) {
    if (conversasMemoria.has(k)) {
      const conv = conversasMemoria.get(k);
      if (
        conv.clienteNome &&
        !conv.clienteNome.startsWith('Cliente (') &&
        conv.clienteNome !== 'Cliente' &&
        !conv.clienteNome.toLowerCase().includes('kkk') &&
        !conv.clienteNome.toLowerCase().includes('muito bom')
      ) {
        return conv.clienteNome;
      }
    }
  }

  // 2. Checar cache da agenda de contatos
  if (realPhone) {
    const limpo = realPhone.replace(/\D/g, '');
    if (contatosCache.has(limpo)) return contatosCache.get(limpo);
    if (contatosCache.has(`${limpo}@s.whatsapp.net`)) return contatosCache.get(`${limpo}@s.whatsapp.net`);
    if (limpo.startsWith('55') && contatosCache.has(limpo.slice(2))) return contatosCache.get(limpo.slice(2));
    if (limpo.length >= 8 && contatosCache.has(limpo.slice(-8))) return contatosCache.get(limpo.slice(-8));
    if (limpo.length >= 9 && contatosCache.has(limpo.slice(-9))) return contatosCache.get(limpo.slice(-9));
  }
  if (remoteJid && contatosCache.has(remoteJid)) return contatosCache.get(remoteJid);
  const lidUser = (remoteJid || '').replace(/@.+/, '');
  if (lidUser && contatosCache.has(lidUser)) return contatosCache.get(lidUser);

  // 3. Analisar pushName do perfil WhatsApp do cliente
  if (rawPushName && typeof rawPushName === 'string') {
    const pushTrim = rawPushName.trim();
    // Se tiver letras de verdade (ex: "Wendel", "Mariana", "Carlos Silva"):
    if (/[A-Za-zÀ-ÿ]{2,}/.test(pushTrim)) {
      const limpo = pushTrim.replace(/^[^\w\sÀ-ÿ]+|[^\w\sÀ-ÿ]+$/g, '').trim();
      if (limpo && /[A-Za-zÀ-ÿ]{2,}/.test(limpo)) {
        return formatarCapitalizacao(limpo);
      }
      return pushTrim;
    }
  }

  // 4. Fallback amigável usando os 4 últimos dígitos do telefone real
  const finalDigitos = realPhone ? realPhone.slice(-4) : (remoteJid ? remoteJid.slice(-4) : 'Zap');
  return `Cliente (${finalDigitos})`;
}

// Clientes SSE (Server-Sent Events) para atualizações em tempo real no frontend
const sseClients = new Set();

function broadcastEvent(tipo, dados) {
  const payload = `data: ${JSON.stringify({ tipo, dados, timestamp: Date.now() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// ====================================================================
// MOTOR DO BAILEYS (WHATSAPP WEB OFICIAL)
// ====================================================================
async function iniciarBaileys() {
  if (isInitializing) {
    console.log('[EloBot Baileys] Conexão já em andamento, ignorando chamada concorrente.');
    return;
  }
  if (connectionState.status === 'conectado' && sock) {
    console.log('[EloBot Baileys] WhatsApp já conectado!');
    return;
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  isInitializing = true;

  try {
    console.log('[EloBot Baileys] Iniciando conexão com WhatsApp...');
    connectionState.status = 'conectando';
    connectionState.ultimoErro = '';
    broadcastEvent('status_change', connectionState);

    // Fechar socket anterior se existir
    if (sock) {
      try {
        sock.ev.removeAllListeners();
        sock.ws?.close();
      } catch (e) {}
      sock = null;
    }

    // Certificar pasta de autenticação
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }), // Log limpo
      printQRInTerminal: false,
      auth: state,
      browser: ['EloServe PDV', 'Chrome', '1.0.0'],
      syncFullHistory: false,
      generateHighQualityLinkPreview: true,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
    });

    sock.ev.on('creds.update', async () => {
      try {
        if (!fs.existsSync(AUTH_DIR)) {
          fs.mkdirSync(AUTH_DIR, { recursive: true });
        }
        await saveCreds();
      } catch (err) {
        console.warn('[EloBot Baileys] Aviso ao gravar credenciais:', err.message);
      }
    });

    // 1. Sincronização inicial completa do histórico (Contatos, Chats e Mapeamentos LID)
    sock.ev.on('messaging-history.set', ({ contacts, chats, lidPnMappings }) => {
      console.log(`[EloBot Baileys] 📦 Histórico recebido: ${contacts?.length || 0} contatos, ${chats?.length || 0} conversas, ${lidPnMappings?.length || 0} LIDs`);

      // Contatos salvos na agenda
      for (const c of contacts || []) {
        const nome = c.name || c.notify || c.verifiedName || '';
        if (nome && /[A-Za-zÀ-ÿ]/.test(nome)) {
          if (c.id) guardarContatoNoCache(c.id, nome);
          if (c.lid) guardarContatoNoCache(c.lid, nome);
          if (c.phoneNumber) guardarContatoNoCache(c.phoneNumber, nome);
        }
      }

      // Conversas com nome salvo
      for (const chat of chats || []) {
        if (chat.name && /[A-Za-zÀ-ÿ]/.test(chat.name)) {
          guardarContatoNoCache(chat.id, chat.name);
        }
      }

      // Mapeamentos LID <-> Telefone Real
      for (const m of lidPnMappings || []) {
        if (m.lid && m.pn) {
          const l = m.lid.replace(/@.+/, '').split(':')[0];
          const p = m.pn.replace(/@.+/, '').split(':')[0];
          lidToPhoneMap.set(l, p);
          phoneToLidMap.set(p, l);
        }
      }
    });

    // 2. Atualizações em tempo real de mapeamento LID
    sock.ev.on('lid-mapping.update', ({ pn, lid }) => {
      if (pn && lid) {
        const l = lid.replace(/@.+/, '').split(':')[0];
        const p = pn.replace(/@.+/, '').split(':')[0];
        lidToPhoneMap.set(l, p);
        phoneToLidMap.set(p, l);
      }
    });

    // 3. Atualizações incrementais de contatos
    sock.ev.on('contacts.upsert', (contacts) => {
      for (const c of contacts || []) {
        const nome = c.name || c.notify || c.verifiedName || '';
        if (nome && /[A-Za-zÀ-ÿ]/.test(nome)) {
          if (c.id) guardarContatoNoCache(c.id, nome);
          if (c.lid) guardarContatoNoCache(c.lid, nome);
          if (c.phoneNumber) guardarContatoNoCache(c.phoneNumber, nome);
        }
      }
      console.log(`[EloBot Baileys] 👥 Contatos da agenda sincronizados: ${contatosCache.size} registros carregados`);
    });

    sock.ev.on('contacts.update', (updates) => {
      for (const c of updates || []) {
        const nome = c.name || c.notify || c.verifiedName || '';
        if (nome && /[A-Za-zÀ-ÿ]/.test(nome)) {
          if (c.id) guardarContatoNoCache(c.id, nome);
          if (c.lid) guardarContatoNoCache(c.lid, nome);
          if (c.phoneNumber) guardarContatoNoCache(c.phoneNumber, nome);
        }
      }
    });

    // 4. Atualizações de chats
    sock.ev.on('chats.upsert', (chats) => {
      for (const chat of chats || []) {
        if (chat.name && /[A-Za-zÀ-ÿ]/.test(chat.name)) {
          guardarContatoNoCache(chat.id, chat.name);
        }
      }
    });

    sock.ev.on('chats.update', (updates) => {
      for (const chat of updates || []) {
        if (chat.name && /[A-Za-zÀ-ÿ]/.test(chat.name)) {
          guardarContatoNoCache(chat.id, chat.name);
        }
      }
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        connectionState.status = 'qrcode';
        connectionState.qrRaw = qr;
        try {
          connectionState.qrCodeDataUrl = await QRCode.toDataURL(qr, {
            width: 400,
            margin: 2,
            errorCorrectionLevel: 'M',
          });
          broadcastEvent('qrcode_gerado', {
            qrCodeDataUrl: connectionState.qrCodeDataUrl,
            qrRaw: qr,
          });
        } catch (qrErr) {
          console.error('[EloBot Baileys] Erro ao renderizar QR DataURL:', qrErr.message);
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
        const shouldReconnect = !isLoggedOut;
        console.log(`[EloBot Baileys] Conexão encerrada. Motivo: ${statusCode}. Reconectar? ${shouldReconnect}`);

        if (isLoggedOut) {
          connectionState.status = 'desconectado';
          connectionState.qrCodeDataUrl = '';
          connectionState.telefone = '';
          connectionState.nome = '';
          limparCredenciais();
          broadcastEvent('status_change', connectionState);
        } else if (shouldReconnect) {
          connectionState.status = 'conectando';
          broadcastEvent('status_change', connectionState);
          if (reconnectTimer) clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(() => {
            iniciarBaileys();
          }, 4000);
        }
      } else if (connection === 'open') {
        connectionState.status = 'conectado';
        connectionState.qrCodeDataUrl = '';
        const userJid = sock?.user?.id || '';
        const numeroLimpo = userJid.split(':')[0] || userJid.split('@')[0];
        connectionState.telefone = `+${numeroLimpo}`;
        connectionState.nome = sock?.user?.name || 'Restaurante';

        console.log(`[EloBot Baileys] ✅ WHATSAPP CONECTADO COM SUCESSO! Número: ${connectionState.telefone}`);
        broadcastEvent('conectado', connectionState);
      }
    });

    // Função auxiliar para extrair texto de qualquer tipo de mensagem do WhatsApp
    function extrairTextoMensagem(msg) {
      if (!msg || !msg.message) return '';
      const m =
        msg.message.ephemeralMessage?.message ||
        msg.message.viewOnceMessage?.message ||
        msg.message.viewOnceMessageV2?.message ||
        msg.message.documentWithCaptionMessage?.message ||
        msg.message;

      return (
        m?.conversation ||
        m?.extendedTextMessage?.text ||
        m?.imageMessage?.caption ||
        m?.videoMessage?.caption ||
        m?.documentMessage?.caption ||
        m?.buttonsResponseMessage?.selectedButtonId ||
        m?.templateButtonReplyMessage?.selectedId ||
        m?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        ''
      );
    }

    // Escuta de mensagens recebidas de clientes reais
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      console.log(`[EloBot Baileys] 📨 Evento messages.upsert recebido! Tipo: ${type}, Total: ${messages?.length || 0}`);

      for (const msg of messages || []) {
        const remoteJid = msg.key?.remoteJid || '';

        // Ignora status/stories, canais/newsletters e grupos (foco apenas em atendimento 1 a 1 de clientes)
        if (!remoteJid || remoteJid.includes('@g.us') || remoteJid.includes('@newsletter') || remoteJid === 'status@broadcast') continue;

        // Ignora mensagens de protocolo interno do WhatsApp (recibos de leitura, sincronização)
        if (msg.message?.protocolMessage) continue;

        const textoMensagem = extrairTextoMensagem(msg);
        console.log(`[EloBot Baileys] 📩 Msg de ${remoteJid} (fromMe: ${msg.key?.fromMe}): "${textoMensagem}"`);

        if (!textoMensagem.trim()) continue;

        const meuNumeroLimpo = (connectionState.telefone || '').replace(/\D/g, '');
        const isParaMimMesmo = meuNumeroLimpo.length > 5 && remoteJid.includes(meuNumeroLimpo);

        // Resolve o número real (mesmo que venha como @lid)
        const realPhone = await resolverNumeroReal(remoteJid);
        const clienteTelefone = realPhone || remoteJid.replace(/@.+/, '');

        // Salvar pushName do contato no cache se tiver letras de verdade
        if (msg.pushName && typeof msg.pushName === 'string' && /[A-Za-zÀ-ÿ]{2,}/.test(msg.pushName)) {
          guardarContatoNoCache(remoteJid, msg.pushName);
          if (clienteTelefone) guardarContatoNoCache(clienteTelefone, msg.pushName);
        }

        // Se a mensagem foi enviada pelo próprio celular para terceiros (atendimento manual pelo dono):
        if (msg.key?.fromMe && !isParaMimMesmo) {
          const chaves = [clienteTelefone, remoteJid, remoteJid.replace(/@.+/, '')].filter(Boolean);
          for (const k of chaves) {
            if (conversasMemoria.has(k)) {
              const conversa = conversasMemoria.get(k);
              const horaAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const msgHumano = {
                id: msg.key?.id || `hum-${Date.now()}`,
                remetente: 'humano',
                texto: textoMensagem,
                hora: horaAtual,
                statusEnvio: 'entregue',
                tipo: 'texto',
              };
              conversa.mensagens.push(msgHumano);
              conversa.status = 'humano';
              salvarConversasNoDisco();
              broadcastEvent('nova_mensagem', {
                clienteTelefone,
                clienteNome: conversa.clienteNome,
                mensagem: msgHumano,
                transbordoHumano: true,
              });
              break;
            }
          }
          continue;
        }

        const horaAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Verifica se a última mensagem do bot havia perguntado o nome do cliente
        let botPerguntouNome = false;
        const convAtual = conversasMemoria.get(clienteTelefone) || conversasMemoria.get(remoteJid);
        if (convAtual && convAtual.mensagens?.length > 0) {
          const ult = convAtual.mensagens[convAtual.mensagens.length - 1];
          if (ult.remetente === 'bot' && (ult.texto?.includes('como posso te chamar') || ult.texto?.includes('qual o seu nome') || ult.texto?.includes('qual é o seu nome'))) {
            botPerguntouNome = true;
          }
        }

        // 1. Resolução inteligente do nome do cliente
        let nomeClienteResolvido = resolverNomeCliente(remoteJid, clienteTelefone, msg.pushName, isParaMimMesmo);

        // 2. Detecção automática de nome introduzido pelo cliente
        const nomeDetectadoNoTexto = extrairNomeDoTexto(textoMensagem, botPerguntouNome);
        let nomeFoiAtualizado = false;

        if (nomeDetectadoNoTexto) {
          console.log(`[EloBot Baileys] 💡 Nome do cliente detectado: "${nomeDetectadoNoTexto}"`);
          nomeClienteResolvido = nomeDetectadoNoTexto;
          guardarContatoNoCache(remoteJid, nomeDetectadoNoTexto);
          guardarContatoNoCache(clienteTelefone, nomeDetectadoNoTexto);
          nomeFoiAtualizado = true;
        }

        // 3. Detecção de Mesa e Restaurante correspondente
        const mesaDetectada = extrairMesaDoTexto(textoMensagem);
        const lojaDetectada = detectarLojaDoTexto(textoMensagem, convAtual?.tenantId || botConfig.tenantId);

        console.log(`[EloBot Baileys] 🚀 Processando mensagem de ${nomeClienteResolvido} (${clienteTelefone})${mesaDetectada ? ` [${mesaDetectada} - ${lojaDetectada.nomeLoja}]` : ''}: "${textoMensagem}"`);
        connectionState.totalMensagensHoje++;

        // Obter ou criar conversa do cliente
        if (!conversasMemoria.has(clienteTelefone)) {
          conversasMemoria.set(clienteTelefone, {
            clienteTelefone,
            remoteJid,
            clienteNome: nomeClienteResolvido,
            status: 'ia',
            mesa: mesaDetectada || null,
            tenantId: lojaDetectada.tenantId || botConfig.tenantId,
            nomeLoja: lojaDetectada.nomeLoja || botConfig.nomeLoja,
            mensagens: [],
            pedidoRascunho: null,
          });
        }

        const conversa = conversasMemoria.get(clienteTelefone);
        conversa.remoteJid = remoteJid;
        if (mesaDetectada) conversa.mesa = mesaDetectada;
        if (lojaDetectada) {
          conversa.tenantId = lojaDetectada.tenantId;
          conversa.nomeLoja = lojaDetectada.nomeLoja;
        }

        // Se o nome atual da conversa é genérico ("Cliente (XXXX)") ou corrompido, e agora temos um nome resolvido melhor:
        const nomeAtualEhGenerico = !conversa.clienteNome || conversa.clienteNome.startsWith('Cliente (') || conversa.clienteNome === 'Cliente' || conversa.clienteNome.toLowerCase().includes('kkk');
        if (nomeClienteResolvido && !nomeClienteResolvido.startsWith('Cliente (') && (nomeAtualEhGenerico || nomeFoiAtualizado)) {
          conversa.clienteNome = nomeClienteResolvido;
          nomeFoiAtualizado = true;
        }

        // Se o nome foi detectado/atualizado, notifica o frontend
        if (nomeFoiAtualizado) {
          broadcastEvent('nome_atualizado', {
            clienteTelefone,
            novoNome: conversa.clienteNome,
            mesa: conversa.mesa || null,
            tenantId: conversa.tenantId || null,
            nomeLoja: conversa.nomeLoja || null,
          });
        }

        // Registra mensagem do cliente
        const msgCliente = {
          id: msg.key?.id || `msg-${Date.now()}`,
          remetente: 'cliente',
          texto: textoMensagem,
          hora: horaAtual,
          statusEnvio: 'entregue',
          tipo: 'texto',
        };
        conversa.mensagens.push(msgCliente);
        salvarConversasNoDisco();

        // Notifica frontend da nova mensagem do cliente com o nome e mesa atualizados
        broadcastEvent('nova_mensagem', {
          clienteTelefone,
          clienteNome: conversa.clienteNome,
          mensagem: msgCliente,
          mesa: conversa.mesa || null,
          tenantId: conversa.tenantId || null,
          nomeLoja: conversa.nomeLoja || null,
        });

        // Se a conversa estiver com atendimento humano, a IA não responde automaticamente
        if (conversa.status === 'humano') {
          console.log(`[EloBot Baileys] Chat em modo HUMANO. Aguardando operador responder.`);
          continue;
        }

        // Processar resposta da IA com o cardápio e esteira de pedidos
        const respostaIA = processarInteligenciaEloBot(textoMensagem, conversa.clienteNome, conversa, nomeDetectadoNoTexto);

        // Intervalo de digitação natural
        await new Promise((r) => setTimeout(r, 1200));

        // Envia mensagem de volta para o WhatsApp do cliente
        try {
          await sock.sendMessage(remoteJid, { text: respostaIA.texto });

          const msgBot = {
            id: `bot-${Date.now()}`,
            remetente: 'bot',
            texto: respostaIA.texto,
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            statusEnvio: 'entregue',
            tipo: respostaIA.tipo || 'texto',
            resumoPedido: respostaIA.resumoPedido,
          };
          conversa.mensagens.push(msgBot);
          salvarConversasNoDisco();

          if (respostaIA.transbordoHumano) {
            conversa.status = 'humano';
          }

          if (respostaIA.pedidoCriado) {
            conversa.pedidoRascunho = respostaIA.resumoPedido;
          }

          // Notifica frontend da resposta do robô
          broadcastEvent('nova_mensagem', {
            clienteTelefone,
            clienteNome: conversa.clienteNome,
            mensagem: msgBot,
            pedidoCriado: respostaIA.pedidoCriado,
            transbordoHumano: respostaIA.transbordoHumano,
            mesa: conversa.mesa || null,
            tenantId: conversa.tenantId || null,
            nomeLoja: conversa.nomeLoja || null,
          });

          console.log(`[EloBot Baileys] 🤖 Resposta enviada para ${conversa.clienteNome} (${conversa.mesa || 'Delivery'} • ${conversa.nomeLoja}): "${respostaIA.texto.substring(0, 60)}..."`);
        } catch (sendErr) {
          console.error(`[EloBot Baileys] Erro ao enviar mensagem para ${remoteJid}:`, sendErr.message);
        }
      }
    });
  } catch (err) {
    console.error('[EloBot Baileys] Erro fatal ao iniciar Baileys:', err);
    connectionState.status = 'desconectado';
    connectionState.ultimoErro = err.message || 'Erro de conexão';
    broadcastEvent('status_change', connectionState);
  } finally {
    isInitializing = false;
  }
}

// ====================================================================
// INTELIGÊNCIA CONVERSACIONAL DO ELOBOT
// ====================================================================
// ====================================================================
// INTELIGÊNCIA CONVERSACIONAL DO ELOBOT
// ====================================================================
function processarInteligenciaEloBot(texto, nomeCliente, conversa, nomeDetectadoAgora) {
  const t = texto;
  const textoNorm = normalizarTexto(texto);

  // 1. Identificar se o cliente está em uma mesa / balcão
  const mesaDetectada = extrairMesaDoTexto(t) || conversa?.mesa || null;

  // 2. Identificar qual restaurante o cliente está solicitando
  const loja = detectarLojaDoTexto(t, conversa?.tenantId || botConfig.tenantId);

  // Atualiza mesa e loja na conversa em memória
  if (conversa) {
    if (mesaDetectada) conversa.mesa = mesaDetectada;
    conversa.tenantId = loja.tenantId;
    conversa.nomeLoja = loja.nomeLoja;
  }

  const saudacaoTom = formatarSaudacaoPorTom(
    loja.tomDeVoz || botConfig.tomDeVoz || 'acolhedor',
    nomeCliente,
    loja.nomeLoja || botConfig.nomeLoja,
    loja.nomeAgente || botConfig.nomeAgente
  );

  const dicaCustom = botConfig.instrucoesCustomizadas
    ? `\n\n💡 *Dica Especial:* ${botConfig.instrucoesCustomizadas}`
    : '';

  // Se o cliente acabou de se apresentar com o nome:
  if (nomeDetectadoAgora) {
    if (conversa?.mesa) {
      return {
        texto: `Muito prazer, *${nomeDetectadoAgora}*! 👋 Já anotei o seu nome aqui para o atendimento na *${conversa.mesa}*.\n\n` + gerarCardapioMesaTexto(loja, conversa.mesa, nomeDetectadoAgora),
        tipo: 'cardapio',
      };
    }

    if (botConfig.mensagemBoasVindas && botConfig.mensagemBoasVindas.trim()) {
      let customWelcome = botConfig.mensagemBoasVindas
        .replace(/\{nome\}/gi, nomeDetectadoAgora)
        .replace(/\{loja\}/gi, loja.nomeLoja)
        .replace(/\{agente\}/gi, loja.nomeAgente || botConfig.nomeAgente);

      const temMenuNoTexto =
        customWelcome.includes('Cardápio') ||
        customWelcome.includes('Cardapio') ||
        customWelcome.includes('👉') ||
        customWelcome.includes('1️⃣') ||
        customWelcome.includes('🅰️') ||
        customWelcome.includes('A -');

      const menuFinal = temMenuNoTexto ? '' : `\n\n${obterMenuOpcoesTexto()}`;

      return {
        texto: `Muito prazer, *${nomeDetectadoAgora}*! 👋 Já anotei o seu nome aqui.\n\n${customWelcome}${dicaCustom}${menuFinal}`,
        tipo: 'texto',
      };
    }

    return {
      texto: `Muito prazer, *${nomeDetectadoAgora}*! 👋 Já anotei o seu nome aqui.\n\n${saudacaoTom.abertura}\n${saudacaoTom.apresentacao}${dicaCustom}\n\n${obterMenuOpcoesTexto()}`,
      tipo: 'texto',
    };
  }

  // 3. Cliente na Mesa pediu o Cardápio ou escaneou o QR Code da mesa!
  // Exemplo da placa: "Olá! Estou na Mesa 04 do Churrascaria & Parrilla Fogo de Minas e gostaria de ver o cardápio e fazer meu pedido."
  const ehGatilhoMesaCardapio =
    textoNorm.includes('ver o cardapio') ||
    textoNorm.includes('gostaria de ver o cardapio') ||
    textoNorm.includes('ver cardapio') ||
    textoNorm.includes('fazer meu pedido') ||
    textoNorm.includes('cardapio na mesa') ||
    textoNorm.includes('cardápio na mesa') ||
    textoNorm.includes('cardapio') ||
    textoNorm.includes('cardápio') ||
    textoNorm.includes('menu') ||
    textoNorm.includes('o que tem') ||
    checarGatilho(t, botConfig.palavrasCardapio, 'cardapio, cardápio, menu, pratos, opcoes, opções, precos, preços, a, 1') ||
    (mesaDetectada && (textoNorm.includes('estou na') || textoNorm.includes('to na') || textoNorm.startsWith('ola') || textoNorm.startsWith('oi') || textoNorm.includes('cheguei')));

  if (mesaDetectada && ehGatilhoMesaCardapio) {
    console.log(`[EloBot Baileys] 🍽️ Autoatendimento na mesa: Cliente na ${mesaDetectada} solicitou cardápio da loja "${loja.nomeLoja}"!`);
    return {
      texto: gerarCardapioMesaTexto(loja, mesaDetectada, nomeCliente),
      tipo: 'cardapio',
    };
  }

  // 4. Pedido de Atendente Humano ou Chamada de Garçom na Mesa
  const gatilhoAtendente =
    checarGatilho(
      t,
      botConfig.palavrasAtendente,
      'humano, atendente, garcom, garçom, ajuda, suporte, falar com atendente, b, 2'
    ) ||
    textoNorm.includes('garcom') ||
    textoNorm.includes('garçom') ||
    textoNorm.includes('chamar garcom') ||
    textoNorm.includes('chamar garçom') ||
    textoNorm.includes('chamar o garcom');

  if (gatilhoAtendente) {
    if (conversa?.mesa) {
      return {
        texto: `🔔 *GARÇOM ACIONADO PARA A ${conversa.mesa}!* 🙋‍♂️\n\nOlá, ${nomeCliente}! Já notificamos nossa equipe de atendimento do *${loja.nomeLoja}*.\nUm garçom está a caminho da sua mesa para te atender presencialmente!`,
        tipo: 'aviso',
        transbordoHumano: true,
      };
    }

    if (botConfig.mensagemTransbordo && botConfig.mensagemTransbordo.trim()) {
      let customTransbordo = botConfig.mensagemTransbordo
        .replace(/\{nome\}/gi, nomeCliente)
        .replace(/\{loja\}/gi, loja.nomeLoja);
      return {
        texto: customTransbordo,
        tipo: 'aviso',
        transbordoHumano: true,
      };
    }

    return {
      texto: `Com certeza, ${nomeCliente}! 👨‍💼 Estou transferindo seu atendimento para nossa equipe do *${loja.nomeLoja}* agora mesmo. Um atendente entrará no chat em instantes!`,
      tipo: 'aviso',
      transbordoHumano: true,
    };
  }

  // 5. Cliente forneceu endereço e pagamento (Finalização de Pedido de Delivery)
  const temEndereco =
    textoNorm.includes('rua') ||
    textoNorm.includes('av') ||
    textoNorm.includes('avenida') ||
    textoNorm.includes('bairro') ||
    textoNorm.includes('apto') ||
    textoNorm.includes('casa') ||
    textoNorm.includes('numero') ||
    textoNorm.includes('entrega') ||
    textoNorm.includes('savassi') ||
    textoNorm.includes('centro');

  const temPagamento =
    textoNorm.includes('pix') ||
    textoNorm.includes('cartao') ||
    textoNorm.includes('credito') ||
    textoNorm.includes('debito') ||
    textoNorm.includes('dinheiro') ||
    textoNorm.includes('troco');

  if (conversa?.pedidoRascunho && (temEndereco || temPagamento) && !conversa?.mesa) {
    const formaPag = textoNorm.includes('pix')
      ? 'PIX'
      : (textoNorm.includes('cartao') || textoNorm.includes('credito') || textoNorm.includes('debito'))
      ? 'Cartão na Entrega'
      : 'Dinheiro';

    const numeroPedido = Math.floor(100 + Math.random() * 900);
    const subtotal = conversa.pedidoRascunho.subtotal || 0;
    const taxa = Number(botConfig.taxaEntregaFixa) || 0;
    const total = subtotal + taxa;

    const resumo = {
      numeroPedido,
      pedidoId: `PED-${numeroPedido}`,
      itens: conversa.pedidoRascunho.itens,
      subtotal,
      taxaEntrega: taxa,
      total,
      endereco: texto,
      formaPagamento: formaPag,
      chavePix: loja.chavePix || botConfig.chavePix,
      enviadoParaCozinha: true,
    };

    conversa.pedidoRascunho = resumo;

    let msgResposta = `🎉 *PEDIDO #${numeroPedido} CONFIRMADO COM SUCESSO!*\n\n`;
    msgResposta += `*Restaurante:* ${loja.nomeLoja}\n`;
    msgResposta += `Itens do Pedido:\n`;
    resumo.itens.forEach((it) => {
      const emoji = obterEmojiPrato(it.nome, '');
      msgResposta += `• ${it.quantidade}x ${emoji} ${it.nome} - R$ ${(it.preco * it.quantidade).toFixed(2)}\n`;
    });
    msgResposta += `\nTaxa de Entrega: R$ ${taxa.toFixed(2)}`;
    msgResposta += `\n*TOTAL: R$ ${total.toFixed(2)}*\n\n`;

    if (formaPag === 'PIX') {
      msgResposta += `🔑 *Chave PIX do Restaurante:* \`${loja.chavePix || botConfig.chavePix}\`\n`;
      msgResposta += `Após o pagamento, envie o comprovante por aqui que seu pedido já começará a ser preparado!\n\n`;
    }

    msgResposta += `⏱️ *Tempo estimado de entrega:* ${botConfig.tempoMedioEntregaMin} a ${Number(botConfig.tempoMedioEntregaMin) + 15} minutos.\n`;
    msgResposta += `👨‍🍳 Já enviamos a comanda para nossa *Cozinha (KDS)*. Avisaremos assim que sair para entrega!`;

    return {
      texto: msgResposta,
      tipo: 'pedido',
      resumoPedido: resumo,
      pedidoCriado: true,
    };
  }

  // 6. Detecção de Intenção de Pedido de Pratos (com produtos reais do catálogo da loja)
  const todosCatalogo = (Array.isArray(loja.produtos) && loja.produtos.length > 0)
    ? loja.produtos
    : (Array.isArray(botConfig.produtos) ? botConfig.produtos : []);
  const produtosCatalogo = todosCatalogo.filter((p) => p.disponivel !== false);

  const pratosDetectados = [];
  if (produtosCatalogo.length > 0) {
    produtosCatalogo.forEach((prod) => {
      const nomeProdNorm = normalizarTexto(prod.nome);
      const palavras = nomeProdNorm.split(' ').filter((w) => w.length > 2);
      const primeiraPalavra = palavras[0] || nomeProdNorm;

      if (textoNorm.includes(nomeProdNorm) || (palavras.length > 0 && textoNorm.includes(primeiraPalavra))) {
        let qtd = 1;
        const matchQtd = textoNorm.match(new RegExp(`(\\d+)\\s*(?:x|de)?\\s*${primeiraPalavra}`, 'i'));
        if (matchQtd) {
          qtd = parseInt(matchQtd[1], 10) || 1;
        } else if (textoNorm.includes('2 ') || textoNorm.includes('dois ') || textoNorm.includes('2x ')) {
          if (textoNorm.includes(primeiraPalavra)) qtd = 2;
        } else if (textoNorm.includes('3 ') || textoNorm.includes('tres ') || textoNorm.includes('3x ')) {
          if (textoNorm.includes(primeiraPalavra)) qtd = 3;
        }
        pratosDetectados.push({
          nome: prod.nome,
          quantidade: qtd,
          preco: Number(prod.preco) || 0,
          categoria: prod.categoria,
        });
      }
    });
  }

  if (pratosDetectados.length > 0) {
    const subtotal = pratosDetectados.reduce((acc, p) => acc + p.preco * p.quantidade, 0);

    // Se o cliente estiver na MESA, confirma diretamente sem taxa e sem pedir endereço!
    if (conversa?.mesa) {
      const numeroPedido = Math.floor(100 + Math.random() * 900);
      const resumoMesa = {
        numeroPedido,
        pedidoId: `CMD-${conversa.mesa.replace(/\s+/g, '')}-${numeroPedido}`,
        itens: pratosDetectados,
        subtotal,
        taxaEntrega: 0,
        total: subtotal,
        mesa: conversa.mesa,
        tipo: 'mesa',
        enviadoParaCozinha: true,
        chavePix: loja.chavePix || botConfig.chavePix,
      };
      conversa.pedidoRascunho = resumoMesa;

      let msgMesa = `🍽️ *PEDIDO REGISTRADO PARA A ${conversa.mesa}!* 👨‍🍳\n`;
      msgMesa += `*Restaurante:* ${loja.nomeLoja}\n\n`;
      msgMesa += `Itens Solicitados:\n`;
      pratosDetectados.forEach((p) => {
        const emoji = obterEmojiPrato(p.nome, p.categoria);
        msgMesa += `• ${p.quantidade}x ${emoji} *${p.nome}* - R$ ${(p.preco * p.quantidade).toFixed(2)}\n`;
      });
      msgMesa += `\n💰 *Total da Mesa: R$ ${subtotal.toFixed(2)}*`;
      msgMesa += `\n🛎️ *Local:* ${conversa.mesa} (Consumo Presencial • Taxa de Entrega: R$ 0,00)\n\n`;
      msgMesa += `👨‍🍳 A comanda já foi enviada para a *Cozinha e Bar (KDS)*!\n`;
      msgMesa += `Em instantes seus itens serão servidos quentinhos na sua mesa.\n\n`;
      msgMesa += `Se desejar mais alguma coisa ou pedir a conta, basta me avisar por aqui!`;

      return {
        texto: msgMesa,
        tipo: 'pedido',
        resumoPedido: resumoMesa,
        pedidoCriado: true,
      };
    }

    // Fluxo normal de delivery:
    const taxa = Number(botConfig.taxaEntregaFixa) || 0;
    const total = subtotal + taxa;

    conversa.pedidoRascunho = {
      itens: pratosDetectados,
      subtotal,
      taxaEntrega: taxa,
      total,
    };

    const emojiGeral = obterEmojiPrato(pratosDetectados[0].nome, pratosDetectados[0].categoria);
    let msg = `Excelente escolha, ${nomeCliente}! ${emojiGeral} Já montei o seu pedido no *${loja.nomeLoja}*:\n\n`;
    pratosDetectados.forEach((p) => {
      const emoji = obterEmojiPrato(p.nome, p.categoria);
      msg += `• ${p.quantidade}x ${emoji} *${p.nome}* - R$ ${(p.preco * p.quantidade).toFixed(2)}\n`;
    });
    msg += `\nSubtotal: R$ ${subtotal.toFixed(2)}`;
    msg += `\nTaxa de Entrega: R$ ${taxa.toFixed(2)}`;
    msg += `\n*Total Previsto: R$ ${total.toFixed(2)}*\n\n`;
    if (dicaCustom) {
      msg += `${dicaCustom}\n\n`;
    }
    msg += `📍 Por favor, me informe o seu *endereço completo* e a *forma de pagamento* desejada (PIX ou Cartão na Entrega) para despacharmos para a cozinha!`;

    return {
      texto: msg,
      tipo: 'pedido',
      resumoPedido: conversa.pedidoRascunho,
    };
  }

  // 7. Pergunta sobre Cardápio / Opções (Delivery)
  const gatilhoCardapio = checarGatilho(
    t,
    botConfig.palavrasCardapio,
    'cardapio, cardápio, menu, pratos, opcoes, opções, precos, preços, quanto custa, a, 1'
  );
  if (gatilhoCardapio) {
    if (conversa?.mesa) {
      return {
        texto: gerarCardapioMesaTexto(loja, conversa.mesa, nomeCliente),
        tipo: 'cardapio',
      };
    }
    return {
      texto: gerarCardapioDeliveryTexto(loja, nomeCliente),
      tipo: 'cardapio',
    };
  }

  // 8. Pergunta sobre Chave PIX
  const gatilhoPix = checarGatilho(
    t,
    botConfig.palavrasPix,
    'pix, chave, chave pix, pagar, pagamento, transferir, conta, c, 3'
  );
  if (gatilhoPix) {
    const chavePix = loja.chavePix || botConfig.chavePix;
    if (conversa?.mesa) {
      return {
        texto: `🔑 *PAGAMENTO VIA PIX — ${loja.nomeLoja.toUpperCase()}*\n\nNossa chave PIX oficial é:\n\`${chavePix}\`\n\nConta PJ do restaurante vinculada à sua comanda na *${conversa.mesa}*.\nBasta realizar a transferência e enviar o comprovante por aqui!`,
        tipo: 'pix',
      };
    }

    if (botConfig.mensagemPix && botConfig.mensagemPix.trim()) {
      let customPix = botConfig.mensagemPix
        .replace(/\{chave\}/gi, chavePix)
        .replace(/\{loja\}/gi, loja.nomeLoja)
        .replace(/\{nome\}/gi, nomeCliente);
      return {
        texto: customPix,
        tipo: 'pix',
      };
    }

    return {
      texto: `Nossa chave PIX oficial do *${loja.nomeLoja}* é:\n\n🔑 *${chavePix}*\n\nBanco: EloServe Pagamentos (Conta PJ). Aceitamos o envio do comprovante diretamente por aqui no WhatsApp!`,
      tipo: 'pix',
    };
  }

  // 9. Saudação Geral / Mensagem Padrão
  if (conversa?.mesa) {
    return {
      texto: `Olá, ${nomeCliente}! Você está na *${conversa.mesa}* do *${loja.nomeLoja}*.\n\n` + gerarCardapioMesaTexto(loja, conversa.mesa, nomeCliente),
      tipo: 'cardapio',
    };
  }

  if (botConfig.mensagemBoasVindas && botConfig.mensagemBoasVindas.trim()) {
    let customWelcome = botConfig.mensagemBoasVindas
      .replace(/\{nome\}/gi, nomeCliente)
      .replace(/\{loja\}/gi, loja.nomeLoja)
      .replace(/\{agente\}/gi, loja.nomeAgente || botConfig.nomeAgente);

    const ehNomeGenerico = !nomeCliente || nomeCliente.includes('Cliente (') || nomeCliente === 'Cliente';
    const sugestaoNome = ehNomeGenerico
      ? '\n\n💡 _Dica: me diga seu nome (ex: "Meu nome é Carlos") para personalizarmos o seu atendimento!_'
      : '';

    const temMenuNoTexto =
      customWelcome.includes('Cardápio') ||
      customWelcome.includes('Cardapio') ||
      customWelcome.includes('👉') ||
      customWelcome.includes('1️⃣') ||
      customWelcome.includes('🅰️') ||
      customWelcome.includes('A -');

    const menuFinal = temMenuNoTexto ? '' : `\n\n${obterMenuOpcoesTexto()}`;

    return {
      texto: `${customWelcome}${sugestaoNome}${dicaCustom}${menuFinal}`,
      tipo: 'texto',
    };
  }

  const ehNomeGenerico = !nomeCliente || nomeCliente.includes('Cliente (') || nomeCliente === 'Cliente';
  const sugestaoNome = ehNomeGenerico
    ? '\n\n💡 _Dica: me diga seu nome (ex: "Meu nome é Carlos") para personalizarmos o seu atendimento!_'
    : '';

  return {
    texto: `${saudacaoTom.abertura}\n\n${saudacaoTom.apresentacao}${sugestaoNome}${dicaCustom}\n\n${obterMenuOpcoesTexto()}\n\n_${saudacaoTom.fechamento}_`,
    tipo: 'texto',
  };
}

function limparCredenciais() {
  try {
    if (fs.existsSync(AUTH_DIR)) {
      const files = fs.readdirSync(AUTH_DIR);
      for (const file of files) {
        try {
          fs.unlinkSync(path.join(AUTH_DIR, file));
        } catch (e) {}
      }
    } else {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('[EloBot Baileys] Erro ao limpar pasta de auth:', err.message);
  }
}

// ====================================================================
// ROTAS REST DA API PARA O FRONTEND ELOSERVE
// ====================================================================

// Status da Conexão
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    sucesso: true,
    ...connectionState,
  });
});

// Listar todas as conversas armazenadas em memória
app.get('/api/whatsapp/conversas', (req, res) => {
  const lista = Array.from(conversasMemoria.values()).map((c) => {
    let nome = c.clienteNome;
    if (!nome || nome.toLowerCase().includes('kkk') || nome.toLowerCase().includes('muito bom')) {
      nome = resolverNomeCliente(c.remoteJid, c.clienteTelefone, c.pushName, false);
      c.clienteNome = nome;
    }
    return {
      id: `conv-real-${c.clienteTelefone}`,
      clienteNome: nome,
      clienteTelefone: formatarTelefoneExibicao(c.clienteTelefone),
      status: c.status || 'ia',
      mesa: c.mesa || null,
      tenantId: c.tenantId || null,
      nomeLoja: c.nomeLoja || null,
      ultimaMensagem: c.mensagens[c.mensagens.length - 1]?.texto || 'Conversa iniciada',
      ultimaHora: c.mensagens[c.mensagens.length - 1]?.hora || '',
      naoLidas: 0,
      mensagens: c.mensagens,
      pedidoRascunho: c.pedidoRascunho || null,
    };
  });
  res.json({ sucesso: true, conversas: lista });
});

// Renomear cliente manualmente pelo operador no painel
app.post('/api/whatsapp/renomear', (req, res) => {
  const { telefone, novoNome } = req.body;
  if (!telefone || !novoNome) {
    return res.status(400).json({ sucesso: false, erro: 'Telefone e novoNome são obrigatórios.' });
  }

  const nomeLimpo = novoNome.trim();
  const telLimpo = telefone.replace(/\D/g, '');

  // Atualiza no cache de contatos
  guardarContatoNoCache(telefone, nomeLimpo);
  if (telLimpo) guardarContatoNoCache(telLimpo, nomeLimpo);

  // Atualiza nas conversas em memória
  let atualizou = false;
  for (const [chave, conv] of conversasMemoria.entries()) {
    const chaveLimpa = chave.replace(/\D/g, '');
    if (chave === telefone || (telLimpo && (chaveLimpa.includes(telLimpo) || telLimpo.includes(chaveLimpa)))) {
      conv.clienteNome = nomeLimpo;
      atualizou = true;
    }
  }
  salvarConversasNoDisco();

  // Notifica o frontend via SSE
  broadcastEvent('nome_atualizado', {
    clienteTelefone: telefone,
    novoNome: nomeLimpo,
  });

  console.log(`[EloBot Baileys] ✏️ Cliente renomeado para "${nomeLimpo}" (${telefone})`);
  res.json({ sucesso: true, clienteNome: nomeLimpo, atualizou });
});

// Iniciar conexão e gerar QR Code
app.post('/api/whatsapp/conectar', async (req, res) => {
  if (connectionState.status === 'conectado') {
    return res.json({ sucesso: true, mensagem: 'Já conectado', status: 'conectado' });
  }
  await iniciarBaileys();
  res.json({ sucesso: true, mensagem: 'Iniciando Baileys. Aguarde o QR Code.' });
});

// Desconectar sessão
app.post('/api/whatsapp/desconectar', async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
      sock = null;
    }
    limparCredenciais();
    connectionState.status = 'desconectado';
    connectionState.qrCodeDataUrl = '';
    connectionState.telefone = '';
    connectionState.nome = '';
    broadcastEvent('status_change', connectionState);
    res.json({ sucesso: true, mensagem: 'Instância desconectada com sucesso.' });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// Enviar mensagem humana do operador pelo painel
app.post('/api/whatsapp/enviar', async (req, res) => {
  const { telefone, texto } = req.body;
  if (!telefone || !texto) {
    return res.status(400).json({ sucesso: false, erro: 'Telefone e texto são obrigatórios.' });
  }

  if (connectionState.status !== 'conectado' || !sock) {
    return res.status(503).json({ sucesso: false, erro: 'WhatsApp não está conectado no momento.' });
  }

  try {
    const remoteJid = resolverJidParaEnvio(telefone);
    const numLimpo = telefone.replace(/\D/g, '');

    await sock.sendMessage(remoteJid, { text: texto });

    // Salvar no histórico da conversa
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgHumano = {
      id: `op-${Date.now()}`,
      remetente: 'humano',
      texto,
      hora,
      statusEnvio: 'entregue',
    };

    let salvou = false;
    for (const [k, conv] of conversasMemoria.entries()) {
      const kLimpo = k.replace(/\D/g, '');
      if (k === telefone || kLimpo === numLimpo || (numLimpo && (kLimpo.includes(numLimpo) || numLimpo.includes(kLimpo)))) {
        conv.mensagens.push(msgHumano);
        salvou = true;
        break;
      }
    }

    if (!salvou) {
      if (!conversasMemoria.has(numLimpo)) {
        conversasMemoria.set(numLimpo, {
          clienteTelefone: numLimpo,
          remoteJid,
          clienteNome: resolverNomeCliente(remoteJid, numLimpo, '', false),
          status: 'humano',
          mensagens: [msgHumano],
          pedidoRascunho: null,
        });
      }
    }
    salvarConversasNoDisco();

    res.json({ sucesso: true, mensagem: 'Mensagem enviada com sucesso!' });
  } catch (err) {
    console.error('[EloBot Baileys] Erro ao enviar mensagem manual:', err);
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// Sincronizar configuração de regras da IA, gatilhos, mensagens e cardápio por restaurante
app.post('/api/whatsapp/config', (req, res) => {
  const {
    tenantId,
    produtos,
    nomeLoja,
    nomeAgente,
    tomDeVoz,
    modeloIA,
    chavePix,
    taxaEntregaFixa,
    tempoMedioEntregaMin,
    instrucoesCustomizadas,
    palavrasCardapio,
    palavrasAtendente,
    palavrasPix,
    mensagemBoasVindas,
    mensagemCardapio,
    mensagemTransbordo,
    mensagemPix,
  } = req.body;

  if (tenantId) {
    botConfig.tenantId = tenantId;
    if (!catalogoLojas[tenantId]) {
      catalogoLojas[tenantId] = {
        tenantId,
        nomeLoja: nomeLoja || botConfig.nomeLoja,
        nomeAgente: nomeAgente || botConfig.nomeAgente,
        tomDeVoz: tomDeVoz || botConfig.tomDeVoz,
        chavePix: chavePix || botConfig.chavePix,
        termosIdentificacao: [nomeLoja || 'restaurante'],
        produtos: produtos || botConfig.produtos || [],
      };
    } else {
      if (nomeLoja) catalogoLojas[tenantId].nomeLoja = nomeLoja;
      if (nomeAgente) catalogoLojas[tenantId].nomeAgente = nomeAgente;
      if (tomDeVoz) catalogoLojas[tenantId].tomDeVoz = tomDeVoz;
      if (chavePix) catalogoLojas[tenantId].chavePix = chavePix;
      if (produtos && Array.isArray(produtos)) catalogoLojas[tenantId].produtos = produtos;
    }
    salvarCatalogoLojasNoDisco();
  }

  if (produtos && Array.isArray(produtos)) botConfig.produtos = produtos;
  if (nomeLoja) botConfig.nomeLoja = nomeLoja;
  if (nomeAgente) botConfig.nomeAgente = nomeAgente;
  if (tomDeVoz) botConfig.tomDeVoz = tomDeVoz;
  if (modeloIA) botConfig.modeloIA = modeloIA;
  if (chavePix) botConfig.chavePix = chavePix;
  if (taxaEntregaFixa !== undefined && taxaEntregaFixa !== null) botConfig.taxaEntregaFixa = Number(taxaEntregaFixa);
  if (tempoMedioEntregaMin !== undefined && tempoMedioEntregaMin !== null) botConfig.tempoMedioEntregaMin = Number(tempoMedioEntregaMin);
  if (instrucoesCustomizadas !== undefined) botConfig.instrucoesCustomizadas = instrucoesCustomizadas;
  if (palavrasCardapio !== undefined) botConfig.palavrasCardapio = palavrasCardapio;
  if (palavrasAtendente !== undefined) botConfig.palavrasAtendente = palavrasAtendente;
  if (palavrasPix !== undefined) botConfig.palavrasPix = palavrasPix;
  if (mensagemBoasVindas !== undefined) botConfig.mensagemBoasVindas = mensagemBoasVindas;
  if (mensagemCardapio !== undefined) botConfig.mensagemCardapio = mensagemCardapio;
  if (mensagemTransbordo !== undefined) botConfig.mensagemTransbordo = mensagemTransbordo;
  if (mensagemPix !== undefined) botConfig.mensagemPix = mensagemPix;

  salvarBotConfigNoDisco();
  console.log(`[EloBot Baileys] 🔄 Regras da IA sincronizadas para "${botConfig.nomeLoja}" (${botConfig.nomeAgente} • Tom: ${botConfig.tomDeVoz} • ${botConfig.produtos?.length || 0} produtos)`);
  res.json({ sucesso: true, config: botConfig });
});

// Consulta das configurações ativas no servidor
app.get('/api/whatsapp/config', (req, res) => {
  res.json({ sucesso: true, config: botConfig });
});

// Server-Sent Events (SSE) para comunicação instantânea sem polling
app.get('/api/whatsapp/eventos', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  res.write(`data: ${JSON.stringify({ tipo: 'conectado_sse', connectionState })}\n\n`);
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Servir arquivos estáticos do frontend (React SPA compilado pelo Vite) em produção
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  console.log(`[EloServe] 📦 Frontend compilado detectado. Servindo estáticos de: ${distPath}`);
  app.use(express.static(distPath));

  // Catch-all compatível com Express v5 para SPA React Router
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Inicia servidor Express
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 EloBot WhatsApp Baileys Server rodando na porta ${PORT}`);
  console.log(`📡 URL API: http://localhost:${PORT}/api/whatsapp`);
  console.log(`====================================================`);

  // Se já houver credenciais salvas de sessão anterior, reconecta automaticamente
  if (fs.existsSync(path.join(AUTH_DIR, 'creds.json'))) {
    console.log('[EloBot Baileys] 🔑 Credenciais salvas detectadas no disco. Reconectando sessão automaticamente...');
    iniciarBaileys();
  }
});
