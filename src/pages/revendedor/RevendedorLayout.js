import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
// import './AdminLayout.css'; 

import { 
  FiHome, 
  FiShoppingCart, 
  FiBriefcase, 
  FiUsers, 
  FiFileText, 
  FiDollarSign, 
  FiLogOut, 
  FiMenu 
} from 'react-icons/fi';
import keycloak from '../../config/keycloak';
import { FaWhatsapp } from 'react-icons/fa';

const RevendedorLayout = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const nomeUsuario = keycloak.tokenParsed?.preferred_username || 'Revendedora';
  const inicialUsuario = nomeUsuario.charAt(0).toUpperCase();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSair = () => {
    localStorage.removeItem('@ClariceJoias_Token');
    localStorage.removeItem('@ClariceJoias_RefreshToken');
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return (
    <div className={`admin-container ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          {isExpanded ? (
            <>
              <h2>Clarice<span>Joias</span></h2>
              <p>Painel da Revendedora</p>
            </>
          ) : (
            <h2>C<span>J</span></h2>
          )}
        </div>

        <nav className="sidebar-nav">
          
          <NavLink to="/revendedor/dashboard" className="nav-item-single" title="Meu Resumo">
            <FiHome size={20} />
            <span className="nav-text">Meu Resumo</span>
          </NavLink>

          <NavLink to="/revendedor/pdv" className="nav-item-single" title="Nova Venda (PDV)">
            <FiShoppingCart size={20} />
            <span className="nav-text">Nova Venda</span>
          </NavLink>

          <NavLink to="/revendedor/maleta" className="nav-item-single" title="Minha Maleta">
            <FiBriefcase size={20} />
            <span className="nav-text">Minha Maleta</span>
          </NavLink>

          <NavLink to="/revendedor/clientes" className="nav-item-single" title="Meus Clientes">
            <FiUsers size={20} />
            <span className="nav-text">Meus Clientes</span>
          </NavLink>

          <NavLink to="/revendedor/vendas" className="nav-item-single" title="Histórico de Vendas">
            <FiFileText size={20} />
            <span className="nav-text">Minhas Vendas</span>
          </NavLink>

          <NavLink to="/revendedor/financeiro" className="nav-item-single" title="Acerto e Lucro">
            <FiDollarSign size={20} />
            <span className="nav-text">Meu Lucro</span>
          </NavLink>
         
          {/* BOTÃO DIRETO DO WHATSAPP */}
          <NavLink to="/revendedor/whatsapp" className="nav-item-single" title="Conexão WhatsApp">
            <FaWhatsapp size={20} />
            <span className="nav-text">Conexão WhatsApp</span>
          </NavLink>

        </nav>

        <div className="sidebar-footer">
          <button className="btn-sair" title="Sair do Sistema" onClick={handleSair}>
            <FiLogOut size={20} />
            <span className="nav-text">Sair</span>
          </button>
        </div>
      </aside>

      <main className="admin-main-content">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="btn-toggle-menu" onClick={toggleSidebar}>
              <FiMenu size={24} />
            </button>
            <div className="topbar-titulo">Área da Revendedora</div>
          </div>

          <div className="topbar-perfil">
            <div className="avatar" style={{ backgroundColor: '#D4AF37' }}>{inicialUsuario}</div>
            <span>{nomeUsuario}</span>
          </div>
        </header>
        
        <div className="admin-page-content">
          {/* Aqui as rotas filhas da revendedora serão renderizadas */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default RevendedorLayout;