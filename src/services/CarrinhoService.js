import api from './api';

export const CarrinhoService = {
    // Busca o carrinho atual do visitante ou usuário logado
    obterCarrinho: async () => {
        const response = await api.get('/carrinho');
        return response.data;
    },

    // Adiciona 1 ou mais itens e retorna o carrinho atualizado
    adicionarItem: async (produtoId, quantidade = 1) => {
        const response = await api.post(`/carrinho/adicionar/${produtoId}?quantidade=${quantidade}`);
        return response.data;
    },

    // Remove a joia do carrinho e retorna atualizado
    removerItem: async (produtoId) => {
        const response = await api.delete(`/carrinho/remover/${produtoId}`);
        return response.data;
    }
};