import React, { useState, useEffect } from 'react';
import './ListaProduto.css'; 
import { ProdutoService } from '../../../services/ProdutoService';

const ListaProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Novos estados para controlar a edição
  const [produtoEditando, setProdutoEditando] = useState(null);

  // Busca os produtos reais da API ao abrir a tela
  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const data = await ProdutoService.listarTodos();
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao buscar catálogo:", error);
      alert("Não foi possível carregar os produtos do servidor.");
    } finally {
      setLoading(false);
    }
  };

  const excluirProduto = async (id) => {
    if(window.confirm('Tem certeza que deseja excluir esta peça do catálogo?')) {
      try {
        await ProdutoService.deletar(id);
        setProdutos(produtos.filter(prod => prod.id !== id));
        alert('Produto excluído com sucesso!');
      } catch (error) {
        console.error("Erro ao excluir a peça:", error);
        alert("Erro ao excluir o produto. Tente novamente.");
      }
    }
  };

  // --- Funções de Edição ---
  
  const abrirModalEdicao = (produto) => {
    // Clona o objeto para não alterar a tabela antes de salvar na API
    setProdutoEditando({ ...produto });
  };

  const fecharModal = () => {
    setProdutoEditando(null);
  };

  const handleChangeEdicao = (e) => {
    const { name, value } = e.target;
    setProdutoEditando(prev => ({
      ...prev,
      [name]: name === 'preco' ? parseFloat(value) || 0 : value
    }));
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    try {
      // Supondo que você tenha um método 'atualizar' ou 'editar' no ProdutoService
      // await ProdutoService.atualizar(produtoEditando.id, produtoEditando);

      // Atualiza o estado local para refletir na tabela imediatamente
      setProdutos(produtos.map(prod => 
        prod.id === produtoEditando.id ? produtoEditando : prod
      ));
      
      alert('Peça atualizada com sucesso!');
      fecharModal();
    } catch (error) {
      console.error("Erro ao atualizar a peça:", error);
      alert("Erro ao salvar as alterações. Tente novamente.");
    }
  };

  return (
    <div className="lp-container-unique"> 
      <div className="lista-card">
        
        <div className="lista-header-flex">
          <div className="lista-titulos">
            <h2>Catálogo de Joias</h2>
            <p>Gerencie as peças ativas no seu aplicativo de delivery.</p>
          </div>
          <button className="btn-novo-produto">
            + Cadastrar Nova Peça
          </button>
        </div>

        {loading ? (
          <div className="loading">Carregando catálogo do servidor...</div>
        ) : produtos.length === 0 ? (
          <div className="loading" style={{ color: '#666' }}>Nenhum produto cadastrado ainda.</div>
        ) : (
          <div className="tabela-responsiva">
            <table className="tabela-dados">
              <thead>
                <tr>
                  <th className="col-img">Foto</th>
                  <th>Nome da Peça</th>
                  <th>Classificação</th>
                  <th>Preço</th>
                  <th className="col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((prod) => (
                  <tr key={prod.id}>
                    <td className="col-img">
                      <div className="thumb-container">
                        {prod.img ? (
                          <img src={prod.img} alt={prod.nome} className="thumb-img" />
                        ) : (
                          <div className="thumb-placeholder">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="col-nome">
                      <strong>{prod.nome}</strong>
                      <span className="id-tag">#{prod.id}</span>
                    </td>
                    
                    <td className="col-classificacao">
                      <span className="tag-categoria">
                        {prod.subcategoria?.categoria?.nome || 'Sem Categoria'}
                      </span>
                      <span className="tag-subcategoria">
                        {prod.subcategoria?.nome || 'Sem Subcategoria'}
                      </span>
                    </td>

                    <td className="col-preco">
                      R$ {prod.preco ? prod.preco.toFixed(2).replace('.', ',') : '0,00'}
                    </td>

                    <td className="col-acoes">
                      <div className="acoes-botoes">
                        {/* Botão de Editar agora chama abrirModalEdicao */}
                        <button onClick={() => abrirModalEdicao(prod)} className="btn-icon azul" title="Editar Peça">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button onClick={() => excluirProduto(prod.id)} className="btn-icon vermelho" title="Excluir Peça">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL DE EDIÇÃO --- */}
      {produtoEditando && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Editar Peça #{produtoEditando.id}</h3>
              <button className="btn-close-modal" onClick={fecharModal}>&times;</button>
            </div>
            
            <form onSubmit={salvarEdicao}>
              <div className="form-group">
                <label>Nome da Peça</label>
                <input 
                  type="text" 
                  name="nome" 
                  value={produtoEditando.nome || ''} 
                  onChange={handleChangeEdicao} 
                  required 
                  className="input-estilizado"
                />
              </div>

              <div className="form-group">
                <label>Preço (R$)</label>
                <input 
                  type="number" 
                  name="preco" 
                  step="0.01"
                  min="0"
                  value={produtoEditando.preco || ''} 
                  onChange={handleChangeEdicao} 
                  required 
                  className="input-estilizado"
                />
              </div>

              {/* Se você tiver outros campos, como imagem URL ou categoria, basta adicionar divs .form-group semelhantes aqui */}

              <div className="modal-footer">
                <button type="button" className="btn-cancelar" onClick={fecharModal}>Cancelar</button>
                <button type="submit" className="btn-salvar">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaProdutos;