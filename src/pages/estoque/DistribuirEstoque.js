import React, { useState, useEffect } from 'react';
import { FiBriefcase, FiPackage, FiArrowRight, FiCheckCircle, FiRefreshCcw } from 'react-icons/fi';
import { RevendedorService } from '../../services/RevendedorService';
import { EstoqueRevendedorService } from '../../services/EstoqueRevendedorService';
import { ProdutoService } from '../../services/ProdutoService';

const DistribuirEstoque = () => {
    const [revendedores, setRevendedores] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [maletaAtual, setMaletaAtual] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const [formData, setFormData] = useState({
        revendedorId: '',
        produtoId: '',
        quantidade: 1
    });

    useEffect(() => {
        carregarDadosIniciais();
    }, []);

    // Quando o usuário muda de revendedor, puxa a maleta dele
    useEffect(() => {
        if (formData.revendedorId) {
            carregarMaleta(formData.revendedorId);
        } else {
            setMaletaAtual([]);
        }
    }, [formData.revendedorId]);

    const carregarDadosIniciais = async () => {
        try {
            const revData = await RevendedorService.listarTodos();
            setRevendedores(revData);

            // Supondo que você tem um ProdutoService que lista o catálogo
            const prodData = await ProdutoService.listarTodos(); 
            setProdutos(prodData);
        } catch (error) {
            setErro('Erro ao carregar listas de produtos ou revendedores.');
        }
    };

    const carregarMaleta = async (idRevendedor) => {
        try {
            const dados = await EstoqueRevendedorService.listarMaleta(idRevendedor);
            
            // TRAVA DE SEGURANÇA: 
            if (Array.isArray(dados)) {
                setMaletaAtual(dados);
            } else if (dados && Array.isArray(dados.content)) {
                setMaletaAtual(dados.content);
            } else {
                setMaletaAtual([]);
            }
        } catch (error) {
            console.error("Erro ao puxar maleta:", error);
            setErro('Erro ao carregar a maleta do revendedor.');
            setMaletaAtual([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ==========================================
    // FUNÇÃO PARA ENVIAR PARA A MALETA
    // ==========================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.revendedorId || !formData.produtoId || formData.quantidade <= 0) {
            setErro("Preencha todos os campos corretamente.");
            return;
        }

        setLoading(true);
        setErro('');
        setSucesso('');

        try {
            await EstoqueRevendedorService.transferir({
                revendedorId: formData.revendedorId,
                produtoId: parseInt(formData.produtoId),
                quantidade: parseInt(formData.quantidade)
            });
            
            setSucesso('Produto transferido para a maleta com sucesso!');
            setFormData(prev => ({ ...prev, quantidade: 1, produtoId: '' }));
            carregarMaleta(formData.revendedorId); 
            carregarDadosIniciais(); 
            
        } catch (error) {
            setErro(error.response?.data || 'Erro ao transferir estoque. Verifique se há saldo no Estoque Central.');
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // NOVA FUNÇÃO: DEVOLVER PARA ESTOQUE CENTRAL
    // ==========================================
    const handleDevolver = async (produtoId, quantidadeAtual) => {
        // Pede a quantidade ao usuário
        const input = window.prompt(`Quantas unidades deseja devolver ao Estoque Central?\n(Máximo disponível na maleta: ${quantidadeAtual})`, "1");
        
        if (!input) return; // Se o usuário cancelar, não faz nada

        const qtdParaDevolver = parseInt(input, 10);

        if (isNaN(qtdParaDevolver) || qtdParaDevolver <= 0) {
            alert("Quantidade inválida! Digite um número maior que zero.");
            return;
        }

        if (qtdParaDevolver > quantidadeAtual) {
            alert(`Você não pode devolver mais do que possui na maleta (${quantidadeAtual}).`);
            return;
        }

        setLoading(true);
        setErro('');
        setSucesso('');

        try {
            await EstoqueRevendedorService.devolver({
                revendedorId: formData.revendedorId,
                produtoId: produtoId,
                quantidade: qtdParaDevolver
            });
            
            setSucesso(`Devolução de ${qtdParaDevolver} unidade(s) realizada com sucesso!`);
            carregarMaleta(formData.revendedorId); // Atualiza a maleta
            carregarDadosIniciais(); // Atualiza o saldo do estoque central no select
            
        } catch (error) {
            setErro(error.response?.data || 'Erro ao tentar devolver produto ao estoque central.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="vendas-container">
            <div className="vendas-card">
                <header className="vendas-header">
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiBriefcase /> Distribuição de Maletas
                        </h2>
                        <p>Transfira peças do Estoque Central para as revendedoras.</p>
                    </div>
                </header>

                {erro && <div className="mensagem-erro" style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '15px' }}>{erro}</div>}
                {sucesso && <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', marginBottom: '15px' }}><FiCheckCircle /> {sucesso}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '20px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '30px', border: '1px solid #eee', alignItems: 'flex-end' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '2', minWidth: '200px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '4px' }}>Revendedor (Destino)</label>
                        <select name="revendedorId" value={formData.revendedorId} onChange={handleChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                            <option value="">Selecione a vendedora...</option>
                            {revendedores.map(rev => (
                                <option key={rev.id} value={rev.id}>{rev.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: '3', minWidth: '250px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '4px' }}>Produto do Estoque Central</label>
                        <select name="produtoId" value={formData.produtoId} onChange={handleChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                            <option value="">Selecione o produto...</option>
                            {produtos.map(prod => (
                                <option key={prod.id} value={prod.id} disabled={prod.estoque <= 0}>
                                    {prod.nome} (Saldo Central: {prod.estoque || 0})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '100px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '4px' }}>Quantidade</label>
                        <input 
                            type="number" name="quantidade" min="1" required value={formData.quantidade} onChange={handleChange}
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ display: 'flex' }}>
                        <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#1a1a1a', color: '#D4AF37', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            <FiArrowRight /> {loading ? 'Aguarde...' : 'Transferir p/ Maleta'}
                        </button>
                    </div>
                </form>

                {/* Exibição da Maleta Atual do Revendedor Selecionado */}
                {formData.revendedorId && (
                    <>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#333' }}>
                            <FiPackage /> Maleta Atual da Vendedora
                        </h3>
                        
                        <div className="tabela-responsiva">
                            <table className="tabela-vendas">
                                <thead>
                                    <tr>
                                        <th>ID Produto</th>
                                        <th>Foto</th>
                                        <th>Nome da Joia</th>
                                        <th className="text-center">Qtd. na Maleta</th>
                                        <th className="text-center">Ações</th> {/* NOVA COLUNA */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {maletaAtual.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center text-gray-500">A maleta desta vendedora está vazia.</td></tr>
                                    ) : (
                                        maletaAtual.map(item => (
                                            <tr key={item.id}>
                                                <td>#{item.produto.id}</td>
                                                <td>
                                                    {item.produto.img ? (
                                                        <img src={item.produto.img} alt="Joia" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                    ) : (
                                                        <div style={{ width: '40px', height: '40px', background: '#eee', borderRadius: '4px' }}></div>
                                                    )}
                                                </td>
                                                <td><strong>{item.produto.nome}</strong></td>
                                                <td className="text-center">
                                                    <span style={{ background: '#1a1a1a', color: '#D4AF37', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold' }}>
                                                        {item.quantidade} un.
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    {/* BOTÃO DE DEVOLUÇÃO */}
                                                    <button 
                                                        onClick={() => handleDevolver(item.produto.id, item.quantidade)}
                                                        disabled={loading}
                                                        style={{
                                                            background: 'transparent',
                                                            color: '#e63946',
                                                            border: '1px solid #e63946',
                                                            padding: '6px 12px',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold'
                                                        }}
                                                        title="Devolver para o Estoque Central"
                                                    >
                                                        <FiRefreshCcw /> Devolver
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DistribuirEstoque;