import React, { useState, useEffect } from 'react';
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
  FiMenu,
  FiExternalLink // Novo ícone para o botão da loja
} from 'react-icons/fi';
import keycloak from '../../config/keycloak';
import { FaWhatsapp } from 'react-icons/fa';

// Importa o serviço novo que criamos para buscar os dados da revendedora no banco
import { RevendedorService } from '../../services/RevendedorService'; 

const RevendedorLayout = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [meuSlug, setMeuSlug] = useState(null); // Estado para guardar o slug real
  
  const nomeUsuario = keycloak.tokenParsed?.preferred_username || 'Revendedora';
  const inicialUsuario = nomeUsuario.charAt(0).toUpperCase();

  // Busca os dados da revendedora no banco de dados assim que ela loga
  useEffect(() => {
    const buscarDadosPerfil = async () => {
      try {
        const dados = await RevendedorService.getMeuPerfil();
        if (dados && dados.slug) {
          setMeuSlug(dados.slug);
        }
      } catch (error) {
        console.error("Erro ao buscar perfil no layout:", error);
      }
    };

    buscarDadosPerfil();
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSair = () => {
    localStorage.removeItem('@ClariceJoias_Token');
    localStorage.removeItem('@ClariceJoias_RefreshToken');

    // Monta a URL dinâmica baseada no slug que veio do BANCO DE DADOS
    const urlRedirecionamento = meuSlug 
      ? `${window.location.origin}/${meuSlug}` 
      : window.location.origin;

    keycloak.logout({ redirectUri: urlRedirecionamento });
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

          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            {/* BOTÃO PARA VISITAR A LOJA (Aparece assim que o slug é carregado) */}
            {meuSlug && (
              <a 
                href={`/${meuSlug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                title="Visitar minha loja"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  color: '#D4AF37', textDecoration: 'none', fontWeight: 'bold',
                  border: '1px solid #D4AF37', padding: '6px 12px', borderRadius: '6px'
                }}
              >
                <FiExternalLink size={18} />
                Minha Loja
              </a>
            )}

            <div className="topbar-perfil" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="avatar" style={{ backgroundColor: '#D4AF37', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                {inicialUsuario}
              </div>
              <span>{nomeUsuario}</span>
            </div>
          </div>
        </header>
        
        <div className="admin-page-content">
          {/* O Outlet passa o meuSlug como contexto para as telas filhas! */}
          <Outlet context={{ meuSlug }} /> 
        </div>
      </main>
    </div>
  );
};

export default RevendedorLayout;