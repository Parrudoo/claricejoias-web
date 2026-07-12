import React, { useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ImagemService } from '../services/ImagemService';
import './CardItem.css';
import { useLoja } from '../context/LojaContext';

// MUDANÇA: Recebendo abrirDetalhes nas props
export function CardItem({ joia, adicionarItem, abrirDetalhes }) {

  const [imgAtiva, setImgAtiva] = useState(0);
  const { slug, revendedor: lojaRevendedor } = useLoja();

  const fotos = useMemo(() => {
    if (joia.imagens && joia.imagens.length > 0) {
      return joia.imagens.map(img => ImagemService.getUrl(img));
    }
    // Fallback para a imagem única ou uma imagem padrão de "sem foto"
    return [ImagemService.getUrl(joia.pathImg || 'placeholder.png')];
  }, [joia.imagens, joia.pathImg]);

  const proxima = (e) => {
    e.stopPropagation(); // Não abre o detalhe do card ao clicar na seta
    setImgAtiva((prev) => (prev + 1) % fotos.length);
  };

  const anterior = (e) => {
    e.stopPropagation();
    setImgAtiva((prev) => (prev - 1 + fotos.length) % fotos.length);
  };

  return (
    <div className="card-joia">
      <div className="card-img-container" onClick={() => abrirDetalhes(joia)}>
        {/* MUDANÇA: Usando a foto ativa do array em vez de joia.imagem fixa */}
        <img
          key={imgAtiva} // <-- ISSO É O MAIS IMPORTANTE PARA A ANIMAÇÃO
          src={fotos[imgAtiva]}
          alt={joia.nome}
          className="imagem-padrao-card"
        />

        {/* Renderiza as setinhas e pontinhos apenas se houver mais de 1 foto */}
        {fotos.length > 1 && (
          <>
            <button className="seta-carrossel esquerda" onClick={anterior}>
              <FiChevronLeft size={18} />
            </button>
            <button className="seta-carrossel direita" onClick={proxima}>
              <FiChevronRight size={18} />
            </button>

            <div className="dots-container">
              {fotos.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === imgAtiva ? 'ativo' : ''}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card-sku">Código: {joia.codigo}</div>
      <h3 className="card-titulo">{joia.nome}</h3>

      <div className="card-estoque-tag">
        <strong>CRISTAL</strong> <br />
        Estoque: {joia.quantidade} | {joia.peso || '2g'}
      </div>

      <div className="card-footer">
        <span className="card-preco">
          R$ {joia.preco ? joia.preco.toFixed(2).replace('.', ',') : '0,00'}
        </span>

        {/* Botão estilo Pill (Pílula) */}
        <button
          className="btn-comprar-pill"
          onClick={(e) => {
            e.stopPropagation(); // Evita abrir o modal de detalhes quando clica em comprar
            adicionarItem(joia);
          }}
        >
          Comprar
        </button>
      </div>
    </div>
  );
}