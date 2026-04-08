import axios from 'axios';

// Cria uma instância do axios com configurações padrão
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor: Útil para tratamento global de erros ou loading no futuro
api.interceptors.response.use(
    response => response,
    error => {
        console.error("Erro na comunicação com a API:", error);
        return Promise.reject(error);
    }
);

export default api;