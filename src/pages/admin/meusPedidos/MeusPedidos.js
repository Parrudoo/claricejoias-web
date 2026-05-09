import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiCalendar, FiChevronDown, FiChevronUp, FiCreditCard, FiMessageCircle } from 'react-icons/fi';
import { MdOutlinePix } from 'react-icons/md';

import './MeusPedidos.css';
import { useAuth } from '../../../context/AuthProvider';
import { ImagemService } from '../../../services/ImagemService';
import { PedidoService } from '../../../services/pedidoService';

export default function MeusPedidos() {
  const navigate = useNavigate();
  const { logado, carregando } = useAuth(); 
  
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [pedidoExpandido, setPedidoExpandido] = useState(null);

  useEffect(() => {
    if (!carregando && !logado) {
      navigate('/');
      return;
    }

    if (logado && !carregando) {
      buscarPedidos();
    }
  }, [logado, carregando, navigate]);

  const buscarPedidos = async () => {
    setLoadingPedidos(true);
    try {
      // A API retorna um Page<PedidoDTO>, portanto a lista de pedidos está em "content"
      const data = await PedidoService.listarMeusPedidos(); 
      setPedidos(data.content || []); 
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    } finally {
      setLoadingPedidos(false);
    }
  };

  const togglePedido = (id) => {
    if (pedidoExpandido === id) {
      setPedidoExpandido(null);
    } else {
      setPedidoExpandido(id);
    }
  };

  const renderIconePagamento = (forma) => {
    switch (forma?.toLowerCase()) {
      case 'pix': return <MdOutlinePix size={18} />;
      case 'cartao': return <FiCreditCard size={18} />;
      case 'negociar': return <FiMessageCircle size={18} />;
      default: return <FiCreditCard size={18} />;
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Função robusta para formatar valores numéricos (protege contra quebras caso o BigDecimal venha nulo)
  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (carregando || loadingPedidos) {
    return (
      <div className="pedidos-container">
        <div className="loading-pedidos">Carregando seus pedidos...</div>
      </div>
    );
  }

  return (
    <div className="pedidos-container">
      <header className="pedidos-header">
        <button onClick={() => navigate('/')} className="btn-voltar-simples">
          <FiArrowLeft /> Voltar à loja
        </button>
        <div className="pedidos-titulo">
          <FiPackage className="icone-verde" size={24} />
          <h2>Meus Pedidos</h2>
        </div>
      </header>

      <div className="pedidos-content">
        {pedidos.length === 0 ? (
          <div className="sem-pedidos">
            <FiPackage size={48} className="icone-cinza" />
            <h3>Você ainda não tem nenhum pedido</h3>
            <p>Que tal dar uma olhada nas nossas novidades?</p>
            <button onClick={() => navigate('/')} className="btn-primario">Ir para a Loja</button>
          </div>
        ) : (
          <div className="lista-pedidos">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className={`pedido-card ${pedidoExpandido === pedido.id ? 'expandido' : ''}`}>
                
                {/* CABEÇALHO DO PEDIDO */}
                <div className="pedido-card-header" onClick={() => togglePedido(pedido.id)}>
                  <div className="pedido-info-principal">
                    <span className="pedido-numero">Pedido #{pedido.id}</span>
                    <span className="pedido-data">
                      <FiCalendar /> {formatarData(pedido.dataCriacao)} 
                    </span>
                  </div>
                  <div className="pedido-info-secundaria">
                    <span className={`pedido-status status-${pedido.statusPedido?.toLowerCase()}`}>
                      {pedido.statusPedido?.replace(/_/g, ' ') || 'Processando'}
                    </span>
                    
                    <span className="pedido-total">
                      {formatarMoeda(pedido.totalCobrado)}
                    </span>
                    <button className="btn-expandir">
                      {pedidoExpandido === pedido.id ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* DETALHES DO PEDIDO */}
                {pedidoExpandido === pedido.id && (
                  <div className="pedido-card-body fade-in">
                    <div className="pedido-detalhes-header">
                      <h4>Itens do Pedido</h4>
                      <div className="pedido-forma-pagamento">
                        {renderIconePagamento(pedido.formaPagamento)}
                        <span>Pagamento via {pedido.formaPagamento}</span>
                      </div>
                    </div>
                    
                    <div className="pedido-itens-lista">
                      {pedido.itens?.map((item, index) => (
                        <div key={index} className="pedido-item">
                          <img 
                            src={ImagemService.getUrl(item.produto?.imagens?.[0])} 
                            alt={item.produto?.nome} 
                            className="pedido-item-img"
                            onError={(e) => { e.target.src = '/caminho/para/imagem/padrao.png'; }}
                          />
                          <div className="pedido-item-info">
                            <span className="pedido-item-nome">{item.produto?.nome}</span>
                            <span className="pedido-item-qtd">Qtd: {item.quantidade}</span>
                          </div>
                          <div className="pedido-item-preco">
                            {/* Cálculo do subtotal do item formatado corretamente */}
                            {formatarMoeda(Number(item.precoUnitario || 0) * Number(item.quantidade || 0))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pedido-resumo-final">
                      <div className="linha-resumo">
                        <span>Subtotal</span>
                        <span>{formatarMoeda(pedido.totalCobrado)}</span>
                      </div>
                      <div className="linha-resumo total-destaque">
                        <strong>Total Pago</strong>
                        <strong>{formatarMoeda(pedido.totalCobrado)}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}