import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importação do Provedor de Estado Global
import { MaletaProvider } from './context/MaletaContext';

// Importação das Páginas (que você criará na pasta pages)
import Catalogo from './pages/Catalogo';


// Estilos Globais
import './App.css';
import CadastroJoia from './pages/admin/CadastroJoia';
import NavBar from './components/NavBar';
import Maleta from './components/Maleta';
import Checkout from './components/Checkout';

function App() {
  return (
    <MaletaProvider>
      <Router>
        <div className="App">
          {/* O NavBar fica fora das rotas para aparecer em todas as páginas */}
          {/* <NavBar />  */}
          <Maleta /> {/* Componente lateral escondido */}
          
          <main className="conteudo-principal">
          <Routes>
              <Route path="/" element={<Catalogo />} />
              <Route path="/checkout" element={<Checkout />} />
              
              {/* Rota de Administração para Cadastrar */}
              <Route path="/admin/cadastrar" element={<CadastroJoia />} />
              
              {/* Você pode adicionar depois a rota de listagem/edição:
              <Route path="/admin/lista" element={<ListaJoiasAdmin />} /> 
              */}
            </Routes>
          </main>

          
        </div>
      </Router>
    </MaletaProvider>
  );
}

export default App;