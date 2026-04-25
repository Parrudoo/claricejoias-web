import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactKeycloakProvider, useKeycloak } from '@react-keycloak/web'; // 👇 Adicionado o useKeycloak aqui
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

const Loading = () => <div className="carregando">Iniciando sistema de segurança...</div>;

// CRIAMOS UM COMPONENTE SÓ PARA O DASHBOARD
const Dashboard = () => {
  // Agora o componente "escuta" o Keycloak em tempo real!
  const { keycloak } = useKeycloak();
  const nomeUsuario = keycloak.tokenParsed?.preferred_username || keycloak.tokenParsed?.given_name || 'Usuário';

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
      initOptions={{ onLoad: 'check-sso', pkceMethod: 'S256' }}
      LoadingComponent={<Loading />}
    >
      <MaletaProvider>
      <ToastContainer position="top-right" autoClose={4000} />
        <Router>
          <div className="App">
            <Maleta />
            <Routes>
              {/* ROTAS PÚBLICAS */}
              <Route path="/" element={<main className="conteudo-principal"><Catalogo /></main>} />
              <Route path="/checkout" element={<main className="conteudo-principal"><Checkout /></main>} />

              {/* ROTAS ADMINISTRATIVAS */}
              <Route path="/admin" element={ <RotaProtegida><AdminLayout /></RotaProtegida> }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                
                {/* AGORA USAMOS O NOVO COMPONENTE AQUI */}
                <Route path="dashboard" element={<Dashboard />} />
                
                <Route path="cadastrar" element={<CadastroCategoria />} />
                <Route path="listar" element={<ListarCategorias />} />   
                <Route path="leads" element={<LeadsDashboard />} />   
                <Route path="telaPdv" element={<TelaPDV />} />                
                <Route path="telaCliente" element={<ClientesDashboard />} /> 
              </Route>
            </Routes>
          </div>
        </Router>
      </MaletaProvider>
    </ReactKeycloakProvider>
  );
}

export default App;