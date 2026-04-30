import React, { useState, useEffect } from 'react';
import { FiEye, FiX, FiShoppingBag, FiCalendar, FiDollarSign, FiUser, FiUserCheck, FiPrinter } from 'react-icons/fi';
import CupomVenda from '../../../components/cupom/CupomVenda';
import { VendaService } from '../../../services/VendaService'; 



import './ListarVendas.css';

const ListarVendas = () => {
    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [vendaModal, setVendaModal] = useState(null);
    const [vendaImpressao, setVendaImpressao] = useState(null);

    useEffect(() => {
        carregarVendas();
    }, []);

    // Função para acionar a impressão
    const handleImprimirCupom = (venda) => {
        const dadosCupom = {
            id: venda.id,
            dataVenda: venda.dataVenda,
            total: venda.total,
            itens: venda.itens.map(item => ({
                nome: item.produto?.nome || 'Produto Indisponível',
                quantidade: item.quantidade,
                preco: item.precoUnitario
            })),
            pagamento: {
                metodo: venda.metodoPagamento,
                parcelas: venda.parcelas,
                valorRecebido: venda.valorRecebido,
                valorEntrada: venda.valorEntrada
            },
            cliente: venda.cliente ? {
                nome: venda.cliente.nome,
                telefone: venda.cliente.telefone
            } : null,
            loginOperador: venda.loginOperador
        };

        setVendaImpressao(dadosCupom);

        // Aguarda renderizar o cupom invisível e chama a impressora
        setTimeout(() => {
            window.print();
            setVendaImpressao(null); // Limpa após abrir a tela de impressão
        }, 150);
    };

    const carregarVendas = async () => {
        try {
            setLoading(true);
            const dados = await VendaService.listarTodas(); // ou listar(), dependendo do seu service
            const dadosOrdenados = dados.sort((a, b) => b.id - a.id);
            setVendas(dadosOrdenados);
        } catch (error) {
            console.error("Erro ao carregar vendas:", error);
            setErro('Não foi possível carregar o histórico de vendas.');
        } finally {
            setLoading(false);
        }
    };

    const formatarDinheiro = (valor) => {
        return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatarData = (dataString) => {
        if (!dataString) return '--';
        const data = new Date(dataString);
        return data.toLocaleString('pt-BR');
    };

    const traduzirPagamento = (metodo) => {
        const metodos = {
            'pix': 'PIX',
            'cartao': 'Cartão',
            'especie': 'Dinheiro',
            'fiado': 'Fiado / Promissória'
        };
        return metodos[metodo] || metodo;
    };

    return (
        <div className="vendas-container">
            <div className="vendas-card">
                <header className="vendas-header">
                    <div>
                        <h2>📊 Histórico de Vendas</h2>
                        <p>Acompanhe as vendas realizadas no PDV e Loja Virtual.</p>
                    </div>
                    <div className="vendas-stats">
                        <div className="stat-box">
                            <span>Total de Vendas</span>
                            <strong>{vendas.length}</strong>
                        </div>
                    </div>
                </header>

                {erro && <div className="mensagem-erro">{erro}</div>}

                {loading ? (
                    <div className="loading-vendas">Carregando histórico... ✨</div>
                ) : vendas.length === 0 ? (
                    <div className="loading-vendas">Nenhuma venda registrada ainda.</div>
                ) : (
                    <div className="tabela-responsiva">
                        <table className="tabela-vendas">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Data / Hora</th>
                                    <th>Operador</th>
                                    <th>Cliente</th>
                                    <th>Pagamento</th>
                                    <th>Valor Total</th>
                                    <th className="text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendas.map(venda => (
                                    <tr key={venda.id}>
                                        <td><strong>#{venda.id}</strong></td>
                                        <td>{formatarData(venda.dataVenda)}</td>

                                        <td>
                                            <span style={{ color: '#555', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FiUserCheck size={14} color="#D4AF37" />
                                                {venda.loginOperador || 'Sistema'}
                                            </span>
                                        </td>

                                        <td>
                                            {venda.cliente ? (
                                                <span className="cliente-nome">{venda.cliente.nome}</span>
                                            ) : (
                                                <span className="cliente-anonimo">Cliente Balcão</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`tag-pagamento ${venda.metodoPagamento}`}>
                                                {traduzirPagamento(venda.metodoPagamento)}
                                                {venda.parcelas > 1 && ` (${venda.parcelas}x)`}
                                            </span>
                                        </td>
                                        <td className="valor-destaque">{formatarDinheiro(venda.total)}</td>
                                        
                                        <td className="text-center">
                                            {/* 👇 BOTÕES DA TABELA COM ESPAÇAMENTO AJUSTADO (gap: 12px) 👇 */}
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                                                <button
                                                    className="btn-ver-detalhes"
                                                    onClick={() => setVendaModal(venda)}
                                                    title="Ver Detalhes"
                                                >
                                                    <FiEye size={16} /> Detalhes
                                                </button>
                                                
                                                <button 
                                                    className="btn-ver-detalhes" 
                                                    onClick={() => handleImprimirCupom(venda)}
                                                    title="Reimprimir Cupom"
                                                    style={{ color: '#1a1a1a', borderColor: '#ccc', backgroundColor: '#fafafa' }}
                                                >
                                                    <FiPrinter size={16} /> Recibo
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* =========================================
                MODAL DE DETALHES DA VENDA
                ========================================= */}
            {vendaModal && (
                <div className="modal-overlay">
                    <div className="modal-card modal-venda-detalhes">
                        
                        {/* 👇 CABEÇALHO DO MODAL COM BOTÕES ESPAÇADOS 👇 */}
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiShoppingBag /> Detalhes da Venda #{vendaModal.id}
                            </h3>
                            
                            {/* Grupo de botões à direita com gap de 15px */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <button 
                                    onClick={() => handleImprimirCupom(vendaModal)} 
                                    className="btn-ver-detalhes"
                                    style={{ background: '#1a1a1a', color: '#D4AF37', border: 'none', padding: '8px 16px' }}
                                >
                                    <FiPrinter size={16} /> Imprimir Recibo
                                </button>
                                <button 
                                    className="btn-close-modal" 
                                    onClick={() => setVendaModal(null)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center' }}
                                >
                                    <FiX size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="venda-detalhes-content">
                            {/* Info Cards Topo */}
                            <div className="detalhes-grid-top">
                                <div className="detalhe-box">
                                    <FiCalendar className="detalhe-icone" />
                                    <div>
                                        <small>Data da Venda</small>
                                        <p>{formatarData(vendaModal.dataVenda)}</p>
                                    </div>
                                </div>
                                <div className="detalhe-box">
                                    <FiUser className="detalhe-icone" />
                                    <div>
                                        <small>Cliente</small>
                                        <p>{vendaModal.cliente ? vendaModal.cliente.nome : 'Cliente não identificado'}</p>
                                        {vendaModal.cliente?.telefone && <small>{vendaModal.cliente.telefone}</small>}
                                    </div>
                                </div>
                                <div className="detalhe-box">
                                    <FiDollarSign className="detalhe-icone" />
                                    <div>
                                        <small>Pagamento</small>
                                        <p>{traduzirPagamento(vendaModal.metodoPagamento)} {vendaModal.parcelas > 1 && `em ${vendaModal.parcelas}x`}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Lista de Itens Comprados */}
                            <div className="detalhes-itens-section">
                                <h4>Itens da Venda</h4>
                                <table className="tabela-itens-venda">
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th className="text-center">Qtd</th>
                                            <th className="text-right">Val. Unitário</th>
                                            <th className="text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vendaModal.itens && vendaModal.itens.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.produto?.nome || 'Produto não encontrado'}</td>
                                                <td className="text-center">{item.quantidade}x</td>
                                                <td className="text-right">{formatarDinheiro(item.precoUnitario)}</td>
                                                <td className="text-right font-bold">{formatarDinheiro(item.subtotal || (item.quantidade * item.precoUnitario))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Resumo Financeiro (Especialmente para Fiado e Dinheiro) */}
                            <div className="detalhes-financeiro-section">
                                <div className="financeiro-linha">
                                    <span>Subtotal Itens:</span>
                                    <span>{formatarDinheiro(vendaModal.total)}</span>
                                </div>

                                {vendaModal.metodoPagamento === 'especie' && (
                                    <>
                                        <div className="financeiro-linha">
                                            <span>Valor Recebido do Cliente:</span>
                                            <span>{formatarDinheiro(vendaModal.valorRecebido)}</span>
                                        </div>
                                        <div className="financeiro-linha text-red">
                                            <span>Troco Devolvido:</span>
                                            <span>{formatarDinheiro(vendaModal.troco)}</span>
                                        </div>
                                    </>
                                )}

                                {vendaModal.metodoPagamento === 'fiado' && (
                                    <>
                                        <div className="financeiro-linha text-green">
                                            <span>Valor de Entrada:</span>
                                            <span>{formatarDinheiro(vendaModal.valorEntrada)}</span>
                                        </div>
                                        <div className="financeiro-linha text-red">
                                            <span>Saldo Devido (Fiado):</span>
                                            <span>{formatarDinheiro(vendaModal.valorDevido)}</span>
                                        </div>
                                    </>
                                )}

                                <div className="financeiro-linha total-final">
                                    <span>TOTAL DA VENDA:</span>
                                    <span>{formatarDinheiro(vendaModal.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 👇 MÁGICA DA IMPRESSÃO AQUI 👇 */}
            {/* O Cupom invisível precisa estar renderizado para o window.print() capturá-lo */}
            {vendaImpressao && <CupomVenda venda={vendaImpressao} />}
            
        </div>
    );
};

export default ListarVendas;