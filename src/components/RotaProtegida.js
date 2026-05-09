import React, { useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Navigate, useLocation } from 'react-router-dom';

export function RotaProtegida({ children, adminOnly = false }) {
  const { keycloak, initialized } = useKeycloak();
  const location = useLocation();

  useEffect(() => {
    if (initialized && !keycloak.authenticated) {
      keycloak.login({ redirectUri: window.location.origin + location.pathname });
    }
  }, [keycloak, initialized, location.pathname]);

  if (!initialized || !keycloak.authenticated) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
        Conectando ao servidor seguro...
      </div>
    );
  }

  // ==========================================
  // EXTRAI AS ROLES DIRETAMENTE DO KEYCLOAK
  // ==========================================
  const ehAdmin = keycloak.hasRealmRole('admin') || keycloak.hasRealmRole('ADMIN');
  const ehCliente = keycloak.hasRealmRole('cliente') || keycloak.hasRealmRole('CLIENTE');

  // ==========================================
  // REGRAS DE REDIRECIONAMENTO E ACESSO
  // ==========================================

  // 1. Rota de Admin acessada por um Cliente
  if (adminOnly && ehCliente && !ehAdmin) {
    return <Navigate to="/minha-conta" replace />;
  }

  // 2. Rota de Cliente (/minha-conta) acessada por um Admin
  if (!adminOnly && ehAdmin && !ehCliente) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 3. Segurança Extrema: E se o usuário não tem NENHUMA das duas roles?
  // (Ex: Uma conta que foi bloqueada ou desativada parcialmente)
  if (!ehAdmin && !ehCliente) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#ff4d4d' }}>Acesso Restrito 🚫</h2>
        <p>Sua conta não tem permissão para acessar esta área.</p>
        <button 
          onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
          style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '20px' }}
        >
          Sair
        </button>
      </div>
    );
  }

  // Se passou pelas barreiras e tem a permissão correta, desenha a tela!
  return children; 
}