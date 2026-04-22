// Importe a sua classe/configuração de API apontando para o caminho correto
import api from './api'; 

export const leadService = {
  
  // Função atualizada para receber o objeto completo do Checkout
  // Esse objeto (dadosCheckout) agora contém: nome, whatsapp, email, criarConta, senha e itens
  salvar: async (dadosCheckout) => {
    try {
      // Usando a sua classe de API (exemplo com padrão Axios)
      // DICA: Se você for usar a rota que combinamos no Spring Security, 
      // talvez precise mudar de '/leads' para '/pedidos/checkout' dependendo de como criou no backend.
      const resposta = await api.post('/leads', dadosCheckout);

      return resposta.data; 
    } catch (erro) {
      console.error("Erro no leadService:", erro);
      throw erro;
    }
  },

  listarTodos: async () => {
    try {
      const resposta = await api.get('/leads');
      return resposta.data;
    } catch (erro) {
      console.error("Erro ao listar leads:", erro);
      throw erro;
    }
  }
};