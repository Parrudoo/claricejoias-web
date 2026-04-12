import React, { useState, useEffect } from 'react';
import { FiShoppingBag, FiX } from 'react-icons/fi'; // Adicionado FiX para o botão de fechar do modal
import { CardItem } from '../components/CardItem';
import { Menu } from '../components/Menu';
import { useMaleta } from '../context/MaletaContext';
import { CategoriaService } from '../services/CategoriaService';
import './Catalogo.css';

export default function Catalogo() {
    const { adicionarItem, itens, setCarrinhoAberto } = useMaleta();
    const qtdTotal = itens.reduce((acc, curr) => acc + curr.quantidade, 0);

    const [acervo, setAcervo] = useState([]);
    const [loading, setLoading] = useState(true);

    // Novos estados para controlar o Modal de Detalhes (Galeria)
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [fotoDestaque, setFotoDestaque] = useState(null);

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

    const rolarPara = (id) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            const yOffset = -100; 
            const y = elemento.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const dadosMenu = acervo.map(cat => ({
        categoria: cat.nome || cat.categoria, 
        subitens: cat.subcategorias ? cat.subcategorias.map(sub => sub.nome) : []
    }));

    // Funções do Modal de Detalhes
    const abrirDetalhes = (joia) => {
        setProdutoSelecionado(joia);
        setFotoDestaque(joia.imagens && joia.imagens.length > 0 ? joia.imagens[0] : null);
    };

    const fecharDetalhes = () => {
        setProdutoSelecionado(null);
        setFotoDestaque(null);
    };

    if (loading) {
        return (
            <div className="catalogo-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
                <h2 style={{ color: '#D4AF37', fontFamily: 'Playfair Display' }}>Carregando a vitrine... ✨</h2>
            </div>
        );
    }

    return (
        <div className="catalogo-container">
            <Menu categorias={dadosMenu} aoClicarCategoria={rolarPara} />

            <div className="espacador-topo"></div>

            <header className="header-vitrine">
                <h1>Clarice Joias</h1>
                <p>Acessórios de luxo para momentos inesquecíveis.</p>
            </header>

            <main className="vitrine-conteudo">
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
                                        {(sub.produtos || sub.itens || []).map(joia => (
                                            <CardItem
                                                key={joia.id}
                                                joia={joia}
                                                adicionarItem={adicionarItem}
                                                // Passamos a função para o CardItem saber que deve abrir o modal
                                                abrirDetalhes={() => abrirDetalhes(joia)}
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

            {/* =========================================
                MODAL DE DETALHES (GALERIA) MANTIDO SEPARADO
                ========================================= */}
            {produtoSelecionado && (
                <div className="modal-detalhes-overlay" onClick={fecharDetalhes}>
                    <div className="modal-detalhes-card" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-fechar-detalhes" onClick={fecharDetalhes}>
                            <FiX size={24} />
                        </button>

                        <div className="modal-detalhes-content">
                            <div className="galeria-joia">
                                <div className="foto-principal">
                                    {fotoDestaque ? (
                                        <img src={fotoDestaque} alt={produtoSelecionado.nome} />
                                    ) : (
                                        <div className="placeholder-foto">Sem foto</div>
                                    )}
                                </div>

                                {produtoSelecionado.imagens && produtoSelecionado.imagens.length > 1 && (
                                    <div className="lista-miniaturas">
                                        {produtoSelecionado.imagens.map((imgUrl, index) => (
                                            <img 
                                                key={index} 
                                                src={imgUrl} 
                                                alt={`Ângulo ${index + 1}`} 
                                                onClick={() => setFotoDestaque(imgUrl)}
                                                className={`miniatura ${fotoDestaque === imgUrl ? 'selecionada' : ''}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="info-joia-detalhada">
                                <h2>{produtoSelecionado.nome}</h2>
                                <p className="preco-destaque">R$ {produtoSelecionado.preco ? produtoSelecionado.preco.toFixed(2).replace('.', ',') : '0,00'}</p>
                                
                                {produtoSelecionado.material && (
                                    <div className="descricao-box">
                                        <p>{produtoSelecionado.material}</p>
                                    </div>
                                )}

                                <button 
                                    className="btn-add-maleta-modal" 
                                    onClick={() => {
                                        adicionarItem(produtoSelecionado);
                                        fecharDetalhes();
                                    }}
                                >
                                    Adicionar à Maleta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}