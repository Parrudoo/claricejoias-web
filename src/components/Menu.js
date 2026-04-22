import React, { useState } from 'react';
import { FiUser, FiChevronDown, FiX } from 'react-icons/fi';
import { useKeycloak } from '@react-keycloak/web'; // 👇 Importação Oficial do Keycloak
import { authService } from '../services/authService';
import './Menu.css';

export function Menu({ categorias, aoClicarCategoria }) {
  // 👇 Puxa a instância oficial do Keycloak que gerencia a sessão global
  const { keycloak } = useKeycloak(); 

  // Controle do Modal (Agora focado apenas no Cadastro)
  const [modalAberto, setModalAberto] = useState(false);

  // Dados do formulário de cadastro
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    senha: ''
  });

  // 👇 DADOS EM TEMPO REAL: Lê diretamente do Keycloak (sem usar localStorage)
  const usuarioEstaLogado = keycloak.authenticated;
  const nomeCompleto = keycloak.tokenParsed?.name || keycloak.tokenParsed?.given_name || 'Cliente';
  const primeiroNome = nomeCompleto.split(' ')[0];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const abrirModalCadastro = () => {
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  // Decide pra onde o botão "Minha Conta" vai levar usando a role do Keycloak
  const handleMinhaConta = () => {
    if (keycloak.hasRealmRole('ADMIN')) {
      window.location.href = '/admin'; // Joga pro painel administrativo
    } else {
      alert("A área de perfil do cliente estará disponível em breve!"); 
    }
  };

  const handleSair = () => {
    // Encerra a sessão direto no servidor do Keycloak e volta pra página inicial
    keycloak.logout({ redirectUri: window.location.origin });
  };

  const handleCadastroSubmit = async (e) => {
    e.preventDefault();

    try {
      // Manda os dados para o Spring Boot criar o usuário
      await authService.cadastrar({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha
      });

      alert("Conta criada com sucesso! Você será redirecionado para o login.");

      // Limpa o formulário, fecha o modal e joga pra tela de login do Keycloak
      setFormData({ nome: '', whatsapp: '', email: '', senha: '' });
      fecharModal();
      
      keycloak.login(); 

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <header className="topo-fixo">
        {/* 1ª BARRA: LOGIN OU NOME DO USUÁRIO */}
        <div className="secao-login">
          <div className="login-container">
            <FiUser size={14} />
            
            {usuarioEstaLogado ? (
              <>
                <span className="btn-texto-login" style={{ cursor: 'default', textTransform: 'none' }}>
                  Olá, <strong>{primeiroNome}</strong>
                </span>
                <span className="divisor">|</span>
                <button className="btn-texto-login" onClick={handleMinhaConta} title="Ir para o seu painel">Minha Conta</button>
                <span className="divisor">|</span>
                <button className="btn-texto-login" onClick={handleSair} style={{ color: '#ff4d4d' }}>Sair</button>
              </>
            ) : (
              <>
                {/* 👇 Login agora chama o Keycloak direto! */}
                <button className="btn-texto-login" onClick={() => keycloak.login()}>Login</button>
                <span className="divisor">|</span>
                <button className="btn-texto-login" onClick={abrirModalCadastro}>Cadastre-se</button>
              </>
            )}
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
          MODAL DE CADASTRO (Simplificado para apenas cadastro)
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

              <div className="auth-form-group">
                <label>WhatsApp</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  required
                  placeholder="(00) 90000-0000"
                />
              </div>

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
                    keycloak.login(); // Fecha o modal e abre o login do Keycloak
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