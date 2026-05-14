import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiUsers, FiTrash2, FiSave } from 'react-icons/fi';
import { RevendedorService } from '../../services/RevendedorService';

const CadastrarRevendedor = () => {
    const [revendedores, setRevendedores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    // 1. Adicionado o campo 'slug' no estado inicial
    const [formData, setFormData] = useState({
        id: '',
        nome: '',
        email: '',
        slug: '' 
    });

    useEffect(() => {
        carregarRevendedores();
    }, []);

    const carregarRevendedores = async () => {
        try {
            const dados = await RevendedorService.listarTodos();
            setRevendedores(dados);
        } catch (error) {
            console.error("Erro ao carregar revendedores:", error);
            setErro('Não foi possível carregar a lista de revendedores.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');
        setSucesso('');

        try {
            await RevendedorService.cadastrar(formData);
            setSucesso('Revendedor vinculado com sucesso!');
            // 2. Limpar o campo 'slug' após o sucesso
            setFormData({ id: '', nome: '', email: '', slug: '' });
            carregarRevendedores(); // Atualiza a tabela
        } catch (error) {
            setErro('Erro ao vincular revendedor. Verifique se o ID ou Slug já existem.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Deseja realmente remover este vínculo?")) {
            try {
                await RevendedorService.deletar(id);
                setSucesso('Revendedor removido com sucesso!');
                carregarRevendedores();
            } catch (error) {
                setErro('Erro ao remover o revendedor.');
            }
        }
    };

    return (
        <div className="vendas-container">
            <div className="vendas-card">
                <header className="vendas-header">
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiUserPlus /> Vincular Revendedor
                        </h2>
                        <p>Gerencie o acesso das vendedoras consignadas (Maleta).</p>
                    </div>
                </header>

                {erro && <div className="mensagem-erro" style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '15px' }}>{erro}</div>}
                {sucesso && <div style={{ padding: '10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', marginBottom: '15px' }}>{sucesso}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '20px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '20px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '2', minWidth: '250px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '4px' }}>ID do Keycloak (UUID)*</label>
                        <input 
                            type="text" name="id" required value={formData.id} onChange={handleChange}
                            placeholder="Ex: f47ac10b-58cc..."
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '2', minWidth: '200px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '4px' }}>Nome Completo*</label>
                        <input 
                            type="text" name="nome" required value={formData.nome} onChange={handleChange}
                            placeholder="Ex: Maria Joias"
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '2', minWidth: '200px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '4px' }}>E-mail*</label>
                        <input 
                            type="email" name="email" required value={formData.email} onChange={handleChange}
                            placeholder="maria@email.com"
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    
                    {/* 3. Novo input para o Slug */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '2', minWidth: '200px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '4px' }}>Slug*</label>
                        <input 
                            type="text" name="slug" required value={formData.slug} onChange={handleChange}
                            placeholder="Ex: maria-joias"
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                        <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#1a1a1a', color: '#D4AF37', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                            <FiSave /> {loading ? 'Salvando...' : 'Vincular'}
                        </button>
                    </div>
                </form>

                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '30px', marginBottom: '15px' }}>
                    <FiUsers /> Revendedores Cadastrados
                </h3>
                
                <div className="tabela-responsiva">
                    <table className="tabela-vendas">
                        <thead>
                            <tr>
                                <th>ID (Keycloak)</th>
                                <th>Nome</th>
                                <th>E-mail</th>
                                {/* 4. Adicionado cabeçalho do Slug na tabela */}
                                <th>Slug</th>
                                <th>Status</th>
                                <th className="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revendedores.length === 0 ? (
                                <tr><td colSpan="6" className="text-center">Nenhum revendedor vinculado.</td></tr>
                            ) : (
                                revendedores.map(rev => (
                                    <tr key={rev.id}>
                                        <td style={{ fontSize: '12px', color: '#666' }}>{rev.id}</td>
                                        <td><strong>{rev.nome}</strong></td>
                                        <td>{rev.email}</td>
                                        {/* 5. Exibição do Slug na tabela */}
                                        <td style={{ color: '#0056b3' }}>{rev.slug}</td>
                                        <td>
                                            <span style={{ background: rev.ativo ? '#e8f5e9' : '#ffebee', color: rev.ativo ? '#2e7d32' : '#c62828', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                                                {rev.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <button onClick={() => handleDelete(rev.id)} style={{ background: 'transparent', border: 'none', color: '#c62828', cursor: 'pointer' }} title="Remover Vínculo">
                                                <FiTrash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CadastrarRevendedor;