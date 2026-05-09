import React, { useState, useEffect } from 'react';
import { 
    FiEye, FiX, FiShoppingBag, FiCalendar, 
    FiDollarSign, FiUser, FiUserCheck, FiPrinter, 
    FiFilter, FiSearch 
} from 'react-icons/fi';

import './ListarVendas.css';
import CupomVenda from '../../../components/cupom/CupomVenda';
import Paginacao from '../../../components/paginacao/Paginacao';
import { PedidoService } from '../../../services/pedidoService';

const ListarVendas = () => {
    // Alterado de vendas para pedidos
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [pedidoModal, setPedidoModal] = useState(null);
    const [pedidoImpressao, setPedidoImpressao] = useState(null);

    // ESTADOS DE FILTROS
    const [filtroOperador, setFiltroOperador] = useState('');
    const [filtroMetodo, setFiltroMetodo] = useState('');
    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');

    // ESTADOS DE PAGINAÇÃO
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Carrega a página 0 ao abrir a tela
    useEffect(() => {
        carregarPedidos(0);
    }, []);

    const handleImprimirCupom = (pedido) => {
        const dadosCupom = {
            id: pedido.id,
            dataVenda: pedido.dataCriacao, // ATENÇÃO: Mudou de dataVenda para dataCriacao no backend
            total: pedido.total,
            itens: pedido.itens.map(item => ({
                nome: item.produto?.nome || 'Produto Indisponível',
                quantidade: item.quantidade,
                preco: item.precoUnitario
            })),
            pagamento: {
                metodo: pedido.metodoPagamento,
                parcelas: pedido.parcelas,
                valorRecebido: pedido.valorRecebido,
                valorEntrada: pedido.valorEntrada
            },
            cliente: pedido.cliente ? {
                nome: pedido.cliente.nome,
                telefone: pedido.cliente.telefone
            } : null,
            loginOperador: pedido.loginOperador
        };

        setPedidoImpressao(dadosCupom);

        setTimeout(() => {
            window.print();
            setPedidoImpressao(null);
        }, 150);
    };

    const carregarPedidos = async (pageIndex = 0, filtrosOverride = null) => {
        try {
            setLoading(true);
            
            const filtrosAtuais = filtrosOverride !== null ? filtrosOverride : {
                loginOperador: filtroOperador,
                metodoPagamento: filtroMetodo,
                dataInicio: filtroDataInicio,
                dataFim: filtroDataFim
            };

            // Certifique-se de que o método listarPedidos existe no seu PedidoService.js
            const dados = await PedidoService.listarTodas(pageIndex, filtrosAtuais);
            
            setPedidos(dados.content);
            setCurrentPage(dados.number);
            setTotalPages(dados.totalPages);
            setTotalElements(dados.totalElements);

        } catch (error) {
            console.error("Erro ao carregar pedidos:", error);
            setErro('Não foi possível carregar o histórico de vendas.');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltrar = (e) => {
        e.preventDefault(); 
        carregarPedidos(0);  
    };

    const handleLimparFiltros = () => {
        setFiltroOperador('');
        setFiltroMetodo('');
        setFiltroDataInicio('');
        setFiltroDataFim('');
        carregarPedidos(0, { loginOperador: '', metodoPagamento: '', dataInicio: '', dataFim: '' });
    };

    const handlePageChange = (novaPagina) => {
        carregarPedidos(novaPagina);
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
                            <strong>{totalElements}</strong>
                        </div>
                    </div>
                </header>

                {/* FILTROS */}
                <form className="filtros-venda-container" onSubmit={handleFiltrar} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '15px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '20px', border: '1px solid #eee' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '130px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '4px' }}>Data Inicial</label>
                        <input 
                            type="date" 
                            value={filtroDataInicio}
                            onChange={(e) => setFiltroDataInicio(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '130px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '4px' }}>Data Final</label>
                        <input 
                            type="date" 
                            value={filtroDataFim}
                            onChange={(e) => setFiltroDataFim(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            min={filtroDataInicio}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '150px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '4px' }}>Método de Pagamento</label>
                        <select 
                            value={filtroMetodo} 
                            onChange={(e) => setFiltroMetodo(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="">Todos</option>
                            <option value="pix">PIX</option>
                            <option value="cartao">Cartão</option>
                            <option value="especie">Dinheiro</option>
                            <option value="fiado">Fiado</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '150px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '4px' }}>Operador (Login)</label>
                        <input 
                            type="text" 
                            placeholder="Ex: joao123" 
                            value={filtroOperador}
                            onChange={(e) => setFiltroOperador(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                        <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#1a1a1a', color: '#D4AF37', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                            <FiSearch /> Buscar
                        </button>
                        <button type="button" onClick={handleLimparFiltros} style={{ padding: '8px 16px', backgroundColor: '#e0e0e0', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FiFilter /> Limpar
                        </button>
                    </div>
                </form>

                {erro && <div className="mensagem-erro">{erro}</div>}

                {loading ? (
                    <div className="loading-vendas">Carregando histórico... ✨</div>
                ) : pedidos.length === 0 ? (
                    <div className="loading-vendas">Nenhum pedido encontrado para estes filtros.</div>
                ) : (
                    <>
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
                                    {pedidos.map(pedido => (
                                        <tr key={pedido.id}>
                                            <td><strong>#{pedido.id}</strong></td>
                                            <td>{formatarData(pedido.dataCriacao)}</td> {/* ATUALIZADO */}
                                            <td>
                                                <span style={{ color: '#555', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <FiUserCheck size={14} color="#D4AF37" />
                                                    {pedido.loginOperador || 'Sistema'}
                                                </span>
                                            </td>
                                            <td>
                                                {pedido.cliente ? (
                                                    <span className="cliente-nome">{pedido.cliente.nome}</span>
                                                ) : (
                                                    <span className="cliente-anonimo">Cliente Balcão</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`tag-pagamento ${pedido.metodoPagamento}`}>
                                                    {traduzirPagamento(pedido.metodoPagamento)}
                                                    {pedido.parcelas > 1 && ` (${pedido.parcelas}x)`}
                                                </span>
                                            </td>
                                            <td className="valor-destaque">{formatarDinheiro(pedido.total)}</td>
                                            <td className="text-center">
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                                                    <button
                                                        className="btn-ver-detalhes"
                                                        onClick={() => setPedidoModal(pedido)}
                                                        title="Ver Detalhes"
                                                    >
                                                        <FiEye size={16} /> Detalhes
                                                    </button>
                                                    <button 
                                                        className="btn-ver-detalhes" 
                                                        onClick={() => handleImprimirCupom(pedido)}
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

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                            <Paginacao 
                                currentPage={currentPage} 
                                totalPages={totalPages} 
                                onPageChange={handlePageChange} 
                            />
                        </div>
                    </>
                )}
            </div>

            {/* MODAL DE DETALHES DO PEDIDO */}
            {pedidoModal && (
                <div className="modal-overlay">
                    <div className="modal-card modal-venda-detalhes">
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiShoppingBag /> Detalhes da Venda #{pedidoModal.id}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <button 
                                    onClick={() => handleImprimirCupom(pedidoModal)} 
                                    className="btn-ver-detalhes"
                                    style={{ background: '#1a1a1a', color: '#D4AF37', border: 'none', padding: '8px 16px' }}
                                >
                                    <FiPrinter size={16} /> Imprimir Recibo
                                </button>
                                <button 
                                    className="btn-close-modal" 
                                    onClick={() => setPedidoModal(null)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center' }}
                                >
                                    <FiX size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="venda-detalhes-content">
                            <div className="detalhes-grid-top">
                                <div className="detalhe-box">
                                    <FiCalendar className="detalhe-icone" />
                                    <div>
                                        <small>Data da Venda</small>
                                        <p>{formatarData(pedidoModal.dataCriacao)}</p> {/* ATUALIZADO */}
                                    </div>
                                </div>
                                <div className="detalhe-box">
                                    <FiUser className="detalhe-icone" />
                                    <div>
                                        <small>Cliente</small>
                                        <p>{pedidoModal.cliente ? pedidoModal.cliente.nome : 'Cliente não identificado'}</p>
                                        {pedidoModal.cliente?.telefone && <small>{pedidoModal.cliente.telefone}</small>}
                                    </div>
                                </div>
                                <div className="detalhe-box">
                                    <FiDollarSign className="detalhe-icone" />
                                    <div>
                                        <small>Pagamento</small>
                                        <p>{traduzirPagamento(pedidoModal.metodoPagamento)} {pedidoModal.parcelas > 1 && `em ${pedidoModal.parcelas}x`}</p>
                                    </div>
                                </div>
                            </div>

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
                                        {pedidoModal.itens && pedidoModal.itens.map(item => (
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

                            <div className="detalhes-financeiro-section">
                                <div className="financeiro-linha">
                                    <span>Subtotal Itens:</span>
                                    <span>{formatarDinheiro(pedidoModal.total)}</span>
                                </div>
                                {pedidoModal.metodoPagamento === 'especie' && (
                                    <>
                                        <div className="financeiro-linha">
                                            <span>Valor Recebido do Cliente:</span>
                                            <span>{formatarDinheiro(pedidoModal.valorRecebido)}</span>
                                        </div>
                                        <div className="financeiro-linha text-red">
                                            <span>Troco Devolvido:</span>
                                            <span>{formatarDinheiro(pedidoModal.troco)}</span>
                                        </div>
                                    </>
                                )}
                                {pedidoModal.metodoPagamento === 'fiado' && (
                                    <>
                                        <div className="financeiro-linha text-green">
                                            <span>Valor de Entrada:</span>
                                            <span>{formatarDinheiro(pedidoModal.valorEntrada)}</span>
                                        </div>
                                        <div className="financeiro-linha text-red">
                                            <span>Saldo Devido (Fiado):</span>
                                            <span>{formatarDinheiro(pedidoModal.valorDevido)}</span>
                                        </div>
                                    </>
                                )}
                                <div className="financeiro-linha total-final">
                                    <span>TOTAL DA VENDA:</span>
                                    <span>{formatarDinheiro(pedidoModal.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mantemos a prop como "venda" para o componente CupomVenda caso você não o tenha refatorado ainda */}
            {pedidoImpressao && <CupomVenda venda={pedidoImpressao} />}
        </div>
    );
};

export default ListarVendas;