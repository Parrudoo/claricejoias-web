import React, { useState, useEffect } from 'react';
import { FiClock, FiX, FiMessageCircle, FiCheck, FiPower } from 'react-icons/fi';
import Paginacao from '../../../components/paginacao/Paginacao';
import { leadService } from '../../../services/leadService';
import './LeadsDashboard.css';

const LeadsDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados da Paginação
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Estados Modal e Fila
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [leadSelecionadoParaHistorico, setLeadSelecionadoParaHistorico] = useState(null);
  const [enviandoMensagemId, setEnviandoMensagemId] = useState(null);
  const [leadsNaFila, setLeadsNaFila] = useState([]);

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
      } else {
        setLeads(Array.isArray(data) ? data : []);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Erro ao buscar leads", error);
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
    if (enviandoMensagemId === lead.id || leadsNaFila.includes(lead.id)) return;

    try {
      setEnviandoMensagemId(lead.id);
      await leadService.dispararWhatsapp(lead.id);
      setLeadsNaFila(prev => [...prev, lead.id]);
    } catch (error) {
      console.error("Falha ao agendar mensagem.", error);
    } finally {
      setEnviandoMensagemId(null);
    }
  };

  const calcularResumoCarrinho = (itens) => {
    if (!itens || itens.length === 0) return { qtd: 0, total: 0 };
    const qtd = itens.reduce((acc, item) => acc + item.quantidade, 0);
    const total = itens.reduce((acc, item) => acc + (item.quantidade * item.precoMomento), 0);
    return { qtd, total };
  };

  if (loading) return <div className="mensagem-sistema">Carregando leads...</div>;

  return (
    <div className="leads-container">
      <div className="leads-header">
        <h1 className="leads-title">Leads & CRM</h1>
      </div>

      <div className="leads-table-wrapper">
        <table className="leads-table minimalistic-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Carrinho</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan="4" className="mensagem-sistema">Nenhum lead no momento.</td>
              </tr>
            ) : (
              leads.map((lead) => {
                const resumoCarrinho = calcularResumoCarrinho(lead.itens);

                return (
                  <tr key={lead.id} className={!lead.ativo ? 'inativo' : ''}>
                    {/* COLUNA 1: CLIENTE */}
                    <td>
                      <div className="lead-info-compact">
                        <strong>{lead.nome}</strong>
                        <span>{lead.whatsapp}</span>
                        {/* NOVA LINHA: Exibe a tag do revendedor se existir */}
                        {lead.nomeRevendedor ? (
                          <span className="lead-revendedor">Loja: {lead.nomeRevendedor}</span>
                        ) : (
                          <span className="lead-revendedor matriz">Loja Matriz</span>
                        )}
                      </div>
                    </td>

                    {/* COLUNA 2: RESUMO DO CARRINHO */}
                    <td>
                      {resumoCarrinho.qtd > 0 ? (
                        <div className="carrinho-resumo">
                          <span className="carrinho-qtd">{resumoCarrinho.qtd} item(ns)</span>
                          <span className="carrinho-valor">R$ {resumoCarrinho.total.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="carrinho-vazio">-</span>
                      )}
                    </td>

                    {/* COLUNA 3: STATUS SIMPLIFICADO */}
                    <td>
                      <div className="status-badges">
                        {lead.comprou ? (
                          <span className="badge badge-comprou">Cliente</span>
                        ) : (
                          <span className="badge badge-pendente">Pendente</span>
                        )}
                        {!lead.ativo && <span className="badge badge-inativo">Inativo</span>}
                      </div>
                    </td>

                
                   {/* COLUNA 4: AÇÕES FOCADAS */}
                    {/* COLUNA 4: AÇÕES FOCADAS */}
                    {/* 👇 O td fica sem nenhuma classe especial para não quebrar a borda */}
                    <td>
                      {/* 👇 A div flexbox volta para cá, abraçando tudo! */}
                      <div className="acoes-compactas">
                        
                        {/* Botão Principal: WhatsApp */}
                        <button
                          onClick={() => dispararWhatsapp(lead)}
                          className={`btn-icon-text ${leadsNaFila.includes(lead.id) ? 'agendado' : 'whatsapp'}`}
                          disabled={!lead.ativo || enviandoMensagemId === lead.id || leadsNaFila.includes(lead.id)}
                          title="Chamar no WhatsApp"
                        >
                          <FiMessageCircle />
                          {leadsNaFila.includes(lead.id) ? 'Na Fila' : 'Chamar'}
                        </button>

                        {/* Botões Secundários: Ícones */}
                        <div className="acoes-secundarias">
                          {!lead.comprou && lead.ativo && (
                            <button onClick={() => marcarComoComprado(lead.id)} className="btn-icon check" title="Marcar como Comprou">
                              <FiCheck />
                            </button>
                          )}

                          <button onClick={() => { setLeadSelecionadoParaHistorico(lead); setIsModalAberto(true); }} className="btn-icon historico" title="Histórico">
                            <FiClock />
                          </button>

                          <button onClick={() => alternarStatus(lead.id)} className="btn-icon toggle" title={lead.ativo ? "Desativar" : "Reativar"}>
                            <FiPower />
                          </button>
                        </div>
                        
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Paginacao currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* MODAL DE HISTÓRICO - Mantido limpo */}
      {isModalAberto && leadSelecionadoParaHistorico && (
        <div className="modal-overlay">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h2>Histórico de {leadSelecionadoParaHistorico.nome.split(' ')[0]}</h2>
              <button onClick={() => setIsModalAberto(false)} className="btn-fechar-modal"><FiX size={20} /></button>
            </div>

            <div className="modal-body">
              {!leadSelecionadoParaHistorico.historicoDisparos?.length ? (
                <p className="mensagem-sistema">Sem interações registradas.</p>
              ) : (
                <ul className="timeline-simples">
                  {leadSelecionadoParaHistorico.historicoDisparos.map((hist, idx) => (
                    <li key={idx}>
                      <span className="timeline-data">{new Date(hist.dataHoraDisparo).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="timeline-evento">Mensagem disparada</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsDashboard;