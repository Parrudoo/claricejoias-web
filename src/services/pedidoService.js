import api from './api';

export const pedidoService = {
    
    // Busca o histórico de pedidos do cliente.
    // O X-Visitor-ID e o Token JWT já são injetados automaticamente pelo interceptor do api.js!
    buscarMeusPedidos: async () => {
        try {
            const response = await api.get('/pedidos/meus-pedidos');
            return response.data;
        } catch (error) {
            console.error("Erro na API ao buscar meus pedidos:", error);
            throw error;
        }
    },

    // Busca os detalhes de um pedido específico
    buscarPorId: async (pedidoId) => {
        try {
            const response = await api.get(`/pedidos/${pedidoId}`);
            return response.data;
        } catch (error) {
            console.error("Erro na API ao buscar o pedido:", error);
            throw error;
        }
    },

    // ==========================================================
    // MÉTODOS PARA O PAINEL DE ADMINISTRAÇÃO (Sua Vendedora)
    // ==========================================================

    // Lista todos os pedidos da loja
    listarTodos: async () => {
        try {
            const response = await api.get('/pedidos');
            return response.data;
        } catch (error) {
            console.error("Erro na API ao listar todos os pedidos:", error);
            throw error;
        }
    },

    // Atualiza o status do pedido (ex: de AGUARDANDO_WHATSAPP para CONCLUIDO)
    atualizarStatus: async (pedidoId, novoStatus) => {
        try {
            const response = await api.put(`/pedidos/${pedidoId}/status`, { statusPedido: novoStatus });
            return response.data;
        } catch (error) {
            console.error(`Erro na API ao atualizar status do pedido ${pedidoId}:`, error);
            throw error;
        }
    }
};