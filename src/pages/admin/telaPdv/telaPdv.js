import React, { useState, useRef, useEffect } from 'react';
import './TelaPDV.css';
import { ProdutoService } from '../../../services/ProdutoService';
import { VendaService } from '../../../services/VendaService';
import { ImagemService } from '../../../services/ImagemService';
import CupomVenda from '../../../components/cupom/CupomVenda';




const TelaPDV = () => {
    // ==========================================
    // ESTADOS PRINCIPAIS DO PDV
    // ==========================================
    const [codigoBusca, setCodigoBusca] = useState('');
    const [carrinho, setCarrinho] = useState([]);
    const [produtoAtual, setProdutoAtual] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // ==========================================
    // ESTADOS DE PAGAMENTO E CLIENTE
    // ==========================================
    const [formaPagamento, setFormaPagamento] = useState('pix');
    const [parcelas, setParcelas] = useState(1);
    const [valorRecebido, setValorRecebido] = useState('');
    const [clienteNome, setClienteNome] = useState('');
    const [clienteTelefone, setClienteTelefone] = useState('');
    const [valorEntrada, setValorEntrada] = useState('');

    // ==========================================
    // ESTADO DE IMPRESSÃO
    // ==========================================
    const [vendaImpressao, setVendaImpressao] = useState(null);

    const inputRef = useRef(null);

    // Mantém o foco no input para o leitor de código de barras
    useEffect(() => {
        inputRef.current?.focus();
    }, [carrinho]);

    // ==========================================
    // LÓGICA DO CARRINHO
    // ==========================================
    const handleBuscarProduto = async (e) => {
        e.preventDefault();
        if (!codigoBusca.trim()) return;

        setIsLoading(true);
        try {
            const produtoEncontrado = await ProdutoService.buscarPorCodigo(codigoBusca);
            adicionarAoCarrinho(produtoEncontrado);
            setProdutoAtual(produtoEncontrado);
            setCodigoBusca('');
        } catch (error) {
            console.error("Erro ao buscar produto:", error);
            alert('Joia não encontrada. Verifique se o código está correto.');
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const adicionarAoCarrinho = (produto) => {
        setCarrinho((prev) => {
            const itemExistente = prev.find(item => item.id === produto.id);
            if (itemExistente) {
                return prev.map(item =>
                    item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
                );
            }
            return [...prev, { ...produto, quantidade: 1 }];
        });
    };

    const alterarQuantidade = (id, delta) => {
        setCarrinho((prev) => {
            const novoCarrinho = prev.map(item => {
                if (item.id === id) {
                    return { ...item, quantidade: item.quantidade + delta };
                }
                return item;
            }).filter(item => item.quantidade > 0);

            const itemAindaExiste = novoCarrinho.find(item => item.id === id);
            if (!itemAindaExiste && produtoAtual?.id === id) {
                setProdutoAtual(null);
            }

            return novoCarrinho;
        });
    };

    const removerDoCarrinho = (id) => {
        setCarrinho((prev) => prev.filter(item => item.id !== id));
        if (produtoAtual && produtoAtual.id === id) {
            setProdutoAtual(null);
        }
    };

    const calcularTotal = () => {
        return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    };

    const total = calcularTotal();
    const troco = formaPagamento === 'especie' && valorRecebido ? (parseFloat(valorRecebido) - total) : 0;

    // ==========================================
    // FINALIZAR VENDA E IMPRIMIR
    // ==========================================
    const handleFinalizarVenda = async () => {
        if (carrinho.length === 0) return alert('O carrinho está vazio.');

        if (formaPagamento === 'fiado' && (!clienteNome.trim() || !clienteTelefone.trim())) {
            return alert('Para vendas no FIADO, é obrigatório preencher o Nome e o WhatsApp do cliente!');
        }

        const payloadVenda = {
            itens: carrinho.map(item => ({
                id: item.id,
                nome: item.nome,
                preco: item.preco,
                quantidade: item.quantidade
            })),
            total: total,
            pagamento: {
                metodo: formaPagamento,
                parcelas: parcelas || 1, 
                valorRecebido: formaPagamento === 'especie' ? Number(valorRecebido || 0) : total,
                valorEntrada: Number(valorEntrada || 0) 
            },
            cliente: clienteNome.trim() ? {
                nome: clienteNome,
                telefone: clienteTelefone
            } : null
        };

        try {
            setIsLoading(true);
            const response = await VendaService.registrar(payloadVenda);
            
            // Prepara os dados para o Cupom, unindo o ID gerado com os dados da venda
            const dadosDoCupom = {
                ...payloadVenda,
                id: response.id || response.data?.id
            };

            // Aciona o estado de impressão (Isso vai renderizar o <CupomVenda /> invisível no HTML)
            setVendaImpressao(dadosDoCupom);

            // Dá um tempinho (100ms) pro React colocar o HTML na tela e aciona a impressora do Windows/Mac
            setTimeout(() => {
                window.print();
                limparPDV();
            }, 100);

        } catch (error) {
            console.error('Erro detalhado do Backend:', error.response?.data || error.message);
            alert('Erro ao finalizar venda. Verifique o console (F12) para ver o motivo exato.');
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const limparPDV = () => {
        setCarrinho([]);
        setProdutoAtual(null);
        setCodigoBusca('');
        setFormaPagamento('pix');
        setValorRecebido('');
        setClienteNome('');
        setClienteTelefone('');
        setValorEntrada('');
        setParcelas(1);
        setVendaImpressao(null); // Remove o cupom do HTML
    };

    // ==========================================
    // RENDERIZAÇÃO DA TELA
    // ==========================================
    return (
        <>
            <div className="pdv-container">
                {/* =========================================
                    SEÇÃO ESQUERDA - INSERÇÃO DE PRODUTOS
                    ========================================= */}
                <div className="pdv-left-section">
                    <header className="pdv-header">
                        <h1 className="pdv-title">PDV - Caixa Livre</h1>
                        <p className="pdv-subtitle">Insira o código da joia para adicionar à venda</p>
                    </header>

                    <form onSubmit={handleBuscarProduto} className="pdv-search-form">
                        <div className="pdv-input-wrapper">
                            <input
                                ref={inputRef}
                                type="text"
                                value={codigoBusca}
                                onChange={(e) => setCodigoBusca(e.target.value)}
                                placeholder="Código de barras ou SKU (ex: 1)"
                                className="pdv-search-input"
                                autoFocus
                                disabled={isLoading}
                            />
                            <button type="submit" className="pdv-btn-inserir" disabled={isLoading}>
                                {isLoading ? 'Buscando...' : 'Inserir'}
                            </button>
                        </div>
                    </form>

                    {produtoAtual ? (
                        <div className="pdv-product-view">
                            <div className="pdv-product-center">
                                <img 
                                    src={ImagemService.getUrl(
                                        produtoAtual.imagens && produtoAtual.imagens.length > 0 
                                            ? produtoAtual.imagens[0] 
                                            : produtoAtual.pathImg
                                    )} 
                                    alt={produtoAtual.nome} 
                                    className="pdv-product-img" 
                                />
                                <h2 className="pdv-product-name">{produtoAtual.nome}</h2>
                                <p className="pdv-product-price">
                                    R$ {produtoAtual.preco?.toFixed(2).replace('.', ',')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="pdv-product-view pdv-product-empty">
                            Aguardando produto...
                        </div>
                    )}
                </div>

                {/* =========================================
                    SEÇÃO DIREITA - CARRINHO E PAGAMENTO
                    ========================================= */}
                <div className="pdv-right-section">

                    {/* Lista de Itens */}
                    <div className="pdv-cart-list" style={{ flex: '1', minHeight: '150px' }}>
                        <h3 className="pdv-cart-title">Lista de Itens</h3>
                        {carrinho.length === 0 ? (
                            <p className="pdv-cart-empty-msg">Nenhum item na lista.</p>
                        ) : (
                            <ul className="pdv-cart-items">
                                {carrinho.map((item) => (
                                    <li key={item.id} className="pdv-cart-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img 
                                            src={ImagemService.getUrl(item.imagens && item.imagens.length > 0 ? item.imagens[0] : item.pathImg)} 
                                            alt={item.nome} 
                                            style={{ width: '45px', height: '45px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#fff' }} 
                                        />

                                        <div className="pdv-item-info" style={{ flex: 1 }}>
                                            <p className="pdv-item-name" style={{ margin: '0 0 5px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>{item.nome}</p>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <button 
                                                    type="button" 
                                                    onClick={() => alterarQuantidade(item.id, -1)}
                                                    style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: '#f5f5f5', fontWeight: 'bold' }}
                                                >-</button>
                                                
                                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', minWidth: '15px', textAlign: 'center' }}>{item.quantidade}</span>
                                                
                                                <button 
                                                    type="button" 
                                                    onClick={() => alterarQuantidade(item.id, 1)}
                                                    style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: '#f5f5f5', fontWeight: 'bold' }}
                                                >+</button>
                                                
                                                <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '5px' }}>x R$ {item.preco?.toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        </div>

                                        <div className="pdv-item-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                            <button onClick={() => removerDoCarrinho(item.id)} className="pdv-btn-remove" title="Remover Produto" style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                                            <span className="pdv-item-price" style={{ fontWeight: 'bold', color: '#D4AF37' }}>
                                                R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Resumo e Pagamento */}
                    <div className="pdv-summary">
                        <div className="pdv-total-row">
                            <span className="pdv-total-label">Total a Pagar:</span>
                            <span className="pdv-total-value">R$ {total.toFixed(2).replace('.', ',')}</span>
                        </div>

                        {/* Dados do Cliente */}
                        <div className="pdv-conditional-block" style={{ marginBottom: '1.5rem' }}>
                            <label className="pdv-label">Dados do Cliente {formaPagamento === 'fiado' ? <span className="text-red">*</span> : '(Opcional)'}</label>
                            <div className="pdv-flex-row" style={{ marginTop: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Nome do Cliente"
                                    value={clienteNome}
                                    onChange={(e) => setClienteNome(e.target.value)}
                                    className="pdv-input pdv-flex-1"
                                />
                                <input
                                    type="text"
                                    placeholder="WhatsApp (Ex: 86999999999)"
                                    value={clienteTelefone}
                                    onChange={(e) => setClienteTelefone(e.target.value)}
                                    className="pdv-input pdv-flex-1"
                                />
                            </div>
                        </div>

                        {/* Forma de Pagamento */}
                        <div className="pdv-payment-section">
                            <label className="pdv-label">Forma de Pagamento</label>

                            <div className="pdv-method-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                {['pix', 'cartao', 'especie', 'fiado'].map((metodo) => (
                                    <button
                                        key={metodo}
                                        onClick={() => setFormaPagamento(metodo)}
                                        className={`pdv-method-btn ${formaPagamento === metodo ? 'active' : ''}`}
                                        style={{ padding: '0.5rem 0.2rem', fontSize: '0.8rem' }}
                                    >
                                        {metodo === 'pix' ? 'PIX' : metodo === 'cartao' ? 'Cartão' : metodo === 'especie' ? 'Espécie' : 'Fiado'}
                                    </button>
                                ))}
                            </div>

                            {/* Condicional: Cartão */}
                            {formaPagamento === 'cartao' && (
                                <div className="pdv-conditional-block">
                                    <label className="pdv-label-small">Parcelamento (Cartão)</label>
                                    <select value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className="pdv-select">
                                        <option value={1}>À vista (1x)</option>
                                        <option value={2}>2x sem juros</option>
                                        <option value={3}>3x sem juros</option>
                                        <option value={4}>4x sem juros</option>
                                        <option value={5}>5x sem juros</option>
                                        <option value={6}>6x sem juros</option>
                                    </select>
                                </div>
                            )}

                            {/* Condicional: Fiado */}
                            {formaPagamento === 'fiado' && (
                                <div className="pdv-conditional-block">
                                    <div className="pdv-flex-row">
                                        <div className="pdv-flex-1">
                                            <label className="pdv-label-small">Valor da Entrada (Dinheiro/Pix)</label>
                                            <input
                                                type="number"
                                                value={valorEntrada}
                                                onChange={(e) => setValorEntrada(e.target.value)}
                                                className="pdv-input"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="pdv-flex-1">
                                            <label className="pdv-label-small">Saldo Restante (Fiado)</label>
                                            <div className="pdv-troco-display text-red">
                                                R$ {(total - (parseFloat(valorEntrada) || 0)).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    <label className="pdv-label-small" style={{ marginTop: '10px' }}>Parcelar Saldo em:</label>
                                    <select value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className="pdv-select">
                                        {[1, 2, 3, 4, 5, 6].map(p => (
                                            <option key={p} value={p}>{p}x {p > 1 ? 'Mensais' : 'Única'}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Condicional: Espécie */}
                            {formaPagamento === 'especie' && (
                                <div className="pdv-conditional-block pdv-flex-row">
                                    <div className="pdv-flex-1">
                                        <label className="pdv-label-small">Valor Recebido</label>
                                        <input
                                            type="number"
                                            value={valorRecebido}
                                            onChange={(e) => setValorRecebido(e.target.value)}
                                            className="pdv-input"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="pdv-flex-1">
                                        <label className="pdv-label-small">Troco</label>
                                        <div className={`pdv-troco-display ${troco < 0 ? 'text-red' : 'text-green'}`}>
                                            R$ {troco > 0 ? troco.toFixed(2) : '0.00'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleFinalizarVenda}
                            disabled={carrinho.length === 0 || isLoading}
                            className="pdv-btn-finalizar"
                        >
                            {isLoading ? 'Processando...' : 'Finalizar Venda'}
                        </button>
                    </div>
                </div>
            </div>

            {/* =========================================
                ÁREA DO CUPOM DE IMPRESSÃO INVISÍVEL
                Só é preenchido e jogado na tela na hora que clica em Finalizar
                ========================================= */}
            {vendaImpressao && <CupomVenda venda={vendaImpressao} />}
        </>
    );
};

export default TelaPDV;