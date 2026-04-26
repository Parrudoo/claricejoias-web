import axios from 'axios';
import { toast } from 'react-toastify';
import keycloak from '../config/keycloak'; // Importe a instância do Keycloak que configuramos

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    withCredentials: true,
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
        console.log(response.data)
        return response;
    },
    (error) => {
        // 1. Tenta extrair a mensagem de vários lugares possíveis que o Spring Boot pode mandar
        const mensagemBackend = error.response?.data?.message
            || error.response?.data?.erro
            || (typeof error.response?.data === 'string' ? error.response.data : null);
        if (mensagemBackend) {
            // Se achou a mensagem do Java, mostra ela!
            toast.error(mensagemBackend);
        } else {
            // Se não achou nada (ex: API caiu, erro 500 sem tratamento), mostra a genérica
            toast.error("Ocorreu um erro de comunicação com o servidor.");
        }

        // Repassa o erro para frente apenas para a tela saber que tem que interromper o fluxo
        return Promise.reject(error);
    }
);

export default api;