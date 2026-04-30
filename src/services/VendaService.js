import api from './api';

export const VendaService = {
    // Registra uma nova venda vinda do PDV
    registrar: async (venda) => {
        const response = await api.post('/vendas', venda);
        return response.data;
    },

    // Busca o histórico de todas as vendas cadastradas no sistema
   listarTodas: async (page = 0, filtros = {}) => {
        const params = {
            page: page,
            size: 20, 
            sort: 'id,desc'
        };

        if (filtros.loginOperador) params.loginOperador = filtros.loginOperador;
        if (filtros.metodoPagamento) params.metodoPagamento = filtros.metodoPagamento;
        if (filtros.dataInicio) params.dataInicio = filtros.dataInicio; 
        if (filtros.dataFim) params.dataFim = filtros.dataFim;

        const response = await api.get('/vendas', { params });
        return response.data;
    },

    // Caso futuramente você crie no backend a rota de buscar por ID
    buscarPorId: async (id) => {
        const response = await api.get(`/vendas/${id}`);
        return response.data;
    }
};