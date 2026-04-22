import React, { useState } from 'react';
import { FiUser, FiChevronDown, FiX } from 'react-icons/fi';
import './Menu.css';
import { authService } from '../services/authService';

export function Menu({ categorias, aoClicarCategoria }) {
  // Controle do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [modoCadastro, setModoCadastro] = useState(false); // false = Login, true = Cadastro

  // Dados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    senha: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const abrirModal = (ehCadastro) => {
    setModoCadastro(ehCadastro);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modoCadastro) {
        // --- FLUXO DE CADASTRO ---

        // Passamos o objeto com nome, email e senha para o serviço
        await authService.cadastrar({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha
        });

        alert("Conta criada com sucesso! Faça login para continuar.");

        // Limpa a senha por segurança e muda para a aba de login
        setFormData({ ...formData, senha: '' });
        setModoCadastro(false);

      } else {
        // --- FLUXO DE LOGIN ---

        await authService.login(formData.email, formData.senha);

        alert("Bem-vindo(a) de volta!");
        fecharModal();

        // Recarrega a página para que o sistema inteiro perceba o novo usuário logado
        window.location.reload();
      }
    } catch (error) {
      // Como o nosso serviço lança um Error, o Catch pega a mensagem exata aqui
      alert(error.message);
    }
  };

  return (
    <>
      <header className="topo-fixo">
        {/* 1ª BARRA: LOGIN */}
        <div className="secao-login">
          <div className="login-container">
            <FiUser size={14} />
            <button className="btn-texto-login" onClick={() => abrirModal(false)}>Login</button>
            <span className="divisor">|</span>
            <button className="btn-texto-login" onClick={() => abrirModal(true)}>Cadastre-se</button>
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

      {/* =========================================
          MODAL DE LOGIN E CADASTRO
          ========================================= */}
      {modalAberto && (
        <div className="modal-auth-overlay" onClick={fecharModal}>
          <div className="modal-auth-card" onClick={(e) => e.stopPropagation()}>
            <button className="btn-fechar-modal-auth" onClick={fecharModal}>
              <FiX size={20} />
            </button>

            <div className="modal-auth-header">
              <h2>{modoCadastro ? 'Criar Conta' : 'Bem-vindo de volta'}</h2>
              <p>{modoCadastro ? 'Cadastre-se para acompanhar seus pedidos.' : 'Acesse sua conta para continuar.'}</p>
            </div>

            <form onSubmit={handleSubmit} className="modal-auth-form">

              {/* Campos que só aparecem no Cadastro */}
              {modoCadastro && (
                <>
                  <div className="auth-form-group">
                    <label>Nome Completo</label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required={modoCadastro}
                      placeholder="Ex: Maria Silva"
                    />
                  </div>
                  <div className="auth-form-group">
                    <label>WhatsApp</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required={modoCadastro}
                      placeholder="(00) 90000-0000"
                    />
                  </div>
                </>
              )}

              {/* Campos que aparecem em ambos (Login e Cadastro) */}
              <div className="auth-form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <div className="auth-form-group">
                <label>Senha</label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
              </div>

              {!modoCadastro && (
                <div className="auth-esqueceu-senha">
                  <button type="button">Esqueceu a senha?</button>
                </div>
              )}

              <button type="submit" className="btn-auth-submit">
                {modoCadastro ? 'Cadastrar' : 'Entrar'}
              </button>
            </form>

            <div className="modal-auth-footer">
              {modoCadastro ? (
                <p>Já tem uma conta? <button type="button" onClick={() => setModoCadastro(false)}>Faça Login</button></p>
              ) : (
                <p>Novo por aqui? <button type="button" onClick={() => setModoCadastro(true)}>Cadastre-se</button></p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}