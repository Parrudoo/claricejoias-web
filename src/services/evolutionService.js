import api from './api'; // Sua configuração do Axios

export const evolutionService = {

    // Cria a instância do usuário logado. O backend decide o instanceName (ignora
    // qualquer nome enviado aqui) e vincula automaticamente ao Revendedor dono do token.
    criarInstancia: async () => {
        try {
            const resposta = await api.post('/whatsapp/instances');
            return resposta.data;
        } catch (erro) {
            console.error("Erro ao criar instância do WhatsApp:", erro);
            throw erro;
        }
    },

    // Busca o QR Code em Base64 para conectar o celular.
    // Sem nomeInstancia: age na própria instância do usuário logado (revendedora).
    // Com nomeInstancia: rota admin-only, para o admin conectar a instância de QUALQUER revendedora.
    conectarInstancia: async (nomeInstancia) => {
        try {
            const url = nomeInstancia
                ? `/whatsapp/instances/${nomeInstancia}/connect`
                : `/whatsapp/instances/my-instance/connect`;
            const resposta = await api.get(url);
            return resposta.data;
        } catch (erro) {
            console.error(`Erro ao conectar a instância:`, erro);
            throw erro;
        }
    },

    // Deleta a instância do servidor da Evolution (mesma regra de escopo do conectarInstancia acima).
    deletarInstancia: async (nomeInstancia) => {
        try {
            const url = nomeInstancia
                ? `/whatsapp/instances/${nomeInstancia}`
                : `/whatsapp/instances/my-instance`;
            const resposta = await api.delete(url);
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

    // Lista TODAS as instâncias existentes (admin-only no backend).
    listarInstancias: async () => {
        try {
            const resposta = await api.get('/whatsapp/instances');
            return resposta.data;
        } catch (erro) {
            console.error("Erro ao listar instâncias:", erro);
            throw erro;
        }
    },

    // Lista só a instância do usuário logado (usado na tela "Status da Conexão" da revendedora).
    listarMinhaInstancia: async () => {
        try {
            const resposta = await api.get('/whatsapp/instances/my-instance');
            return resposta.data;
        } catch (erro) {
            console.error("Erro ao buscar minha instância:", erro);
            throw erro;
        }
    },

    // Mesma regra de escopo do conectarInstancia/deletarInstancia acima.
    desconectarInstancia: async (nomeInstancia) => {
        try {
          const url = nomeInstancia
              ? `/whatsapp/instances/${nomeInstancia}/logout`
              : `/whatsapp/instances/my-instance/logout`;
          const resposta = await api.delete(url);
          return resposta.data;
        } catch (erro) {
          console.error(`Erro ao desconectar a instância ${nomeInstancia}:`, erro);
          throw erro;
        }
      },

};