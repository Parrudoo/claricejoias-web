import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Paginacao from '../../../components/paginacao/Paginacao';
import { leadService } from '../../../services/leadService';
import './LeadsDashboard.css';

const LeadsDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👇 NOVOS ESTADOS PARA PAGINAÇÃO
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // O useEffect agora escuta a variável currentPage. 
  // Se ela mudar, ele busca a nova página no backend.
  useEffect(() => {
    fetchLeads(currentPage);
  }, [currentPage]);

  const fetchLeads = async (pageIndex) => {
    try {
      setLoading(true);
      const data = await leadService.listarTodos(pageIndex, 10);

      // Verifica se o backend enviou o objeto com paginação
      if (data && data.content) {
        // 👇 A MÁGICA AQUI: setLeads precisa do '.content' para receber o Array [ {...}, {...} ]
        setLeads(data.content);
        setTotalPages(data.totalPages);
      }
      // Fallback caso a API mande a lista antiga direta
      else if (Array.isArray(data)) {
        setLeads(data);
        setTotalPages(1);
      }
      // Prevenção de falhas para não quebrar a tela
      else {
        setLeads([]);
      }

    } catch (error) {
      console.error("Erro ao buscar leads", error);
      alert("Não foi possível carregar os leads.");
      setLeads([]); // 👇 Garante que o leads seja um array vazio em caso de erro
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

  const dispararCampanha = (whatsapp) => {
    const payload = {
      number: whatsapp,
      textMessage: { text: "Olá! Vimos que você se interessou por nossas joias. Temos uma oferta especial hoje!" }
    };
    console.log("Enviando via Evolution API para:", payload);
    alert(`Ação de disparo iniciada para ${whatsapp}!`);
  };

  // 👇 FUNÇÕES PARA NAVEGAR ENTRE AS PÁGINAS
  const irParaPaginaAnterior = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const irParaProximaPagina = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
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
                      <span className="carrinho-vazio">Carrinho vazio / Sem itens registrados</span>
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

                  <td >
                    <div className="acoes-container">
                      <button
                        onClick={() => dispararCampanha(lead.whatsapp)}
                        className="btn-acao btn-azul"
                        disabled={!lead.ativo}
                      >
                        Disparar Whatsapp
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

      {/* 👇 CONTROLES DE PAGINAÇÃO MINIMALISTAS NO FINAL DO ARQUIVO */}
      <Paginacao
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default LeadsDashboard;