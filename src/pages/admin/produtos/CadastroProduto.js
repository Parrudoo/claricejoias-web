import React, { useState, useEffect } from 'react';
import './CadastroProduto.css'; 
import { CategoriaService } from '../../../services/CategoriaService';
import { ProdutoService } from '../../../services/ProdutoService';



const CadastroProduto = () => {
    const [produto, setProduto] = useState({
        nome: '',
        descricao: '',
        preco: '',
        categoriaId: '',
        subcategoriaId: '',
        imagem: null
    });

    // Estados para armazenar os dados vindos do Backend
    const [categorias, setCategorias] = useState([]);
    const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState([]);
    
    // Estados visuais
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [carregandoCategorias, setCarregandoCategorias] = useState(true);

    // 1. Busca as Categorias reais assim que a tela abre
    useEffect(() => {
        carregarCategorias();
    }, []);

    const carregarCategorias = async () => {
        try {
            const data = await CategoriaService.listarTodas();
            setCategorias(data);
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
            alert("Não foi possível carregar as categorias do servidor.");
        } finally {
            setCarregandoCategorias(false);
        }
    };

    // 2. Busca as Subcategorias reais quando o usuário escolhe uma Categoria
    const handleCategoriaChange = async (e) => {
        const catId = e.target.value; // Pega o ID em formato string/number
       // COLOQUE ESTA LINHA AQUI:
        console.log("O QUE TEM NO SERVIÇO?", CategoriaService);
        // Atualiza o estado do produto, limpando a subcategoria anterior
        setProduto({ ...produto, categoriaId: catId, subcategoriaId: '' });

        if (catId) {
           
            try {
                // Chama a API que criamos: /api/categorias/{id}/subcategorias
                const subs = await CategoriaService.listarSubcategoriasPorCategoria(catId);
                setSubcategoriasFiltradas(subs);
            } catch (error) {
                console.error("Erro ao buscar subcategorias:", error);
                setSubcategoriasFiltradas([]);
            }
        } else {
            setSubcategoriasFiltradas([]); // Limpa se o usuário desmarcar a categoria
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduto({ ...produto, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProduto({ ...produto, imagem: file });
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleVoltar = () => {
        window.history.back(); 
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!produto.subcategoriaId) {
            alert("Por favor, selecione uma subcategoria.");
            return;
        }

        try {
            setIsSubmitting(true); 

            let imagemBase64 = null;
            if (produto.imagem) {
                imagemBase64 = await convertFileToBase64(produto.imagem);
            }

            const payload = {
                nome: produto.nome,
                preco: parseFloat(produto.preco),
                img: imagemBase64, 
                subcategoria: {
                    id: parseInt(produto.subcategoriaId) 
                }
            };

            await ProdutoService.cadastrar(payload);

            alert('Produto cadastrado com sucesso!');
            handleVoltar(); 

        } catch (error) {
            console.error('Erro ao cadastrar produto:', error);
            alert('Falha ao cadastrar a peça. Verifique a conexão com o servidor.');
        } finally {
            setIsSubmitting(false); 
        }
    };

    return (
        <div className="cadastro-page-wrapper">
            <div className="cadastro-page-card">
                
                <div className="cadastro-page-header">
                    <div className="header-titles">
                        <h1>Nova Peça</h1>
                        <p>Adicione os detalhes da joia para incluí-la no catálogo.</p>
                    </div>
                    
                    <button onClick={handleVoltar} className="btn-voltar" type="button" disabled={isSubmitting}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Voltar
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="cadastro-form">
                    
                    {/* Área de Upload de Imagem */}
                    <div className="form-group form-image-group">
                        <div className="image-preview-container">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Pré-visualização" className="image-preview" />
                            ) : (
                                <div className="image-placeholder">
                                    <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"><path d="M4 11.238V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6.238L8 8.938z" /><path d="M14 11V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1M3 0h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3" /><path d="M2.5 13H11v1.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5zm9 0h3a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5" /></svg>
                                </div>
                            )}
                        </div>

                        <div className="image-upload-text">
                            <label>Foto Principal</label>
                            <p>Fundo claro ou neutro recomendado.</p>
                        </div>

                        <div className="image-upload-btn">
                            <input
                                id="imagem"
                                type="file"
                                name="imagem"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="input-file-hidden"
                            />
                            <label htmlFor="imagem" className="label-file-custom">
                                {imagePreview ? 'Trocar arquivo' : 'Procurar foto'}
                            </label>
                        </div>
                    </div>

                    {/* Nome do Produto */}
                    <div className="form-group">
                        <label htmlFor="nome">Nome da Peça:</label>
                        <input
                            id="nome"
                            type="text"
                            name="nome"
                            value={produto.nome}
                            onChange={handleInputChange}
                            placeholder="Ex: Anel Solitário Ouro 18k"
                            required
                            className="form-input"
                        />
                    </div>

                    {/* Descrição */}
                    <div className="form-group">
                        <label htmlFor="descricao">Descrição Detalhada (Opcional):</label>
                        <textarea
                            id="descricao"
                            name="descricao"
                            value={produto.descricao}
                            onChange={handleInputChange}
                            placeholder="Ex: Acabamento polido, cravejado com zircônias..."
                            className="form-textarea"
                        />
                    </div>

                    {/* Categoria e Subcategoria */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="categoriaId">Categoria:</label>
                            <select
                                id="categoriaId"
                                name="categoriaId"
                                value={produto.categoriaId}
                                onChange={handleCategoriaChange}
                                required
                                disabled={carregandoCategorias}
                                className="form-select"
                            >
                                <option value="">
                                    {carregandoCategorias ? "Carregando..." : "Selecione..."}
                                </option>
                                {/* Renderiza as categorias vindas do banco de dados */}
                                {categorias.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="subcategoriaId">Subcategoria:</label>
                            <select
                                id="subcategoriaId"
                                name="subcategoriaId"
                                value={produto.subcategoriaId}
                                onChange={handleInputChange}
                                disabled={!produto.categoriaId || subcategoriasFiltradas.length === 0}
                                required
                                className="form-select"
                            >
                                <option value="">
                                    {!produto.categoriaId ? "Escolha a categoria" : "Selecione..."}
                                </option>
                                {/* Renderiza as subcategorias da API baseadas na categoria escolhida */}
                                {subcategoriasFiltradas.map(sub => (
                                    <option key={sub.id} value={sub.id}>{sub.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Preço */}
                    <div className="form-group">
                        <label htmlFor="preco">Preço Sugerido (R$):</label>
                        <input
                            id="preco"
                            type="number"
                            name="preco"
                            step="0.01"
                            placeholder="0,00"
                            value={produto.preco}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                        />
                    </div>

                    {/* Botão de Submit */}
                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Finalizar Cadastro'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CadastroProduto;