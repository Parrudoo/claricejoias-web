import api from './api';

export const ProdutoService = {
    // Busca todos os produtos (GET /api/produtos)
    listarTodos: async () => {
        const response = await api.get('/produtos');
        return response.data;
    },

    // Busca um produto específico pelo ID (GET /api/produtos/{id})
    buscarPorId: async (id) => {
        const response = await api.get(`/produtos/${id}`);
        return response.data;
    },

    // Cria um novo produto (POST /api/produtos)
    // Atenção: Agora recebe formData em vez de um objeto produto simples
    cadastrar: async (formData) => {
        const response = await api.post('/produtos', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Atualiza os dados de um produto existente (PUT /api/produtos/{id})
    // Atenção: Agora recebe formData em vez de um objeto produto simples
    atualizar: async (id, formData) => {
        const response = await api.put(`/produtos/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Remove um produto do catálogo (DELETE /api/produtos/{id})
    deletar: async (id) => {
        await api.delete(`/produtos/${id}`);
    }
};