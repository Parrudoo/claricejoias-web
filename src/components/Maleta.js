import React from 'react';
import { useMaleta } from '../context/MaletaContext';
import { FiX, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { ImagemService } from '../services/ImagemService'; // 👈 Importa o Serviço
import { useNavigate } from 'react-router-dom';
import './Maleta.css';
import { useLoja } from '../context/LojaContext';

export default function Maleta() {
  const { itens, total, removerItem, alterarQuantidade, carrinhoAberto, setCarrinhoAberto } = useMaleta();
  const navigate = useNavigate();
  const { slug, revendedor: lojaRevendedor } = useLoja();

  if (!carrinhoAberto) return null;

  const finalizar = () => {
    if (slug) {
      // Se existe um slug (ex: karolbarcelar), vai para o checkout da revendedora
      navigate(`/${slug}/checkout`);
    } else {
      // Se não tem slug (ex: loja principal oficial), vai para o checkout normal
      navigate('/checkout');
    }

    setCarrinhoAberto(false);
  };

  const handleRemoverItem = (joia) => {
    const revendedorId = lojaRevendedor ? lojaRevendedor.id : null;
    console.log('teste', revendedorId)
    removerItem(joia, revendedorId);
  };

  const handleAlterarQuantidade = (joia, qtd) => {
    const revendedorId = lojaRevendedor ? lojaRevendedor.id : null;
    alterarQuantidade(joia, qtd, revendedorId);
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
              // Pega a primeira foto do array, se existir
              const foto = item.imagens && item.imagens.length > 0 ? item.imagens[0] : null;

              return (
                <div key={item.id} className="item-carrinho">

                  {/* 👇 Usando o serviço de imagens profissional 👇 */}
                  <img
                    src={ImagemService.getUrl(foto)}
                    alt={item.nome}
                  />

                  <div className="item-detalhes">
                    <h4>{item.nome}</h4>
                    <p>R$ {item.preco ? item.preco.toFixed(2).replace('.', ',') : '0,00'}</p>
                    <div className="controles">
                      <button onClick={() => handleAlterarQuantidade(item.id, -1)}><FiMinus /></button>
                      <span>{item.quantidade}</span>
                      <button onClick={() => handleAlterarQuantidade(item.id, 1)}><FiPlus /></button>
                      <button className="remover" onClick={() => handleRemoverItem(item.id)}><FiTrash2 /></button>
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
              <span>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <button className="btn-finalizar" onClick={finalizar}>Pedir Visita / Comprar</button>
          </footer>
        )}
      </div>
    </div>
  );
}