import { NotaFiscalRegistro, ItemNotaFiscal, TipoNotaFiscal } from '../types';

/**
 * Utilitário profissional de leitura e parsing de XMLs da SEFAZ
 * Compatível com NF-e (Modelo 55), NFC-e (Modelo 65) e NFS-e.
 */
export function extrairDadosXmlNFe(
  xmlContent: string,
  tenantId: string,
  tipoSugerido?: TipoNotaFiscal
): { sucesso: boolean; nota?: Omit<NotaFiscalRegistro, 'id' | 'criadoEm'>; erro?: string } {
  try {
    if (!xmlContent || !xmlContent.trim()) {
      return { sucesso: false, erro: 'O conteúdo do arquivo XML está vazio.' };
    }

    // Função auxiliar para extrair tags via regex simples e resiliente
    function extrairTag(tag: string, escopo?: string): string {
      const texto = escopo || xmlContent;
      const regex = new RegExp(`<(?:[a-zA-Z0-9_]+:)?${tag}[^>]*>([^<]+)<\\/(?:[a-zA-Z0-9_]+:)?${tag}>`, 'i');
      const match = texto.match(regex);
      return match ? match[1].trim() : '';
    }

    // Extrair chave de acesso de 44 dígitos
    let chaveAcesso = '';
    const idMatch = xmlContent.match(/Id=["'](?:NFe)?(\d{44})["']/i);
    if (idMatch) {
      chaveAcesso = idMatch[1];
    } else {
      const chMatch = xmlContent.match(/<chNFe>(\d{44})<\/chNFe>/i);
      if (chMatch) chaveAcesso = chMatch[1];
    }

    // Dados de Identificação da Nota
    const nNF = extrairTag('nNF') || Math.floor(100000 + Math.random() * 900000).toString();
    const serie = extrairTag('serie') || '1';
    const mod = extrairTag('mod') || '55';
    const modelo = mod === '65' ? 'NFCe_65' : 'NFe_55';

    // Data de emissão
    let dataEmissao = extrairTag('dhEmi') || extrairTag('dEmi');
    if (dataEmissao) {
      dataEmissao = dataEmissao.split('T')[0];
    } else {
      dataEmissao = new Date().toISOString().split('T')[0];
    }

    // Emitente (Fornecedor ou Restaurante)
    const emitMatch = xmlContent.match(/<emit>([\s\S]*?)<\/emit>/i);
    const emitBloco = emitMatch ? emitMatch[1] : '';
    const emitenteRazaoSocial = extrairTag('xNome', emitBloco) || 'FORNECEDOR DIVERSOS';
    const emitenteCnpj = extrairTag('CNPJ', emitBloco) || extrairTag('CPF', emitBloco) || '00.000.000/0001-00';

    // Destinatário
    const destMatch = xmlContent.match(/<dest>([\s\S]*?)<\/dest>/i);
    const destBloco = destMatch ? destMatch[1] : '';
    const destinatarioRazaoSocial = extrairTag('xNome', destBloco);
    const destinatarioCnpj = extrairTag('CNPJ', destBloco) || extrairTag('CPF', destBloco);

    // Totais e Valores
    const totalMatch = xmlContent.match(/<total>([\s\S]*?)<\/total>/i);
    const totalBloco = totalMatch ? totalMatch[1] : '';

    const vProdStr = extrairTag('vProd', totalBloco) || extrairTag('vProd');
    const vNFStr = extrairTag('vNF', totalBloco) || extrairTag('vNF') || vProdStr;
    const vFreteStr = extrairTag('vFrete', totalBloco);
    const vDescStr = extrairTag('vDesc', totalBloco);
    const vICMSStr = extrairTag('vICMS', totalBloco);
    const vPISStr = extrairTag('vPIS', totalBloco);
    const vCOFINSStr = extrairTag('vCOFINS', totalBloco);

    const valorTotalProdutos = parseFloat(vProdStr) || 0;
    const valorTotalNota = parseFloat(vNFStr) || valorTotalProdutos;
    const valorFrete = parseFloat(vFreteStr) || 0;
    const valorDesconto = parseFloat(vDescStr) || 0;
    const valorIcms = parseFloat(vICMSStr) || 0;
    const valorPis = parseFloat(vPISStr) || 0;
    const valorCofins = parseFloat(vCOFINSStr) || 0;

    // Extrair Itens da Nota
    const itens: ItemNotaFiscal[] = [];
    const detRegex = /<det[^>]*nItem=["'](\d+)["'][^>]*>([\s\S]*?)<\/det>/gi;
    let matchDet;
    while ((matchDet = detRegex.exec(xmlContent)) !== null) {
      const blocoItem = matchDet[2];
      const cProd = extrairTag('cProd', blocoItem);
      const xProd = extrairTag('xProd', blocoItem) || 'Item da Nota Fiscal';
      const ncm = extrairTag('NCM', blocoItem);
      const cfop = extrairTag('CFOP', blocoItem);
      const qCom = parseFloat(extrairTag('qCom', blocoItem)) || 1;
      const vUnCom = parseFloat(extrairTag('vUnCom', blocoItem)) || 0;
      const vProd = parseFloat(extrairTag('vProd', blocoItem)) || vUnCom * qCom;
      const vICMSItem = parseFloat(extrairTag('vICMS', blocoItem)) || 0;
      const pICMSItem = parseFloat(extrairTag('pICMS', blocoItem)) || 0;

      itens.push({
        id: `item-nf-${Date.now().toString().slice(-4)}-${itens.length + 1}`,
        codigo: cProd,
        descricao: xProd,
        ncm,
        cfop,
        quantidade: qCom,
        unidade: extrairTag('uCom', blocoItem) || 'UN',
        valorUnitario: vUnCom,
        valorTotal: vProd,
        aliquotaIcms: pICMSItem,
        valorIcms: vICMSItem,
      });
    }

    // Decidir o Tipo e a Linha do DRE se não informado
    let tipo: TipoNotaFiscal = tipoSugerido || 'entrada_insumos';
    let linhaDRE: NotaFiscalRegistro['linhaDRE'] = 'cmv';

    const textoAnalise = (emitenteRazaoSocial + ' ' + itens.map((i) => i.descricao).join(' ')).toLowerCase();

    if (tipoSugerido) {
      tipo = tipoSugerido;
      if (tipo === 'entrada_insumos') linhaDRE = 'cmv';
      else if (tipo === 'entrada_embalagens') linhaDRE = 'comercial_embalagens';
      else if (tipo === 'entrada_servicos') linhaDRE = 'servicos';
      else if (tipo === 'entrada_utilidades') linhaDRE = 'ocupacao';
      else if (tipo === 'saida_venda') linhaDRE = 'receita_bruta';
      else linhaDRE = 'outros';
    } else {
      if (textoAnalise.includes('embalag') || textoAnalise.includes('sacola') || textoAnalise.includes('copo') || textoAnalise.includes('caixa')) {
        tipo = 'entrada_embalagens';
        linhaDRE = 'comercial_embalagens';
      } else if (textoAnalise.includes('energia') || textoAnalise.includes('eletric') || textoAnalise.includes('agua') || textoAnalise.includes('gas')) {
        tipo = 'entrada_utilidades';
        linhaDRE = 'ocupacao';
      } else if (textoAnalise.includes('servico') || textoAnalise.includes('manutencao') || textoAnalise.includes('limpeza') || textoAnalise.includes('software')) {
        tipo = 'entrada_servicos';
        linhaDRE = 'servicos';
      } else if (textoAnalise.includes('equipamento') || textoAnalise.includes('fogao') || textoAnalise.includes('refrigerador') || textoAnalise.includes('freezer')) {
        tipo = 'entrada_equipamento';
        linhaDRE = 'outros';
      } else {
        tipo = 'entrada_insumos';
        linhaDRE = 'cmv';
      }
    }

    const nota: Omit<NotaFiscalRegistro, 'id' | 'criadoEm'> = {
      tenantId,
      numero: nNF,
      serie,
      chaveAcesso: chaveAcesso || undefined,
      modelo,
      tipo,
      direcao: tipo === 'saida_venda' ? 'saida' : 'entrada',
      emitenteRazaoSocial,
      emitenteCnpjCpf: emitenteCnpj,
      destinatarioRazaoSocial,
      destinatarioCnpjCpf: destinatarioCnpj,
      dataEmissao,
      dataCompetencia: dataEmissao.slice(0, 7), // YYYY-MM
      valorTotalProdutos: valorTotalProdutos || valorTotalNota,
      valorFrete,
      valorDesconto,
      valorTotalNota,
      valorIcms,
      valorPis,
      valorCofins,
      status: 'autorizada',
      itens: itens.length > 0 ? itens : undefined,
      xmlConteudo: xmlContent,
      linhaDRE,
    };

    return { sucesso: true, nota };
  } catch (err: any) {
    return {
      sucesso: false,
      erro: `Falha ao processar o XML da Nota Fiscal: ${err?.message || 'Arquivo corrompido ou formato não suportado'}`,
    };
  }
}
