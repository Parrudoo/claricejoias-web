import React from 'react';
import { FiShoppingBag } from 'react-icons/fi'; // Ícone de maleta/bolsa
import { useMaleta } from '../context/MaletaContext';
import './NavBar.css';

export default function NavBar() {
  const { itens, setCarrinhoAberto } = useMaleta();
  
  // Calcula o total de peças (soma das quantidades)
  const quantidadeTotal = itens.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <nav className="navbar-luxo">
      <div className="navbar-logo">
        <h1>Clarice Joias</h1>
      </div>
      
      <div className="navbar-acoes" onClick={() => setCarrinhoAberto(true)}>
        <div className="maleta-icon-container">
          <FiShoppingBag size={28} color="#D4AF37" />
          {quantidadeTotal > 0 && (
            <span className="badge-quantidade">{quantidadeTotal}</span>
          )}
        </div>
      </div>
    </nav>
  );
}