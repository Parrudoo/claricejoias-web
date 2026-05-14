import React, { useState, useEffect } from 'react';
import { FiBriefcase, FiPackage, FiSearch, FiInfo } from 'react-icons/fi';

// Importando o contexto para pegar o ID da revendedora logada
import { useAuth } from '../../context/AuthProvider';
// Importando os serviços
import { EstoqueRevendedorService } from '../../services/EstoqueRevendedorService';
import { ImagemService } from '../../services/ImagemService';

const MaletaRevendedora = () => {
    const { keycloakData } = useAuth();
    const usuarioId = keycloakData?.id; // Pega o UUID do Keycloak

    const [maleta, setMaleta] = useState([]);
    const [termoBusca, setTermoBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        if (usuarioId) {
            carregarMinhaMaleta();
        }
    }, [usuarioId]);

    const carregarMinhaMaleta = async () => {
        try {
            setLoading(true);
            const dados = await EstoqueRevendedorService.listarMaleta(usuarioId);
            
            // Trava de segurança (a mesma que fizemos no Admin)
            if (Array.isArray(dados)) {
                setMaleta(dados);
            } else if (dados && Array.isArray(dados.content)) {
                setMaleta(dados.content);
            } else {
                setMaleta([]);
            }
        } catch (error) {
            console.error("Erro ao puxar maleta:", error);
            setErro('Não foi possível carregar o seu estoque atual.');
            setMaleta([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtra os itens localmente baseado na busca da revendedora
    const itensFiltrados = maleta.filter(item => 
        item.produto?.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        String(item.produto?.id) === termoBusca
    );

    // Cálculos para o painel de resumo
    const totalJoiasDiferentes = maleta.length;
    const totalPecas = maleta.reduce((total, item) => total + item.quantidade, 0);
    const valorTotalEstimado = maleta.reduce((total, item) => total + (item.quantidade * (item.produto?.preco || 0)), 0);

    const formatarDinheiro = (valor) => {
        return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="vendas-container">
            <div className="vendas-card">
                <header className="vendas-header">
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiBriefcase /> Minha Maleta
                        </h2>
                        <p>Confira as joias que estão sob sua responsabilidade.</p>
                    </div>
                    <div className="vendas-stats" style={{ display: 'flex', gap: '15px' }}>
                        <div className="stat-box">
                            <span>Total de Peças</span>
                            <strong>{totalPecas} un.</strong>
                        </div>
                        <div className="stat-box">
                            <span>Valor em Estoque</span>
                            <strong style={{ color: '#D4AF37' }}>{formatarDinheiro(valorTotalEstimado)}</strong>
                        </div>
                    </div>
                </header>

                {/* ALERTA INFORMATIVO */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '15px', backgroundColor: '#e3f2fd', color: '#0d47a1', borderRadius: '8px', marginBottom: '20px' }}>
                    <FiInfo size={20} style={{ minWidth: '20px', marginTop: '2px' }} />
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4' }}>
                        <strong>Dica:</strong> Este é apenas um espelho do seu estoque físico atual. 
                        As quantidades diminuem automaticamente quando você realiza uma venda no PDV, e aumentam quando a loja matriz transfere novas peças para você.
                    </p>
                </div>

                {/* BARRA DE BUSCA */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                        <FiSearch style={{ position: 'absolute', left: '12px', top: '10px', color: '#888' }} size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar joia por nome ou código..."
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
                        <p>Contando as joias da sua maleta... ✨</p>
                    </div>
                ) : (
                    <div className="tabela-responsiva">
                        <table className="tabela-vendas">
                            <thead>
                                <tr>
                                    <th>Cód.</th>
                                    <th>Foto</th>
                                    <th>Nome da Joia</th>
                                    <th>Preço de Venda</th>
                                    <th className="text-center">Qtd. Disponível</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itensFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center text-gray-500" style={{ padding: '30px' }}>
                                            {termoBusca ? 'Nenhuma joia encontrada com esse nome/código na sua maleta.' : 'Sua maleta está vazia no momento.'}
                                        </td>
                                    </tr>
                                ) : (
                                    itensFiltrados.map(item => (
                                        <tr key={item.id} style={{ opacity: item.quantidade === 0 ? 0.5 : 1 }}>
                                            <td><strong>#{item.produto?.id}</strong></td>
                                            <td>
                                                {item.produto?.img ? (
                                                    <img 
                                                        src={ImagemService.getUrl(item.produto.img)} 
                                                        alt="Joia" 
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} 
                                                    />
                                                ) : (
                                                    <div style={{ width: '50px', height: '50px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                                        <FiPackage size={20} />
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{item.produto?.nome}</span>
                                                {item.produto?.material && (
                                                    <span style={{ display: 'block', fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                        Material: {item.produto.material}
                                                    </span>
                                                )}
                                            </td>
                                            <td>{formatarDinheiro(item.produto?.preco)}</td>
                                            <td className="text-center">
                                                <span style={{ 
                                                    background: item.quantidade > 0 ? '#1a1a1a' : '#ffebee', 
                                                    color: item.quantidade > 0 ? '#D4AF37' : '#c62828', 
                                                    padding: '6px 14px', 
                                                    borderRadius: '16px', 
                                                    fontWeight: 'bold',
                                                    display: 'inline-block',
                                                    minWidth: '60px'
                                                }}>
                                                    {item.quantidade} {item.quantidade === 1 ? 'peça' : 'peças'}
                                                </span>
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

export default MaletaRevendedora;