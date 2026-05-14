import api from './api';

export const EstoqueRevendedorService = {
    transferir: async (dados) => {
        const response = await api.post('/estoque-revendedor/transferir', dados);
        return response.data;
    },
    listarMaleta: async (revendedorId) => {
        const response = await api.get(`/estoque-revendedor/maleta/${revendedorId}`);
        return response.data;
    }
};