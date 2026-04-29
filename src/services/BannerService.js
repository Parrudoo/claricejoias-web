import api from './api';

export const BannerService = {
    // Busca os banners ativos para a Home do cliente
    listarAtivos: async () => {
        const response = await api.get('/banners/ativos');
        return response.data;
    },

    // Lista todos os banners (para uma futura tabela no painel Admin)
    listarTodos: async () => {
        const response = await api.get('/banners');
        return response.data;
    },

    // Salva o novo banner no banco
    criarBanner: async (bannerData) => {
        const response = await api.post('/banners', bannerData);
        return response.data;
    },

    // Ativa ou desativa um banner
    alternarStatus: async (id) => {
        const response = await api.put(`/banners/${id}/status`);
        return response.data;
    },

    // Deleta o banner
    deletar: async (id) => {
        const response = await api.delete(`/banners/${id}`);
        return response.data;
    }
};