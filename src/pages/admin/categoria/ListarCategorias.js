import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiPackage, FiPlus, FiX, FiUploadCloud, FiAlertCircle, FiImage } from 'react-icons/fi';
import { CategoriaService } from '../../../services/CategoriaService';
import { ProdutoService } from '../../../services/ProdutoService';

import './ListarCategorias.css';

const ListarCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [pendentes, setPendentes] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [xmlLoading, setXmlLoading] = useState(false);
    const [imgLoading, setImgLoading] = useState(false);
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    const [categoriaEditando, setCategoriaEditando] = useState(null);
    const [produtoModal, setProdutoModal] = useState(null);
    const [expandidos, setExpandidos] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [dadosCat, dadosPendentes] = await Promise.all([
                CategoriaService.listarTodas(),
                ProdutoService.listarPendentes()
            ]);
            setCategorias(dadosCat);
            setPendentes(dadosPendentes);
        } catch (error) {
            console.error("Erro ao carregar:", error);
            mostrarMensagem('Erro ao carregar os dados.', 'erro');
        } finally {
            setLoading(false);
        }
    };

    const mostrarMensagem = (texto, tipo) => {
        setMensagem({ texto, tipo });
        setTimeout(() => setMensagem({ texto: '', tipo: '' }), 4000);
    };

    const toggleExpandir = (id) => {
        setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleUploadXML = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setXmlLoading(true);
        try {
            await ProdutoService.importarXml(file);
            mostrarMensagem('Nota Fiscal importada! Veja as pendências.', 'sucesso');
            carregarDados(); 
        } catch (error) {
            mostrarMensagem('Erro ao processar o XML da nota fiscal.', 'erro');
        } finally {
            setXmlLoading(false);
            e.target.value = null; 
        }
    };

    const handleUploadImagensMassa = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setImgLoading(true);
        try {
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('imagens', file); 
            });

            await ProdutoService.vincularImagensEmMassa(formData);
            
            mostrarMensagem(`${files.length} foto(s) processada(s) com sucesso!`, 'sucesso');
            carregarDados(); 
        } catch (error) {
            console.error("Erro ao enviar imagens:", error);
            mostrarMensagem('Erro ao processar o envio em massa das fotos.', 'erro');
        } finally {
            setImgLoading(false);
            e.target.value = null; 
        }
    };

    const handleDeletarCategoria = async (id, nome) => {
        const confirmar = window.confirm(`Deseja excluir a categoria "${nome}"?`);
        if (!confirmar) return;
        try {
            await CategoriaService.deletar(id);
            mostrarMensagem('Categoria excluída.', 'sucesso');
            carregarDados();
        } catch (error) {
            mostrarMensagem('Erro ao excluir.', 'erro');
        }
    };

    const salvarEdicaoCategoria = async (e) => {
        e.preventDefault();
        try {
            await CategoriaService.atualizar(categoriaEditando.id, { nome: categoriaEditando.nome });
            mostrarMensagem('Categoria atualizada!', 'sucesso');
            setCategoriaEditando(null);
            carregarDados();
        } catch (error) {
            mostrarMensagem('Erro ao atualizar.', 'erro');
        }
    };

    // ABRE MODAL VAZIO (Modo Antigo)
    const abrirModalNovoProduto = (subcategoriaId) => {
        setProdutoModal({
            id: null, codigo: '', nome: '', precoCusto: '', preco: '',
            estoque: 1, descricao: '', subcategoriaId: subcategoriaId, imagens: [], previews: [],
            isXML: false
        });
    };

    // ABRE MODAL PARA EDITAR (Modo Antigo - Corrigido com idSubcategoriaPai)
    const abrirModalEditarProduto = (produto, idSubcategoriaPai) => {
        setProdutoModal({
            id: produto.id,
            codigo: produto.codigo || '',
            nome: produto.nome || '',
            precoCusto: produto.precoCusto || '',
            preco: produto.preco || '',
            estoque: produto.estoque || 0,
            descricao: produto.material || produto.descricao || '', 
            subcategoriaId: idSubcategoriaPai || (produto.subcategoria ? produto.subcategoria.id : ''),
            imagens: [],
            previews: produto.img ? [produto.img] : [],
            isXML: false
        });
    };

    // ABRE MODAL COM DADOS DO XML (Modo Novo)
    const finalizarRascunhoXML = (rascunho) => {
        setProdutoModal({
            id: rascunho.id,
            codigo: rascunho.codigo || '',
            nome: rascunho.nome || '',
            precoCusto: rascunho.precoCusto || '',
            preco: rascunho.preco,
            estoque: 1,
            descricao: '',
            subcategoriaId: '', 
            imagens: [],
            previews: [],
            isXML: true 
        });
    };

    const handleChangeProduto = (e) => {
        const { name, value } = e.target;
        setProdutoModal(prev => ({
            ...prev,
            [name]: (name === 'preco' || name === 'precoCusto') 
                ? parseFloat(value) || '' 
                : (name === 'estoque' ? parseInt(value) || '' : value)
        }));
    };

    const handleImageChangeProduto = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const novasPreviews = files.map(file => URL.createObjectURL(file));
            setProdutoModal(prev => ({ 
                ...prev, 
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
        
        if (!produtoModal.subcategoriaId) {
            mostrarMensagem("Por favor, selecione a qual categoria essa joia pertence.", "erro");
            return;
        }

        try {
            setIsSubmitting(true);
            const formData = new FormData();

            const produtoData = {
                codigo: produtoModal.codigo,
                nome: produtoModal.nome,
                precoCusto: parseFloat(produtoModal.precoCusto) || 0,
                preco: parseFloat(produtoModal.preco),
                estoque: parseInt(produtoModal.estoque) || 0,
                material: produtoModal.descricao,
                subcategoria: { id: parseInt(produtoModal.subcategoriaId) }
            };

            const produtoBlob = new Blob([JSON.stringify(produtoData)], { type: "application/json" });
            formData.append("produto", produtoBlob);

            if (produtoModal.imagens && produtoModal.imagens.length > 0) {
                produtoModal.imagens.forEach(img => formData.append("files", img));
            }

            if (produtoModal.id) {
                await ProdutoService.atualizar(produtoModal.id, formData);
                mostrarMensagem('Joia salva e catalogada com sucesso!', 'sucesso');
            } else {
                await ProdutoService.cadastrar(formData);
                mostrarMensagem('Nova joia adicionada ao catálogo!', 'sucesso');
            }

            setProdutoModal(null);
            carregarDados();
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
            carregarDados();
        } catch (error) {
            mostrarMensagem('Erro ao excluir a peça.', 'erro');
        }
    };

    const todasSubcategorias = categorias.flatMap(c => 
        (c.subcategorias || []).map(sub => ({ id: sub.id, nome: `${c.nome} > ${sub.nome}` }))
    );

    return (
        <div className="lista-container">
            <div className="lista-card">
                
                <header className="lista-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h2>📋 Gestão do Acervo</h2>
                        <p>Cadastre joias, importe notas ou atualize fotos em lote.</p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div>
                            <input id="upload-imagens-massa" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleUploadImagensMassa} />
                            <label htmlFor="upload-imagens-massa" className="btn-secundario-luxo" style={{ opacity: imgLoading ? 0.7 : 1 }}>
                                <FiImage size={20} />
                                {imgLoading ? 'Processando...' : 'Vincular Fotos (Massa)'}
                            </label>
                        </div>

                        <div>
                            <input id="upload-xml" type="file" accept=".xml" style={{ display: 'none' }} onChange={handleUploadXML} />
                            <label htmlFor="upload-xml" className="btn-upload-xml" style={{ opacity: xmlLoading ? 0.7 : 1 }}>
                                <FiUploadCloud size={20} />
                                {xmlLoading ? 'Lendo Arquivo...' : 'Importar XML da Nota'}
                            </label>
                        </div>
                    </div>
                </header>

                {mensagem.texto && (
                    <div className={`mensagem-feedback ${mensagem.tipo}`}>
                        {mensagem.texto}
                    </div>
                )}

                {/* GAVETA DE PENDÊNCIAS DO XML */}
                {!loading && pendentes.length > 0 && (
                    <div className="secao-pendencias">
                        <div className="alerta-header">
                            <FiAlertCircle size={20} /> 
                            <span>Você tem {pendentes.length} novas joias importadas aguardando fotos e preços de venda!</span>
                        </div>
                        <div className="scroll-pendencias">
                            {pendentes.map(pendente => (
                                <div key={pendente.id} className="card-pendencia">
                                    <div className="info-pendencia">
                                        <strong>{pendente.nome}</strong>
                                        <small>Ref: {pendente.codigo} | R$ {pendente.precoCusto?.toFixed(2)}</small>
                                    </div>
                                    <button onClick={() => finalizarRascunhoXML(pendente)}>Vincular</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TABELA DE CATEGORIAS */}
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
                                                                                        {prod.img ? <img src={prod.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} /> : <FiPackage />}
                                                                                    </div>
                                                                                    <div className="prod-mini-info">
                                                                                        <span className="prod-mini-nome">{prod.nome}</span>
                                                                                        <span className="prod-mini-preco">R$ {prod.preco ? prod.preco.toFixed(2).replace('.', ',') : '0,00'}</span>
                                                                                    </div>
                                                                                    <div className="prod-mini-acoes">
                                                                                        <button className="btn-mini-acao edit" onClick={() => abrirModalEditarProduto(prod, sub.id)}><FiEdit2 size={14} /></button>
                                                                                        <button className="btn-mini-acao delete" onClick={() => handleDeletarProduto(prod.id, prod.nome)}><FiTrash2 size={14} /></button>
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        ) : (
                                                                            <div className="texto-vazio-produtos">Nenhum produto nesta subcategoria.</div>
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

            {/* MODAL EDITAR CATEGORIA */}
            {categoriaEditando && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h3>✏️ Editar Categoria #{categoriaEditando.id}</h3>
                            <button className="btn-close-modal" onClick={() => setCategoriaEditando(null)}><FiX size={24} /></button>
                        </div>
                        <form onSubmit={salvarEdicaoCategoria} className="cadastro-form-modal">
                            <div className="form-grid">
                                <div className="form-group flex-full">
                                    <label>Nome da Categoria</label>
                                    <input type="text" value={categoriaEditando.nome || ''} onChange={(e) => setCategoriaEditando({ ...categoriaEditando, nome: e.target.value })} required className="input-estilizado" />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancelar" onClick={() => setCategoriaEditando(null)}>Cancelar</button>
                                <button type="submit" className="btn-salvar">Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE PRODUTO */}
            {produtoModal && (
                <div className="modal-overlay">
                    <div className="modal-card modal-largo">
                        <div className="modal-header">
                            <h3>{produtoModal.id ? `Editar Peça / Rascunho` : '💎 Cadastrar Nova Peça'}</h3>
                            <button className="btn-close-modal" onClick={() => setProdutoModal(null)}><FiX size={24} /></button>
                        </div>

                        <form onSubmit={salvarProduto} className="cadastro-form-modal">
                            <div className="form-group form-image-group">
                                <div className="image-upload-area column-layout">
                                    <div className="image-preview-gallery">
                                        {produtoModal.previews && produtoModal.previews.length > 0 ? (
                                            produtoModal.previews.map((url, index) => (
                                                <div key={index} className="preview-item">
                                                    <img src={url} alt="Preview" className="image-preview" />
                                                    <button type="button" className="btn-remove-preview" onClick={() => removerImagem(index)}><FiX /></button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="image-placeholder"><span>Nenhuma foto</span></div>
                                        )}
                                    </div>
                                    <div className="image-upload-actions">
                                        <div className="image-upload-btn" style={{textAlign: 'center', marginTop: '10px'}}>
                                            <input id="imagemModal" type="file" accept="image/*" multiple onChange={handleImageChangeProduto} className="input-file-hidden" />
                                            <label htmlFor="imagemModal" className="label-file-custom">Procurar Fotos</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-grid">
                                {/* SÓ MOSTRA O SELECT SE VIER DA LISTA DE PENDENTES (XML) */}
                                {produtoModal.isXML && (
                                    <div className="form-group flex-full">
                                        <label htmlFor="subcategoriaId">Local na Vitrine (Categoria) *</label>
                                        <select 
                                            id="subcategoriaId" 
                                            name="subcategoriaId" 
                                            value={produtoModal.subcategoriaId} 
                                            onChange={handleChangeProduto} 
                                            className="input-estilizado"
                                            required
                                        >
                                            <option value="">-- Selecione onde esta peça vai aparecer --</option>
                                            {todasSubcategorias.map(sub => (
                                                <option key={sub.id} value={sub.id}>{sub.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="form-group flex-1">
                                    <label htmlFor="codigo">Código / Ref</label>
                                    <input id="codigo" type="text" name="codigo" value={produtoModal.codigo || ''} onChange={handleChangeProduto} className="input-estilizado" />
                                </div>
                                
                                <div className="form-group flex-2">
                                    <label htmlFor="nome">Nome da Peça *</label>
                                    <input id="nome" type="text" name="nome" value={produtoModal.nome || ''} onChange={handleChangeProduto} required className="input-estilizado" />
                                </div>

                                <div className="form-group flex-1">
                                    <label htmlFor="precoCusto">Custo (R$)</label>
                                    <input id="precoCusto" type="number" name="precoCusto" step="0.01" value={produtoModal.precoCusto || ''} onChange={handleChangeProduto} className="input-estilizado" />
                                </div>

                                <div className="form-group flex-1">
                                    <label htmlFor="preco">Venda (R$) *</label>
                                    <input id="preco" type="number" name="preco" step="0.01" value={produtoModal.preco || ''} onChange={handleChangeProduto} required className="input-estilizado" />
                                </div>

                                <div className="form-group flex-1">
                                    <label htmlFor="estoque">Estoque Qtd</label>
                                    <input id="estoque" type="number" name="estoque" min="0" value={produtoModal.estoque || ''} onChange={handleChangeProduto} className="input-estilizado" />
                                </div>

                                <div className="form-group flex-full">
                                    <label htmlFor="descricao">Descrição (Opcional)</label>
                                    <textarea id="descricao" name="descricao" value={produtoModal.descricao || ''} onChange={handleChangeProduto} className="form-textarea" rows="2" />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancelar" onClick={() => setProdutoModal(null)}>Cancelar</button>
                                <button type="submit" className="btn-salvar" disabled={isSubmitting}>
                                    {isSubmitting ? 'Salvando...' : 'Salvar Peça no Acervo'}
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