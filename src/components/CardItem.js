import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ImagemService } from '../services/ImagemService';
import './CardItem.css';

export function CardItem({ joia, adicionarItem }) {
  const [imgAtiva, setImgAtiva] = useState(0);

  
  const fotos = joia.imagens && joia.imagens.length > 0
    ? joia.imagens.map(ImagemService.getUrl) 
    : [ImagemService.getUrl(joia.pathImg)];

  const proxima = (e) => {
    e.stopPropagation(); // Não abre o detalhe do card ao clicar na seta
    setImgAtiva((prev) => (prev + 1) % fotos.length);
  };

  const anterior = (e) => {
    e.stopPropagation();
    setImgAtiva((prev) => (prev - 1 + fotos.length) % fotos.length);
  };

  return (
    <div className="card-item">
      <div className="slider-wrapper">
        {fotos.length > 1 && (
          <>
            <button className="seta esquerda" onClick={anterior}><FiChevronLeft /></button>
            <button className="seta direita" onClick={proxima}><FiChevronRight /></button>
            <div className="pontinhos">
              {fotos.map((_, i) => (
                <span key={i} className={`ponto ${i === imgAtiva ? 'ativo' : ''}`} />
              ))}
            </div>
          </>
        )}
        <img src={fotos[imgAtiva]} alt={joia.nome} className="img-principal" />
      </div>

      <div className="info-joia">
        <span className="codigo-joia">Codigo: {joia.codigo}</span>
        
        <h4>{joia.nome}</h4>
        <p className="material-joia">{joia.material}</p>
        
        <span className="preco">R$ {joia.preco?.toFixed(2).replace('.', ',')}</span>
        
        <button className="btn-add" onClick={() => adicionarItem(joia)}>
          Adicionar à Maleta
        </button>
      </div>
    </div>
  );
}