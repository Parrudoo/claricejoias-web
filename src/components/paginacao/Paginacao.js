import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Paginacao.css'; // Vamos criar esse arquivo no próximo passo

// O componente recebe 3 "props" (parâmetros) para funcionar em qualquer tela
export default function Paginacao({ currentPage, totalPages, onPageChange }) {
  
  // Se não houver páginas ou tiver apenas 1 página (e você quiser esconder), não renderiza nada.
  // Como optamos por mostrar "Página 1 de 1", validamos apenas se for menor ou igual a 0.
  if (totalPages <= 0) return null;

  return (
    <div className="paginacao-container">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="btn-paginacao-icon"
        title="Página Anterior"
      >
        <FiChevronLeft size={20} />
      </button>

      <span className="paginacao-info">
        Página {currentPage + 1} de {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="btn-paginacao-icon"
        title="Próxima Página"
      >
        <FiChevronRight size={20} />
      </button>
    </div>
  );
}