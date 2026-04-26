import React, { useState, useEffect } from 'react';
import './ClientesDashboard.css';
import { ClienteService } from '../../../services/ClienteService';

const ClientesDashboard = () => {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('todos'); // 'todos' ou 'pendentes'
  const [busca, setBusca] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Controle de interface da linha expansível
  const [clienteExpandido, setClienteExpandido] = useState(null);
  
  // NOVOS ESTADOS: Guardam as compras buscadas na API e o status de loading específico
  const [detalhesCompras, setDetalhesCompras] = useState({});
  const [loadingDetalhes, setLoadingDetalhes] = useState({});

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

  // FUNÇÃO ATUALIZADA: Agora ela bate na API se os dados ainda não existirem
  const toggleDetalhes = async (clienteId) => {
    if (clienteExpandido === clienteId) {
      setClienteExpandido(null); // Se já está aberto, só fecha
    } else {
      setClienteExpandido(clienteId); // Abre a aba
      
      // Se não temos os dados das compras desse cliente salvas no estado, faz a requisição
      if (!detalhesCompras[clienteId]) {
        setLoadingDetalhes(prev => ({ ...prev, [clienteId]: true }));
        try {
          const comprasDaApi = await ClienteService.buscarComprasPorCliente(clienteId);
          
          // Salva os dados retornados usando o ID do cliente como chave
          setDetalhesCompras(prev => ({ ...prev, [clienteId]: comprasDaApi }));
        } catch (error) {
          console.error("Erro ao carregar detalhes de compras:", error);
        } finally {
          setLoadingDetalhes(prev => ({ ...prev, [clienteId]: false }));
        }
      }
    }
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
          <p className="dashboard-subtitle">Acompanhe seus clientes, saldos devedores e histórico de compras.</p>
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
                    {/* Linha Principal do Cliente */}
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
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => toggleDetalhes(cliente.id)}
                            className="btn-details"
                          >
                            {clienteExpandido === cliente.id ? 'Ocultar Detalhes ▴' : 'Ver Detalhes ▾'}
                          </button>
                          
                          <button 
                            onClick={() => handleCobrarWhatsApp(cliente)}
                            disabled={cliente.valorDevido <= 0}
                            className="btn-whatsapp"
                          >
                            Cobrar
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Linha Expansível de Detalhes */}
                    {clienteExpandido === cliente.id && (
                      <tr className="details-expanded-row">
                        <td colSpan="5" className="details-cell">
                          <div className="details-content-box">
                            <h4 className="details-title">Histórico Recente de Compras</h4>
                            
                            {/* Verifica se a API ainda está carregando esses dados específicos */}
                            {loadingDetalhes[cliente.id] ? (
                              <p className="loading-text">Buscando informações da compra...</p>
                            ) : (
                              // Se já carregou, verifica se tem dados no estado `detalhesCompras`
                              detalhesCompras[cliente.id] && detalhesCompras[cliente.id].length > 0 ? (
                                <ul className="details-purchase-list">
                                  {detalhesCompras[cliente.id].map((compra, index) => (
                                    <li key={index} className="details-purchase-item">
                                      <div className="purchase-header">
                                        <strong>Data:</strong> {new Date(compra.data).toLocaleDateString()} | <strong>Total:</strong> R$ {compra.total?.toFixed(2).replace('.', ',')}
                                      </div>
                                      <div className="purchase-body">
                                        <p><strong>Método:</strong> {compra.metodoPagamento?.toUpperCase()}</p>
                                        
                                        {compra.metodoPagamento === 'fiado' && (
                                          <>
                                            <p><strong>Entrada (PIX/Espécie):</strong> R$ {(compra.valorEntrada || 0).toFixed(2).replace('.', ',')}</p>
                                            <p><strong>Restante a Pagar:</strong> R$ {(compra.total - (compra.valorEntrada || 0)).toFixed(2).replace('.', ',')}</p>
                                            <p><strong>Parcelamento:</strong> {compra.parcelas}x de R$ {((compra.total - (compra.valorEntrada || 0)) / (compra.parcelas || 1)).toFixed(2).replace('.', ',')}</p>
                                          </>
                                        )}

                                        {compra.metodoPagamento === 'cartao' && (
                                          <p><strong>Parcelamento:</strong> {compra.parcelas}x no Cartão</p>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="no-data-text">Nenhum detalhe de compra registrado ou disponível.</p>
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
    </div>
  );
};

export default ClientesDashboard;