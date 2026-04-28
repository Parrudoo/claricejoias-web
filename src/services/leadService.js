import api from './api'; // Sua configuração do Axios

export const leadService = {

  salvar: async (dadosCheckout) => {
    try {
      const resposta = await api.post('/leads', dadosCheckout);
      return resposta.data;
    } catch (erro) {
      console.error("Erro ao salvar lead:", erro);
      throw erro;
    }
  },

  // ATUALIZADO: Agora suporta a paginação que você colocou no LeadsDashboard
  listarTodos: async (page = 0, size = 10) => {
    try {
      const resposta = await api.get(`/leads?page=${page}&size=${size}`);
      return resposta.data;
    } catch (erro) {
      console.error("Erro ao listar leads:", erro);
      throw erro;
    }
  },

  alternarStatus: async (id) => {
    try {
      const resposta = await api.put(`/leads/${id}/status`);
      return resposta.data;
    } catch (erro) {
      console.error(`Erro ao alterar status do lead ${id}:`, erro);
      throw erro;
    }
  },

  marcarComoComprado: async (id) => {
    try {
      const resposta = await api.put(`/leads/${id}/compra`);
      return resposta.data;
    } catch (erro) {
      console.error(`Erro ao marcar lead ${id} como comprado:`, erro);
      throw erro;
    }
  },

  verificarStatusGuia: async () => {
    const response = await api.get('/leads/status-guia');
    return response.data; // Retorna true (deve mostrar) ou false (já baixou)
  },

  // Envia os dados do formulário para virar um Lead no banco
  registrarLead: async (dadosLead) => {
    const response = await api.post('/leads/registrar-lead', dadosLead);
    return response.data;
  },

  // NOVO: Endpoint para disparar mensagem no WhatsApp sob demanda
  dispararWhatsapp: async (id, texto) => {
    try {
      // Assumindo que o seu arquivo api.js já aponta para a base da sua API (ex: http://localhost:8080/api)
      const resposta = await api.post('/mensagens/disparar', {
        leadId: id,
        texto: texto
      });
      return resposta.data;
    } catch (erro) {
      console.error("Erro ao disparar WhatsApp:", erro);
      throw erro;
    }
  }
};