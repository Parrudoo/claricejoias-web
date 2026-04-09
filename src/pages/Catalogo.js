import React, { useState, useEffect } from 'react';
import { FiShoppingBag } from 'react-icons/fi';
import { CardItem } from '../components/CardItem';
import { Menu } from '../components/Menu';
import { useMaleta } from '../context/MaletaContext';
import { CategoriaService } from '../services/CategoriaService'; // Ajuste o caminho conforme seu projeto
import './Catalogo.css';

export default function Catalogo() {
    const { adicionarItem, itens, setCarrinhoAberto } = useMaleta();
    const qtdTotal = itens.reduce((acc, curr) => acc + curr.quantidade, 0);

    // Novos estados para a API
    const [acervo, setAcervo] = useState([]);
    const [loading, setLoading] = useState(true);

    // Busca os dados assim que o componente é montado na tela
    useEffect(() => {
        carregarCatalogo();
    }, []);

    const carregarCatalogo = async () => {
        try {
            setLoading(true);
            const dados = await CategoriaService.listarTodas();
            setAcervo(dados);
        } catch (error) {
            console.error("Erro ao buscar o catálogo da API:", error);
            alert("Não foi possível carregar as joias. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };

    // Função para rolar até o ID da categoria ou subcategoria
    const rolarPara = (id) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            // Ajuste de offset para não ficar colado no topo por causa do menu fixo
            const yOffset = -100; 
            const y = elemento.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    // Transforma o acervo recebido da API no formato que o Menu espera
    // Adaptado para usar 'cat.nome' que geralmente é o padrão vindo do banco de dados
    const dadosMenu = acervo.map(cat => ({
        categoria: cat.nome || cat.categoria, 
        subitens: cat.subcategorias ? cat.subcategorias.map(sub => sub.nome) : []
    }));

    if (loading) {
        return (
            <div className="catalogo-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
                <h2 style={{ color: '#D4AF37', fontFamily: 'Playfair Display' }}>Carregando a vitrine... ✨</h2>
            </div>
        );
    }

    return (
        <div className="catalogo-container">
            {/* Passamos o array formatado para o Menu */}
            <Menu categorias={dadosMenu} aoClicarCategoria={rolarPara} />

            <div className="espacador-topo"></div>

            <header className="header-vitrine">
                <h1>Clarice Joias</h1>
                <p>Acessórios de luxo para momentos inesquecíveis.</p>
            </header>

            <main className="vitrine-conteudo">
                {/* Verifica se existem categorias antes de mapear */}
                {acervo.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>Nenhuma peça disponível no momento.</p>
                ) : (
                    acervo.map(cat => (
                        <section key={cat.id || cat.categoria} id={cat.nome || cat.categoria} className="secao-categoria">
                            <h2 className="titulo-categoria">{cat.nome || cat.categoria}</h2>
                            
                            {cat.subcategorias && cat.subcategorias.map(sub => (
                                <div key={sub.id || sub.nome} id={sub.nome} className="container-subcategoria">
                                    <h3 className="titulo-subcategoria">{sub.nome}</h3>
                                    <div className="grid-produtos">
                                        {/* A API pode retornar a lista como 'produtos' ou 'itens', adaptei para aceitar ambos */}
                                        {(sub.produtos || sub.itens || []).map(joia => (
                                            <CardItem
                                                key={joia.id}
                                                joia={joia}
                                                adicionarItem={adicionarItem}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </section>
                    ))
                )}
            </main>

            {itens.length > 0 && (
                <div className="botao-maleta-flutuante" onClick={() => setCarrinhoAberto(true)}>
                    <FiShoppingBag size={28} />
                    <span className="badge-contagem">{qtdTotal}</span>
                </div>
            )}
        </div>
    );
}