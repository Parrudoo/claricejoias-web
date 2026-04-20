import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importação do Provedor de Estado Global
import { MaletaProvider } from './context/MaletaContext';

// Importação do Layout Administrativo que criamos
// ATENÇÃO: Ajuste este caminho de acordo com a pasta onde você salvou o AdminLayout

// Importação das Páginas (que você criará na pasta pages)
import Catalogo from './pages/Catalogo';

// Estilos Globais
import './App.css';
import Maleta from './components/Maleta';
import Checkout from './components/Checkout';

// Páginas Administrativas
import CadastroCategoria from './pages/admin/CadastroCategoria';
import ListarCategorias from './pages/admin/categoria/ListarCategorias';
import ListaProdutos from './pages/admin/produtos/ListaProdutos';
import CadastroProduto from './pages/admin/produtos/CadastroProduto';
import AdminLayout from './pages/admin/adminLayout/AdminLayout';

function App() {
  return (
    <MaletaProvider>
      <Router>
        <div className="App">
          {/* O NavBar fica fora das rotas para aparecer em todas as páginas */}
          {/* <NavBar />  */}
          <Maleta /> {/* Componente lateral escondido (Carrinho) */}

          <Routes>
            {/* ====================================================== */}
            {/* ROTAS PÚBLICAS (Visão do Cliente - Catálogo, Checkout) */}
            {/* ====================================================== */}
            
            {/* Envolvi as rotas públicas na main para não quebrar o seu estilo antigo */}
            <Route path="/" element={
              <main className="conteudo-principal">
                <Catalogo />
              </main>
            } />
            
            <Route path="/checkout" element={
              <main className="conteudo-principal">
                <Checkout />
              </main>
            } />


            {/* ====================================================== */}
            {/* ROTAS ADMINISTRATIVAS (Protegidas pelo AdminLayout)    */}
            {/* ====================================================== */}
            
            {/* Tudo que começa com /admin cai aqui e renderiza o Layout (Menu Lateral) */}
            <Route path="/admin" element={<AdminLayout />}>
              
              {/* Se o usuário digitar apenas "/admin", redireciona para a tela de produtos */}
              <Route index element={<Navigate to="/admin/dashboard" replace />} />

              {/* Rota da Visão Geral (Criei um HTML básico provisório para você ver funcionando) */}
              <Route path="dashboard" element={
                <div style={{ padding: '20px' }}>
                  <h1>Visão Geral</h1>
                  <p>Bem-vindo ao painel administrativo da Clarice Joias!</p>
                </div>
              } />
              
              {/* As rotas filhas não precisam da barra inicial, o React já entende que é /admin/alguma-coisa */}
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