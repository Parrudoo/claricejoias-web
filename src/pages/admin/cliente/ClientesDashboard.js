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
  const [parcelaSelecionada, setParcelaSelecionada] = useState(null);

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
      carregarClientes();
      alert("Cobrança enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao cobrar cliente", error);
      alert("Erro ao enviar cobrança.");
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

  const handleAbrirModal = (cliente, parcela = null) => {
    setClienteParaPagamento(cliente);
    setParcelaSelecionada(parcela);
    setIsModalOpen(true);
  };

  const handleSucessoPagamento = () => {
    setIsModalOpen(false);
    setClienteParaPagamento(null);
    setParcelaSelecionada(null);
    carregarClientes();
    setDetalhesCompras({});
    alert("Pagamento registrado com sucesso!");
  };

  const calcularStatusReal = (cliente) => {
    let valorVencido = 0;
    let valorTotalPendente = 0;
    let temAtraso = false;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (cliente.vendas && Array.isArray(cliente.vendas)) {
      cliente.vendas.forEach(venda => {
        if (venda.parcelas && Array.isArray(venda.parcelas)) {
          venda.parcelas.forEach(parcela => {

            // 👈 MUDANÇA AQUI: Agora ele aceita PENDENTE ou ATRASADA
            if (parcela.status === 'PENDENTE' || parcela.status === 'ATRASADA') {
              valorTotalPendente += parcela.valor;

              let parcelaEstaAtrasada = false;

              // Se o backend já carimbou como ATRASADA, já sabemos que está atrasada
              if (parcela.status === 'ATRASADA') {
                parcelaEstaAtrasada = true;
              }
              // Se for PENDENTE, verificamos se a data já passou de hoje
              else if (parcela.dataVencimento) {
                const [ano, mes, dia] = parcela.dataVencimento.split('-');
                const dataVencimento = new Date(ano, mes - 1, dia);

                if (dataVencimento < hoje) {
                  parcelaEstaAtrasada = true;
                }
              }

              // Se a parcela caiu em qualquer regra de atraso, soma no valor vencido
              if (parcelaEstaAtrasada) {
                temAtraso = true;
                valorVencido += parcela.valor;
              }
            }
          });
        }
      });
    }

    if (temAtraso) {
      return { situacao: 'ATRASADA', texto: 'Em Atraso', valorPrincipal: valorVencido, valorTotal: valorTotalPendente, classeCss: 'badge-red' };
    } else if (valorTotalPendente > 0) {
      return { situacao: 'A_VENCER', texto: 'A Vencer', valorPrincipal: valorTotalPendente, valorTotal: valorTotalPendente, classeCss: 'badge-orange' };
    } else {
      return { situacao: 'EM_DIA', texto: 'Em dia', valorPrincipal: 0, valorTotal: 0, classeCss: 'badge-green' };
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.telefone && c.telefone.includes(busca))
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
        <select className="dashboard-select" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
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
                clientesFiltrados.map(cliente => {
                  const statusReal = calcularStatusReal(cliente);

                  return (
                    <React.Fragment key={cliente.id}>
                      <tr>
                        <td className="font-semibold">{cliente.nome}</td>
                        <td>{cliente.telefone}</td>

                        <td>
                          <span className={`badge ${statusReal.classeCss}`} title={`Dívida total: R$ ${statusReal.valorTotal.toFixed(2).replace('.', ',')}`}>
                            {statusReal.texto}
                            {statusReal.valorPrincipal > 0 && ` (R$ ${statusReal.valorPrincipal.toFixed(2).replace('.', ',')})`}
                          </span>
                          {statusReal.situacao === 'ATRASADO' && statusReal.valorTotal > statusReal.valorPrincipal && (
                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                              Total devido: R$ {statusReal.valorTotal.toFixed(2).replace('.', ',')}
                            </div>
                          )}
                        </td>

                        <td className="history-cell">
                          {cliente.ultimaCobranca ? (
                            <><span className="date-text">{new Date(cliente.ultimaCobranca.dataHora).toLocaleDateString()}</span><span className="user-text">por {cliente.ultimaCobranca.funcionario}</span></>
                          ) : (
                            <span className="no-history">Nunca cobrado</span>
                          )}
                        </td>

                        <td>
                          <div className="action-buttons-group">
                            <button onClick={() => toggleDetalhes(cliente.id)} className="btn btn-outline">
                              {clienteExpandido === cliente.id ? '▴ Ocultar' : '▾ Detalhes'}
                            </button>
                            <button
                              onClick={() => handleCobrarWhatsApp(cliente)}
                              disabled={statusReal.situacao !== 'ATRASADA'}
                              className="btn btn-whatsapp"
                              title={statusReal.situacao !== 'ATRASADA' ? 'Cobrança apenas para parcelas vencidas' : 'Enviar cobrança'}
                            >
                              Cobrar
                            </button>
                          </div>
                        </td>
                      </tr>

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
                                    {detalhesCompras[cliente.id].map((compra, index) => {
                                      const dataCompra = compra.dataVenda || compra.data;
                                      const valorTotalCompra = compra.total || compra.valor;
                                      const metodoPagamento = compra.metodoPagamento || compra.metodo;

                                      return (
                                        <li key={index} className="details-purchase-item item-compra">
                                          <div className="purchase-header">
                                            <span className="badge-tipo badge-tipo-orange">🛒 COMPRA</span>
                                            <strong>Data:</strong> {new Date(dataCompra).toLocaleDateString()} | <strong> Valor:</strong> R$ {valorTotalCompra?.toFixed(2).replace('.', ',')}
                                          </div>

                                          <div className="purchase-body">
                                            <p><strong>Método:</strong> {metodoPagamento?.toUpperCase()}</p>

                                            {metodoPagamento === 'fiado' && (
                                              <div className="resumo-fiado">
                                                <p><strong>Entrada:</strong> R$ {(compra.valorEntrada || 0).toFixed(2).replace('.', ',')}</p>
                                                {compra.valorDevido > 0 ? (
                                                  <p><strong>Ainda deve nesta compra:</strong> R$ {(compra.valorDevido).toFixed(2).replace('.', ',')}</p>
                                                ) : (
                                                  <p><strong style={{ color: '#059669' }}>Compra totalmente quitada! ✅</strong></p>
                                                )}

                                                {Array.isArray(compra.parcelas) && compra.parcelas.length > 0 && (
                                                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                                    <h5 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#374151' }}>Status do Carnê:</h5>
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                      {compra.parcelas.map(parcela => (
                                                        <li key={parcela.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: '13px' }}>
                                                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span><strong>{parcela.numeroParcela}ª Parcela</strong> - R$ {parcela.valor?.toFixed(2).replace('.', ',')}</span>
                                                            <span style={{ color: '#6b7280', fontSize: '11px' }}>
                                                              {parcela.status === 'PAGA' ? (
                                                                <>Pago em: {parcela.dataPagamento ? new Date(parcela.dataPagamento + 'T00:00:00').toLocaleDateString() : '--'}</>
                                                              ) : (
                                                                <>Venc: {parcela.dataVencimento ? new Date(parcela.dataVencimento + 'T00:00:00').toLocaleDateString() : '--'}</>
                                                              )}
                                                            </span>
                                                          </div>
                                                          <div>
                                                            {parcela.status === 'PAGA' ? (
                                                              <span className="badge badge-green" style={{ fontSize: '11px', padding: '4px 8px' }}>PAGA ✅</span>
                                                            ) : (
                                                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                <span className="badge badge-orange" style={{ fontSize: '11px', padding: '4px 8px' }}>PENDENTE</span>
                                                                <button onClick={() => handleAbrirModal(cliente, parcela)} className="btn btn-receber" style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '4px' }}>
                                                                  Pagar 💲
                                                                </button>
                                                              </div>
                                                            )}
                                                          </div>
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                                )}
                                              </div>
                                            )}

                                            {(metodoPagamento === 'cartao' || metodoPagamento === 'pix' || metodoPagamento === 'especie') && (
                                              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                                <p style={{ margin: 0 }}>
                                                  <strong style={{ color: '#166534' }}>Compra quitada no ato da venda ✅</strong>
                                                </p>
                                                <p style={{ color: '#15803d', fontSize: '13px', marginTop: '4px', marginBottom: 0 }}>
                                                  Pago via: <strong>{metodoPagamento.toUpperCase()}</strong>
                                                  {metodoPagamento === 'cartao' && compra.qtdParcelas > 1 && ` em ${compra.qtdParcelas}x na maquininha.`}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </li>
                                      );
                                    })}
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
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <ModalBaixaPagamento
          cliente={clienteParaPagamento}
          parcela={parcelaSelecionada}
          onClose={() => {
            setIsModalOpen(false);
            setParcelaSelecionada(null);
          }}
          onSucesso={handleSucessoPagamento}
        />
      )}
    </div>
  );
};

export default ClientesDashboard;