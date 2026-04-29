import api from './api';

export const ArquivoService = {
    // Faz o upload da imagem para o MinIO
    upload: async (arquivo) => {
        const formData = new FormData();
        formData.append('file', arquivo);

        const response = await api.post('/arquivos/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};