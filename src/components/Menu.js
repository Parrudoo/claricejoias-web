import React from 'react';
import { FiUser } from 'react-icons/fi';

import './Menu.css'

export function Menu({ categorias, aoClicarCategoria }) {
    return (
      <header className="topo-fixo">
        {/* Parte de Cima: Login */}
        <div className="secao-login">
          <FiUser size={14} />
          <span>Login</span>
          <span className="divisor">|</span>
          <span>Cadastre-se</span>
        </div>
  
        {/* Parte de Baixo: Categorias */}
        <nav className="secao-categorias">
          {categorias.map(cat => (
            <button 
              key={cat.categoria} 
              onClick={() => aoClicarCategoria(cat.categoria)}
            >
              {cat.categoria}
            </button>
          ))}
        </nav>
      </header>
    );
  }