import api from './api';

export const FinanceiroService = {
    // Busca o resumo financeiro daquele mês específico
    obterAcertoMensal: async (revendedorId, mes, ano) => {
        try {
            // Usa o params do axios para montar a URL: ?mes=5&ano=2026
            const response = await api.get(`/revendedores/${revendedorId}/acerto`, {
                params: { mes, ano }
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar acerto financeiro:", error);
            throw error;
        }
    }
};