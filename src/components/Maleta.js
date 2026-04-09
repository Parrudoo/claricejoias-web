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
    setCarrinhoAberto(false)
  }

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
            itens.map(item => (
              <div key={item.id} className="item-carrinho">
                <img src={item.imagens ? item.imagens[0] : item.img} alt={item.nome} />
                <div className="item-detalhes">
                  <h4>{item.nome}</h4>
                  <p>R$ {item.preco.toFixed(2)}</p>
                  <div className="controles">
                    <button onClick={() => alterarQuantidade(item.id, -1)}><FiMinus /></button>
                    <span>{item.quantidade}</span>
                    <button onClick={() => alterarQuantidade(item.id, 1)}><FiPlus /></button>
                    <button className="remover" onClick={() => removerItem(item.id)}><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {itens.length > 0 && (
          <footer className="maleta-footer">
            <div className="total">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <button className="btn-finalizar" onClick={finalizar} >Pedir Visita / Comprar</button>
          </footer>
        )}
      </div>
    </div>
  );
}