import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { CategoriaService } from '../../../services/CategoriaService';

import '../categoria/ListarCategorias.css';

const ListarCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    // Estados para o modo de edição
    const [editandoId, setEditandoId] = useState(null);
    const [nomeEditado, setNomeEditado] = useState('');

    // Busca os dados assim que a tela abre
    useEffect(() => {
        carregarCategorias();
    }, []);

    const carregarCategorias = async () => {
        try {
            setLoading(true);
            const dados = await CategoriaService.listarTodas();
            setCategorias(dados);
        } catch (error) {
            console.error("Erro ao carregar:", error);
            mostrarMensagem('Erro ao carregar categorias do servidor.', 'erro');
        } finally {
            setLoading(false);
        }
    };

    const mostrarMensagem = (texto, tipo) => {
        setMensagem({ texto, tipo });
        setTimeout(() => setMensagem({ texto: '', tipo: '' }), 3000);
    };

    // --- AÇÕES DE DELETAR ---
    const handleDeletar = async (id, nome) => {
        const confirmar = window.confirm(`Tem certeza que deseja excluir a categoria "${nome}" e todas as suas joias?`);
        if (!confirmar) return;

        try {
            await CategoriaService.deletar(id);
            setCategorias(categorias.filter(cat => cat.id !== id));
            mostrarMensagem('Categoria excluída com sucesso!', 'sucesso');
        } catch (error) {
            console.error("Erro ao deletar:", error);
            mostrarMensagem('Erro ao excluir a categoria.', 'erro');
        }
    };

    // --- AÇÕES DE EDITAR ---
    const iniciarEdicao = (categoria) => {
        setEditandoId(categoria.id);
        setNomeEditado(categoria.nome);
    };

    const cancelarEdicao = () => {
        setEditandoId(null);
        setNomeEditado('');
    };

    const salvarEdicao = async (id) => {
        if (!nomeEditado.trim()) {
            mostrarMensagem('O nome não pode ficar vazio.', 'erro');
            return;
        }

        try {
            // Chama o PUT da API
            const atualizada = await CategoriaService.atualizar(id, { nome: nomeEditado });
            
            // Atualiza a lista na tela sem precisar recarregar do banco
            setCategorias(categorias.map(cat => cat.id === id ? { ...cat, nome: atualizada.nome } : cat));
            
            mostrarMensagem('Categoria atualizada!', 'sucesso');
            cancelarEdicao();
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            mostrarMensagem('Erro ao atualizar a categoria.', 'erro');
        }
    };

    return (
        <div className="lista-container">
            <div className="lista-card">
                <header className="lista-header">
                    <h2>📋 Gerenciar Categorias</h2>
                    <p>Visualize, edite o nome ou remova categorias do seu catálogo.</p>
                </header>

                {mensagem.texto && (
                    <div className={`mensagem-feedback ${mensagem.tipo}`}>
                        {mensagem.texto}
                    </div>
                )}

                {loading ? (
                    <div className="loading">Carregando acervo... ✨</div>
                ) : categorias.length === 0 ? (
                    <div className="loading">Nenhuma categoria cadastrada ainda.</div>
                ) : (
                    <div className="tabela-responsiva">
                        <table className="tabela-categorias">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Categoria Principal</th>
                                    <th>Subcategorias Vinculadas</th>
                                    <th className="col-acoes">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorias.map(cat => (
                                    <tr key={cat.id}>
                                        <td className="col-id">#{cat.id}</td>
                                        
                                        {/* COLUNA DO NOME (Muda se estiver editando) */}
                                        <td className="col-nome">
                                            {editandoId === cat.id ? (
                                                <input 
                                                    className="input-edicao"
                                                    value={nomeEditado}
                                                    onChange={(e) => setNomeEditado(e.target.value)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <strong>{cat.nome}</strong>
                                            )}
                                        </td>

                                        {/* COLUNA DAS SUBCATEGORIAS */}
                                        <td className="col-subs">
                                            {cat.subcategorias && cat.subcategorias.length > 0 ? (
                                                <div className="tags-container">
                                                    {cat.subcategorias.map(sub => (
                                                        <span key={sub.id} className="tag-sub">{sub.nome}</span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="texto-vazio">Sem subcategorias</span>
                                            )}
                                        </td>

                                        {/* COLUNA DE AÇÕES */}
                                        <td className="col-acoes">
                                            {editandoId === cat.id ? (
                                                <div className="acoes-botoes">
                                                    <button className="btn-icon verde" onClick={() => salvarEdicao(cat.id)} title="Salvar">
                                                        <FiCheck />
                                                    </button>
                                                    <button className="btn-icon cinza" onClick={cancelarEdicao} title="Cancelar">
                                                        <FiX />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="acoes-botoes">
                                                    <button className="btn-icon azul" onClick={() => iniciarEdicao(cat)} title="Editar Nome">
                                                        <FiEdit2 />
                                                    </button>
                                                    <button className="btn-icon vermelho" onClick={() => handleDeletar(cat.id, cat.nome)} title="Excluir Categoria">
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListarCategorias;