import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { RotaProtegida } from './components/auth/RotaProtegida';
import Login from './pages/Login';
import PDV from './pages/PDV';
import Mesas from './pages/Mesas';
import KDS from './pages/KDS';
import Cardapio from './pages/Cardapio';
import Caixa from './pages/Caixa';
import Relatorios from './pages/Relatorios';
import EloBot from './pages/EloBot';
import SaaSMaster from './pages/SaaSMaster';
import MinhaAssinatura from './pages/MinhaAssinatura';
import Estoque from './pages/Estoque';
import Delivery from './pages/Delivery';
import Funcionarios from './pages/Funcionarios';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública de Login */}
        <Route path="/login" element={<Login />} />

        {/* Rotas Protegidas dentro do Layout da Aplicação */}
        <Route
          path="/*"
          element={
            <RotaProtegida>
              <Layout>
                <Routes>
                  {/* PDV / Frente de Caixa */}
                  <Route
                    path="/"
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

                  {/* Relatórios DRE */}
                  <Route
                    path="/relatorios"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante']}>
                        <Relatorios />
                      </RotaProtegida>
                    }
                  />

                  {/* EloBot WhatsApp IA */}
                  <Route
                    path="/elobot"
                    element={
                      <RotaProtegida cargosPermitidos={['super_admin', 'admin_restaurante']}>
                        <EloBot />
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
