import api from './api';

export const CategoriaService = {
    // Busca o acervo completo do banco de dados
    listarTodas: async (slug = null) => {
        try {
            // Se tiver slug, a URL fica: /categorias?slug=karolbarcelar
            // Se não tiver, fica só: /categorias
            const url = slug ? `/categorias?slug=${slug}` : '/categorias';
                
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar as categorias:", error);
            throw error;
        }
    },

    // NOVO: Busca as subcategorias atreladas a uma categoria específica
    listarSubcategoriasPorCategoria: async (id) => {
        const response = await api.get(`/categorias/${id}/subcategorias`);
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