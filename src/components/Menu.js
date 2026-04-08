import React from 'react';
import { FiUser, FiChevronDown } from 'react-icons/fi';
import './Menu.css';

export function Menu({ categorias, aoClicarCategoria }) {
  return (
    <header className="topo-fixo">
      {/* 1ª BARRA: LOGIN */}
      <div className="secao-login">
        <div className="login-container">
          <FiUser size={14} />
          <span>Login</span>
          <span className="divisor">|</span>
          <span>Cadastre-se</span>
        </div>
      </div>

      {/* 2ª BARRA: NAVEGAÇÃO COM SUBMENU */}
      <nav className="secao-categorias">
        <ul className="menu-lista">
          {categorias.map((cat) => (
            <li key={cat.categoria} className="menu-item">
              <button 
                className="btn-categoria"
                onClick={() => aoClicarCategoria(cat.categoria)}
              >
                {cat.categoria}
                {cat.subitens && <FiChevronDown className="seta-menu" />}
              </button>

              {/* Renderiza o Submenu se existir subitens */}
              {cat.subitens && (
                <ul className="submenu">
                  {cat.subitens.map((sub) => (
                    <li key={sub}>
                      <button onClick={() => aoClicarCategoria(sub)}>
                        {sub}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}