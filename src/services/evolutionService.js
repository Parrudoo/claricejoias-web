import api from './api'; // Sua configuração do Axios

export const evolutionService = {

    // Cria uma nova instância na Evolution API
    criarInstancia: async (dadosInstancia) => {
        try {
            // dadosInstancia deve conter: { instanceName, token, qrcode, integration, webhook }
            const resposta = await api.post('/whatsapp/instances', dadosInstancia);
            return resposta.data;
        } catch (erro) {
            console.error("Erro ao criar instância do WhatsApp:", erro);
            throw erro;
        }
    },

    // Busca o QR Code em Base64 para conectar o celular
    conectarInstancia: async () => {
        try {
            const resposta = await api.get(`/whatsapp/instances/my-instance/connect`);
            return resposta.data;
        } catch (erro) {
            console.error(`Erro ao conectar a instância:`, erro);
            throw erro;
        }
    },

    // Deleta a instância do servidor da Evolution
    deletarInstancia: async () => {
        try {
            const resposta = await api.delete(`/whatsapp/instances/my-instance`);
            return resposta.data;
        } catch (erro) {
            console.error(`Erro ao deletar a instância`, erro);
            throw erro;
        }
    },

    // Configura a URL de Webhook para receber mensagens e status
    configurarWebhook: async (nomeInstancia, dadosWebhook) => {
        try {
            const resposta = await api.post(`/whatsapp/instances/${nomeInstancia}/webhook`, dadosWebhook);
            return resposta.data;
        } catch (erro) {
            console.error(`Erro ao configurar webhook da instância ${nomeInstancia}:`, erro);
            throw erro;
        }
    },

    // Lista todas as instâncias existentes no servidor da Evolution
    listarInstancias: async () => {
        try {
            const resposta = await api.get('/whatsapp/instances');
            return resposta.data;
        } catch (erro) {
            console.error("Erro ao listar instâncias:", erro);
            throw erro;
        }
    },

    desconectarInstancia: async (nomeInstancia) => {
        try {
          // Ajuste a URL se não estiver usando /api no baseURL do axios
          const resposta = await api.delete(`/whatsapp/instances/my-instance/logout`);
          return resposta.data;
        } catch (erro) {
          console.error(`Erro ao desconectar a instância ${nomeInstancia}:`, erro);
          throw erro;
        }
      },

};