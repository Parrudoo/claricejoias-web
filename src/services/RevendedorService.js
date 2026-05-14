import api from './api';

export const RevendedorService = {
    cadastrar: async (dados) => {
        const response = await api.post('/revendedores', dados);
        return response.data;
    },
    listarTodos: async () => {
        const response = await api.get('/revendedores');
        return response.data;
    },
    deletar: async (id) => {
        const response = await api.delete(`/revendedores/${id}`);
        return response.data;
    }
};