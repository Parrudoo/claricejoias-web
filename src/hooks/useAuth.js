import { useKeycloak } from '@react-keycloak/web';

export function useAuth() {
  const { keycloak, initialized } = useKeycloak();

  // Verifica se está logado de forma segura
  const logado = !!keycloak.authenticated;

  // Extrai os dados do usuário já formatados
  const nomeCompleto = logado ? (keycloak.tokenParsed?.name || keycloak.tokenParsed?.given_name) : '';
  const primeiroNome = logado ? nomeCompleto.split(' ')[0] : '';
  const email = logado ? keycloak.tokenParsed?.email : '';

  // Verifica se é administrador
  const ehAdmin = logado ? (keycloak.hasRealmRole('admin') || keycloak.hasRealmRole('ADMIN')) : false;

  return {
    carregando: !initialized, // Útil para mostrar telas de loading
    logado,
    nomeCompleto,
    primeiroNome,
    email,
    ehAdmin,
    token: keycloak.token,
    // Atalhos para não precisar chamar o keycloak direto nas telas:
    login: () => keycloak.login(),
    logout: () => keycloak.logout({ redirectUri: window.location.origin }),
  };
}