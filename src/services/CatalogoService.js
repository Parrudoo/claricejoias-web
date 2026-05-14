import api from './api';

export const CatalogoService = {
    
    // Busca os dados do Revendedor (Nome, foto, etc) pelo slug da URL
    getPerfil: async (slug) => {
        try {
            const response = await api.get(`/catalogo-publico/${slug}/perfil`);
            return response.data; 
        } catch (error) {
            console.error("Erro na API ao buscar perfil do catálogo:", error);
            throw error;
        }
    },

    // Busca os produtos da maleta daquele revendedor específico
    getProdutos: async (slug, page = 0, categoriaId = null) => {
        try {
            let url = `/catalogo-publico/${slug}/produtos?page=${page}&size=50`;
            
            if (categoriaId) {
                url += `&categoriaId=${categoriaId}`;
            }
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error("Erro na API ao buscar produtos do catálogo:", error);
            throw error;
        }
    }
};