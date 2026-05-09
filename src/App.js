import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './config/keycloak';

import { MaletaProvider } from './context/MaletaContext';

import Catalogo from './pages/Catalogo';
import Maleta from './components/Maleta';
import Checkout from './components/Checkout';
import CadastroCategoria from './pages/admin/CadastroCategoria';
import ListarCategorias from './pages/admin/categoria/ListarCategorias';
import AdminLayout from './pages/admin/adminLayout/AdminLayout';
import { RotaProtegida } from './components/RotaProtegida';
import './App.css';
import LeadsDashboard from './pages/admin/leads/LeadsDashboard';
import { ToastContainer } from 'react-toastify';
import TelaPDV from './pages/admin/telaPdv/telaPdv';
import ClientesDashboard from './pages/admin/cliente/ClientesDashboard';
import { AuthProvider, useAuth } from './context/AuthProvider';
import { GerenciarBanners } from './pages/admin/banner/GerenciarBanners';
import ListarVendas from './pages/admin/vendas/ListarVendas';
import GerenciadorWhatsapp from './pages/admin/GerenciadorWhatsapp/GerenciadorWhatsapp';
import MinhaContaLayout from './pages/admin/cliente/MinhaContaLayout';
import MeusPedidos from './pages/admin/meusPedidos/MeusPedidos';


// =========================================================
// IMPORTAÇÕES DA ÁREA DO CLIENTE (MINHA CONTA)
// =========================================================



const Loading = () => <div className="carregando">Iniciando sistema de segurança...</div>;

// CRIAMOS UM COMPONENTE SÓ PARA O DASHBOARD
const Dashboard = () => {
  //  2. Olha que legal: agora você puxa as informações do seu próprio Contexto!
  const { keycloakData } = useAuth();
  const nomeUsuario = keycloakData?.primeiroNome || 'Usuário';

  return (
    <div style={{ padding: '20px' }}>
      <h1>Visão Geral</h1>
      <p>Bem-vindo ao painel, {nomeUsuario}!</p>
    </div>
  );
};

function App() {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false
      }}
      LoadingComponent={<Loading />}
    >
      <AuthProvider>
        <MaletaProvider>
          <ToastContainer position="top-right" autoClose={4000} />
          <Router>
            <div className="App">
              <Maleta />
              <Routes>
                {/* ROTAS PÚBLICAS */}
                <Route path="/" element={<main className="conteudo-principal"><Catalogo /></main>} />
                <Route path="/checkout" element={<main className="conteudo-principal"><Checkout /></main>} />

                {/* ========================================================= */}
                {/* ÁREA DO CLIENTE (MINHA CONTA) - NOVO BLOCO */}
                {/* ========================================================= */}
                <Route path="/minha-conta" element={<RotaProtegida><MinhaContaLayout /></RotaProtegida>}>
                  <Route index element={<Navigate to="/minha-conta/pedidos" replace />} />

                  {/* <Route path="visao-geral" element={<VisaoGeralCliente />} /> */}
                  {/* Rota de Pedidos que acabamos de criar */}
                  <Route path="pedidos" element={<MeusPedidos />} />
                  {/* <Route path="dados" element={<MeusDados />} /> */}
                  {/* Você pode ir adicionando endereços, favoritos, etc, aqui depois */}
                </Route>

                {/* ========================================================= */}
                {/* ROTAS ADMINISTRATIVAS */}
                {/* ========================================================= */}
                <Route path="/admin" element={<RotaProtegida adminOnly={true}><AdminLayout /></RotaProtegida>}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />

                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="cadastrar" element={<CadastroCategoria />} />
                  <Route path="listar" element={<ListarCategorias />} />
                  <Route path="leads" element={<LeadsDashboard />} />
                  <Route path="telaPdv" element={<TelaPDV />} />
                  <Route path="telaCliente" element={<ClientesDashboard />} />
                  <Route path="vendas" element={<ListarVendas />} />
                  <Route path="config" element={<GerenciarBanners />} />
                  <Route path="config/whatsapp" element={<GerenciadorWhatsapp />} />
                </Route>
              </Routes>
            </div>
          </Router>
        </MaletaProvider>
      </AuthProvider>
    </ReactKeycloakProvider>
  );
}

export default App;