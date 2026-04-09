import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './CardItem.css';

export function CardItem({ joia, adicionarItem }) {
  const [imgAtiva, setImgAtiva] = useState(0);
  
  // Função que monta a URL correta apontando para o seu backend
  const getUrlImagem = (caminho) => {
    if (!caminho) return 'https://via.placeholder.com/300x300?text=Sem+Foto'; // Placeholder caso não tenha foto
    if (caminho.startsWith('http')) return caminho; // Prevenção caso já venha um link completo
    return `http://localhost:8080/arquivos/view/${caminho}`;
  };

  // Normaliza para sempre ter um array. Agora usamos o pathImg que vem da API
  const fotos = joia.imagens 
    ? joia.imagens.map(getUrlImagem) 
    : [getUrlImagem(joia.pathImg)];

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
        <h4>{joia.nome}</h4>
        <p>{joia.material}</p>
        <span className="preco">R$ {joia.preco?.toFixed(2).replace('.', ',')}</span>
        <button className="btn-add" onClick={() => adicionarItem(joia)}>
          Adicionar à Maleta
        </button>
      </div>
    </div>
  );
}