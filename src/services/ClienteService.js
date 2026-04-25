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
    }
};