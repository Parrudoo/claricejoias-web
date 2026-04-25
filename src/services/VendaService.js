import api from './api';

export const VendaService = {
    // Registra uma nova venda vinda do PDV
    registrar: async (venda) => {
        const response = await api.post('/vendas', venda);
        return response.data;
    },

    // Busca o histórico de todas as vendas cadastradas no sistema
    listarTodas: async () => {
        const response = await api.get('/vendas');
        return response.data;
    },

    // Caso futuramente você crie no backend a rota de buscar por ID
    buscarPorId: async (id) => {
        const response = await api.get(`/vendas/${id}`);
        return response.data;
    }
};