import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiClock, FiX } from 'react-icons/fi';
import Paginacao from '../../../components/paginacao/Paginacao';
import { leadService } from '../../../services/leadService';
import './LeadsDashboard.css';

const LeadsDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados da Paginação
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para o Modal de Histórico
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [leadSelecionadoParaHistorico, setLeadSelecionadoParaHistorico] = useState(null);
  
  // 👇 Controle de bloqueio dos botões
  const [enviandoMensagemId, setEnviandoMensagemId] = useState(null);
  const [leadsNaFila, setLeadsNaFila] = useState([]); // Guarda quem já foi pra fila na sessão atual

  useEffect(() => {
    fetchLeads(currentPage);
  }, [currentPage]);

  const fetchLeads = async (pageIndex) => {
    try {
      setLoading(true);
      const data = await leadService.listarTodos(pageIndex, 10);
      if (data && data.content) {
        setLeads(data.content);
        setTotalPages(data.totalPages);
      } else if (Array.isArray(data)) {
        setLeads(data);
        setTotalPages(1);
      } else {
        setLeads([]);
      }
    } catch (error) {
      console.error("Erro ao buscar leads", error);
      alert("Não foi possível carregar os leads.");
      setLeads([]); 
    } finally {
      setLoading(false);
    }
  };

  const alternarStatus = async (id) => {
    try {
      const leadAtualizado = await leadService.alternarStatus(id);
      setLeads(leads.map(lead => lead.id === id ? leadAtualizado : lead));
    } catch (error) {
      alert("Erro ao alterar o status do lead.");
    }
  };

  const marcarComoComprado = async (id) => {
    try {
      const leadAtualizado = await leadService.marcarComoComprado(id);
      setLeads(leads.map(lead => lead.id === id ? leadAtualizado : lead));
    } catch (error) {
      alert("Erro ao registrar a compra.");
    }
  };

  const dispararWhatsapp = async (lead) => {
    // Evita clique duplo acidental se já estiver enviando ou na fila
    if (enviandoMensagemId === lead.id || leadsNaFila.includes(lead.id)) return;
    
    const texto = `Olá ${lead.nome}! Aqui é da Clarice Joias. Vimos que você se interessou por nossas joias. Temos uma oferta especial liberada para você hoje! Gostaria de conferir?`;

    try {
      setEnviandoMensagemId(lead.id);
      
      // Chamada para o backend agendar na fila
      await leadService.dispararWhatsapp(lead.id, texto);
      
      // Se deu sucesso, marca visualmente como agendado
      setLeadsNaFila(prev => [...prev, lead.id]);
      
    } catch (error) {
      let mensagemErro = `Falha ao agendar mensagem para ${lead.nome}.`;
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          mensagemErro = error.response.data;
        } else if (error.response.data.message) {
          mensagemErro = error.response.data.message;
        } else if (error.response.data.error) {
          mensagemErro = error.response.data.error;
        }
      }
      // alert(mensagemErro);
    } finally {
      setEnviandoMensagemId(null);
    }
  };

  const abrirModalHistorico = (lead) => {
    setLeadSelecionadoParaHistorico(lead);
    setIsModalAberto(true);
  };

  const fecharModal = () => {
    setIsModalAberto(false);
    setLeadSelecionadoParaHistorico(null);
  };

  if (loading) return <div className="mensagem-sistema">Carregando leads do sistema...</div>;

  return (
    <div className="leads-container">
      <h1 className="leads-title">Gerenciamento de Leads</h1>

      <div className="leads-table-wrapper">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Interesse</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan="4" className="mensagem-sistema">Nenhum lead encontrado.</td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className={!lead.ativo ? 'inativo' : ''}>
                  <td>
                    <p className="lead-nome">{lead.nome}</p>
                    <p className="lead-contato">{lead.whatsapp}</p>
                    <p className="lead-contato">{lead.email}</p>
                    {lead.historicoDisparos && lead.historicoDisparos.length > 0 && (
                      <p className="lead-ultimo-disparo" style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                        <FiClock style={{ marginRight: '4px' }}/>
                        Último envio: {new Date(lead.historicoDisparos[lead.historicoDisparos.length - 1].dataHoraDisparo).toLocaleDateString()}
                      </p>
                    )}
                  </td>

                  <td>
                    {lead.itens && lead.itens.length > 0 ? (
                      <ul className="lead-itens-lista">
                        {lead.itens.map((item, index) => (
                          <li key={index}>
                            <span className="item-qtd">{item.quantidade}x</span> {item.produto?.nome}
                            <span className="item-preco">(R$ {item.precoMomento?.toFixed(2)})</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="carrinho-vazio">Carrinho vazio / Sem itens</span>
                    )}
                  </td>

                  <td>
                    {lead.comprou ? (
                      <span className="badge badge-comprou">Comprou</span>
                    ) : (
                      <span className="badge badge-pendente">Pendente</span>
                    )}
                    {!lead.ativo && (
                      <span className="badge badge-inativo">Inativo</span>
                    )}
                  </td>

                  <td>
                    <div className="acoes-container">
                      
                      {/* 👇 BOTÃO DE DISPARO ATUALIZADO */}
                      <button
                        onClick={() => dispararWhatsapp(lead)}
                        className={`btn-acao ${leadsNaFila.includes(lead.id) ? 'btn-cinza' : 'btn-azul'}`}
                        disabled={!lead.ativo || enviandoMensagemId === lead.id || leadsNaFila.includes(lead.id)}
                      >
                        {enviandoMensagemId === lead.id 
                          ? 'Agendando...' 
                          : leadsNaFila.includes(lead.id) 
                            ? 'Na Fila ⏳' 
                            : 'Disparar Whatsapp'}
                      </button>

                      <button
                        onClick={() => abrirModalHistorico(lead)}
                        className="btn-acao btn-cinza"
                        title="Ver histórico de mensagens"
                      >
                        <FiClock /> Histórico
                      </button>

                      {!lead.comprou && lead.ativo && (
                        <button
                          onClick={() => marcarComoComprado(lead.id)}
                          className="btn-acao btn-verde"
                        >
                          Marcar Compra
                        </button>
                      )}

                      <button
                        onClick={() => alternarStatus(lead.id)}
                        className={`btn-acao ${lead.ativo ? 'btn-vermelho' : 'btn-cinza'}`}
                      >
                        {lead.ativo ? 'Desativar' : 'Reativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Paginacao
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* MODAL DE HISTÓRICO MANTIDO IGUAL */}
      {isModalAberto && leadSelecionadoParaHistorico && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Histórico de Disparos - {leadSelecionadoParaHistorico.nome}</h2>
              <button onClick={fecharModal} className="btn-fechar-modal"><FiX size={24} /></button>
            </div>
            
            <div className="modal-body">
              {!leadSelecionadoParaHistorico.historicoDisparos || leadSelecionadoParaHistorico.historicoDisparos.length === 0 ? (
                <p className="mensagem-sistema">Nenhum disparo registrado para este lead ainda.</p>
              ) : (
                <table className="historico-table">
                  <thead>
                    <tr>
                      <th>Data e Hora</th>
                      <th>Operador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadSelecionadoParaHistorico.historicoDisparos.map((hist, idx) => (
                      <tr key={idx}>
                        <td>{new Date(hist.dataHoraDisparo).toLocaleString('pt-BR')}</td>
                        <td>{hist.operador || 'Sistema / Batch'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsDashboard;