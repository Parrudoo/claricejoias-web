import React, { useState, useEffect } from 'react';
import './ClientesDashboard.css';
import { ClienteService } from '../../../services/ClienteService';


const ClientesDashboard = () => {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('todos'); // 'todos' ou 'pendentes'
  const [busca, setBusca] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simulação de quem está logado no sistema (você deve pegar do seu Contexto de Autenticação/Keycloak)
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
      // 1. Salva no banco de dados o histórico da cobrança
      await ClienteService.registrarCobranca(cliente.id, usuarioLogado);
      
      // 2. Monta a mensagem e abre o WhatsApp Web/App
      const mensagem = `Olá ${cliente.nome}, tudo bem? Aqui é da Clarice Joias. Consta em nosso sistema um saldo pendente de R$ ${cliente.valorDevido?.toFixed(2).replace('.', ',')}. Gostaria de verificar uma previsão de pagamento?`;
      const url = `https://wa.me/55${cliente.telefone}?text=${encodeURIComponent(mensagem)}`;
      
      window.open(url, '_blank');
      
      // 3. Recarrega a lista para atualizar a data da última cobrança na tela
      carregarClientes();
    } catch (error) {
      alert("Erro ao registrar histórico de cobrança.");
    }
  };

  // Filtro de busca por texto (nome ou telefone)
  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) || 
    c.telefone.includes(busca)
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Gestão de Clientes</h1>
          <p className="dashboard-subtitle">Acompanhe seus clientes, saldos devedores e histórico de cobranças.</p>
        </div>
      </header>

      {/* Barra de Filtros */}
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

      {/* Tabela de Clientes */}
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
                  <tr key={cliente.id}>
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
                      <button 
                        onClick={() => handleCobrarWhatsApp(cliente)}
                        disabled={cliente.valorDevido <= 0}
                        className="btn-whatsapp"
                      >
                        Cobrar WhatsApp
                      </button>
                    </td>
                  </tr>
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