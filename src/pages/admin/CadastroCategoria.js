import React, { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi'; // Ícones para adicionar/remover
import { CategoriaService } from '../../services/CategoriaService';

import './CadastroCategoria.css';

const CadastroCategoria = () => {
    const [nomeCategoria, setNomeCategoria] = useState('');
    // Começamos a lista de subcategorias com um item vazio por padrão
    const [subcategorias, setSubcategorias] = useState([{ nome: '' }]);
    
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

    // Adiciona uma nova linha de subcategoria vazia
    const adicionarSubcategoria = () => {
        setSubcategorias([...subcategorias, { nome: '' }]);
    };

    // Remove uma linha específica pelo seu índice
    const removerSubcategoria = (index) => {
        const novaLista = [...subcategorias];
        novaLista.splice(index, 1);
        setSubcategorias(novaLista);
    };

    // Atualiza o texto de uma subcategoria específica
    const atualizarSubcategoria = (index, valor) => {
        const novaLista = [...subcategorias];
        novaLista[index].nome = valor;
        setSubcategorias(novaLista);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensagem({ texto: '', tipo: '' });

        // Filtra as subcategorias para não enviar linhas em branco para o backend
        const subcategoriasValidas = subcategorias.filter(sub => sub.nome.trim() !== '');

        // Monta o JSON Exatamente como a entidade Java espera
        const payload = {
            nome: nomeCategoria,
            subcategorias: subcategoriasValidas
        };

        try {
            console.log(payload)
            await CategoriaService.cadastrar(payload);
            setMensagem({ texto: 'Categoria e Subcategorias salvas com sucesso! ✨', tipo: 'sucesso' });
            
            // Limpa o formulário após o sucesso
            setNomeCategoria('');
            setSubcategorias([{ nome: '' }]);
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            setMensagem({ texto: 'Erro ao conectar com o servidor.', tipo: 'erro' });
        } finally {
            setLoading(false);
            setTimeout(() => setMensagem({ texto: '', tipo: '' }), 4000);
        }
    };

    return (
        <div className="cadastro-container">
            <div className="cadastro-card categoria-card">
                <h2>📁 Nova Categoria Completa</h2>
                <p>Crie a categoria principal e suas respectivas subdivisões de uma só vez.</p>
                
                <form onSubmit={handleSubmit}>
                    {/* CAMPO DA CATEGORIA PRINCIPAL */}
                    <div className="form-group principal">
                        <label>Nome da Categoria Principal</label>
                        <input 
                            value={nomeCategoria} 
                            onChange={(e) => setNomeCategoria(e.target.value)} 
                            required 
                            placeholder="Ex: Joias, Relógios, Bolsas..." 
                            autoFocus
                        />
                    </div>

                    <div className="divisor-secao"></div>

                    {/* LISTA DINÂMICA DE SUBCATEGORIAS */}
                    <div className="secao-subcategorias">
                        <div className="header-subcategorias">
                            <label>Subcategorias <span>(Opcional)</span></label>
                            <button type="button" className="btn-add-linha" onClick={adicionarSubcategoria}>
                                <FiPlus /> Adicionar Linha
                            </button>
                        </div>

                        {subcategorias.map((sub, index) => (
                            <div key={index} className="linha-subcategoria">
                                <input 
                                    value={sub.nome}
                                    onChange={(e) => atualizarSubcategoria(index, e.target.value)}
                                    placeholder={`Ex: ${index === 0 ? 'Anéis' : index === 1 ? 'Colares' : 'Pulseiras'}`}
                                />
                                {/* Só mostra o botão de lixeira se houver mais de uma linha */}
                                {subcategorias.length > 1 && (
                                    <button 
                                        type="button" 
                                        className="btn-remover" 
                                        onClick={() => removerSubcategoria(index)}
                                        title="Remover linha"
                                    >
                                        <FiTrash2 />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {mensagem.texto && (
                        <div className={`mensagem-feedback ${mensagem.tipo}`}>
                            {mensagem.texto}
                        </div>
                    )}

                    <button type="submit" className="btn-salvar" disabled={loading || !nomeCategoria.trim()}>
                        {loading ? 'Salvando no Banco...' : 'Finalizar Cadastro'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CadastroCategoria;