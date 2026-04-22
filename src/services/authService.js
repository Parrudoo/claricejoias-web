// Importe a sua configuração de API (Axios)
import api from './api';

export const authService = {
  
  // ==========================================
  // REALIZAR LOGIN E SALVAR TOKEN
  // ==========================================
  login: async (email, senha) => {
    try {
      // Faz o POST para a rota do Spring Boot
      const resposta = await api.post('/auth/login', { email, senha });

      // Se a requisição deu certo, o Keycloak devolveu os tokens.
      // Vamos salvar no Local Storage para o navegador não esquecer quem está logado.
      if (resposta.data && resposta.data.access_token) {
        localStorage.setItem('@ClariceJoias_Token', resposta.data.access_token);
        
        // Opcional: Salvar o refresh_token se quiser renovar a sessão depois
        if (resposta.data.refresh_token) {
          localStorage.setItem('@ClariceJoias_RefreshToken', resposta.data.refresh_token);
        }
      }

      return resposta.data;

    } catch (erro) {
      console.error("Erro no authService.login:", erro);
      
      // O Axios é inteligente e guarda a mensagem de erro do Spring Boot dentro de erro.response.data
      if (erro.response && erro.response.data) {
        // Se for uma string de erro (ex: "E-mail ou senha incorretos")
        if (typeof erro.response.data === 'string') {
          throw new Error(erro.response.data);
        }
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
      return resposta.data; // Retorna a mensagem de sucesso do backend
    } catch (erro) {
      console.error("Erro no authService.cadastrar:", erro);
      
      if (erro.response && erro.response.data) {
        if (typeof erro.response.data === 'string') {
          throw new Error(erro.response.data);
        }
      }
      throw new Error("Não foi possível criar a conta no momento.");
    }
  },

  // ==========================================
  // FUNÇÕES AUXILIARES DE SESSÃO
  // ==========================================
  
  // Limpa os tokens do navegador (Sair)
  logoutLocal: () => {
    localStorage.removeItem('@ClariceJoias_Token');
    localStorage.removeItem('@ClariceJoias_RefreshToken');
  },

  // Retorna true se existir um token salvo
  estaLogado: () => {
    return !!localStorage.getItem('@ClariceJoias_Token');
  }
};