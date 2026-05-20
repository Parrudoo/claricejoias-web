import api from './api';

export const ClienteService = {
    // Busca todos os clientes
    listarTodos: async (page = 0, size = 10) => {
        try {
            const response = await api.get(`/clientes?page=${page}&size=${size}`);
            return response.data; // Retorna o objeto Page completo
        } catch (error) {
            console.error("Erro ao listar todos os clientes:", error);
            throw error;
        }
    },

    obterMeuPerfil: async () => {
        const response = await api.get('/clientes/me');
        return response.data;
    },

    // Busca apenas clientes que estão devendo (fiado pendente)
    listarPendentes: async (page = 0, size = 10) => {
        try {
            const response = await api.get(`/clientes/pendentes?page=${page}&size=${size}`);
            return response.data; // Retorna o objeto Page completo
        } catch (error) {
            console.error("Erro ao listar clientes pendentes:", error);
            throw error;
        }
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
    },

    listarMeusClientes: async () => {
        const response = await api.get(`/clientes/revendedor`);
        return response.data;
    }
};