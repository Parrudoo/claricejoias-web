import api from './api';

export const ClienteService = {
    // Busca todos os clientes
    listarTodos: async () => {
        const response = await api.get('/clientes');
        return response.data;
    },

    // Busca apenas clientes que estão devendo (fiado pendente)
    listarPendentes: async () => {
        const response = await api.get('/clientes/pendentes');
        return response.data;
    },

    // Registra no banco que o funcionário X fez a cobrança
    registrarCobranca: async (clienteId, nomeFuncionario) => {
        const response = await api.post(`/clientes/${clienteId}/cobranca`, {
            funcionario: nomeFuncionario
        });
        return response.data;
    },

    // Busca os detalhes das compras de um cliente específico
    buscarComprasPorCliente: async (clienteId) => {
        try {
            // Usando a instância 'api' (axios) para manter o padrão e pegar sua URL base automaticamente
            const response = await api.get(`/clientes/${clienteId}/compras`);
            return response.data;
        } catch (error) {
            console.error("Erro na API ao buscar detalhes das compras:", error);
            throw error;
        }
    },

    registrarPagamento: async (clienteId, dadosPagamento) => {
        try {
            const response = await api.post(`/clientes/${clienteId}/pagamentos`, dadosPagamento);
            return response.data;
        } catch (error) {
            console.error("Erro na API ao registrar pagamento:", error);
            throw error;
        }
    }
};