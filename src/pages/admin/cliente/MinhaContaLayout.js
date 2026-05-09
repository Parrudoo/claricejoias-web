import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthProvider';
import './MinhaContaLayout.css'; // 👈 Importação do novo CSS de alta qualidade

export default function MinhaContaLayout() {
  const location = useLocation();
  // Atenção: Ajuste de keycloakData para extrair o nome corretamente do seu contexto
  const { keycloakData, logout } = useAuth(); 
  
  const nomeUsuario = keycloakData?.primeiroNome || 'Cliente';

  const menuItems = [
    // { path: '/minha-conta/visao-geral', label: 'Visão Geral', icon: '📊' }, // Descomente quando criar a tela
    { path: '/minha-conta/pedidos', label: 'Meus Pedidos', icon: '🛍️' },
    // { path: '/minha-conta/dados', label: 'Meus Dados', icon: '👤' }, // Descomente quando criar a tela
  ];

  return (
    <div className="conta-layout-container fade-in">
      
      {/* Menu Lateral */}
      <aside className="conta-sidebar">
        <div className="conta-sidebar-header">
          <h2 className="conta-titulo">Minha Conta</h2>
          <p className="conta-saudacao">Olá, {nomeUsuario}!</p>
        </div>

        <nav className="conta-nav">
          {menuItems.map((item) => {
            // Verifica se a rota atual é exatamente a do link
            const isAtivo = location.pathname.includes(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`conta-nav-link ${isAtivo ? 'ativo' : ''}`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          
          <hr className="conta-divisor" />

          <button 
            className="conta-btn-logout"
            onClick={logout}
          >
            <span>🚪</span> Sair
          </button>
        </nav>
      </aside>

      {/* Área de Conteúdo Principal (Onde as rotas filhas aparecem) */}
      <main className="conta-main-content">
        <Outlet /> 
      </main>

    </div>
  );
}