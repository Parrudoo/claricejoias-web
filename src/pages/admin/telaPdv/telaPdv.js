import React, { useState, useRef, useEffect } from 'react';
import './TelaPDV.css'; // Importando o arquivo CSS criado

const produtosMock = {
  '1001': { id: 1, nome: 'Colar de Ouro 18k com Pingente', preco: 1250.00, imagem: '/api/placeholder/150/150' },
  '1002': { id: 2, nome: 'Anel Solitário Prata 925', preco: 180.00, imagem: '/api/placeholder/150/150' },
  '1003': { id: 3, nome: 'Brinco Argola Pequena Banhada', preco: 85.00, imagem: '/api/placeholder/150/150' },
};

const TelaPDV = () => {
  const [codigoBusca, setCodigoBusca] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [produtoAtual, setProdutoAtual] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [parcelas, setParcelas] = useState(1);
  const [valorRecebido, setValorRecebido] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [carrinho]);

  const handleBuscarProduto = (e) => {
    e.preventDefault();
    if (!codigoBusca.trim()) return;

    const produtoEncontrado = produtosMock[codigoBusca];

    if (produtoEncontrado) {
      adicionarAoCarrinho(produtoEncontrado);
      setProdutoAtual(produtoEncontrado);
      setCodigoBusca('');
    } else {
      alert('Joia não encontrada. Verifique o código.');
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

  const handleFinalizarVenda = () => {
    if (carrinho.length === 0) return alert('O carrinho está vazio.');
    
    const payloadVenda = {
      itens: carrinho,
      total,
      pagamento: {
        metodo: formaPagamento,
        parcelas: formaPagamento === 'cartao' ? parcelas : 1,
        valorRecebido: formaPagamento === 'especie' ? parseFloat(valorRecebido) : total
      }
    };

    console.log('Enviando para a API:', payloadVenda);
    alert('Venda finalizada com sucesso!');
    
    setCarrinho([]);
    setProdutoAtual(null);
    setCodigoBusca('');
    setFormaPagamento('pix');
    setValorRecebido('');
  };

  return (
    <div className="pdv-container">
      
      {/* SEÇÃO ESQUERDA - Inserção de Produtos */}
      <div className="pdv-left-section">
        <header className="pdv-header">
          <h1 className="pdv-title">PDV - Caixa Livre</h1>
          <p className="pdv-subtitle">Insira o código da joia para adicionar à venda</p>
        </header>

        {/* Input de Código */}
        <form onSubmit={handleBuscarProduto} className="pdv-search-form">
          <div className="pdv-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={codigoBusca}
              onChange={(e) => setCodigoBusca(e.target.value)}
              placeholder="Código de barras ou SKU (ex: 1001)"
              className="pdv-search-input"
              autoFocus
            />
            <button type="submit" className="pdv-btn-inserir">
              Inserir
            </button>
          </div>
        </form>

        {/* Visualização do Último Produto Inserido */}
        {produtoAtual ? (
          <div className="pdv-product-view">
            <div className="pdv-product-center">
              <img src={produtoAtual.imagem} alt={produtoAtual.nome} className="pdv-product-img" />
              <h2 className="pdv-product-name">{produtoAtual.nome}</h2>
              <p className="pdv-product-price">
                R$ {produtoAtual.preco.toFixed(2).replace('.', ',')}
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
        <div className="pdv-cart-list">
          <h3 className="pdv-cart-title">Lista de Itens</h3>
          {carrinho.length === 0 ? (
            <p className="pdv-cart-empty-msg">Nenhum item na lista.</p>
          ) : (
            <ul className="pdv-cart-items">
              {carrinho.map((item) => (
                <li key={item.id} className="pdv-cart-item">
                  <div className="pdv-item-info">
                    <p className="pdv-item-name">{item.nome}</p>
                    <p className="pdv-item-qty">{item.quantidade}x R$ {item.preco.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="pdv-item-actions">
                    <span className="pdv-item-price">
                      R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                    </span>
                    <button onClick={() => removerDoCarrinho(item.id)} className="pdv-btn-remove" title="Remover">
                      X
                    </button>
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

          <div className="pdv-payment-section">
            <label className="pdv-label">Forma de Pagamento</label>
            <div className="pdv-method-grid">
              {['pix', 'cartao', 'especie'].map((metodo) => (
                <button
                  key={metodo}
                  onClick={() => setFormaPagamento(metodo)}
                  className={`pdv-method-btn ${formaPagamento === metodo ? 'active' : ''}`}
                >
                  {metodo === 'pix' ? 'PIX' : metodo === 'cartao' ? 'Cartão' : 'Espécie'}
                </button>
              ))}
            </div>

            {/* Condicionais de Pagamento */}
            {formaPagamento === 'cartao' && (
              <div className="pdv-conditional-block">
                <label className="pdv-label-small">Parcelamento</label>
                <select 
                  value={parcelas} 
                  onChange={(e) => setParcelas(Number(e.target.value))}
                  className="pdv-select"
                >
                  <option value={1}>À vista (1x)</option>
                  <option value={2}>2x sem juros</option>
                  <option value={3}>3x sem juros</option>
                  <option value={4}>4x sem juros</option>
                </select>
              </div>
            )}

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
            disabled={carrinho.length === 0}
            className="pdv-btn-finalizar"
          >
            Finalizar Venda
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default TelaPDV;