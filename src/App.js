import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
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
import CadastrarRevendedor from './pages/revendedor/CadastrarRevendedor';
import DistribuirEstoque from './pages/estoque/DistribuirEstoque';

// =========================================================
// IMPORTAÇÕES DA ÁREA DA REVENDEDORA
// =========================================================
import RevendedorLayout from './pages/revendedor/RevendedorLayout';
import MaletaRevendedora from './pages/revendedor/MaletaRevendedora';
import ClientesRevendedora from './pages/revendedor/ClientesRevendedora';


const Loading = () => <div className="carregando">Iniciando sistema de segurança...</div>;

// =========================================================
// COMPONENTES DE DASHBOARD (VISÃO GERAL)
// =========================================================

// DASHBOARD DO ADMIN
const Dashboard = () => {
  const { keycloakData } = useAuth();
  const nomeUsuario = keycloakData?.primeiroNome || 'Usuário';

  return (
    <div style={{ padding: '20px' }}>
      <h1>Visão Geral</h1>
      <p>Bem-vindo ao painel, {nomeUsuario}!</p>
    </div>
  );
};

// DASHBOARD PROVISÓRIO DA REVENDEDORA (Para a tela não quebrar enquanto você cria as outras)
const DashboardRevendedora = () => {
  const { keycloakData } = useAuth();
  const nomeUsuario = keycloakData?.primeiroNome || 'Revendedora';

  return (
    <div style={{ padding: '20px' }}>
      <h1>Meu Resumo</h1>
      <p>Bem-vinda, {nomeUsuario}! Aqui você acompanhará suas metas e lucros.</p>
    </div>
  );
};

const CatalogoWrapper = () => {
  const { slug } = useParams();
  return <main className="conteudo-principal"><Catalogo slug={slug} /></main>;
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
                {/* ========================================================= */}
                {/* ROTAS PÚBLICAS */}
                {/* ========================================================= */}
                {/* 1. Catálogo da Loja Matriz */}
                <Route path="/" element={<CatalogoWrapper />} />

                {/* ROTAS PÚBLICAS */}
                {/* <Route path="/" element={<main className="conteudo-principal"><Catalogo /></main>} /> */}
                <Route path="/checkout" element={<main className="conteudo-principal"><Checkout /></main>} />


                {/* 3. Catálogo da Revendedora (Rota Dinâmica) */}
                {/* ATENÇÃO: O React Router v6 prioriza rotas exatas, então /checkout não vai cair aqui */}
                <Route path="/:slug" element={<CatalogoWrapper />} />

                {/* ========================================================= */}
                {/* ÁREA DO CLIENTE (MINHA CONTA) */}
                {/* ========================================================= */}
                <Route path="/minha-conta" element={<RotaProtegida><MinhaContaLayout /></RotaProtegida>}>
                  <Route index element={<Navigate to="/minha-conta/pedidos" replace />} />
                  <Route path="pedidos" element={<MeusPedidos />} />
                </Route>

                {/* ========================================================= */}
                {/* ÁREA DA REVENDEDORA (NOVO BLOCO) */}
                {/* ========================================================= */}
                <Route path="/revendedor" element={<RotaProtegida revendedoraOnly={true}><RevendedorLayout /></RotaProtegida>}>
                  {/* Redireciona a raiz /revendedor para o dashboard dela */}
                  <Route index element={<Navigate to="/revendedor/dashboard" replace />} />

                  <Route path="dashboard" element={<DashboardRevendedora />} />
                  <Route path="pdv" element={<TelaPDV isRevendedor={true} />} />
                  <Route path="maleta" element={<MaletaRevendedora isRevendedor={true} />} />
                  <Route path="clientes" element={<ClientesDashboard isRevendedor={true} />} />
                  <Route path="vendas" element={<ListarVendas isRevendedor={true} />} />
                  {/* Conforme você for criando as telas da revendedora, basta descomentar e adicionar aqui: */}
                  {/* <Route path="pdv" element={<TelaPDV />} /> */}
                  {/* <Route path="maleta" element={<MaletaRevendedora />} /> */}
                  {/* <Route path="clientes" element={<ClientesDashboard />} /> */}
                  {/* <Route path="vendas" element={<ListarVendas />} /> */}
                  {/* <Route path="financeiro" element={<FinanceiroRevendedora />} /> */}
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
                  <Route path="revendedores/cadastrar" element={<CadastrarRevendedor />} />
                  <Route path="revendedores/maletas" element={<DistribuirEstoque />} />
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