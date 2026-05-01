import React, { useState, useEffect } from 'react';
import { 
    FiShoppingBag, FiX, FiFileText, FiChevronLeft, 
    FiChevronRight, FiMaximize2 
} from 'react-icons/fi';

// Componentes
import { CardItem } from '../components/CardItem';
import { Menu } from '../components/Menu';
import WhatsAppInput from '../components/WhatsAppInput';
import MedidorDeAnel from './MedidorDeAnel';

// Contexto e Serviços
import { useMaleta } from '../context/MaletaContext';
import { CategoriaService } from '../services/CategoriaService';
import { leadService } from '../services/leadService';
import { BannerService } from '../services/BannerService'; 

// Estilos
import './Catalogo.css';

export default function Catalogo() {
    const { adicionarItem, itens, setCarrinhoAberto } = useMaleta();
    const qtdTotal = itens.reduce((acc, curr) => acc + curr.quantidade, 0);

    const [acervo, setAcervo] = useState([]);
    const [bannersAtivos, setBannersAtivos] = useState([]);
    const [indiceBanner, setIndiceBanner] = useState(0);
    const [loading, setLoading] = useState(true);

    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [fotoDestaque, setFotoDestaque] = useState(null);

    const [modalGuiaAberto, setModalGuiaAberto] = useState(false);
    const [dadosLead, setDadosLead] = useState({ nome: '', whatsapp: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // 👇 Novos estados do Medidor
    const [mostrarMedidor, setMostrarMedidor] = useState(false);
    const [visitanteJaEhLead, setVisitanteJaEhLead] = useState(false);

    const API_BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        carregarDadosVitrine();
        checarStatusLead();
    }, []);

    // 👇 Nova função para checar se já libera o medidor direto
    const checarStatusLead = async () => {
        try {
            const deveMostrarForm = await leadService.verificarStatusGuia();
            if (!deveMostrarForm) {
                setVisitanteJaEhLead(true);
                setMostrarMedidor(true); 
            }
        } catch (error) {
            console.error("Erro ao verificar status do visitante:", error);
        }
    };

    // Efeito para o Carrossel (reinicia o timer se o usuário clicar na seta)
    useEffect(() => {
        if (bannersAtivos.length <= 1) return;

        const timerSlide = setInterval(() => {
            proximoBanner();
        }, 5000); 

        return () => clearInterval(timerSlide);
    }, [bannersAtivos, indiceBanner]);

    const carregarDadosVitrine = async () => {
        setLoading(true);
        try {
            const dadosCategorias = await CategoriaService.listarTodas();
            setAcervo(dadosCategorias);
        } catch (error) {
            console.error("Erro ao buscar as joias da vitrine:", error);
        }

        try {
            const dadosBanners = await BannerService.listarAtivos();
            if (dadosBanners && dadosBanners.length > 0) {
                setBannersAtivos(dadosBanners);
            }
        } catch (error) {
            console.error("Erro ao carregar o banner:", error);
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

    // 👇 Função Atualizada: Abre o Medidor em vez do PDF
    const handleCapturaLead = async (e) => {
        e.preventDefault();
        const regexWhatsapp = /^\(\d{2}\)\s\d{5}-\d{4}$/;
        if (!regexWhatsapp.test(dadosLead.whatsapp)) return alert("WhatsApp inválido!");
        if (!dadosLead.nome) return alert("Preencha seu nome.");

        setIsSubmitting(true);
        try {
            await leadService.registrarLead(dadosLead);
            setVisitanteJaEhLead(true);
            setMostrarMedidor(true);
        } catch (error) {
            console.error("Erro ao processar captura:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const proximoBanner = () => {
        setIndiceBanner((prev) => (prev === bannersAtivos.length - 1 ? 0 : prev + 1));
    };

    const bannerAnterior = () => {
        setIndiceBanner((prev) => (prev === 0 ? bannersAtivos.length - 1 : prev - 1));
    };

    if (loading) {
        return (
            <div className="catalogo-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
                <h2 style={{ color: '#D4AF37', fontFamily: 'Playfair Display' }}>Carregando a vitrine... ✨</h2>
            </div>
        );
    }

    const backgroundUrl = bannersAtivos.length > 0 
        ? `${API_BASE_URL}/api/arquivos/view/${bannersAtivos[indiceBanner].objectName}`
        : 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop';

    return (
        <div className="catalogo-container">
            <Menu categorias={dadosMenu} aoClicarCategoria={rolarPara} />
            <div className="espacador-topo"></div>

            {/* BANNER DINÂMICO CARROSSEL */}
            <section 
                className="banner-destaque"
                style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('${backgroundUrl}')` }}
            >
                {bannersAtivos.length > 1 && (
                    <button className="btn-seta-banner esquerda" onClick={bannerAnterior}>
                        <FiChevronLeft size={36} />
                    </button>
                )}

                <div className="banner-conteudo" key={indiceBanner}>
                    <h2>{bannersAtivos.length > 0 ? bannersAtivos[indiceBanner].titulo : "Nova Coleção Elegance"}</h2>
                    <p>Descubra peças exclusivas para momentos inesquecíveis.</p>
                    <button 
                        className="btn-banner" 
                        onClick={() => {
                            const linkAcao = bannersAtivos[indiceBanner]?.linkAcao;
                            if (linkAcao) {
                                window.location.href = linkAcao;
                            } else {
                                rolarPara(acervo[0]?.nome || acervo[0]?.categoria);
                            }
                        }}
                    >
                        Ver Novidades
                    </button>
                </div>

                {bannersAtivos.length > 1 && (
                    <button className="btn-seta-banner direita" onClick={proximoBanner}>
                        <FiChevronRight size={36} />
                    </button>
                )}

                {bannersAtivos.length > 1 && (
                    <div className="banner-indicadores">
                        {bannersAtivos.map((_, index) => (
                            <span 
                                key={index} 
                                className={`indicador-bolinha ${index === indiceBanner ? 'ativo' : ''}`}
                                onClick={() => setIndiceBanner(index)}
                            ></span>
                        ))}
                    </div>
                )}
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
                                        {/* AQUI ESTAVA O SEGREDO DO SEU CÓDIGO FUNCIONAR: sub.itens */}
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

            {/* 👇 AREA FLUTUANTE DO RODAPÉ ATUALIZADA 👇 */}
            <div className="area-flutuante-rodape">
                <div className="botao-guia-flutuante" onClick={() => setModalGuiaAberto(true)} title="Medir Anel">
                    <div className="guia-icone-container">
                        <FiMaximize2 size={24} />
                    </div>
                    <span className="guia-texto">Descubra seu tamanho!</span>
                </div>

                {itens.length > 0 && (
                    <div className="botao-maleta-flutuante" onClick={() => setCarrinhoAberto(true)}>
                        <FiShoppingBag size={28} />
                        <span className="badge-contagem">{qtdTotal}</span>
                    </div>
                )}
            </div>

            {/* 👇 MODAL DO MEDIDOR 👇 */}
            {modalGuiaAberto && (
                <div className="modal-detalhes-overlay" onClick={() => setModalGuiaAberto(false)}>
                    <div className="modal-lead-card" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-fechar-detalhes" onClick={() => setModalGuiaAberto(false)}>
                            <FiX size={24} />
                        </button>
                        <div className="modal-lead-content">
                            {!mostrarMedidor && !visitanteJaEhLead ? (
                                <>
                                    <h3 className="lead-titulo">Não sabe o tamanho do seu anel? 💍</h3>
                                    <p className="lead-subtitulo">Libere agora nossa <strong>Ferramenta Prática de Medidas</strong> e descubra o tamanho ideal sem sair de casa!</p>
                                    <form onSubmit={handleCapturaLead} className="form-lead">
                                        <div className="input-group">
                                            <label>Como podemos te chamar?</label>
                                            <input type="text" placeholder="Seu nome" required value={dadosLead.nome} onChange={e => setDadosLead({ ...dadosLead, nome: e.target.value })} />
                                        </div>                                
                                        <WhatsAppInput value={dadosLead.whatsapp} onChange={(valor) => setDadosLead({ ...dadosLead, whatsapp: valor })} />
                                        <button type="submit" className="btn-baixar-guia" disabled={isSubmitting}>
                                            {isSubmitting ? 'Processando...' : 'Acessar Ferramenta Grátis'}
                                        </button>
                                    </form>
                                    <span className="lead-spam-aviso">Prometemos não enviar spam.</span>
                                </>
                            ) : (
                                <div className="ferramenta-container-modal">
                                    <MedidorDeAnel />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SEU MODAL DE DETALHES DE PRODUTO INTACTO (O QUE FAZ AS FOTOS FUNCIONAREM) */}
            {produtoSelecionado && (
                <div className="modal-detalhes-overlay" onClick={fecharDetalhes}>
                    <div className="modal-detalhes-card" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-fechar-detalhes" onClick={fecharDetalhes}>
                            <FiX size={24} />
                        </button>
                        <div className="modal-detalhes-content">
                            <div className="galeria-joia">
                                <div className="foto-principal">
                                    {fotoDestaque ? <img src={fotoDestaque} alt={produtoSelecionado.nome} /> : <div className="placeholder-foto">Sem foto</div>}
                                </div>
                                {produtoSelecionado.imagens && produtoSelecionado.imagens.length > 1 && (
                                    <div className="lista-miniaturas">
                                        {produtoSelecionado.imagens.map((imgUrl, index) => (
                                            <img key={index} src={imgUrl} alt={`Ângulo ${index + 1}`} onClick={() => setFotoDestaque(imgUrl)} className={`miniatura ${fotoDestaque === imgUrl ? 'selecionada' : ''}`} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="info-joia-detalhada">
                                <h2>{produtoSelecionado.nome}</h2>
                                <p className="preco-destaque">R$ {produtoSelecionado.preco ? produtoSelecionado.preco.toFixed(2).replace('.', ',') : '0,00'}</p>
                                {produtoSelecionado.material && (
                                    <div className="descricao-box"><p>{produtoSelecionado.material}</p></div>
                                )}
                                <button
                                    className="btn-add-maleta-modal"
                                    onClick={() => { adicionarItem({ ...produtoSelecionado, imagemSelecionada: fotoDestaque }); fecharDetalhes(); }}
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