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
  },

  // 👇 NOVO ENDPOINT: RECUPERAÇÃO DE SENHA VIA WHATSAPP
  solicitarRecuperacaoSenha: async (whatsapp) => {
    try {
      // Como o backend usa @RequestParam, passamos via "params" no Axios
      const resposta = await api.post('/auth/recuperar-senha', null, {
        params: { whatsapp: whatsapp }
      });
      return resposta.data;
    } catch (erro) {
      console.error("Erro no authService.solicitarRecuperacaoSenha:", erro);
      // Repassa a mensagem de erro que vem do backend (ex: "Número não encontrado")
      if (erro.response && erro.response.data && erro.response.data.erro) {
         throw new Error(erro.response.data.erro);
      }
      throw new Error("Não foi possível enviar a senha de recuperação no momento.");
    }
  }
};