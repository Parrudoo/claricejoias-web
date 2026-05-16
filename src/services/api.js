import axios from 'axios';
import { toast } from 'react-toastify';
import keycloak from '../config/keycloak';
import { v4 as uuidv4 } from 'uuid'; // IMPORT ADICIONADO AQUI

// =======================================================================
// 1. GERA OU RECUPERA O ID DO VISITANTE (CARRINHO ANÔNIMO)
// =======================================================================
let visitorId = localStorage.getItem('visitor_id');
if (!visitorId) {
    // Se for a primeira vez da pessoa no site, gera um código único pra ela
    // FUNÇÃO TROCADA AQUI PARA FUNCIONAR SEM HTTPS
    visitorId = uuidv4(); 
    localStorage.setItem('visitor_id', visitorId);
}

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// =======================================================================
// INTERCEPTOR DE REQUISIÇÃO
// =======================================================================
api.interceptors.request.use(
    async (config) => {
        // 1. INJETA O ID DO VISITANTE
        config.headers['X-Visitor-ID'] = visitorId;

        // 2. INJETA O REVENDEDOR NA URL EM TODAS AS REQUISIÇÕES (GET, POST, DELETE, etc.)
        const revendedorId = localStorage.getItem('revendedorIdAtivo');
        if (revendedorId) {
            config.params = {
                ...config.params,
                revendedorId: revendedorId
            };
        }

        // 3. INJETA O TOKEN DO KEYCLOAK
        if (keycloak.authenticated) {
            try {
                await keycloak.updateToken(30);
                config.headers.Authorization = `Bearer ${keycloak.token}`;
            } catch (error) {
                console.error("Falha ao atualizar o token do Keycloak:", error);
                keycloak.login();
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// =======================================================================
// INTERCEPTOR DE RESPOSTA (Trata os erros que vêm do Spring Boot)
// =======================================================================
api.interceptors.response.use(
    (response) => {
        // Se deu Status 200 ou 201 (Sucesso), apenas deixa passar
        return response;
    },
    (error) => {
        // Tenta extrair a mensagem de vários lugares possíveis que o Spring Boot pode mandar
        const mensagemBackend = error.response?.data?.message
            || error.response?.data?.erro
            || (typeof error.response?.data === 'string' ? error.response.data : null);
            
        if (mensagemBackend) {
            // Se achou a mensagem do Java, mostra ela num Toast!
            toast.error(mensagemBackend);
        } else {
            // Se não achou nada (ex: API caiu, banco offline), mostra a genérica
            toast.error("Ocorreu um erro de comunicação com o servidor.");
        }

        // Repassa o erro para frente apenas para a tela saber que tem que interromper o fluxo (como parar um botão de 'Carregando')
        return Promise.reject(error);
    }
);

export default api;