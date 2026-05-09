import React, { useState, useRef, useEffect } from 'react';
import { FiUser, FiChevronDown, FiX, FiSmartphone, FiLock } from 'react-icons/fi';
import { useAuth } from '../context/AuthProvider';
import { leadService } from '../services/leadService';
import { authService } from '../services/authService'; // 👈 Importamos o serviço para a recuperação de senha
import './Menu.css';
import WhatsAppInput from './WhatsAppInput';
import { useNavigate } from 'react-router-dom';

export function Menu({ categorias, aoClicarCategoria }) {
  const { logado, keycloakData, ehAdmin, login, logout } = useAuth();
const navigate = useNavigate();
  // ==========================================
  // ESTADOS DO MODAL DE CADASTRO (STEPS)
  // ==========================================
  const [modalAberto, setModalAberto] = useState(false);
  const [step, setStep] = useState(1);
  const [codigoOtp, setCodigoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    email: ''
  });

  // ==========================================
  // ESTADOS DO MODAL DE RECUPERAÇÃO DE SENHA
  // ==========================================
  const [modalRecuperarAberto, setModalRecuperarAberto] = useState(false);
  const [whatsAppRecuperar, setWhatsAppRecuperar] = useState('');
  const [loadingRecuperar, setLoadingRecuperar] = useState(false);

  // ==========================================
  // ESTADOS E REFS DA ROLETA/CARROSSEL
  // ==========================================
  const [isRoleta, setIsRoleta] = useState(false);
  const menuRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isDragging = useRef(false); 

  const primeiroNome = keycloakData?.primeiroNome || 'Cliente';

  // --- LÓGICA DE TELA (RESIZE E OVERFLOW) ---
  useEffect(() => {
    const checarEspaco = () => {
      if (!menuRef.current) return;
      const nav = menuRef.current;
      const larguraOriginal = isRoleta ? nav.scrollWidth / 3 : nav.scrollWidth;
      
      if (larguraOriginal > nav.clientWidth) {
        setIsRoleta(true);
      } else {
        setIsRoleta(false);
      }
    };
    checarEspaco();
    window.addEventListener('resize', checarEspaco);
    return () => window.removeEventListener('resize', checarEspaco);
  }, [isRoleta, categorias]);

  useEffect(() => {
    if (isRoleta && menuRef.current) {
      menuRef.current.scrollLeft = menuRef.current.scrollWidth / 3;
    }
  }, [isRoleta]);

  const categoriasParaRenderizar = isRoleta 
    ? [...categorias, ...categorias, ...categorias] 
    : categorias;

  const handleScroll = () => {
    if (!isRoleta || !menuRef.current) return;
    const nav = menuRef.current;
    const tamanhoDeUmaLista = nav.scrollWidth / 3;

    if (nav.scrollLeft <= 0) {
      nav.scrollLeft += tamanhoDeUmaLista;
    } else if (nav.scrollLeft + nav.clientWidth >= nav.scrollWidth - 1) {
      nav.scrollLeft -= tamanhoDeUmaLista;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- CONTROLES DOS MODAIS ---
  const abrirModalCadastro = () => {
    setStep(1);
    setCodigoOtp('');
    setFormData({ nome: '', whatsapp: '', email: '' });
    setModalAberto(true);
  };
  const fecharModal = () => setModalAberto(false);

  const abrirModalRecuperar = () => {
    setWhatsAppRecuperar('');
    setModalRecuperarAberto(true);
  };
  const fecharModalRecuperar = () => setModalRecuperarAberto(false);

  const handleMinhaConta = () => {
    if (ehAdmin) {
      navigate('/admin'); // Leva o admin para o painel administrativo
    } else {
      navigate('/minha-conta'); // Leva o cliente para a área de "Minha Conta"
    }
  };

  // ==========================================================
  // LÓGICA DE CADASTRO COM WHATSAPP
  // ==========================================================

  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    setLoading(true);
    const whatsappLimpo = formData.whatsapp.replace(/\D/g, '');
    try {
      await leadService.solicitarCodigo(whatsappLimpo);
      setLoading(false);
      setStep(2);
    } catch (error) {
      setLoading(false);
      alert("Erro ao enviar código. Verifique se o número está correto.");
    }
  };

  const handleValidarCodigo = async (e) => {
    e.preventDefault();
    setLoading(true);
    const whatsappLimpo = formData.whatsapp.replace(/\D/g, '');
    try {
      await leadService.validarCodigo(whatsappLimpo, codigoOtp);
      setLoading(false);
      setStep(3);
    } catch (error) {
      setLoading(false);
      alert("Código inválido. Tente novamente.");
    }
  };

  const handleFinalizarCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    const whatsappLimpo = formData.whatsapp.replace(/\D/g, '');

    try {
      await leadService.salvar({
        nome: formData.nome,
        email: formData.email,
        whatsapp: whatsappLimpo,
        criarConta: true,
        itens: [] 
      });

      setLoading(false);
      alert("Conta criada com sucesso! 💎 A senha de acesso foi enviada para o seu WhatsApp.");
      fecharModal();
      login();
    } catch (error) {
      setLoading(false);
      alert("Houve um erro ao criar sua conta. Tente novamente.");
    }
  };

  // ==========================================================
  // LÓGICA DE RECUPERAÇÃO DE SENHA
  // ==========================================================

  const handleRecuperarSenha = async (e) => {
    e.preventDefault();
    setLoadingRecuperar(true);
    const whatsappLimpo = whatsAppRecuperar.replace(/\D/g, '');

    try {
      await authService.solicitarRecuperacaoSenha(whatsappLimpo);
      alert("Pronto! 💎 Uma senha provisória foi enviada para o seu WhatsApp.");
      fecharModalRecuperar();
      login(); // Redireciona para o login do Keycloak
    } catch (error) {
      alert("Não encontramos nenhuma conta com este número de WhatsApp ou houve uma falha.");
    } finally {
      setLoadingRecuperar(false);
    }
  };

  // ==========================================================
  // LÓGICA DE ARRASTAR O MENU (DRAG TO SCROLL)
  // ==========================================================
  const voltarAoTopo = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleMouseDown = (e) => {
    isDown.current = true;
    isDragging.current = false;
    menuRef.current.classList.add('active');
    startX.current = e.pageX - menuRef.current.offsetLeft;
    scrollLeft.current = menuRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    menuRef.current.classList.remove('active');
  };

  const handleMouseUp = () => {
    isDown.current = false;
    menuRef.current.classList.remove('active');
    setTimeout(() => isDragging.current = false, 50);
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    isDragging.current = true; 
    e.preventDefault();
    const x = e.pageX - menuRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; 
    menuRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const posicionarSubmenu = (e) => {
    const li = e.currentTarget;
    const submenu = li.querySelector('.submenu');
    if (submenu) {
      const rect = li.getBoundingClientRect();
      const submenuWidth = submenu.offsetWidth || 180;
      submenu.style.top = `${rect.bottom}px`;
      let calculatedLeft = rect.left;
      if (calculatedLeft + submenuWidth > window.innerWidth) calculatedLeft = window.innerWidth - submenuWidth - 15; 
      if (calculatedLeft < 15) calculatedLeft = 15; 
      submenu.style.left = `${calculatedLeft}px`;
    }
  };

  return (
    <>
      <header className="topo-fixo">
        <div className="secao-login">
          <div className="topo-logo" onClick={voltarAoTopo} title="Voltar ao início">
            <h2>Clarice<span>Joias</span></h2>
          </div>

          <div className="login-container">
            <FiUser size={14} />
            {logado ? (
              <>
                <span className="btn-texto-login" style={{ cursor: 'default', textTransform: 'none' }}>
                  Olá, <strong>{primeiroNome}</strong>
                </span>
                <span className="divisor">|</span>
                <button className="btn-texto-login" onClick={handleMinhaConta} title="Ir para o seu painel">Minha Conta</button>
                <span className="divisor">|</span>
                <button className="btn-texto-login" onClick={logout} style={{ color: '#ff4d4d' }}>Sair</button>
              </>
            ) : (
              <>
                <button className="btn-texto-login" onClick={login}>Login</button>
                <span className="divisor">|</span>
                <button className="btn-texto-login" onClick={abrirModalRecuperar}>Esqueci a Senha</button>
                <span className="divisor">|</span>
                <button className="btn-texto-login" onClick={abrirModalCadastro}>Cadastre-se</button>
              </>
            )}
          </div>
        </div>

        <nav 
          className="secao-categorias"
          ref={menuRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onScroll={handleScroll} 
        >
          <ul className="menu-lista">
            {categoriasParaRenderizar.map((cat, i) => (
              <li key={`${cat.categoria}-${i}`} className="menu-item" onMouseEnter={posicionarSubmenu}>
                <button
                  className="btn-categoria"
                  onClick={(e) => {
                    if (isDragging.current) {
                      e.preventDefault();
                      return;
                    }
                    aoClicarCategoria(cat.categoria);
                  }}
                >
                  {cat.categoria}
                  {cat.subitens && <FiChevronDown className="seta-menu" />}
                </button>

                {cat.subitens && (
                  <ul className="submenu">
                    {cat.subitens.map((sub, j) => (
                      <li key={`${sub}-${j}`}>
                        <button onClick={() => aoClicarCategoria(sub)}>{sub}</button>
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
          MODAL DE CADASTRO COM VALIDAÇÃO (STEPS)
          ========================================= */}
      {modalAberto && (
        <div className="modal-auth-overlay" onClick={fecharModal}>
          <div className="modal-auth-card" onClick={(e) => e.stopPropagation()}>
            <button className="btn-fechar-modal-auth" onClick={fecharModal}>
              <FiX size={20} />
            </button>

            <div className="modal-auth-header">
              <h2>Criar Conta</h2>
              <p>Segurança e agilidade em um só lugar.</p>
            </div>

            <div className="modal-auth-body">
              {step === 1 && (
                <form onSubmit={handleSolicitarCodigo} className="fade-in">
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px', textAlign: 'center' }}>
                    Para sua segurança, valide seu número de WhatsApp.
                  </p>
                  <WhatsAppInput 
                    required={true} 
                    value={formData.whatsapp} 
                    onChange={(valorMascarado) => setFormData({ ...formData, whatsapp: valorMascarado })} 
                  />
                  <button type="submit" className="btn-auth-submit" disabled={loading || formData.whatsapp.length < 10}>
                    {loading ? 'Enviando código...' : 'Receber código de acesso'}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleValidarCodigo} className="fade-in">
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px', textAlign: 'center' }}>
                    Enviamos um código para o número final <strong>{formData.whatsapp.slice(-4)}</strong>
                  </p>
                  <div className="auth-form-group">
                    <div className="input-with-icon">
                      <FiLock className="icon-inside" />
                      <input 
                        type="text" 
                        placeholder="000000" 
                        maxLength="6"
                        value={codigoOtp}
                        onChange={(e) => setCodigoOtp(e.target.value.replace(/\D/g, ''))}
                        required
                        autoFocus
                        className="input-codigo-centralizado"
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-auth-submit" disabled={loading || codigoOtp.length < 6}>
                    {loading ? 'Validando...' : 'Confirmar Código'}
                  </button>
                  <button type="button" className="btn-link-auth" onClick={() => setStep(1)}>
                    Corrigir número
                  </button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleFinalizarCadastro} className="fade-in">
                  <div className="auth-form-group">
                    <label>Seu Nome Completo</label>
                    <input type="text" name="nome" value={formData.nome} onChange={handleChange} required placeholder="Como podemos te chamar?" />
                  </div>
                  <div className="auth-form-group">
                    <label>Seu E-mail (Opcional)</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" />
                  </div>
                  <button type="submit" className="btn-auth-submit" disabled={loading || !formData.nome}>
                    {loading ? 'Criando conta...' : 'Finalizar Cadastro'}
                  </button>
                </form>
              )}
            </div>

            <div className="modal-auth-footer">
              <p>Já tem uma conta? <button type="button" onClick={() => { fecharModal(); login(); }}>Faça Login</button></p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL DE RECUPERAÇÃO DE SENHA
          ========================================= */}
      {modalRecuperarAberto && (
        <div className="modal-auth-overlay" onClick={fecharModalRecuperar}>
          <div className="modal-auth-card" onClick={(e) => e.stopPropagation()}>
            <button className="btn-fechar-modal-auth" onClick={fecharModalRecuperar}>
              <FiX size={20} />
            </button>

            <div className="modal-auth-header">
              <h2>Recuperar Senha</h2>
              <p>Digite seu WhatsApp para receber uma senha provisória.</p>
            </div>

            <form onSubmit={handleRecuperarSenha} className="fade-in">
              <div style={{ marginBottom: '20px' }}>
                <WhatsAppInput 
                  required={true} 
                  value={whatsAppRecuperar} 
                  onChange={(valorMascarado) => setWhatsAppRecuperar(valorMascarado)} 
                />
              </div>

              <button type="submit" className="btn-auth-submit" disabled={loadingRecuperar || whatsAppRecuperar.length < 10}>
                {loadingRecuperar ? 'Enviando...' : 'Receber Nova Senha no Zap'}
              </button>
            </form>

            <div className="modal-auth-footer">
              <p>Lembrou a senha? <button type="button" onClick={() => { fecharModalRecuperar(); login(); }}>Faça Login</button></p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}