// src/components/RotaProtegida.js
import React, { useEffect, useRef } from 'react';
import keycloak from '../config/keycloak';

export function RotaProtegida({ children }) {
  const loginChamado = useRef(false);

  useEffect(() => {
    // Garante que o comando de login só seja disparado UMA ÚNICA VEZ
    if (!keycloak.authenticated && !loginChamado.current) {
      loginChamado.current = true;
      console.warn("Usuário não autenticado. Redirecionando para Keycloak...");
      
      // Passamos a URL exata para o Keycloak saber para onde voltar
      keycloak.login({ redirectUri: window.location.href });
    }
  }, []);

  if (!keycloak.authenticated) {
    return <div style={{textAlign: 'center', marginTop: '100px'}}>Redirecionando para o login seguro...</div>;
  }

  return children; 
}