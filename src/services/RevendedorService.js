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
    },

    getMeuPerfil: async () => {
        try {
            // O backend deve pegar o ID do usuário direto do Token JWT
            const response = await api.get('/revendedores/meu-perfil');
            return response.data; 
        } catch (error) {
            console.error("Erro ao buscar meu perfil de revendedora:", error);
            throw error;
        }
    }
};