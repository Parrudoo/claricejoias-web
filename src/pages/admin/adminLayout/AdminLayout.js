import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
// Importe o keycloak (ajuste a quantidade de '../' dependendo de onde este arquivo está na sua pasta)
import keycloak from '../../../config/keycloak'; 
import './AdminLayout.css';

const AdminLayout = () => {
  // Controle de largura da barra lateral
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Controle de qual submenu está aberto (ex: 'produtos', 'categorias')
  const [submenuAberto, setSubmenuAberto] = useState('');

  // Captura os dados do usuário logado pelo Keycloak
  const nomeUsuario = keycloak.tokenParsed?.preferred_username || 'Usuário';
  const inicialUsuario = nomeUsuario.charAt(0).toUpperCase();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    // Opcional: fechar submenus ao encolher a barra lateral
    if (isExpanded) {
      setSubmenuAberto('');
    }
  };

  const toggleSubmenu = (menu) => {
    // Se a sidebar estiver encolhida, expande ela primeiro
    if (!isExpanded) {
      setIsExpanded(true);
    }
    // Abre o submenu clicado, ou fecha se já estiver aberto
    setSubmenuAberto(submenuAberto === menu ? '' : menu);
  };

  // 👇 NOVA FUNÇÃO DE LOGOUT SEGURO
  const handleSair = () => {
    // 1. Limpa os dados do LocalStorage para não deixar rastros na loja
    localStorage.removeItem('@ClariceJoias_Token');
    localStorage.removeItem('@ClariceJoias_RefreshToken');
    
    // 2. Desloga do Keycloak e manda de volta pra página inicial da loja
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return (
    <div className={`admin-container ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      
      {/* --- BARRA LATERAL (SIDEBAR) --- */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          {isExpanded ? (
            <>
              <h2>Clarice<span>Joias</span></h2>
              <p>Painel Administrativo</p>
            </>
          ) : (
            <h2>C<span>J</span></h2>
          )}
        </div>

        <nav className="sidebar-nav">
          
          <NavLink to="/admin/dashboard" className="nav-item-single" title="Visão Geral">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            <span className="nav-text">Visão Geral</span>
          </NavLink>

          {/* === GRUPO: PRODUTOS === */}
          <div className="nav-group">
            {/* Omitido no seu código original, deixado comentado se quiser usar depois */}
            {/* <button 
              className={`nav-group-btn ${submenuAberto === 'produtos' ? 'open' : ''}`} 
              onClick={() => toggleSubmenu('produtos')}
              title="Produtos"
            >
              <div className="nav-group-icon-text">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                <span className="nav-text">Produtos</span>
              </div>
              <svg className={`chevron ${submenuAberto === 'produtos' ? 'rotate' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button> */}
            
            {submenuAberto === 'produtos' && isExpanded && (
              <div className="submenu-items">
                <NavLink to="/admin/produtos" className="submenu-link">Listar Produtos</NavLink>
                <NavLink to="/admin/prod" className="submenu-link">Cadastrar Novo</NavLink>
              </div>
            )}
          </div>

          {/* === GRUPO: CATEGORIAS === */}
          <div className="nav-group">
            <button 
              className={`nav-group-btn ${submenuAberto === 'categorias' ? 'open' : ''}`} 
              onClick={() => toggleSubmenu('categorias')}
              title="Categorias"
            >
              <div className="nav-group-icon-text">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                <span className="nav-text">Categorias</span>
              </div>
              <svg className={`chevron ${submenuAberto === 'categorias' ? 'rotate' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            
            {submenuAberto === 'categorias' && isExpanded && (
              <div className="submenu-items">
                <NavLink to="/admin/listar" className="submenu-link">Listar Categorias</NavLink>
                <NavLink to="/admin/cadastrar" className="submenu-link">Nova Categoria</NavLink>
              </div>
            )}
          </div>

          {/* === GRUPO: LEADS === */}
          <div className="nav-group">
            <button 
              className={`nav-group-btn ${submenuAberto === 'leads' ? 'open' : ''}`} 
              onClick={() => toggleSubmenu('leads')}
              title="Leads"
            >
              <div className="nav-group-icon-text">
                {/* Ícone de Usuários/Clientes */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span className="nav-text">Leads</span>
              </div>
              <svg className={`chevron ${submenuAberto === 'leads' ? 'rotate' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            
            {submenuAberto === 'leads' && isExpanded && (
              <div className="submenu-items">
                {/* Rota apontando para a tela LeadsDashboard que criamos */}
                <NavLink to="/admin/leads" className="submenu-link">Gerenciar Leads</NavLink>
              </div>
            )}
          </div>

          {/* === GRUPO: LEADS === */}
          <div className="nav-group">
            <button 
              className={`nav-group-btn ${submenuAberto === 'pdv' ? 'open' : ''}`} 
              onClick={() => toggleSubmenu('pdv')}
              title="Pdv"
            >
              <div className="nav-group-icon-text">
                {/* Ícone de Usuários/Clientes */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span className="nav-text">PDV</span>
              </div>
              <svg className={`chevron ${submenuAberto === 'pdv' ? 'rotate' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            
            {submenuAberto === 'pdv' && isExpanded && (
              <div className="submenu-items">
                {/* Rota apontando para a tela LeadsDashboard que criamos */}
                <NavLink to="/admin/telaPdv" className="submenu-link">PDV</NavLink>
              </div>
            )}
          </div>

           {/* === GRUPO: VENDAS === */}
           <div className="nav-group">
            <button 
              className={`nav-group-btn ${submenuAberto === 'vendas' ? 'open' : ''}`} 
              onClick={() => toggleSubmenu('vendas')}
              title="Vendas"
            >
              <div className="nav-group-icon-text">
                {/* Ícone de Usuários/Clientes */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span className="nav-text">PDV</span>
              </div>
              <svg className={`chevron ${submenuAberto === 'vendas' ? 'rotate' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            
            {submenuAberto === 'vendas' && isExpanded && (
              <div className="submenu-items">
                {/* Rota apontando para a tela LeadsDashboard que criamos */}
                <NavLink to="/admin/vendas" className="submenu-link">Vendas PDV</NavLink>
              </div>
            )}
          </div>

           {/* === GRUPO: CLIENTES === */}
          <div className="nav-group">
            <button 
              className={`nav-group-btn ${submenuAberto === 'Cliente' ? 'open' : ''}`} 
              onClick={() => toggleSubmenu('Cliente')}
              title="Cliente"
            >
              <div className="nav-group-icon-text">
                {/* Ícone de Usuários/Clientes */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span className="nav-text">Cliente</span>
              </div>
              <svg className={`chevron ${submenuAberto === 'Cliente' ? 'rotate' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            
            {submenuAberto === 'Cliente' && isExpanded && (
              <div className="submenu-items">
                {/* Rota apontando para a tela LeadsDashboard que criamos */}
                <NavLink to="/admin/telaCliente" className="submenu-link">Clientes</NavLink>
              </div>
            )}
          </div>

           {/* === GRUPO: BANNER === */}
          <div className="nav-group">
            <button 
              className={`nav-group-btn ${submenuAberto === 'banner' ? 'open' : ''}`} 
              onClick={() => toggleSubmenu('banner')}
              title="banner"
            >
              <div className="nav-group-icon-text">
                {/* Ícone de Usuários/Clientes */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span className="nav-text">Config Banner</span>
              </div>
              <svg className={`chevron ${submenuAberto === 'banner' ? 'rotate' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            
            {submenuAberto === 'banner' && isExpanded && (
              <div className="submenu-items">
                {/* Rota apontando para a tela LeadsDashboard que criamos */}
                <NavLink to="/admin/config" className="submenu-link">Banner</NavLink>
              </div>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          {/* 👇 Botão ajustado com a função que limpa os dados antes de sair */}
          <button className="btn-sair" title="Sair do Sistema" onClick={handleSair}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span className="nav-text">Sair</span>
          </button>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="admin-main-content">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="btn-toggle-menu" onClick={toggleSidebar}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className="topbar-titulo">Administração</div>
          </div>

          <div className="topbar-perfil">
            <div className="avatar">{inicialUsuario}</div>
            <span>{nomeUsuario}</span>
          </div>
        </header>
        
        <div className="admin-page-content">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;