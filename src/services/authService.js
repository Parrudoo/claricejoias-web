import api from './api';

export const authService = {
  // CADASTRAR NOVO CLIENTE (Via Spring Boot)
  cadastrar: async (dadosCadastro) => {
    try {
      const resposta = await api.post('/auth/cadastro', dadosCadastro);
      return resposta.data; 
    } catch (erro) {
      console.error("Erro no authService.cadastrar:", erro);
      if (erro.response && erro.response.data && erro.response.data.erro) {
         throw new Error(erro.response.data.erro);
      }
      throw new Error("Não foi possível criar a conta no momento.");
    }
  }
};