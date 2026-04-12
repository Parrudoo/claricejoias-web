import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiPackage, FiPlus } from 'react-icons/fi';
import { CategoriaService } from '../../../services/CategoriaService';
import { ProdutoService } from '../../../services/ProdutoService';

import './ListarCategorias.css';

const ListarCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    const [categoriaEditando, setCategoriaEditando] = useState(null);
    const [produtoModal, setProdutoModal] = useState(null);
    const [expandidos, setExpandidos] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const toggleExpandir = (id) => {
        setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // ==========================================
    // AÇÕES DE CATEGORIA
    // ==========================================
    const handleDeletarCategoria = async (id, nome) => {
        const confirmar = window.confirm(`Tem certeza que deseja excluir a categoria "${nome}" e todas as suas joias?`);
        if (!confirmar) return;

        try {
            await CategoriaService.deletar(id);
            setCategorias(categorias.filter(cat => cat.id !== id));
            mostrarMensagem('Categoria excluída com sucesso!', 'sucesso');
        } catch (error) {
            mostrarMensagem('Erro ao excluir a categoria.', 'erro');
        }
    };

    const salvarEdicaoCategoria = async (e) => {
        e.preventDefault();
        if (!categoriaEditando.nome.trim()) {
            mostrarMensagem('O nome não pode ficar vazio.', 'erro'); return;
        }
        try {
            const atualizada = await CategoriaService.atualizar(categoriaEditando.id, { nome: categoriaEditando.nome });
            setCategorias(categorias.map(cat => cat.id === categoriaEditando.id ? { ...cat, nome: atualizada.nome } : cat));
            mostrarMensagem('Categoria atualizada!', 'sucesso');
            setCategoriaEditando(null);
            carregarCategorias();
        } catch (error) {
            mostrarMensagem('Erro ao atualizar a categoria.', 'erro');
        }
    };

    // ==========================================
    // AÇÕES DE PRODUTO (MODAL RICO COM GALERIA)
    // ==========================================

    const abrirModalNovoProduto = (subcategoriaId) => {
        setProdutoModal({
            id: null,
            nome: '',
            preco: '',
            descricao: '',
            subcategoriaId: subcategoriaId,
            imagens: [], // Array para os arquivos físicos
            previews: [] // Array para as URLs de visualização
        });
    };

    const abrirModalEditarProduto = (produto) => {
        setProdutoModal({
            ...produto,
            imagens: [],
            // Se o produto já tiver uma imagem salva (string URL), coloca na preview
            previews: produto.img ? [produto.img] : [] 
        });
    };

    const handleChangeProduto = (e) => {
        const { name, value } = e.target;
        setProdutoModal(prev => ({
            ...prev,
            [name]: name === 'preco' ? parseFloat(value) || '' : value
        }));
    };

    const handleImageChangeProduto = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // Gera URLs temporárias para mostrar na tela
            const novasPreviews = files.map(file => URL.createObjectURL(file));
            
            setProdutoModal(prev => ({ 
                ...prev, 
                // Adiciona os novos arquivos e previews aos que já existiam no array
                imagens: [...(prev.imagens || []), ...files], 
                previews: [...(prev.previews || []), ...novasPreviews] 
            }));
        }
    };

    const removerImagem = (indexToRemove) => {
        setProdutoModal(prev => ({
            ...prev,
            imagens: prev.imagens.filter((_, index) => index !== indexToRemove),
            previews: prev.previews.filter((_, index) => index !== indexToRemove)
        }));
    };

    const salvarProduto = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);

            // 1. Cria um objeto FormData vazio
            const formData = new FormData();

            // 2. Prepara os dados de texto do Produto
            const produtoData = {
                nome: produtoModal.nome,
                preco: parseFloat(produtoModal.preco),
                material: produtoModal.descricao, // Ajuste para bater com o nome no Spring se necessário
                subcategoria: { id: parseInt(produtoModal.subcategoriaId) }
            };

            // 3. Adiciona o JSON no FormData como um Blob
            const produtoBlob = new Blob([JSON.stringify(produtoData)], { type: "application/json" });
            formData.append("produto", produtoBlob);

            // 4. Adiciona todas as imagens selecionadas (como "files")
            if (produtoModal.imagens && produtoModal.imagens.length > 0) {
                produtoModal.imagens.forEach(img => {
                    formData.append("files", img); 
                });
            }

            // 5. Envia o formData completo
            if (produtoModal.id) {
                await ProdutoService.atualizar(produtoModal.id, formData);
                mostrarMensagem('Joia atualizada com sucesso!', 'sucesso');
            } else {
                await ProdutoService.cadastrar(formData);
                mostrarMensagem('Nova joia adicionada ao catálogo!', 'sucesso');
            }

            setProdutoModal(null);
            carregarCategorias();
        } catch (error) {
            console.error("Erro ao salvar produto:", error);
            mostrarMensagem('Erro ao salvar os dados da joia.', 'erro');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletarProduto = async (id, nome) => {
        const confirmar = window.confirm(`Tem certeza que deseja excluir a peça "${nome}"?`);
        if (!confirmar) return;

        try {
            await ProdutoService.deletar(id);
            mostrarMensagem('Peça excluída com sucesso!', 'sucesso');
            carregarCategorias();
        } catch (error) {
            mostrarMensagem('Erro ao excluir a peça.', 'erro');
        }
    };

    return (
        <div className="lista-container">
            <div className="lista-card">
                <header className="lista-header">
                    <h2>📋 Gerenciar Categorias e Acervo</h2>
                    <p>Visualize a estrutura do seu catálogo, cadastre ou edite joias rapidamente.</p>
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
                                    <th style={{ width: '40px' }}></th>
                                    <th>ID</th>
                                    <th>Categoria Principal</th>
                                    <th>Resumo</th>
                                    <th className="col-acoes">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorias.map(cat => (
                                    <React.Fragment key={cat.id}>
                                        <tr className={`linha-categoria ${expandidos[cat.id] ? 'expandida' : ''}`}>
                                            <td className="col-toggle">
                                                <button className="btn-toggle-row" onClick={() => toggleExpandir(cat.id)}>
                                                    {expandidos[cat.id] ? <FiChevronUp /> : <FiChevronDown />}
                                                </button>
                                            </td>
                                            <td className="col-id">#{cat.id}</td>
                                            <td className="col-nome"><strong>{cat.nome}</strong></td>
                                            <td className="col-resumo"><span className="tag-sub">{cat.subcategorias?.length || 0} Subcategorias</span></td>
                                            <td className="col-acoes">
                                                <div className="acoes-botoes">
                                                    <button className="btn-icon azul" onClick={() => setCategoriaEditando({ ...cat })}><FiEdit2 /></button>
                                                    <button className="btn-icon vermelho" onClick={() => handleDeletarCategoria(cat.id, cat.nome)}><FiTrash2 /></button>
                                                </div>
                                            </td>
                                        </tr>

                                        {expandidos[cat.id] && (
                                            <tr className="linha-detalhes">
                                                <td colSpan="5">
                                                    <div className="container-detalhes-hierarquia">
                                                        {cat.subcategorias && cat.subcategorias.length > 0 ? (
                                                            cat.subcategorias.map(sub => (
                                                                <div key={sub.id} className="bloco-subcategoria">
                                                                    <div className="header-subcategoria">
                                                                        <h4>{sub.nome}</h4>
                                                                        <div className="acoes-header-sub">
                                                                            <span className="badge-qtd-produtos">{(sub.produtos || sub.itens || []).length} produtos</span>
                                                                            <button className="btn-add-produto" onClick={() => abrirModalNovoProduto(sub.id)}>
                                                                                <FiPlus size={14} /> Novo
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid-produtos-admin">
                                                                        {(sub.produtos || sub.itens || []).length > 0 ? (
                                                                            (sub.produtos || sub.itens || []).map(prod => (
                                                                                <div key={prod.id} className="card-produto-mini">
                                                                                    <div className="prod-mini-icone">
                                                                                        {prod.img ? <img src={prod.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} /> : <FiPackage />}
                                                                                    </div>
                                                                                    <div className="prod-mini-info">
                                                                                        <span className="prod-mini-nome">{prod.nome}</span>
                                                                                        <span className="prod-mini-preco">R$ {prod.preco ? prod.preco.toFixed(2).replace('.', ',') : '0,00'}</span>
                                                                                    </div>
                                                                                    <div className="prod-mini-acoes">
                                                                                        <button className="btn-mini-acao edit" onClick={() => abrirModalEditarProduto(prod)}><FiEdit2 size={12} /></button>
                                                                                        <button className="btn-mini-acao delete" onClick={() => handleDeletarProduto(prod.id, prod.nome)}><FiTrash2 size={12} /></button>
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        ) : (
                                                                            <div className="texto-vazio-produtos">Nenhum produto cadastrado nesta subcategoria.</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="texto-vazio" style={{ padding: '20px', textAlign: 'center' }}>Nenhuma subcategoria vinculada.</div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL DE CATEGORIA */}
            {categoriaEditando && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h3>Editar Categoria #{categoriaEditando.id}</h3>
                            <button className="btn-close-modal" onClick={() => setCategoriaEditando(null)}>&times;</button>
                        </div>
                        <form onSubmit={salvarEdicaoCategoria}>
                            <div className="form-group">
                                <label>Nome da Categoria</label>
                                <input
                                    type="text" name="nome" value={categoriaEditando.nome || ''}
                                    onChange={(e) => setCategoriaEditando({ ...categoriaEditando, nome: e.target.value })}
                                    required className="input-estilizado" autoFocus
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancelar" onClick={() => setCategoriaEditando(null)}>Cancelar</button>
                                <button type="submit" className="btn-salvar">Salvar Categoria</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL RICO DE PRODUTO */}
            {produtoModal && (
                <div className="modal-overlay">
                    <div className="modal-card modal-largo">
                        <div className="modal-header">
                            <h3>{produtoModal.id ? `Editar Peça #${produtoModal.id}` : '💎 Cadastrar Nova Peça'}</h3>
                            <button className="btn-close-modal" onClick={() => setProdutoModal(null)}>&times;</button>
                        </div>

                        <form onSubmit={salvarProduto} className="cadastro-form-modal">

                            {/* Área de Upload de Imagens (GALERIA) */}
                            <div className="form-group form-image-group">
                                <div className="image-upload-area column-layout">
                                    <div className="image-preview-gallery">
                                        {produtoModal.previews && produtoModal.previews.length > 0 ? (
                                            produtoModal.previews.map((url, index) => (
                                                <div key={index} className="preview-item">
                                                    <img src={url} alt={`Preview ${index}`} className="image-preview" />
                                                    <button 
                                                        type="button" 
                                                        className="btn-remove-preview" 
                                                        onClick={() => removerImagem(index)}
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="image-placeholder">
                                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                                <span>Nenhuma foto</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="image-upload-actions">
                                        <div className="image-upload-text" style={{textAlign: 'center'}}>
                                            <label>Fotos da Joia</label>
                                            <p>Selecione várias fotos de uma vez.</p>
                                        </div>
                                        <div className="image-upload-btn" style={{textAlign: 'center', marginTop: '10px'}}>
                                            <input
                                                id="imagemModal"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChangeProduto}
                                                className="input-file-hidden"
                                            />
                                            <label htmlFor="imagemModal" className="label-file-custom">
                                                {produtoModal.previews?.length > 0 ? 'Adicionar mais fotos' : 'Procurar Fotos'}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group flex-2">
                                    <label htmlFor="nome">Nome da Peça</label>
                                    <input
                                        id="nome" type="text" name="nome"
                                        value={produtoModal.nome || ''}
                                        onChange={handleChangeProduto}
                                        required className="input-estilizado"
                                        placeholder="Ex: Anel Ouro 18k"
                                    />
                                </div>
                                <div className="form-group flex-1">
                                    <label htmlFor="preco">Preço (R$)</label>
                                    <input
                                        id="preco" type="number" name="preco" step="0.01" min="0"
                                        value={produtoModal.preco || ''}
                                        onChange={handleChangeProduto}
                                        required className="input-estilizado"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="form-group flex-full">
                                    <label htmlFor="descricao">Descrição Detalhada (Opcional)</label>
                                    <textarea
                                        id="descricao" name="descricao"
                                        value={produtoModal.descricao || ''}
                                        onChange={handleChangeProduto}
                                        className="form-textarea"
                                        placeholder="Descreva materiais, pedras, etc..."
                                        rows="2"
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancelar" onClick={() => setProdutoModal(null)}>Cancelar</button>
                                <button type="submit" className="btn-salvar" disabled={isSubmitting}>
                                    {isSubmitting ? 'Salvando...' : (produtoModal.id ? 'Salvar Alterações' : 'Cadastrar Peça')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListarCategorias;