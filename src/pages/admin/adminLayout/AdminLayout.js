import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
// Importe o keycloak (ajuste a quantidade de '../' dependendo de onde este arquivo está na sua pasta)
import keycloak from '../../../config/keycloak'; 
import './AdminLayout.css';

// 👇 Adicionado o FiSettings (Engrenagem) para o menu de configurações
import { 
  FiGrid, 
  FiPackage, 
  FiList, 
  FiUsers, 
  FiShoppingCart, 
  FiDollarSign, 
  FiUser, 
  FiImage, 
  FiLogOut, 
  FiMenu, 
  FiChevronDown,
  FiSettings 
} from 'react-icons/fi';

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

  // NOVA FUNÇÃO DE LOGOUT SEGURO
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
            <FiGrid size={20} />
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
                <FiPackage size={20} />
                <span className="nav-text">Produtos</span>
              </div>
              <FiChevronDown size={16} className={`chevron ${submenuAberto === 'produtos' ? 'rotate' : ''}`} />
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
                <FiList size={20} />
                <span className="nav-text">Categorias</span>
              </div>
              <FiChevronDown size={16} className={`chevron ${submenuAberto === 'categorias' ? 'rotate' : ''}`} />
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
                <FiUsers size={20} />
                <span className="nav-text">Leads</span>
              </div>
              <FiChevronDown size={16} className={`chevron ${submenuAberto === 'leads' ? 'rotate' : ''}`} />
            </button>
            
            {submenuAberto === 'leads' && isExpanded && (
              <div className="submenu-items">
                <NavLink to="/admin/leads" className="submenu-link">Gerenciar Leads</NavLink>
              </div>
            )}
          </div>

          {/* === GRUPO: PDV === */}
          <div className="nav-group">
            <button 
              className={`nav-group-btn ${submenuAberto === 'pdv' ? 'open' : ''}`} 
              onClick={() => toggleSubmenu('pdv')}
              title="Pdv"
            >
              <div className="nav-group-icon-text">
                <FiShoppingCart size={20} />
                <span className="nav-text">PDV</span>
              </div>
              <FiChevronDown size={16} className={`chevron ${submenuAberto === 'pdv' ? 'rotate' : ''}`} />
            </button>
            
            {submenuAberto === 'pdv' && isExpanded && (
              <div className="submenu-items">
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
                <FiDollarSign size={20} />
                <span className="nav-text">Vendas</span>
              </div>
              <FiChevronDown size={16} className={`chevron ${submenuAberto === 'vendas' ? 'rotate' : ''}`} />
            </button>
            
            {submenuAberto === 'vendas' && isExpanded && (
              <div className="submenu-items">
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
                <FiUser size={20} />
                <span className="nav-text">Cliente</span>
              </div>
              <FiChevronDown size={16} className={`chevron ${submenuAberto === 'Cliente' ? 'rotate' : ''}`} />
            </button>
            
            {submenuAberto === 'Cliente' && isExpanded && (
              <div className="submenu-items">
                <NavLink to="/admin/telaCliente" className="submenu-link">Clientes</NavLink>
              </div>
            )}
          </div>

           {/* === GRUPO: CONFIGURAÇÕES (Antigo Banner) === */}
          <div className="nav-group">
            <button 
              className={`nav-group-btn ${submenuAberto === 'config' ? 'open' : ''}`} 
              onClick={() => toggleSubmenu('config')}
              title="Configurações"
            >
              <div className="nav-group-icon-text">
                <FiSettings size={20} />
                <span className="nav-text">Configurações</span>
              </div>
              <FiChevronDown size={16} className={`chevron ${submenuAberto === 'config' ? 'rotate' : ''}`} />
            </button>
            
            {submenuAberto === 'config' && isExpanded && (
              <div className="submenu-items">
                {/* Link para o Banner */}
                <NavLink to="/admin/config" className="submenu-link">Banners</NavLink>
                
                {/* NOVO: Link para o WhatsApp (deve bater com a rota que configuramos no App.js) */}
                <NavLink to="/admin/config/whatsapp" className="submenu-link">Conexão WhatsApp</NavLink>
              </div>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-sair" title="Sair do Sistema" onClick={handleSair}>
            <FiLogOut size={20} />
            <span className="nav-text">Sair</span>
          </button>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="admin-main-content">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="btn-toggle-menu" onClick={toggleSidebar}>
              <FiMenu size={24} />
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