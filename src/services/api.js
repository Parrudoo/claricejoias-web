import axios from 'axios';
import keycloak from '../config/keycloak'; // Importe a instância do Keycloak que configuramos

const api = axios.create({
    // Ajustado para a porta 8082 conforme sua configuração do Docker
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8082',
    headers: {
        'Content-Type': 'application/json',
    }
});

/**
 * INTERCEPTOR DE REQUISIÇÃO
 * Garante que toda chamada para o backend leve o token mais recente.
 */
api.interceptors.request.use(
    async (config) => {
        if (keycloak.authenticated) {
            try {
                // Atualiza o token se ele expirar nos próximos 30 segundos
                await keycloak.updateToken(30);
                
                // Injeta o token no cabeçalho Authorization
                config.headers.Authorization = `Bearer ${keycloak.token}`;
            } catch (error) {
                console.error("Falha ao atualizar o token do Keycloak:", error);
                // Opcional: Forçar logout ou redirecionar para login se o refresh falhar
                keycloak.login();
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * INTERCEPTOR DE RESPOSTA
 * Útil para capturar erros globais (como 401 ou 403)
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Se o backend retornar 401 (Não autorizado), o token pode ter invalidado
            if (error.response.status === 401) {
                console.warn("Sessão expirada ou não autorizada. Redirecionando...");
                keycloak.login();
            }
        }
        console.error("Erro na comunicação com a API:", error.message);
        return Promise.reject(error);
    }
);

export default api;