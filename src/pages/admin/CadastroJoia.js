import React, { useState } from 'react';
// import joiaService from '../../services/joiaService';
import './CadastroJoia.css';

const CadastroJoia = () => {
    const [joia, setJoia] = useState({
        nome: '',
        preco: '',
        material: 'Ouro 18k',
        banho: '',
        descricao: '',
        imagemUrl: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setJoia({ ...joia, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // await joiaService.cadastrarJoia(joia);
            alert('Joia cadastrada com sucesso na sua coleção!');
            setJoia({ nome: '', preco: '', material: 'Ouro 18k', banho: '', descricao: '', imagemUrl: '' });
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            alert('Erro ao conectar com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cadastro-container">
            <div className="cadastro-card">
                <h2>✨ Nova Peça no Acervo</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome da Joia</label>
                        <input name="nome" value={joia.nome} onChange={handleChange} required placeholder="Ex: Colar Riviera" />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Preço (R$)</label>
                            <input name="preco" type="number" value={joia.preco} onChange={handleChange} required placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label>Material Base</label>
                            <select name="material" value={joia.material} onChange={handleChange}>
                                <option value="Ouro 18k">Ouro 18k</option>
                                <option value="Prata 925">Prata 925</option>
                                <option value="Ródio">Ródio</option>
                                <option value="Aço Inox">Aço Inox</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Detalhes do Banho/Pedraria</label>
                        <input name="banho" value={joia.banho} onChange={handleChange} placeholder="Ex: 10 milésimos com Zircônias" />
                    </div>

                    <div className="form-group">
                        <label>URL da Imagem</label>
                        <input name="imagemUrl" value={joia.imagemUrl} onChange={handleChange} placeholder="http://..." />
                    </div>

                    <div className="form-group">
                        <label>Descrição</label>
                        <textarea name="descricao" value={joia.descricao} onChange={handleChange} rows="3" placeholder="Descreva os detalhes e a garantia..." />
                    </div>

                    <button type="submit" className="btn-salvar" disabled={loading}>
                        {loading ? 'Processando...' : 'Adicionar ao Catálogo'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CadastroJoia;