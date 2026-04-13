import React from 'react';
import { useMaleta } from '../context/MaletaContext';
import { FiX, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import './Maleta.css';
import { useNavigate } from 'react-router-dom';

export default function Maleta() {
  const { itens, total, removerItem, alterarQuantidade, carrinhoAberto, setCarrinhoAberto } = useMaleta();
  const navigate = useNavigate();
  
  if (!carrinhoAberto) return null;

  const finalizar = () => {
    navigate('/checkout');
    setCarrinhoAberto(false);
  }

  // MÁGICA AQUI: A mesma função do CardItem para montar a URL do seu backend
  const getUrlImagem = (caminho) => {
    if (!caminho) return 'https://via.placeholder.com/70x90?text=Sem+Foto'; 
    if (caminho.startsWith('http')) return caminho; 
    return `http://localhost:8080/arquivos/view/${caminho}`;
  };

  return (
    <div className="maleta-overlay" onClick={() => setCarrinhoAberto(false)}>
      <div className="maleta-sidebar" onClick={e => e.stopPropagation()}>
        <header className="maleta-header">
          <h2>Minha Maleta</h2>
          <button onClick={() => setCarrinhoAberto(false)}><FiX size={24} /></button>
        </header>

        <div className="maleta-itens">
          {itens.length === 0 ? (
            <p className="vazio">Sua maleta está vazia...</p>
          ) : (
            itens.map(item => {
              // Verifica onde o nome da foto veio (do Modal ou direto do CardItem)
              const caminhoDaFoto = item.imagemSelecionada || (item.imagens && item.imagens[0]) || item.pathImg;

              return (
                <div key={item.id} className="item-carrinho">
                  
                  {/* Passamos o caminho na função para colocar o localhost:8080 na frente */}
                  <img 
                    src={getUrlImagem(caminhoDaFoto)} 
                    alt={item.nome} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/70x90?text=Erro'; }}
                  />
                  
                  <div className="item-detalhes">
                    <h4>{item.nome}</h4>
                    <p>R$ {item.preco ? item.preco.toFixed(2) : '0.00'}</p>
                    <div className="controles">
                      <button onClick={() => alterarQuantidade(item.id, -1)}><FiMinus /></button>
                      <span>{item.quantidade}</span>
                      <button onClick={() => alterarQuantidade(item.id, 1)}><FiPlus /></button>
                      <button className="remover" onClick={() => removerItem(item.id)}><FiTrash2 /></button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {itens.length > 0 && (
          <footer className="maleta-footer">
            <div className="total">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <button className="btn-finalizar" onClick={finalizar}>Pedir Visita / Comprar</button>
          </footer>
        )}
      </div>
    </div>
  );
}