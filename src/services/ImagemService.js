import api from './api';

export const ImagemService = {
    /**
     * Retorna a URL completa da imagem para ser usada na tag <img src={...} />
     * @param {string} caminho - Nome do arquivo ou caminho salvo no banco
     * @returns {string} URL completa
     */
    getUrl: (caminho) => {
      
        if (!caminho) return 'https://via.placeholder.com/300x300?text=Sem+Foto';
        if (caminho.startsWith('http')) return caminho;
        let baseUrl = api.defaults.baseURL || 'http://localhost:8080/api';
        
        return `${baseUrl}/arquivos/view/${caminho}`;
    }
};