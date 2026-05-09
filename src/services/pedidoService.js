import api from './api';

export const PedidoService = {
    // Registra uma nova venda vinda do PDV
    registrar: async (venda) => {
        const response = await api.post('/pedidos/pdv', venda);
        return response.data;
    },

    // Busca o histórico de todas as vendas cadastradas no sistema (Admin)
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

        const response = await api.get('/pedidos', { params });
        return response.data;
    },

    // NOVO: Busca os pedidos apenas do cliente logado (Minha Conta)
    listarMeusPedidos: async (page = 0) => {
        const params = {
            page: page,
            size: 10, // Traz de 10 em 10 para o cliente
            sort: 'id,desc'
        };
        const response = await api.get('/pedidos/meus-pedidos', { params });
        return response.data;
    },

    // Caso futuramente você crie no backend a rota de buscar por ID
    buscarPorId: async (id) => {
        const response = await api.get(`/pedidos/${id}`);
        return response.data;
    }
};