import api from './api'; // Sua configuração do Axios

export const leadService = {
  
  salvar: async (dadosCheckout) => {
    try {
      const resposta = await api.post('/api/leads', dadosCheckout);
      return resposta.data; 
    } catch (erro) {
      console.error("Erro ao salvar lead:", erro);
      throw erro;
    }
  },

  listarTodos: async () => {
    try {
      const resposta = await api.get('/api/leads');
      return resposta.data;
    } catch (erro) {
      console.error("Erro ao listar leads:", erro);
      throw erro;
    }
  },

  // NOVO: Endpoint para alternar o status ativo/inativo
  alternarStatus: async (id) => {
    try {
      const resposta = await api.put(`/api/leads/${id}/status`);
      return resposta.data; // O backend agora retorna o Lead atualizado
    } catch (erro) {
      console.error(`Erro ao alterar status do lead ${id}:`, erro);
      throw erro;
    }
  },

  // NOVO: Endpoint para marcar como comprado
  marcarComoComprado: async (id) => {
    try {
      const resposta = await api.put(`/api/leads/${id}/compra`);
      return resposta.data; // O backend agora retorna o Lead atualizado
    } catch (erro) {
      console.error(`Erro ao marcar lead ${id} como comprado:`, erro);
      throw erro;
    }
  }
};