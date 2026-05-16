import api from './api';

export const CarrinhoService = {
    // Busca o carrinho atual do visitante ou usuário logado
    obterCarrinho: async () => {
        // O interceptador injeta o ?revendedorId=X automaticamente
        const response = await api.get(`/carrinho`);
        return response.data;
    },

    // Adiciona 1 ou mais itens e retorna o carrinho atualizado
    adicionarItem: async (produtoId, quantidade = 1) => {
        const url = `/carrinho/adicionar/${produtoId}`;
        
        // Passamos 'null' como corpo do POST, e a quantidade nos parâmetros.
        // O interceptador fará o trabalho dele com o revendedorId!
        const response = await api.post(url, null, {
            params: { quantidade: quantidade }
        });
        
        return response.data;
    },

    // Remove a joia do carrinho e retorna atualizado
    removerItem: async (produtoId) => {
        const url = `/carrinho/remover/${produtoId}`;
        
        // O interceptador injeta o ?revendedorId=X automaticamente
        const response = await api.delete(url);
        
        return response.data;
    }
};