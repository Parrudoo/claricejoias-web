import React, { useState, useEffect } from 'react';
import { FiUsers, FiSearch, FiMessageCircle, FiDollarSign } from 'react-icons/fi';

import { useAuth } from '../../context/AuthProvider';
import { ClienteService } from '../../services/ClienteService';

const ClientesRevendedora = () => {
    const { keycloakData } = useAuth();
    const usuarioId = keycloakData?.id; 

    const [clientes, setClientes] = useState([]);
    const [termoBusca, setTermoBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        if (usuarioId) {
            carregarClientes();
        }
    }, [usuarioId]);

    const carregarClientes = async () => {
        try {
            setLoading(true);
            const dados = await ClienteService.listarMeusClientes();
            
            // Trava de segurança para paginação/arrays
            if (Array.isArray(dados)) {
                setClientes(dados);
            } else if (dados && Array.isArray(dados.content)) {
                setClientes(dados.content);
            } else {
                setClientes([]);
            }
        } catch (error) {
            console.error("Erro ao puxar clientes:", error);
            setErro('Não foi possível carregar sua lista de clientes.');
            setClientes([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtra os clientes localmente pela busca
    const clientesFiltrados = clientes.filter(cliente => 
        cliente.nome?.toLowerCase().includes(termoBusca.toLowerCase()) ||
        cliente.whatsapp?.includes(termoBusca)
    );

    // Resumo para o topo da tela
    const totalClientes = clientes.length;
    const totalFiadoAberto = clientes.reduce((total, c) => total + (c.saldoDevedor || 0), 0);

    const formatarDinheiro = (valor) => {
        return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Função para abrir o WhatsApp com mensagem pronta
    const abrirWhatsApp = (whatsapp, nome, saldoDevedor) => {
        if (!whatsapp) return;
        // Limpa o número (tira traços, espaços, parênteses)
        const numeroLimpo = whatsapp.replace(/\D/g, '');
        
        let mensagem = `Olá, ${nome}! Tudo bem? Passando para avisar das novidades da Clarice Joias! ✨`;
        if (saldoDevedor > 0) {
            mensagem = `Olá, ${nome}! Tudo bem? Passando para enviar o lembrete da sua maleta. O seu saldo em aberto está ${formatarDinheiro(saldoDevedor)}. Quando fica bom para acertarmos? ✨`;
        }
        
        const url = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="vendas-container">
            <div className="vendas-card">
                <header className="vendas-header">
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiUsers /> Meus Clientes
                        </h2>
                        <p>Gerencie sua carteira de clientes e saldos (Fiado).</p>
                    </div>
                    <div className="vendas-stats" style={{ display: 'flex', gap: '15px' }}>
                        <div className="stat-box">
                            <span>Total de Clientes</span>
                            <strong>{totalClientes}</strong>
                        </div>
                        <div className="stat-box">
                            <span>A Receber (Fiado)</span>
                            <strong style={{ color: '#c62828' }}>{formatarDinheiro(totalFiadoAberto)}</strong>
                        </div>
                    </div>
                </header>

                {/* BARRA DE BUSCA */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                        <FiSearch style={{ position: 'absolute', left: '12px', top: '10px', color: '#888' }} size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar por nome ou WhatsApp..."
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                {erro && <div className="mensagem-erro" style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px' }}>{erro}</div>}

                {loading ? (
                    <div className="loading-vendas" style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
                        <p>Carregando sua lista de clientes... ✨</p>
                    </div>
                ) : (
                    <div className="tabela-responsiva">
                        <table className="tabela-vendas">
                            <thead>
                                <tr>
                                    <th>Nome do Cliente</th>
                                    <th>WhatsApp</th>
                                    <th>E-mail</th>
                                    <th className="text-right">Saldo Devedor (Fiado)</th>
                                    <th className="text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientesFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center text-gray-500" style={{ padding: '30px' }}>
                                            Nenhum cliente encontrado. Faça vendas no PDV informando o WhatsApp para salvá-los aqui!
                                        </td>
                                    </tr>
                                ) : (
                                    clientesFiltrados.map(cliente => (
                                        <tr key={cliente.id}>
                                            <td>
                                                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{cliente.nome}</span>
                                            </td>
                                            <td>{cliente.whatsapp || '--'}</td>
                                            <td>{cliente.email || '--'}</td>
                                            <td className="text-right">
                                                <span style={{ 
                                                    color: (cliente.saldoDevedor > 0) ? '#c62828' : '#2e7d32', 
                                                    fontWeight: 'bold' 
                                                }}>
                                                    {formatarDinheiro(cliente.saldoDevedor)}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button 
                                                    onClick={() => abrirWhatsApp(cliente.whatsapp, cliente.nome, cliente.saldoDevedor)}
                                                    disabled={!cliente.whatsapp}
                                                    style={{ 
                                                        background: cliente.whatsapp ? '#25D366' : '#ccc', 
                                                        color: '#fff', 
                                                        border: 'none', 
                                                        padding: '6px 12px', 
                                                        borderRadius: '6px', 
                                                        cursor: cliente.whatsapp ? 'pointer' : 'not-allowed',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontWeight: 'bold',
                                                        fontSize: '13px'
                                                    }}
                                                    title={cliente.whatsapp ? "Enviar mensagem" : "Cliente sem WhatsApp cadastrado"}
                                                >
                                                    <FiMessageCircle size={16} /> WhatsApp
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientesRevendedora;