import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { RotaProtegida } from './components/auth/RotaProtegida';
import Login from './pages/Login';
import PDV from './pages/PDV';
import Mesas from './pages/Mesas';
import KDS from './pages/KDS';
import Cardapio from './pages/Cardapio';
import Caixa from './pages/Caixa';
import Financeiro from './pages/Financeiro';
import Relatorios from './pages/Relatorios';
import SaaSMaster from './pages/SaaSMaster';
import MinhaAssinatura from './pages/MinhaAssinatura';
import Estoque from './pages/Estoque';
import Delivery from './pages/Delivery';
import Funcionarios from './pages/Funcionarios';
import PainelDono from './pages/PainelDono';
import AutoatendimentoMesa from './pages/AutoatendimentoMesa';
import { useAuthStore } from './store/useAuthStore';
import { useSaaSStore } from './store/useSaaSStore';
import { useProductStore } from './store/useProductStore';
import { useAppStore } from './store/useAppStore';
import { supabaseService } from './services/supabaseService';

function RotaInicialInteligente() {
  const { usuarioLogado } = useAuthStore();
  const { tenantAtivoId } = useSaaSStore();

  // Super Admin em Visão Global vai direto para o Painel de Gestão SaaS Master
  if (usuarioLogado?.cargo === 'super_admin' && tenantAtivoId === 'global') {
    return <Navigate to="/saas" replace />;
  }

  // Cozinha vai direto para o KDS
  if (usuarioLogado?.cargo === 'cozinha') {
    return <Navigate to="/kds" replace />;
  }

  // Garçom vai direto para Mesas & Salão
  if (usuarioLogado?.cargo === 'garcom') {
    return <Navigate to="/mesas" replace />;
  }

  // Entregador vai direto para Delivery & Entregas
  if (usuarioLogado?.cargo === 'entregador') {
    return <Navigate to="/delivery" replace />;
  }

  // Dono e Gerente da Loja (ou Super Admin inspecionando uma loja específica) vai direto para o Painel do Dono!
  if (usuarioLogado?.cargo === 'admin_restaurante' || (usuarioLogado?.cargo === 'super_admin' && tenantAtivoId !== 'global')) {
    return <PainelDono />;
  }

  // Equipe operacional de frente de caixa
  return <PDV />;
}

export default function App() {
  useEffect(() => {
    // Sincroniza dados oficiais com o Supabase ao inicializar a aplicação
    supabaseService.carregarTudoDoSupabase().then((dados) => {
      if (!dados) return;
      if (dados.tenants && dados.tenants.length > 0) {
        useSaaSStore.getState().sincronizarComSupabase(dados.tenants);
      }
      if (dados.usuarios && dados.usuarios.length > 0) {
        useAuthStore.getState().sincronizarComSupabase(dados.usuarios);
      }
      if (dados.produtos && dados.categorias) {
        useProductStore.getState().sincronizarComSupabase(dados.produtos, dados.categorias);
      }
      if (dados.mesas) {
        useAppStore.getState().sincronizarComSupabase(dados.mesas);
      }
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública de Login */}
        <Route path="/login" element={<Login />} />

        {/* Rota Pública de Autoatendimento da Mesa via QR Code (Seção 4.12) */}
        <Route path="/mesa/:numero" element={<AutoatendimentoMesa />} />

        {/* Rotas Protegidas dentro do Layout da Aplicação */}
        <Route
          path="/*"
          element={
            <RotaProtegida>
              <Layout>
                <Routes>
                  {/* Rota Raiz Inteligente */}
                  <Route
                    path="/"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante', 'caixa', 'garcom', 'cozinha', 'entregador']}>
                        <RotaInicialInteligente />
                      </RotaProtegida>
                    }
                  />

                  {/* Painel do Dono & Gerente (Nível 2) */}
                  <Route
                    path="/painel-dono"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante']}>
                        <PainelDono />
                      </RotaProtegida>
                    }
                  />

                  {/* Frente de Caixa (PDV) */}
                  <Route
                    path="/pdv"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante', 'caixa', 'garcom']}>
                        <PDV />
                      </RotaProtegida>
                    }
                  />

                  {/* Mesas & Salão */}
                  <Route
                    path="/mesas"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante', 'caixa', 'garcom']}>
                        <Mesas />
                      </RotaProtegida>
                    }
                  />

                  {/* Delivery & Entregas */}
                  <Route
                    path="/delivery"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante', 'caixa', 'entregador']}>
                        <Delivery />
                      </RotaProtegida>
                    }
                  />

                  {/* Cozinha KDS */}
                  <Route
                    path="/kds"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante', 'cozinha']}>
                        <KDS />
                      </RotaProtegida>
                    }
                  />

                  {/* Estoque Inteligente & Compras */}
                  <Route
                    path="/estoque"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante']}>
                        <Estoque />
                      </RotaProtegida>
                    }
                  />

                  {/* Funcionários & Gestão de Equipe */}
                  <Route
                    path="/funcionarios"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante']}>
                        <Funcionarios />
                      </RotaProtegida>
                    }
                  />

                  {/* Cardápio & Preços */}
                  <Route
                    path="/cardapio"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante']}>
                        <Cardapio />
                      </RotaProtegida>
                    }
                  />

                  {/* Caixa & Turno */}
                  <Route
                    path="/caixa"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante', 'caixa']}>
                        <Caixa />
                      </RotaProtegida>
                    }
                  />

                  {/* Financeiro & Notas Fiscais (Nível 1: Master, Nível 2: Restaurantes) */}
                  <Route
                    path="/financeiro"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante']}>
                        <Financeiro />
                      </RotaProtegida>
                    }
                  />
                  <Route
                    path="/notas-fiscais"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante']}>
                        <Financeiro />
                      </RotaProtegida>
                    }
                  />
                  <Route
                    path="/relatorios"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante']}>
                        <Financeiro />
                      </RotaProtegida>
                    }
                  />

                  {/* Minha Assinatura */}
                  <Route
                    path="/minha-assinatura"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante']}>
                        <MinhaAssinatura />
                      </RotaProtegida>
                    }
                  />

                  {/* SaaS Master (Exclusivo Super Admin / Dono do SaaS) */}
                  <Route
                    path="/saas"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin']}>
                        <SaaSMaster />
                      </RotaProtegida>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </RotaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
