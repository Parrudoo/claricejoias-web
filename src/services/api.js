import axios from 'axios';
import { toast } from 'react-toastify';
import keycloak from '../config/keycloak'; // Importe a instância do Keycloak que configuramos

const api = axios.create({
    // Ajustado para a porta 8082 conforme sua configuração do Docker
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
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
    (response) => {
        // Se deu Status 200 ou 201 (Sucesso), apenas deixa passar
        return response;
    },
    (error) => {
        // Se deu ERRO (400, 401, 500...), o axios cai aqui ANTES de chegar na sua tela

        if (error.response && error.response.data && error.response.data.erro) {
            // Pega a mensagem lá do nosso 'StandardError' do Spring e mostra um Toast Vermelho!
            toast.error(error.response.data.erro);
        } else {
            // Se a API estiver fora do ar ou der um erro desconhecido
            toast.error("Ocorreu um erro de comunicação com o servidor.");
        }

        // Repassa o erro para frente apenas para a tela saber que tem que interromper o fluxo
        return Promise.reject(error);
    }
);

export default api;