import api from './api';

export const authService = {
  
  // ==========================================
  // REALIZAR LOGIN E SALVAR TOKEN
  // ==========================================
  login: async (email, senha) => {
    try {
      // Faz o POST para a rota do Spring Boot
      const resposta = await api.post('/auth/login', { email, senha });

      if (resposta.data && resposta.data.access_token) {
        localStorage.setItem('@ClariceJoias_Token', resposta.data.access_token);
        
        if (resposta.data.refresh_token) {
          localStorage.setItem('@ClariceJoias_RefreshToken', resposta.data.refresh_token);
        }
      }

      return resposta.data;

    } catch (erro) {
      console.error("Erro no authService.login:", erro);
      
      //  AJUSTE AQUI: Lê o JSON de erro que criamos lá no Spring Boot
      if (erro.response && erro.response.data && erro.response.data.erro) {
         throw new Error(erro.response.data.erro);
      }
      throw new Error("Erro de comunicação com o servidor de autenticação.");
    }
  },

  // ==========================================
  // CADASTRAR NOVO CLIENTE
  // ==========================================
  cadastrar: async (dadosCadastro) => {
    try {
      const resposta = await api.post('/auth/cadastro', dadosCadastro);
      return resposta.data; 
    } catch (erro) {
      console.error("Erro no authService.cadastrar:", erro);
      
      //  AJUSTE AQUI TAMBÉM: Captura o erro do Java
      if (erro.response && erro.response.data && erro.response.data.erro) {
         throw new Error(erro.response.data.erro);
      }
      throw new Error("Não foi possível criar a conta no momento.");
    }
  },

  // ==========================================
  // FUNÇÕES AUXILIARES DE SESSÃO
  // ==========================================
  logoutLocal: () => {
    localStorage.removeItem('@ClariceJoias_Token');
    localStorage.removeItem('@ClariceJoias_RefreshToken');
  },

  estaLogado: () => {
    return !!localStorage.getItem('@ClariceJoias_Token');
  },

  // ==========================================
  // LER O TOKEN PARA PEGAR NOME E EMAIL
  // ==========================================
  obterUsuarioLogado: () => {
    const token = localStorage.getItem('@ClariceJoias_Token');
    if (!token) return null;

    try {
      // O Token JWT tem 3 partes separadas por ponto. A parte do meio [1] é o "Payload" (os dados).
      const payloadBase64 = token.split('.')[1];
      // Decodifica a base64 para texto normal legível
      const payloadDecoded = JSON.parse(window.atob(payloadBase64));

      return {
        nome: payloadDecoded.name || payloadDecoded.given_name || 'Cliente',
        email: payloadDecoded.email
      };
    } catch (erro) {
      console.error("Erro ao decodificar o token do usuário:", erro);
      return null;
    }
  },

  temPermissaoAdmin: () => {
    const token = localStorage.getItem('@ClariceJoias_Token');
    if (!token) return false;

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadDecoded = JSON.parse(window.atob(payloadBase64));

      // O Keycloak guarda as roles dentro do objeto realm_access.roles
      const roles = payloadDecoded.realm_access?.roles || [];
      
      // Retorna true se a palavra 'admin' estiver na lista de roles
      return roles.includes('admin');
    } catch (erro) {
      console.error("Erro ao ler as permissões do token:", erro);
      return false;
    }
  }

  
};