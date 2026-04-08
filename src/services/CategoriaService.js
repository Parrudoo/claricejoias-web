import api from './api';

export const CategoriaService = {
    // Busca o acervo completo do banco de dados
    listarTodas: async () => {
        const response = await api.get('/categorias');
        return response.data;
    },

    // Métodos para o painel de administração (se houver)
    cadastrar: async (categoria) => {
        const response = await api.post('/categorias', categoria);
        return response.data;
    },

    atualizar: async (id, categoria) => {
        const response = await api.put(`/categorias/${id}`, categoria);
        return response.data;
    },

    deletar: async (id) => {
        await api.delete(`/categorias/${id}`);
    }
};