import React, { useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web'; // Hook Oficial
import { Navigate } from 'react-router-dom';

export function RotaProtegida({ children }) {
  const { keycloak, initialized } = useKeycloak();

  useEffect(() => {
    // Se o Keycloak terminou de iniciar e o usuário NÃO está logado, manda pro login
    if (initialized && !keycloak.authenticated) {
      keycloak.login({ redirectUri: window.location.origin + '/admin' });
    }
  }, [keycloak, initialized]);

  // Se ainda estiver carregando, segura a tela
  if (!initialized || !keycloak.authenticated) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>Conectando ao servidor seguro...</div>;
  }

  // Verifica se o usuário tem a permissão de administrador
  const ehAdmin = keycloak.hasRealmRole('ADMIN'); // Certifique-se que no Keycloak a role é minúscula 'admin'

  if (!ehAdmin) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#ff4d4d' }}>Acesso Negado 🚫</h2>
        <p>Área exclusiva para operadores da Clarice Joias.</p>
        <button 
          onClick={() => {
            keycloak.logout({ redirectUri: window.location.origin }); // Chuta o intruso
          }}
          style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '20px' }}
        >
          Sair e Voltar ao Catálogo
        </button>
      </div>
    );
  }

  return children; 
}