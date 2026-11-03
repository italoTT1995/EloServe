import { supabase } from '../lib/supabase';
import { supabaseService } from './supabaseService';
import { useAppStore } from '../store/useAppStore';
import { useProductStore } from '../store/useProductStore';
import { useSaaSStore } from '../store/useSaaSStore';
import { useAuthStore } from '../store/useAuthStore';
import { tocarSinoPratoPronto, tocarAlertaChamadoMesa, tocarSomNovoPedido } from '../utils/audioAlert';
import { RealtimeChannel } from '@supabase/supabase-js';

let canalRealtime: RealtimeChannel | null = null;

export const realtimeService = {
  iniciarSincronizacaoRealtime() {
    if (canalRealtime) return;

    try {
      canalRealtime = supabase
        .channel('eloserve-realtime-channel')
        // -------------------------------------------------------------
        // MESAS EM TEMPO REAL (Salão, Garçom, KDS e Autoatendimento)
        // -------------------------------------------------------------
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'mesas' },
          (payload) => {
            const { eventType, new: novaMesaRaw, old: velhaMesaRaw } = payload;

            if (eventType === 'INSERT' || eventType === 'UPDATE') {
              if (!novaMesaRaw) return;
              const mesa = supabaseService.converterMesaDoBanco(novaMesaRaw);

              // Alerta de garçom chamado
              if (mesa.status === 'chamar_garcom') {
                tocarAlertaChamadoMesa();
              }

              useAppStore.getState().sincronizarMesaIndividual(mesa);
            } else if (eventType === 'DELETE') {
              if (velhaMesaRaw?.id) {
                useAppStore.getState().removerMesaRealtime(velhaMesaRaw.id);
              }
            }
          }
        )
        // -------------------------------------------------------------
        // PEDIDOS EM TEMPO REAL (KDS, Cozinha, Bar e Garçom)
        // -------------------------------------------------------------
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'pedidos' },
          (payload) => {
            const { eventType, new: novoPedidoRaw } = payload;

            if (eventType === 'INSERT') {
              tocarSomNovoPedido();
            } else if (eventType === 'UPDATE') {
              // Quando o KDS finaliza um prato, o sino toca imediatamente para o garçom!
              if (novoPedidoRaw?.status_kds === 'pronto') {
                tocarSinoPratoPronto();
              }
            }
          }
        )
        // -------------------------------------------------------------
        // PRODUTOS (Cardápio sincronizado instantaneamente)
        // -------------------------------------------------------------
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'produtos' },
          (payload) => {
            const { eventType, new: novoProdutoRaw, old: velhoProdutoRaw } = payload;

            if (eventType === 'INSERT' || eventType === 'UPDATE') {
              if (!novoProdutoRaw) return;
              const produto = supabaseService.converterProdutoDoBanco(novoProdutoRaw);
              useProductStore.getState().sincronizarProdutoIndividual(produto, novoProdutoRaw.tenant_id);
            } else if (eventType === 'DELETE') {
              if (velhoProdutoRaw?.id) {
                useProductStore.getState().removerProdutoRealtime(velhoProdutoRaw.id);
              }
            }
          }
        )
        // -------------------------------------------------------------
        // RESTAURANTES & USUÁRIOS
        // -------------------------------------------------------------
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tenants' },
          (payload) => {
            if (payload.new) {
              const tenant = supabaseService.converterTenantDoBanco(payload.new);
              useSaaSStore.getState().sincronizarComSupabase([tenant]);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'usuarios' },
          (payload) => {
            if (payload.new) {
              const usuario = supabaseService.converterUsuarioDoBanco(payload.new);
              useAuthStore.getState().sincronizarComSupabase([usuario]);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Supabase Realtime Conectado: Sincronização em tempo real ativa');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Supabase Realtime: Canal reconectando...');
          }
        });
    } catch (err) {
      console.warn('Supabase Realtime: Erro na inicialização:', err);
    }
  },

  pararSincronizacaoRealtime() {
    if (canalRealtime) {
      supabase.removeChannel(canalRealtime);
      canalRealtime = null;
    }
  },
};
