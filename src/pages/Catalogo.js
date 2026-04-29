import React, { useState, useEffect } from 'react';
import { FiShoppingBag, FiX, FiFileText } from 'react-icons/fi';

// Componentes
import { CardItem } from '../components/CardItem';
import { Menu } from '../components/Menu';
import WhatsAppInput from '../components/WhatsAppInput';

// Contexto e Serviços
import { useMaleta } from '../context/MaletaContext';
import { CategoriaService } from '../services/CategoriaService';
import { leadService } from '../services/leadService';
import { BannerService } from '../services/BannerService'; 

// Estilos
import './Catalogo.css';

export default function Catalogo() {
    // Contexto do Carrinho
    const { adicionarItem, itens, setCarrinhoAberto } = useMaleta();
    const qtdTotal = itens.reduce((acc, curr) => acc + curr.quantidade, 0);

    // Estados da Vitrine e Banner
    const [acervo, setAcervo] = useState([]);
    const [bannerDestaque, setBannerDestaque] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estados do Modal de Detalhes da Joia
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [fotoDestaque, setFotoDestaque] = useState(null);

    // Estados de Captura de Lead (Guia de Medidas)
    const [mostrarBotaoGuia, setMostrarBotaoGuia] = useState(false);
    const [modalGuiaAberto, setModalGuiaAberto] = useState(false);
    const [dadosLead, setDadosLead] = useState({ nome: '', whatsapp: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // URL Base para buscar a imagem do Banner no MinIO
    const API_BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        carregarDadosVitrine();

        // Temporizador de 15 segundos para exibir o botão flutuante de captura de leads
        const timer = setTimeout(async () => {
            try {
                const deveMostrar = await leadService.verificarStatusGuia();
                if (deveMostrar) {
                    setMostrarBotaoGuia(true);
                }
            } catch (error) {
                console.error("Erro ao verificar status do visitante:", error);
                setMostrarBotaoGuia(true);
            }
        }, 15000);

        return () => clearTimeout(timer);
    }, []);

    // Busca as Categorias e o Banner de forma independente (Fix Aplicado!)
    const carregarDadosVitrine = async () => {
        setLoading(true);

        // 1º PASSO: BUSCAR AS JOIAS (Prioridade máxima)
        try {
            const dadosCategorias = await CategoriaService.listarTodas();
            setAcervo(dadosCategorias);
        } catch (error) {
            console.error("Erro ao buscar as joias da vitrine:", error);
            alert("Não foi possível carregar as joias. Tente novamente mais tarde.");
        }

        // 2º PASSO: BUSCAR O BANNER (Independente das joias)
        try {
            const dadosBanners = await BannerService.listarAtivos();
            if (dadosBanners && dadosBanners.length > 0) {
                setBannerDestaque(dadosBanners[0]);
            }
        } catch (error) {
            console.error("Erro silencioso ao carregar o banner:", error);
            // Se falhar, usará o fundo preto padrão silenciosamente
        }

        setLoading(false);
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
            await leadService.registrarLead(dadosLead);

            const link = document.createElement('a');
            link.href = '/guia-medidas.pdf';
            link.download = 'Guia_Medidas_Clarice_Joias.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

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

    // Define a imagem do banner: usa a do banco (MinIO) se tiver, senão usa uma imagem padrão/fundo preto
    const backgroundUrl = bannerDestaque 
        ? `${API_BASE_URL}/api/arquivos/view/${bannerDestaque.objectName}`
        : 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop';

    return (
        <div className="catalogo-container">
            <Menu categorias={dadosMenu} aoClicarCategoria={rolarPara} />
            <div className="espacador-topo"></div>

            {/* BANNER DINÂMICO GERENCIÁVEL */}
            <section 
                className="banner-destaque"
                style={{ 
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('${backgroundUrl}')` 
                }}
            >
                <div className="banner-conteudo">
                    <h2>{bannerDestaque ? bannerDestaque.titulo : "Nova Coleção Elegance"}</h2>
                    <p>Descubra peças exclusivas para momentos inesquecíveis.</p>
                    <button 
                        className="btn-banner" 
                        onClick={() => {
                            if (bannerDestaque && bannerDestaque.linkAcao) {
                                window.location.href = bannerDestaque.linkAcao;
                            } else {
                                rolarPara(acervo[0]?.nome || acervo[0]?.categoria);
                            }
                        }}
                    >
                        Ver Novidades
                    </button>
                </div>
            </section>

            {/* VITRINE DE JOIAS */}
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

            {/* BOTÃO FLUTUANTE DO CARRINHO */}
            {itens.length > 0 && (
                <div className="botao-maleta-flutuante" onClick={() => setCarrinhoAberto(true)}>
                    <FiShoppingBag size={28} />
                    <span className="badge-contagem">{qtdTotal}</span>
                </div>
            )}

            {/* BOTÃO FLUTUANTE DA CAPTURA DE LEADS (GUIA DE MEDIDAS) */}
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

            {/* MODAL DE CAPTURA DE LEADS (GUIA DE MEDIDAS) */}
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
                                <WhatsAppInput
                                    value={dadosLead.whatsapp}
                                    onChange={(valorMascarado) => setDadosLead({ ...dadosLead, whatsapp: valorMascarado })}
                                />
                                <button type="submit" className="btn-baixar-guia" disabled={isSubmitting}>
                                    {isSubmitting ? 'Processando...' : 'Baixar Guia Grátis'}
                                </button>
                            </form>
                            <span className="lead-spam-aviso">Prometemos não enviar spam.</span>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE DETALHES DA JOIA (GALERIA E COMPRA) */}
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