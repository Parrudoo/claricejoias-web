import { useState, useEffect } from 'react';
import { CatalogoService } from '../services/CatalogoService';
import { ProdutoService } from '../services/ProdutoService';


export function useCatalogo(slug) {
    const [produtos, setProdutos] = useState([]);
    const [perfilRevendedor, setPerfilRevendedor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        carregarDados();
    }, [slug]); // Se o slug mudar, recarrega a página

    const carregarDados = async () => {
        setLoading(true);
        setErro('');
        try {
            if (slug) {
                // É CATÁLOGO DE REVENDEDORA
                const [resPerfil, resProdutos] = await Promise.all([
                    CatalogoService.getPerfil(slug),
                    CatalogoService.getProdutos(slug, 0)
                ]);
                
                setPerfilRevendedor(resPerfil.data);
                setProdutos(resProdutos.data.content);
                
                // Grava para o Checkout saber de quem é a venda!
                localStorage.setItem('revendedorIdAtivo', resPerfil.data.id);
            } else {
                // É CATÁLOGO DA LOJA MATRIZ (Home)
                const res = await ProdutoService.listarTodos(0); // Sua chamada de API padrão
                setProdutos(res.data.content || res.data);
                setPerfilRevendedor(null); // Loja padrão
                
                // Limpa caso existisse um revendedor anterior na sessão
                localStorage.removeItem('revendedorIdAtivo');
            }
        } catch (err) {
            console.error("Erro ao carregar catálogo", err);
            setErro('Não foi possível carregar os produtos no momento.');
        } finally {
            setLoading(false);
        }
    };

    return { produtos, perfilRevendedor, loading, erro };
}