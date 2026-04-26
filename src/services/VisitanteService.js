import api from './api';

export const VisitanteService = {
    // Pergunta ao backend se este visitante já baixou o guia (Baseado no cookie HttpOnly)
    verificarStatusGuia: async () => {
        const response = await api.get('/visitantes/status-guia');
        return response.data; // Retorna true (deve mostrar) ou false (já baixou)
    },

    // Envia os dados do formulário para virar um Lead no banco
    registrarLead: async (dadosLead) => {
        const response = await api.post('/visitantes/registrar-lead', dadosLead);
        return response.data;
    }
};