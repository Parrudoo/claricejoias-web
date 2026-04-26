import React, { useState, useRef, useEffect } from 'react';
import './TelaPDV.css';
import { ProdutoService } from '../../../services/ProdutoService';
import { VendaService } from '../../../services/VendaService';

const TelaPDV = () => {
    const [codigoBusca, setCodigoBusca] = useState('');
    const [carrinho, setCarrinho] = useState([]);
    const [produtoAtual, setProdutoAtual] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Estados de Pagamento e Cliente
    const [formaPagamento, setFormaPagamento] = useState('pix');
    const [parcelas, setParcelas] = useState(1);
    const [valorRecebido, setValorRecebido] = useState('');

    // Novos estados para o Cliente
    const [clienteNome, setClienteNome] = useState('');
    const [clienteTelefone, setClienteTelefone] = useState('');
    const [valorEntrada, setValorEntrada] = useState('');

    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, [carrinho]);

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

    const removerDoCarrinho = (id) => {
        setCarrinho((prev) => prev.filter(item => item.id !== id));
    };

    const calcularTotal = () => {
        return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    };

    const total = calcularTotal();
    const troco = formaPagamento === 'especie' && valorRecebido ? (parseFloat(valorRecebido) - total) : 0;

    const handleFinalizarVenda = async () => {
    if (carrinho.length === 0) return alert('O carrinho está vazio.');

    if (formaPagamento === 'fiado' && (!clienteNome.trim() || !clienteTelefone.trim())) {
        return alert('Para vendas no FIADO, é obrigatório preencher o Nome e o WhatsApp do cliente!');
    }

    // Usando Number() para garantir que os valores numéricos não quebrem o JSON
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

    console.log("Enviando para o Spring Boot:", payloadVenda); // <-- OLHE O CONSOLE DO NAVEGADOR

    try {
        setIsLoading(true);
        const response = await VendaService.registrar(payloadVenda);
        alert(`Venda finalizada com sucesso! (ID: ${response.id})`);
        
        // Resetar estados
        setCarrinho([]);
        setProdutoAtual(null);
        setCodigoBusca('');
        setFormaPagamento('pix');
        setValorRecebido('');
        setClienteNome('');
        setClienteTelefone('');
        setValorEntrada('');
        setParcelas(1);
    } catch (error) {
        // Log detalhado para capturar o que o backend reclamou
        const erroBackend = error.response?.data || error.message;
        console.error('Erro detalhado do Backend:', erroBackend);
        
        alert('Erro ao finalizar venda. Verifique o console (F12) para ver o motivo exato.');
    } finally {
        setIsLoading(false);
        inputRef.current?.focus();
    }
};

    return (
        <div className="pdv-container">

            {/* SEÇÃO ESQUERDA - Inserção de Produtos */}
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
                            <img src={produtoAtual.img || '/api/placeholder/150/150'} alt={produtoAtual.nome} className="pdv-product-img" />
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

            {/* SEÇÃO DIREITA - Carrinho e Pagamento */}
            <div className="pdv-right-section">

                {/* Lista de Itens */}
                <div className="pdv-cart-list" style={{ flex: '1', minHeight: '150px' }}>
                    <h3 className="pdv-cart-title">Lista de Itens</h3>
                    {carrinho.length === 0 ? (
                        <p className="pdv-cart-empty-msg">Nenhum item na lista.</p>
                    ) : (
                        <ul className="pdv-cart-items">
                            {carrinho.map((item) => (
                                <li key={item.id} className="pdv-cart-item">
                                    <div className="pdv-item-info">
                                        <p className="pdv-item-name">{item.nome}</p>
                                        <p className="pdv-item-qty">{item.quantidade}x R$ {item.preco?.toFixed(2).replace('.', ',')}</p>
                                    </div>
                                    <div className="pdv-item-actions">
                                        <span className="pdv-item-price">
                                            R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                                        </span>
                                        <button onClick={() => removerDoCarrinho(item.id)} className="pdv-btn-remove" title="Remover">X</button>
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

                    {/* DADOS DO CLIENTE */}
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

                    <div className="pdv-payment-section">
                        <label className="pdv-label">Forma de Pagamento</label>

                        {/* Grid atualizado para 4 botões */}
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

                        {/* Condicionais de Pagamento: Cartão ou Fiado exibem as parcelas */}
                        {(formaPagamento === 'cartao' || formaPagamento === 'fiado') && (
                            <div className="pdv-conditional-block">
                                <label className="pdv-label-small">Parcelamento ({formaPagamento === 'fiado' ? 'Fiado/Promissória' : 'Cartão'})</label>
                                <select
                                    value={parcelas}
                                    onChange={(e) => setParcelas(Number(e.target.value))}
                                    className="pdv-select"
                                >
                                    <option value={1}>À vista (1x)</option>
                                    <option value={2}>2x sem juros</option>
                                    <option value={3}>3x sem juros</option>
                                    <option value={4}>4x sem juros</option>
                                    <option value={5}>5x sem juros</option>
                                    <option value={6}>6x sem juros</option>
                                </select>
                            </div>
                        )}

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
                                <select
                                    value={parcelas}
                                    onChange={(e) => setParcelas(Number(e.target.value))}
                                    className="pdv-select"
                                >
                                    {[1, 2, 3, 4, 5, 6].map(p => (
                                        <option key={p} value={p}>{p}x {p > 1 ? 'Mensais' : 'Única'}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Condicionais de Pagamento: Espécie exibe troco */}
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
    );
};

export default TelaPDV;