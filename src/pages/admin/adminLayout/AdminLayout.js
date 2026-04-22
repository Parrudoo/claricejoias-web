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

        </nav>

        <div className="sidebar-footer">
          {/* Adicionado o onClick com a função de logout do Keycloak */}
          <button className="btn-sair" title="Sair do Sistema" onClick={() => keycloak.logout()}>
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
            {/* Agora renderiza dinamicamente a letra e o nome vindos do Keycloak */}
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