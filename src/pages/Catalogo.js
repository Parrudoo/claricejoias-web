import React, { useState, useEffect } from 'react';
import { FiShoppingBag, FiX, FiDownload, FiFileText } from 'react-icons/fi';
import { CardItem } from '../components/CardItem';
import InputMask from 'react-input-mask';
import { Menu } from '../components/Menu';
import { useMaleta } from '../context/MaletaContext';
import { CategoriaService } from '../services/CategoriaService';
import { VisitanteService } from '../services/VisitanteService'; // 👈 Importamos o novo Service
import './Catalogo.css';

export default function Catalogo() {
    const { adicionarItem, itens, setCarrinhoAberto } = useMaleta();
    const qtdTotal = itens.reduce((acc, curr) => acc + curr.quantidade, 0);

    const [acervo, setAcervo] = useState([]);
    const [loading, setLoading] = useState(true);

    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [fotoDestaque, setFotoDestaque] = useState(null);

    const [mostrarBotaoGuia, setMostrarBotaoGuia] = useState(false);
    const [modalGuiaAberto, setModalGuiaAberto] = useState(false);
    const [dadosLead, setDadosLead] = useState({ nome: '', whatsapp: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        carregarCatalogo();

        // Temporizador de 15 segundos para exibir o botão flutuante
        const timer = setTimeout(async () => {
            try {
                // Pergunta ao Java se este crachá (Cookie) já baixou o material
                const deveMostrar = await VisitanteService.verificarStatusGuia();

                if (deveMostrar) {
                    setMostrarBotaoGuia(true);
                }
            } catch (error) {
                console.error("Erro ao verificar status do visitante:", error);
                // Por segurança de marketing, se falhar a API, a gente mostra o botão
                setMostrarBotaoGuia(true);
            }
        }, 15000);

        return () => clearTimeout(timer);
    }, []);

    const carregarCatalogo = async () => {
        try {
            setLoading(true);
            const dados = await CategoriaService.listarTodas();
            setAcervo(dados);
        } catch (error) {
            console.error("Erro ao buscar o catálogo:", error);
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

    // Adicione esta função fora ou dentro do seu componente Catalogo
    const aplicarMascaraWhatsapp = (value) => {
        if (!value) return "";
        return value
            .replace(/\D/g, "") // Remove tudo que não é número
            .replace(/(\d{2})(\d)/, "($1) $2") // Coloca parênteses no DDD
            .replace(/(\d{5})(\d)/, "$1-$2") // Coloca o hífen no número
            .replace(/(-\d{4})\d+?$/, "$1"); // Limpa números extras
    };
    const abrirDetalhes = (joia) => {
        setProdutoSelecionado(joia);
        setFotoDestaque(joia.imagens && joia.imagens.length > 0 ? joia.imagens[0] : null);
    };

    const fecharDetalhes = () => {
        setProdutoSelecionado(null);
        setFotoDestaque(null);
    };

    const handleBaixarGuia = async (e) => {
        e.preventDefault();

        // Regex para validar: (99) 99999-9999
        const regexWhatsapp = /^\(\d{2}\)\s\d{5}-\d{4}$/;

        if (!regexWhatsapp.test(dadosLead.whatsapp)) {
            alert("Por favor, insira um número de WhatsApp válido com DDD: (00) 00000-0000");
            return;
        }

        if (!dadosLead.nome) {
            alert("Por favor, preencha seu nome.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Manda para o Java salvar no banco (O Java vai ler o cookie automaticamente)
            await VisitanteService.registrarLead(dadosLead);

            // Inicia o download do PDF
            const link = document.createElement('a');
            link.href = '/guia-medidas.pdf';
            link.download = 'Guia_Medidas_Clarice_Joias.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Esconde tudo
            setModalGuiaAberto(false);
            setMostrarBotaoGuia(false);

            alert("Download iniciado! Em breve te chamaremos no WhatsApp com novidades.");

        } catch (error) {
            console.error("Erro ao processar captura:", error);
            alert("Ocorreu um erro ao gerar seu arquivo. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
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

            <section className="banner-destaque">
                <div className="banner-conteudo">
                    <h2>Nova Coleção Elegance</h2>
                    <p>Descubra peças exclusivas com até 15% de desconto.</p>
                    <button className="btn-banner" onClick={() => rolarPara(acervo[0]?.nome || acervo[0]?.categoria)}>
                        Ver Novidades
                    </button>
                </div>
            </section>
            {/* <header className="header-vitrine">
                <h1>Clarice Joias</h1>
                <p>Acessórios de luxo para momentos inesquecíveis.</p>
            </header> */}

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

            {/* CARRINHO */}
            {itens.length > 0 && (
                <div className="botao-maleta-flutuante" onClick={() => setCarrinhoAberto(true)}>
                    <FiShoppingBag size={28} />
                    <span className="badge-contagem">{qtdTotal}</span>
                </div>
            )}

            {/* BOTÃO GUIA */}
            {mostrarBotaoGuia && !modalGuiaAberto && (
                <div
                    className="botao-guia-flutuante"
                    onClick={() => setModalGuiaAberto(true)}
                    title="Baixar Guia de Medidas"
                >
                    <div className="guia-icone-container">
                        <FiFileText size={24} />
                    </div>
                    <span className="guia-texto">Descubra seu tamanho!</span>
                </div>
            )}

            {/* MODAL LEAD */}
            {modalGuiaAberto && (
                <div className="modal-detalhes-overlay" onClick={() => setModalGuiaAberto(false)}>
                    <div className="modal-lead-card" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-fechar-detalhes" onClick={() => setModalGuiaAberto(false)}>
                            <FiX size={24} />
                        </button>

                        <div className="modal-lead-content">
                            <h3 className="lead-titulo">Não sabe o tamanho do seu anel? 💍</h3>
                            <p className="lead-subtitulo">
                                Baixe agora nosso <strong>Guia Prático de Medidas</strong> e descubra o tamanho ideal sem sair de casa!
                            </p>

                            <form onSubmit={handleBaixarGuia} className="form-lead">
                                <div className="input-group">
                                    <label>Como podemos te chamar?</label>
                                    <input
                                        type="text"
                                        placeholder="Seu nome"
                                        required
                                        value={dadosLead.nome}
                                        onChange={e => setDadosLead({ ...dadosLead, nome: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Seu melhor WhatsApp</label>
                                    <input
                                        type="tel"
                                        placeholder="(00) 00000-0000"
                                        required
                                        value={dadosLead.whatsapp}
                                        onChange={e => setDadosLead({ ...dadosLead, whatsapp: aplicarMascaraWhatsapp(e.target.value) })}
                                    />
                                </div>
                                <button type="submit" className="btn-baixar-guia" disabled={isSubmitting}>
                                    {isSubmitting ? 'Processando...' : 'Baixar Guia Grátis'}
                                </button>
                            </form>
                            <span className="lead-spam-aviso">Prometemos não enviar spam.</span>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL GALERIA DA JOIA */}
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
                                        adicionarItem({
                                            ...produtoSelecionado,
                                            imagemSelecionada: fotoDestaque
                                        });
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