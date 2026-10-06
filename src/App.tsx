import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import PDV from './pages/PDV';
import Mesas from './pages/Mesas';
import KDS from './pages/KDS';
import Cardapio from './pages/Cardapio';
import Caixa from './pages/Caixa';
import Relatorios from './pages/Relatorios';
import EloBot from './pages/EloBot';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<PDV />} />
          <Route path="/mesas" element={<Mesas />} />
          <Route path="/kds" element={<KDS />} />
          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/caixa" element={<Caixa />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/elobot" element={<EloBot />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
