import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiClock, FiX } from 'react-icons/fi'; // Adicionei ícones novos aqui
import Paginacao from '../../../components/paginacao/Paginacao';
import { leadService } from '../../../services/leadService';
import './LeadsDashboard.css';

const LeadsDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados da Paginação
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 👇 NOVOS ESTADOS PARA O MODAL DE HISTÓRICO
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [leadSelecionadoParaHistorico, setLeadSelecionadoParaHistorico] = useState(null);
  const [enviandoMensagemId, setEnviandoMensagemId] = useState(null); // Trava de botão da resposta anterior

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
    if (enviandoMensagemId === lead.id) return;
    const texto = `Olá ${lead.nome}! Aqui é da Clarice Joias. Vimos que você se interessou por nossas joias. Temos uma oferta especial liberada para você hoje! Gostaria de conferir?`;

    try {
      setEnviandoMensagemId(lead.id);
      // 🔥 Dica: Passe também o login/email do operador logado aqui se precisar enviar pro backend!
      await leadService.dispararWhatsapp(lead.id, texto);
      // alert(`Mensagem disparada com sucesso para ${lead.nome}!`);
    } catch (error) {
      // Como o backend agora devolve o erro da regra de negócio (ex: "Aguarde 24h..."), você pode exibir ele aqui:
      alert(error.response?.data || `Falha ao enviar mensagem para ${lead.nome}.`);
    } finally {
      setEnviandoMensagemId(null);
    }
  };

  // 👇 FUNÇÕES DO MODAL
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
                    {/* 👇 RESUMO DO ÚLTIMO DISPARO (Se o backend mandar essa info) */}
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
                      <button
                        onClick={() => dispararWhatsapp(lead)}
                        className="btn-acao btn-azul"
                        disabled={!lead.ativo || enviandoMensagemId === lead.id}
                      >
                        {enviandoMensagemId === lead.id ? 'Enviando...' : 'Disparar Whatsapp'}
                      </button>

                      {/* 👇 NOVO BOTÃO DE HISTÓRICO */}
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

      {/* 👇 ESTRUTURA DO MODAL DE HISTÓRICO */}
      {isModalAberto && leadSelecionadoParaHistorico && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Histórico de Disparos - {leadSelecionadoParaHistorico.nome}</h2>
              <button onClick={fecharModal} className="btn-fechar-modal"><FiX size={24} /></button>
            </div>
            
            <div className="modal-body">
              {/* Verifica se tem histórico mockado ou real vindo do backend */}
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
                    {/* Exemplo de iteração caso o backend devolva a lista dentro do Lead */}
                    {leadSelecionadoParaHistorico.historicoDisparos.map((hist, idx) => (
                      <tr key={idx}>
                        <td>{new Date(hist.dataHoraDisparo).toLocaleString('pt-BR')}</td>
                        {/* Se for automático pelo Spring Batch, exibe "Sistema" */}
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