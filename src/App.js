import React, { useState, useEffect ,useRef} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MaletaProvider } from './context/MaletaContext';
import Catalogo from './pages/Catalogo';
import Maleta from './components/Maleta';
import Checkout from './components/Checkout';
import CadastroCategoria from './pages/admin/CadastroCategoria';
import ListarCategorias from './pages/admin/categoria/ListarCategorias';
import AdminLayout from './pages/admin/adminLayout/AdminLayout';

// Importações de Segurança
import keycloak from './config/keycloak';
import { RotaProtegida } from './components/RotaProtegida';
import './App.css';

function App() {
  const [iniciado, setIniciado] = useState(false);
  const isRun = useRef(false); // Variável de controle para evitar dupla execução

  useEffect(() => {
    // Se já rodou uma vez, aborta a execução
    if (isRun.current) return;
    isRun.current = true; // Marca que está rodando

   keycloak.init({ 
      onLoad: 'check-sso',
      checkLoginIframe: false,
      // Habilita o PKCE, que é mais seguro e evita perder dados se a URL mudar rápido
      pkceMethod: 'S256' 
    })
      .then((auth) => {
        console.log("Keycloak inicializado. Autenticado:", auth);
        setIniciado(true);
      })
      .catch(err => {
        console.error("Erro ao iniciar Keycloak:", err);
        setIniciado(true); 
      });
  }, []);

  if (!iniciado) {
    return <div className="carregando">Iniciando sistema de segurança...</div>;
  }

  return (
    <MaletaProvider>
      <Router>
        <div className="App">
          <Maleta />

          <Routes>
            {/* ROTAS PÚBLICAS (Ninguém precisa de senha aqui) */}
            <Route path="/" element={<main className="conteudo-principal"><Catalogo /></main>} />
            <Route path="/checkout" element={<main className="conteudo-principal"><Checkout /></main>} />

            {/* ROTAS ADMINISTRATIVAS (Protegidas pelo Keycloak) */}
            <Route 
              path="/admin" 
              element={
                // 👇 Aqui está a mágica: Envelopamos o AdminLayout com a RotaProtegida
                <RotaProtegida>
                  <AdminLayout />
                </RotaProtegida>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={
                <div style={{ padding: '20px' }}>
                  <h1>Visão Geral</h1>
                  <p>Bem-vindo ao painel, {keycloak.tokenParsed?.preferred_username}!</p>
                  <button onClick={() => keycloak.logout()}>Sair do Sistema</button>
                </div>
              } />
              <Route path="cadastrar" element={<CadastroCategoria />} />
              <Route path="listar" element={<ListarCategorias />} />             
            </Route>
          </Routes>
        </div>
      </Router>
    </MaletaProvider>
  );
}

export default App;