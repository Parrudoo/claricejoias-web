import React, { useState } from 'react';
import { FiUser, FiChevronDown, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthProvider';
import { authService } from '../services/authService';
import './Menu.css';
import WhatsAppInput from './WhatsAppInput';

export function Menu({ categorias, aoClicarCategoria }) {
  // Olha como fica limpo! Tudo vem pronto do contexto.
  const { logado, keycloakData, ehAdmin, login, logout } = useAuth()

  const [modalAberto, setModalAberto] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    senha: ''
  });

  // Se não tiver nome, usa "Cliente" por padrão
  const primeiroNome = keycloakData?.primeiroNome || 'Cliente';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const abrirModalCadastro = () => setModalAberto(true);
  const fecharModal = () => setModalAberto(false);

  const handleMinhaConta = () => {
    if (ehAdmin) { // Usando a variável booleana que veio do contexto
      window.location.href = '/admin';
    } else {
      alert("A área de perfil do cliente estará disponível em breve!");
    }
  };

  const handleCadastroSubmit = async (e) => {
    e.preventDefault();
    try {
      // Como a sua api.js tem o interceptor, o X-Visitor-ID já vai junto aqui por baixo dos panos!
      await authService.cadastrar({
        nome: formData.nome,
        whatsapp: formData.whatsapp,
        email: formData.email,
        senha: formData.senha
      });

      alert("Conta criada com sucesso! Você será redirecionado para o login.");

      setFormData({ nome: '', whatsapp: '', email: '', senha: '' });
      fecharModal();

      login(); // 👈 Usando a função do contexto para abrir a tela de login

    } catch (error) {
      alert(error.message);
    }
  };

  const voltarAoTopo = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="topo-fixo">
        {/* 1ª BARRA: LOGO PEQUENA E LOGIN */}
        <div className="secao-login">

          <div className="topo-logo" onClick={voltarAoTopo} title="Voltar ao início">
            <h2>Clarice<span>Joias</span></h2>
          </div>

          <div className="login-container">
            <FiUser size={14} />

            {/* 👇 Usando a variável 'logado' do contexto */}
            {logado ? (
              <>
                <span className="btn-texto-login" style={{ cursor: 'default', textTransform: 'none' }}>
                  Olá, <strong>{primeiroNome}</strong>
                </span>
                <span className="divisor">|</span>
                <button className="btn-texto-login" onClick={handleMinhaConta} title="Ir para o seu painel">Minha Conta</button>
                <span className="divisor">|</span>
                {/* 👇 Usando a função 'logout' do contexto */}
                <button className="btn-texto-login" onClick={logout} style={{ color: '#ff4d4d' }}>Sair</button>
              </>
            ) : (
              <>
                {/* 👇 Usando a função 'login' do contexto */}
                <button className="btn-texto-login" onClick={login}>Login</button>
                <span className="divisor">|</span>
                <button className="btn-texto-login" onClick={abrirModalCadastro}>Cadastre-se</button>
              </>
            )}
          </div>
        </div>

        {/* 2ª BARRA: APENAS NAVEGAÇÃO CENTRALIZADA */}
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
          MODAL DE CADASTRO 
          ========================================= */}
      {modalAberto && (
        <div className="modal-auth-overlay" onClick={fecharModal}>
          <div className="modal-auth-card" onClick={(e) => e.stopPropagation()}>
            <button className="btn-fechar-modal-auth" onClick={fecharModal}>
              <FiX size={20} />
            </button>

            <div className="modal-auth-header">
              <h2>Criar Conta</h2>
              <p>Cadastre-se para acompanhar seus pedidos na Clarice Joias.</p>
            </div>

            <form onSubmit={handleCadastroSubmit} className="modal-auth-form">

              <div className="auth-form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Maria Silva"
                />
              </div>

              <WhatsAppInput
                value={formData.whatsapp}
                onChange={(valorMascarado) => setFormData({ ...formData, whatsapp: valorMascarado })}
              />

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

              <button type="submit" className="btn-auth-submit">
                Cadastrar
              </button>
            </form>

            <div className="modal-auth-footer">
              <p>
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    fecharModal();
                    login(); // 👈 E aqui também!
                  }}
                >
                  Faça Login
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}