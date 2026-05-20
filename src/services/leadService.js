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
  listarTodos: async (page = 0, size = 10, busca = '') => {
    try {
      // Montamos a URL base com a paginação
      let url = `/leads?page=${page}&size=${size}`;

      // Se o usuário digitou algo no filtro, adicionamos na URL
      if (busca && busca.trim() !== '') {
        url += `&busca=${encodeURIComponent(busca)}`;
      }

      const resposta = await api.get(url);
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
  dispararWhatsapp: async (id) => {
    try {
      const resposta = await api.post('/mensagens/disparar', {
        leadId: id
      });
      return resposta.data;
    } catch (erro) {
      console.error("Erro ao disparar WhatsApp:", erro);
      throw erro;
    }
  },

  // ==================================================
  //  NOVOS ENDPOINTS: CHECKOUT PREMIUM (WhatsApp OTP)
  // ==================================================

  // Dispara o código de 6 dígitos via Evolution API
  solicitarCodigo: async (whatsapp) => {
    try {
      const resposta = await api.post('/leads/solicitar-codigo', null, {
        params: { whatsapp }
      });
      return resposta.data;
    } catch (erro) {
      console.error("Erro ao solicitar código:", erro);
      throw erro;
    }
  },

  // Valida se o código digitado é o mesmo que foi enviado
  validarCodigo: async (whatsapp, codigo) => {
    try {
      const resposta = await api.post('/leads/validar-codigo', null, {
        params: { whatsapp, codigo }
      });
      return resposta.data;
    } catch (erro) {
      console.error("Erro ao validar código:", erro);
      throw erro;
    }
  },

  // ==================================================
  //  NOVOS ENDPOINTS: GESTÃO DO PAINEL DE LEADS (CRM)
  // ==================================================

  // Busca todos os detalhes de um lead específico (para abrir um Modal de Detalhes)
  buscarPorId: async (id) => {
    try {
      const resposta = await api.get(`/leads/${id}`);
      return resposta.data;
    } catch (erro) {
      console.error(`Erro ao buscar detalhes do lead ${id}:`, erro);
      throw erro;
    }
  },

  // Atualiza os dados de contato do Lead (Nome, WhatsApp, E-mail)
  atualizarLead: async (id, dadosAtualizacao) => {
    try {
      // dadosAtualizacao deve ser um objeto: { nome: "...", whatsapp: "...", email: "..." }
      const resposta = await api.put(`/leads/${id}`, dadosAtualizacao);
      return resposta.data;
    } catch (erro) {
      console.error(`Erro ao atualizar lead ${id}:`, erro);
      throw erro;
    }
  },

  // Busca os dados para alimentar os cards do topo do Dashboard (Totais, Conversão, etc)
  obterMetricas: async () => {
    try {
      const resposta = await api.get('/leads/metricas');
      return resposta.data;
    } catch (erro) {
      console.error("Erro ao obter métricas de leads:", erro);
      throw erro;
    }
  },

  // Registra no banco de dados que o vendedor enviou uma mensagem (Email, WhatsApp) para manter o histórico
  registrarHistoricoMensagem: async (id, dadosMensagem) => {
    try {
      // dadosMensagem deve ser um objeto: { mensagem: "Olá...", tipo: "WHATSAPP" }
      const resposta = await api.post(`/leads/${id}/mensagens`, dadosMensagem);
      return resposta.data; // Provavelmente retorna vazio (201 Created), mas evitamos erro se retornar algo
    } catch (erro) {
      console.error(`Erro ao registrar histórico de mensagem para o lead ${id}:`, erro);
      throw erro;
    }
  }

};