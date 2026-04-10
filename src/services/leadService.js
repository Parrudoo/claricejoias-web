// Importe a sua classe/configuração de API apontando para o caminho correto
import api from './api'; 

export const leadService = {
  
  // Função para enviar os dados do cliente para o banco de dados
  salvar: async (nome, whatsapp, carrinho) => {
    try {
      // Usando a sua classe de API (exemplo com padrão Axios)
      // Ele vai concatenar a Base URL automaticamente com o '/leads'
      const resposta = await api.post('/leads', {
        nome,
        whatsapp,
        carrinho
      });

      return resposta.data; 
    } catch (erro) {
      console.error("Erro no leadService:", erro);
      throw erro;
    }
  },

  listarTodos: async () => {
    try {
      const resposta = await api.get('/leads');
      return resposta.data;
    } catch (erro) {
      console.error("Erro ao listar leads:", erro);
      throw erro;
    }
  }
};