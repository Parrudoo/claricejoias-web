import React, { useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Navigate, useLocation } from 'react-router-dom';

// Adicionada a prop revendedoraOnly
export function RotaProtegida({ children, adminOnly = false, revendedoraOnly = false }) {
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
  // Aceita variações da role de revendedora para evitar erros no Keycloak
  const ehRevendedora = keycloak.hasRealmRole('revendedora') || keycloak.hasRealmRole('REVENDEDORA') || 
                        keycloak.hasRealmRole('revendedor') || keycloak.hasRealmRole('REVENDEDOR');

  // Identifica se é uma rota exclusiva de cliente (não marcou admin nem revendedora)
  const clienteOnly = !adminOnly && !revendedoraOnly;

  // ==========================================
  // REGRAS DE REDIRECIONAMENTO E ACESSO
  // ==========================================

  // 1. Rota de ADMIN acessada por quem não é Admin
  if (adminOnly && !ehAdmin) {
    if (ehRevendedora) return <Navigate to="/revendedor/dashboard" replace />;
    if (ehCliente) return <Navigate to="/minha-conta" replace />;
  }

  // 2. Rota de REVENDEDORA acessada por quem não é Revendedora
  if (revendedoraOnly && !ehRevendedora) {
    if (ehAdmin) return <Navigate to="/admin/dashboard" replace />;
    if (ehCliente) return <Navigate to="/minha-conta" replace />;
  }

  // 3. Rota de CLIENTE acessada por quem não é Cliente
  if (clienteOnly && !ehCliente) {
    if (ehAdmin) return <Navigate to="/admin/dashboard" replace />;
    if (ehRevendedora) return <Navigate to="/revendedor/dashboard" replace />;
  }

  // 4. Segurança Extrema: O usuário não tem NENHUMA das três roles?
  // (Ex: Uma conta que foi criada mas você esqueceu de dar a role no Keycloak)
  if (!ehAdmin && !ehCliente && !ehRevendedora) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#ff4d4d' }}>Acesso Restrito 🚫</h2>
        <p>Sua conta não tem um perfil de acesso definido no sistema.</p>
        <p>Por favor, entre em contato com o suporte da Clarice Joias.</p>
        <button 
          onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
          style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '20px', background: '#1a1a1a', color: '#D4AF37', border: 'none', borderRadius: '4px' }}
        >
          Sair e voltar ao início
        </button>
      </div>
    );
  }

  // Se passou pelas barreiras e tem a permissão correta, desenha a tela!
  return children; 
}