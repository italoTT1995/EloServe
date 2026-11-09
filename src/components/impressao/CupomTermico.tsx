import React, { useState } from 'react';
import { Printer, X, Check, Scissors } from 'lucide-react';

export interface ItemCupomImpressao {
  nome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  observacoes?: string;
}

export interface DadosCupomImpressao {
  tipo: 'venda' | 'comanda_mesa' | 'delivery' | 'cozinha';
  identificador: string; // Ex: "VD-893241" ou "Mesa #04"
  restauranteNome: string;
  restauranteDocumento?: string;
  restauranteTelefone?: string;
  restauranteEndereco?: string;
  dataHora: string;
  operador?: string;
  clienteNome?: string;
  clienteTelefone?: string;
  enderecoEntrega?: string;
  itens: ItemCupomImpressao[];
  subtotal: number;
  taxaEntrega?: number;
  taxaServico?: number;
  couvertArtistico?: number;
  desconto?: number;
  total: number;
  formaPagamento?: string;
  detalhesPagamento?: Array<{ forma: string; valor: number }>;
  valorRecebido?: number;
  troco?: number;
}

interface ModalCupomTermicoProps {
  aberto: boolean;
  onClose: () => void;
  dados: DadosCupomImpressao;
}

export function ModalCupomTermico({ aberto, onClose, dados }: ModalCupomTermicoProps) {
  const [larguraBobina, setLarguraBobina] = useState<'58mm' | '80mm'>('80mm');

  if (!aberto) return null;

  function dispararImpressao() {
    window.print();
  }

  const formatarMoeda = (val?: number) =>
    (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none">
      {/* Estilos específicos de impressão térmica injetados dinamicamente */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: ${larguraBobina === '58mm' ? '58mm auto' : '80mm auto'};
          }
          body * {
            visibility: hidden !important;
          }
          #cupom-termico-imprimir, #cupom-termico-imprimir * {
            visibility: visible !important;
          }
          #cupom-termico-imprimir {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${larguraBobina === '58mm' ? '58mm' : '80mm'} !important;
            margin: 0 !important;
            padding: ${larguraBobina === '58mm' ? '2mm' : '4mm'} !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: ${larguraBobina === '58mm' ? '10px' : '12px'} !important;
            line-height: 1.25 !important;
          }
          .nao-imprimir {
            display: none !important;
          }
        }
      `}</style>

      {/* Caixa do Modal */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabeçalho de Controle (Não impresso) */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 nao-imprimir">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Impressão de Cupom</h3>
              <p className="text-[10px] text-slate-400">Layout térmico padrão para 58mm e 80mm</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Seletor de Bobina */}
            <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
              <button
                type="button"
                onClick={() => setLarguraBobina('58mm')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  larguraBobina === '58mm'
                    ? 'bg-orange-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                58mm
              </button>
              <button
                type="button"
                onClick={() => setLarguraBobina('80mm')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  larguraBobina === '80mm'
                    ? 'bg-orange-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                80mm
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visualização Prévia do Cupom Térmico */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 flex justify-center">
          <div
            id="cupom-termico-imprimir"
            className={`bg-white text-black p-4 shadow-lg rounded font-mono transition-all text-left ${
              larguraBobina === '58mm' ? 'w-[240px] text-[10px]' : 'w-[320px] text-[11px]'
            }`}
          >
            {/* CABEÇALHO DO ESTABELECIMENTO */}
            <div className="text-center space-y-0.5 border-b border-dashed border-black pb-2">
              <h2 className="text-sm font-black uppercase tracking-tight">
                {dados.restauranteNome || 'EloServe PDV'}
              </h2>
              {dados.restauranteDocumento && (
                <p className="text-[10px]">CNPJ/CPF: {dados.restauranteDocumento}</p>
              )}
              {dados.restauranteEndereco && (
                <p className="text-[9px]">{dados.restauranteEndereco}</p>
              )}
              {dados.restauranteTelefone && (
                <p className="text-[10px]">Tel: {dados.restauranteTelefone}</p>
              )}
            </div>

            {/* DADOS DA OPERAÇÃO */}
            <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
              <div className="flex justify-between font-bold">
                <span>{dados.identificador}</span>
                <span className="uppercase">{dados.tipo}</span>
              </div>
              <div className="flex justify-between">
                <span>Data: {dados.dataHora}</span>
              </div>
              {dados.operador && (
                <div>Operador: {dados.operador}</div>
              )}
              {dados.clienteNome && (
                <div>Cliente: {dados.clienteNome}</div>
              )}
              {dados.clienteTelefone && (
                <div>WhatsApp: {dados.clienteTelefone}</div>
              )}
              {dados.enderecoEntrega && (
                <div className="pt-0.5">
                  <strong>Entrega:</strong> {dados.enderecoEntrega}
                </div>
              )}
            </div>

            {/* ITENS DO PEDIDO */}
            <div className="py-2 border-b border-dashed border-black">
              <div className="flex justify-between font-bold pb-1 text-[10px] border-b border-dotted border-black/50">
                <span>QTD ITEM</span>
                <span>TOTAL</span>
              </div>
              <div className="space-y-1 pt-1">
                {dados.itens.map((it, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">
                        {it.quantidade}x {it.nome}
                      </span>
                      <span>R$ {formatarMoeda(it.subtotal)}</span>
                    </div>
                    {it.observacoes && (
                      <p className="text-[9px] italic pl-2 text-black/80">
                        Obs: {it.observacoes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* DISCRIMINAÇÃO DE TOTAIS */}
            <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {formatarMoeda(dados.subtotal)}</span>
              </div>
              {Boolean(dados.taxaEntrega && dados.taxaEntrega > 0) && (
                <div className="flex justify-between">
                  <span>Taxa Entrega:</span>
                  <span>+ R$ {formatarMoeda(dados.taxaEntrega)}</span>
                </div>
              )}
              {Boolean(dados.taxaServico && dados.taxaServico > 0) && (
                <div className="flex justify-between">
                  <span>Serviço (10%):</span>
                  <span>+ R$ {formatarMoeda(dados.taxaServico)}</span>
                </div>
              )}
              {Boolean(dados.couvertArtistico && dados.couvertArtistico > 0) && (
                <div className="flex justify-between">
                  <span>Couvert:</span>
                  <span>+ R$ {formatarMoeda(dados.couvertArtistico)}</span>
                </div>
              )}
              {Boolean(dados.desconto && dados.desconto > 0) && (
                <div className="flex justify-between">
                  <span>Desconto:</span>
                  <span>- R$ {formatarMoeda(dados.desconto)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black pt-1 border-t border-dotted border-black/60">
                <span>TOTAL A PAGAR:</span>
                <span>R$ {formatarMoeda(dados.total)}</span>
              </div>
            </div>

            {/* FORMA DE PAGAMENTO */}
            <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
              {dados.detalhesPagamento && dados.detalhesPagamento.length > 0 ? (
                <>
                  <div className="font-bold">Pagamentos Registrados:</div>
                  {dados.detalhesPagamento.map((p, idx) => (
                    <div key={idx} className="flex justify-between pl-1">
                      <span className="capitalize">• {p.forma}:</span>
                      <span>R$ {formatarMoeda(p.valor)}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex justify-between font-bold">
                  <span>Forma:</span>
                  <span className="uppercase">{dados.formaPagamento || 'Não informada'}</span>
                </div>
              )}

              {Boolean(dados.valorRecebido && dados.valorRecebido > 0) && (
                <div className="flex justify-between">
                  <span>Valor Recebido:</span>
                  <span>R$ {formatarMoeda(dados.valorRecebido)}</span>
                </div>
              )}
              {Boolean(dados.troco && dados.troco > 0) && (
                <div className="flex justify-between font-bold">
                  <span>Troco a Devolver:</span>
                  <span>R$ {formatarMoeda(dados.troco)}</span>
                </div>
              )}
            </div>

            {/* RODAPÉ DO COMPROVANTE */}
            <div className="pt-2 text-center text-[9px] space-y-1">
              <p className="font-bold">DOCUMENTO NÃO FISCAL</p>
              <p>Obrigado pela preferência! Volte sempre.</p>
              <div className="flex items-center justify-center gap-1 text-[8px] text-black/60 pt-1">
                <Scissors className="w-3 h-3 inline" />
                <span>EloServe PDV • Gestão Inteligente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Ações (Não impressa) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex gap-3 nao-imprimir">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={dispararImpressao}
            className="flex-1 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Cupom ({larguraBobina})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
