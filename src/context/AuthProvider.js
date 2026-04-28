import React, { createContext, useContext, useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { ClienteService } from '../services/ClienteService'; // Seu serviço que chama /api/clientes/me

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  
  // Estado para os dados vindos do seu banco (Telefone, CPF, Endereço...)
  const [perfil, setPerfil] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);

  const logado = !!keycloak.authenticated;

  // =======================================================================
  // SINCRONIZAÇÃO AUTOMÁTICA (Keycloak -> Spring Boot -> React)
  // =======================================================================
  useEffect(() => {
    const sincronizarUsuario = async () => {
      if (initialized && logado) {
        setSincronizando(true);
        try {
          // O seu interceptor do api.js já enviará o Token e o X-Visitor-ID aqui!
          const dadosDoBanco = await ClienteService.obterMeuPerfil();
          setPerfil(dadosDoBanco);
        } catch (error) {
          console.error("Erro na sincronização de perfil:", error);
        } finally {
          setSincronizando(false);
        }
      } else if (initialized && !logado) {
        setPerfil(null);
      }
    };

    sincronizarUsuario();
  }, [initialized, logado]);

  // =======================================================================
  // DADOS E MÉTODOS EXPOSTOS
  // =======================================================================
  const value = {
    carregando: !initialized || sincronizando,
    logado,
    
    // Dados vindos do Keycloak (Token JWT)
    keycloakData: {
      nomeCompleto: logado ? (keycloak.tokenParsed?.name || keycloak.tokenParsed?.given_name) : '',
      primeiroNome: logado ? (keycloak.tokenParsed?.name?.split(' ')[0]) : '',
      email: logado ? keycloak.tokenParsed?.email : '',
      token: keycloak.token,
    },

    // Dados vindos do seu Banco de Dados (PostgreSQL)
    // Aqui estarão o telefone do Lead, CPF, etc.
    dadosPessoais: perfil, 

    // Verificação de Roles
    ehAdmin: logado ? (keycloak.hasRealmRole('admin') || keycloak.hasRealmRole('ADMIN')) : false,

    // Funções de ação
    login: () => keycloak.login(),
    logout: () => {
      // Opcional: Limpar o visitor_id se quiser que o próximo acesso seja do zero
      // localStorage.removeItem('visitor_id'); 
      keycloak.logout({ redirectUri: window.location.origin });
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto em qualquer tela
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};