import React, { useState, useEffect } from 'react';
import './ClientesDashboard.css';
import { ClienteService } from '../../../services/ClienteService';
import ModalBaixaPagamento from './ModalBaixaPagamento';

const ClientesDashboard = () => {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('todos'); 
  const [busca, setBusca] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [clienteExpandido, setClienteExpandido] = useState(null);
  const [detalhesCompras, setDetalhesCompras] = useState({});
  const [loadingDetalhes, setLoadingDetalhes] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteParaPagamento, setClienteParaPagamento] = useState(null);

  const usuarioLogado = "Diego Oliveira"; 

  useEffect(() => {
    carregarClientes();
  }, [filtro]);

  const carregarClientes = async () => {
    setIsLoading(true);
    try {
      let dados = [];
      if (filtro === 'pendentes') {
        dados = await ClienteService.listarPendentes();
      } else {
        dados = await ClienteService.listarTodos();
      }
      setClientes(dados);
    } catch (error) {
      console.error("Erro ao buscar clientes", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCobrarWhatsApp = async (cliente) => {
    try {
      await ClienteService.registrarCobranca(cliente.id, usuarioLogado);
      
      const mensagem = `Olá ${cliente.nome}, tudo bem? Aqui é da Clarice Joias. Consta em nosso sistema um saldo pendente de R$ ${cliente.valorDevido?.toFixed(2).replace('.', ',')}. Gostaria de verificar uma previsão de pagamento?`;
      const url = `https://wa.me/55${cliente.telefone}?text=${encodeURIComponent(mensagem)}`;
      
      window.open(url, '_blank');
      carregarClientes();
    } catch (error) {
      alert("Erro ao registrar histórico de cobrança.");
    }
  };

  const toggleDetalhes = async (clienteId) => {
    if (clienteExpandido === clienteId) {
      setClienteExpandido(null); 
    } else {
      setClienteExpandido(clienteId); 
      
      if (!detalhesCompras[clienteId]) {
        setLoadingDetalhes(prev => ({ ...prev, [clienteId]: true }));
        try {
          const comprasDaApi = await ClienteService.buscarComprasPorCliente(clienteId);
          setDetalhesCompras(prev => ({ ...prev, [clienteId]: comprasDaApi }));
        } catch (error) {
          console.error("Erro ao carregar detalhes de compras:", error);
        } finally {
          setLoadingDetalhes(prev => ({ ...prev, [clienteId]: false }));
        }
      }
    }
  };

  const handleAbrirModal = (cliente) => {
    setClienteParaPagamento(cliente);
    setIsModalOpen(true);
  };

  const handleSucessoPagamento = () => {
    setIsModalOpen(false);
    setClienteParaPagamento(null);
    carregarClientes(); 
    alert("Pagamento registrado com sucesso!");
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) || 
    c.telefone.includes(busca)
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Gestão de Clientes</h1>
          <p className="dashboard-subtitle">Acompanhe seus clientes, saldos devedores e histórico financeiro.</p>
        </div>
      </header>

      <div className="dashboard-filters">
        <input 
          type="text" 
          placeholder="Buscar por nome ou telefone..." 
          className="dashboard-search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select 
          className="dashboard-select" 
          value={filtro} 
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="todos">Todos os Clientes</option>
          <option value="pendentes">Somente Inadimplentes (Devendo)</option>
        </select>
      </div>

      <div className="dashboard-table-container">
        {isLoading ? (
          <p className="loading-text">Carregando clientes...</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>WhatsApp</th>
                <th>Status / Saldo</th>
                <th>Última Cobrança</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr><td colSpan="5" className="empty-text">Nenhum cliente encontrado.</td></tr>
              ) : (
                clientesFiltrados.map(cliente => (
                  <React.Fragment key={cliente.id}>
                    <tr>
                      <td className="font-semibold">{cliente.nome}</td>
                      <td>{cliente.telefone}</td>
                      <td>
                        {cliente.valorDevido > 0 ? (
                          <span className="badge badge-red">
                            Deve R$ {cliente.valorDevido.toFixed(2).replace('.', ',')}
                          </span>
                        ) : (
                          <span className="badge badge-green">Em dia</span>
                        )}
                      </td>
                      <td className="history-cell">
                        {cliente.ultimaCobranca ? (
                          <>
                            <span className="date-text">{new Date(cliente.ultimaCobranca.dataHora).toLocaleDateString()}</span>
                            <span className="user-text">por {cliente.ultimaCobranca.funcionario}</span>
                          </>
                        ) : (
                          <span className="no-history">Nunca cobrado</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button 
                            onClick={() => toggleDetalhes(cliente.id)}
                            className="btn btn-outline"
                          >
                            {clienteExpandido === cliente.id ? '▴ Ocultar' : '▾ Detalhes'}
                          </button>
                          
                          <button 
                            onClick={() => handleCobrarWhatsApp(cliente)}
                            disabled={cliente.valorDevido <= 0}
                            className="btn btn-whatsapp"
                          >
                            Cobrar
                          </button>

                          <button 
                            onClick={() => handleAbrirModal(cliente)}
                            disabled={cliente.valorDevido <= 0}
                            className="btn btn-receber"
                          >
                            Receber
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Linha Expansível de Detalhes Unificada */}
                    {clienteExpandido === cliente.id && (
                      <tr className="details-expanded-row">
                        <td colSpan="5" className="details-cell">
                          <div className="details-content-box">
                            <h4 className="details-title">Extrato de Movimentações</h4>
                            
                            {loadingDetalhes[cliente.id] ? (
                              <p className="loading-text">Buscando histórico...</p>
                            ) : (
                              detalhesCompras[cliente.id] && detalhesCompras[cliente.id].length > 0 ? (
                                <ul className="details-purchase-list">
                                  {detalhesCompras[cliente.id].map((item, index) => (
                                    <li key={index} className={`details-purchase-item ${item.tipo === 'PAGAMENTO' ? 'item-pagamento' : 'item-compra'}`}>
                                      
                                      <div className="purchase-header">
                                        <span className={`badge-tipo ${item.tipo === 'PAGAMENTO' ? 'badge-tipo-green' : 'badge-tipo-orange'}`}>
                                          {item.tipo === 'PAGAMENTO' ? '💰 PAGAMENTO' : '🛒 COMPRA'}
                                        </span>
                                        <strong>Data:</strong> {new Date(item.data).toLocaleDateString()} | 
                                        <strong> Valor:</strong> R$ {item.valor?.toFixed(2).replace('.', ',')}
                                      </div>

                                      <div className="purchase-body">
                                        {item.tipo === 'COMPRA' ? (
                                          <>
                                            <p><strong>Método:</strong> {item.metodo?.toUpperCase()}</p>
                                            {item.metodo === 'fiado' && (
                                              <div className="resumo-fiado">
                                                <p><strong>Entrada:</strong> R$ {(item.valorEntrada || 0).toFixed(2).replace('.', ',')}</p>
                                                <p><strong>Restante a Pagar:</strong> R$ {(item.valor - (item.valorEntrada || 0)).toFixed(2).replace('.', ',')}</p>
                                                <p><strong>Parcelamento:</strong> {item.parcelas}x de R$ {((item.valor - (item.valorEntrada || 0)) / (item.parcelas || 1)).toFixed(2).replace('.', ',')}</p>
                                              </div>
                                            )}
                                            {item.metodo === 'cartao' && <p><strong>Parcelas:</strong> {item.parcelas}x</p>}
                                          </>
                                        ) : (
                                          <div className="resumo-pagamento">
                                            <p><strong>Forma de Recebimento:</strong> {item.metodo?.toUpperCase()}</p>
                                            {item.observacao && <p><strong>Observação:</strong> {item.observacao}</p>}
                                            <p className="status-baixa">✅ Pagamento abatido do saldo devedor.</p>
                                          </div>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="no-data-text">Nenhuma movimentação registrada.</p>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <ModalBaixaPagamento 
          cliente={clienteParaPagamento}
          onClose={() => setIsModalOpen(false)}
          onSucesso={handleSucessoPagamento}
        />
      )}

    </div>
  );
};

export default ClientesDashboard;