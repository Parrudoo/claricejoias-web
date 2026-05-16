import api from './api';

export const CarrinhoService = {
    // Busca o carrinho atual do visitante ou usuário logado
    obterCarrinho: async () => {
        const response = await api.get('/carrinho');
        return response.data;
    },

    // Adiciona 1 ou mais itens e retorna o carrinho atualizado
  adicionarItem: async (produtoId, quantidade = 1, revendedorId = null) => {
    // 1. Monta a URL básica
    let url = `/carrinho/adicionar/${produtoId}?quantidade=${quantidade}`;
    
    // 2. Se houver uma revendedora, adiciona o parâmetro na URL
    if (revendedorId) {
        url += `&revendedorId=${revendedorId}`;
    }

    // ==========================================
    // 🔍 PRINT DA URL DO CARRINHO (VEJA NO CONSOLE DO F12)
    // ==========================================
    console.log("🚀 URL ENVIADA PARA O AXIOS:", url);
    console.log("📌 ID DO REVENDEDOR PASSADO:", revendedorId);
    // ==========================================

    // 3. Faz o post passando o corpo vazio
    const response = await api.post(url, {});
    return response.data;
},

    // Remove a joia do carrinho e retorna atualizado
    removerItem: async (produtoId) => {
        const response = await api.delete(`/carrinho/remover/${produtoId}`);
        return response.data;
    }
};