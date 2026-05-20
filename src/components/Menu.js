import React, { useState, useRef, useEffect } from 'react';
import { FiUser, FiChevronDown, FiX, FiSmartphone, FiLock, FiLogIn, FiUserPlus, FiKey, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthProvider';
import { leadService } from '../services/leadService';
import { authService } from '../services/authService';
import './Menu.css';
import WhatsAppInput from './WhatsAppInput';
import { useNavigate } from 'react-router-dom';
import { useLoja } from '../context/LojaContext';

export function Menu({ categorias, aoClicarCategoria }) {
  const { logado, keycloakData, ehAdmin, login, logout } = useAuth();
  const navigate = useNavigate();
  
  const [modalAberto, setModalAberto] = useState(false);
  const [step, setStep] = useState(1);
  const [codigoOtp, setCodigoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nome: '', whatsapp: '', email: '' });

  const [modalRecuperarAberto, setModalRecuperarAberto] = useState(false);
  const [whatsAppRecuperar, setWhatsAppRecuperar] = useState('');
  const [loadingRecuperar, setLoadingRecuperar] = useState(false);

  const [isRoleta, setIsRoleta] = useState(false);
  const menuRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isDragging = useRef(false);
  const { slug, revendedor: lojaRevendedor } = useLoja();

  const primeiroNome = keycloakData?.primeiroNome || 'Cliente';

  // ==========================================
  // NOVOS ESTADOS: SUBMENU FLUTUANTE (FORA DA BARRA)
  // ==========================================
  const [submenuAtivo, setSubmenuAtivo] = useState(null);
  const [submenuPos, setSubmenuPos] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef(null);

  // --- LÓGICA DE TELA (RESIZE E OVERFLOW) ---
  useEffect(() => {
    const checarEspaco = () => {
      if (!menuRef.current) return;
      const nav = menuRef.current;
      const larguraOriginal = isRoleta ? nav.scrollWidth / 3 : nav.scrollWidth;
      setIsRoleta(larguraOriginal > nav.clientWidth);
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

  const categoriasParaRenderizar = isRoleta ? [...categorias, ...categorias, ...categorias] : categorias;

  const handleScroll = () => {
    setSubmenuAtivo(null); // Esconde submenu ao rolar a tela
    if (!isRoleta || !menuRef.current) return;
    const nav = menuRef.current;
    const tamanhoDeUmaLista = nav.scrollWidth / 3;

    if (nav.scrollLeft <= 0) {
      nav.scrollLeft += tamanhoDeUmaLista;
    } else if (nav.scrollLeft + nav.clientWidth >= nav.scrollWidth - 1) {
      nav.scrollLeft -= tamanhoDeUmaLista;
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- CONTROLES DOS MODAIS ---
  const abrirModalCadastro = () => {
    setStep(1); setCodigoOtp(''); setFormData({ nome: '', whatsapp: '', email: '' }); setModalAberto(true);
  };
  const fecharModal = () => setModalAberto(false);
  const abrirModalRecuperar = () => { setWhatsAppRecuperar(''); setModalRecuperarAberto(true); };
  const fecharModalRecuperar = () => setModalRecuperarAberto(false);

  const handleMinhaConta = () => {
    if (ehAdmin) navigate('/admin');
    else navigate(slug ? `/${slug}/minha-conta` : '/minha-conta');
  };

  // --- LÓGICA DE CADASTRO E RECUPERAÇÃO ---
  const handleSolicitarCodigo = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await leadService.solicitarCodigo(formData.whatsapp.replace(/\D/g, ''));
      setStep(2);
    } catch (error) { alert("Erro ao enviar código."); } finally { setLoading(false); }
  };

  const handleValidarCodigo = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await leadService.validarCodigo(formData.whatsapp.replace(/\D/g, ''), codigoOtp);
      setStep(3);
    } catch (error) { alert("Código inválido."); } finally { setLoading(false); }
  };

  const handleFinalizarCadastro = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await leadService.salvar({ nome: formData.nome, email: formData.email, whatsapp: formData.whatsapp.replace(/\D/g, ''), criarConta: true, itens: [] });
      alert("Conta criada! A senha foi enviada para o WhatsApp.");
      fecharModal(); login();
    } catch (error) { alert("Erro ao criar conta."); } finally { setLoading(false); }
  };

  const handleRecuperarSenha = async (e) => {
    e.preventDefault(); setLoadingRecuperar(true);
    try {
      await authService.solicitarRecuperacaoSenha(whatsAppRecuperar.replace(/\D/g, ''));
      alert("Senha enviada para o WhatsApp.");
      fecharModalRecuperar(); login();
    } catch (error) { alert("Falha ao recuperar."); } finally { setLoadingRecuperar(false); }
  };

  // --- ARRASTAR MENU ---
  const voltarAoTopo = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleMouseDown = (e) => {
    isDown.current = true; isDragging.current = false; menuRef.current.classList.add('active');
    startX.current = e.pageX - menuRef.current.offsetLeft; scrollLeft.current = menuRef.current.scrollLeft;
    setSubmenuAtivo(null); // Esconde ao clicar
  };
  const handleMouseLeave = () => { isDown.current = false; menuRef.current.classList.remove('active'); };
  const handleMouseUp = () => { isDown.current = false; menuRef.current.classList.remove('active'); setTimeout(() => isDragging.current = false, 50); };
  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    isDragging.current = true; e.preventDefault();
    const walk = ((e.pageX - menuRef.current.offsetLeft) - startX.current) * 1.5;
    menuRef.current.scrollLeft = scrollLeft.current - walk;
  };

  // ==========================================
  // NOVA LÓGICA: POSICIONAMENTO DO SUBMENU
  // ==========================================
  const handleMouseEnterBolha = (e, cat) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!cat.subitens || cat.subitens.length === 0) {
      setSubmenuAtivo(null);
      return;
    }
    
    // Calcula a posição da bolha na tela
    const rect = e.currentTarget.getBoundingClientRect();
    const submenuWidth = 180;
    
    let calcLeft = rect.left + (rect.width / 2) - (submenuWidth / 2);
    if (calcLeft + submenuWidth > window.innerWidth) calcLeft = window.innerWidth - submenuWidth - 15;
    if (calcLeft < 15) calcLeft = 15;

    setSubmenuPos({ top: rect.bottom + 5, left: calcLeft });
    setSubmenuAtivo(cat);
  };

  const handleMouseLeaveBolha = () => {
    // Dá um pequeno atraso para dar tempo de mover o mouse para dentro do submenu
    timeoutRef.current = setTimeout(() => setSubmenuAtivo(null), 150);
  };

  const handleMouseEnterSubmenu = () => {
    // Se o mouse entrou no submenu, cancela o fechamento
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  return (
    <>
      <header className="topo-fixo">
        <div className="secao-login">
          <div className="topo-logo" onClick={voltarAoTopo} title="Voltar ao início">
            <h2>Clarice<span>Joias</span></h2>
          </div>

          <div className="login-container">
            {logado ? (
              <>
                <span className="saudacao-texto">
                  Olá, <strong>{primeiroNome}</strong>
                </span>
                <button className="btn-icone-login" onClick={handleMinhaConta} title="Minha Conta">
                  <FiUser size={22} />
                </button>
                <button className="btn-icone-login" onClick={logout} title="Sair" style={{ color: '#d9534f' }}>
                  <FiLogOut size={22} />
                </button>
              </>
            ) : (
              <>
                <button className="btn-icone-login" onClick={login} title="Fazer Login">
                  <FiLogIn size={22} />
                </button>
                <button className="btn-icone-login" onClick={abrirModalCadastro} title="Criar Conta">
                  <FiUserPlus size={22} />
                </button>
                <button className="btn-icone-login" onClick={abrirModalRecuperar} title="Recuperar Senha">
                  <FiKey size={22} />
                </button>
              </>
            )}
          </div>
        </div>

        <nav className="secao-categorias-bolhas">
          <ul 
            className="menu-lista-bolhas"
            ref={menuRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onScroll={handleScroll}
          >
            {categoriasParaRenderizar.map((cat, i) => (
              <li 
                key={`${cat.categoria}-${i}`} 
                className="bolha-item"
                onMouseEnter={(e) => handleMouseEnterBolha(e, cat)}
                onMouseLeave={handleMouseLeaveBolha}
              >
                <div 
                  className="bolha-img-container"
                  onClick={(e) => {
                    if (isDragging.current) { e.preventDefault(); return; }
                    aoClicarCategoria(cat.categoria);
                  }}
                >
                  <img src={cat.imagem || `https://ui-avatars.com/api/?name=${cat.categoria.substring(0,2)}&background=f0f0f0&color=666&size=100`} alt={cat.categoria} />
                </div>
                <span className="bolha-texto">{cat.categoria}</span>
                {/* O SUBMENU FOI REMOVIDO DAQUI */}
              </li>
            ))}
          </ul>
        </nav>

        {/* ==========================================
            SUBMENU RENDERIZADO FORA DA BARRA (PORTAL)
            ========================================== */}
        {submenuAtivo && (
          <ul 
            className="submenu-bolhas-portal"
            style={{ top: `${submenuPos.top}px`, left: `${submenuPos.left}px` }}
            onMouseEnter={handleMouseEnterSubmenu}
            onMouseLeave={handleMouseLeaveBolha}
          >
            {submenuAtivo.subitens.map((sub, j) => (
              <li key={`${sub}-${j}`}>
                <button onClick={() => {
                  aoClicarCategoria(sub);
                  setSubmenuAtivo(null);
                }}>{sub}</button>
              </li>
            ))}
          </ul>
        )}
      </header>

      {/* RESTANTE DO CÓDIGO DE MODAIS ABAIXO (MANTIDO INTACTO) */}
      {modalAberto && (
        <div className="modal-auth-overlay" onClick={fecharModal}>
          <div className="modal-auth-card" onClick={(e) => e.stopPropagation()}>
            <button className="btn-fechar-modal-auth" onClick={fecharModal}><FiX size={20} /></button>
            <div className="modal-auth-header"><h2>Criar Conta</h2><p>Segurança e agilidade em um só lugar.</p></div>
            <div className="modal-auth-body">
              {step === 1 && (
                <form onSubmit={handleSolicitarCodigo} className="fade-in">
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px', textAlign: 'center' }}>Para sua segurança, valide seu número de WhatsApp.</p>
                  <WhatsAppInput required={true} value={formData.whatsapp} onChange={(v) => setFormData({ ...formData, whatsapp: v })} />
                  <button type="submit" className="btn-auth-submit" disabled={loading || formData.whatsapp.length < 10}>{loading ? 'Enviando...' : 'Receber código de acesso'}</button>
                </form>
              )}
              {step === 2 && (
                <form onSubmit={handleValidarCodigo} className="fade-in">
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px', textAlign: 'center' }}>Enviamos um código para o número final <strong>{formData.whatsapp.slice(-4)}</strong></p>
                  <div className="auth-form-group">
                    <div className="input-with-icon">
                      <FiLock className="icon-inside" />
                      <input type="text" placeholder="000000" maxLength="6" value={codigoOtp} onChange={(e) => setCodigoOtp(e.target.value.replace(/\D/g, ''))} required autoFocus className="input-codigo-centralizado" />
                    </div>
                  </div>
                  <button type="submit" className="btn-auth-submit" disabled={loading || codigoOtp.length < 6}>{loading ? 'Validando...' : 'Confirmar Código'}</button>
                  <button type="button" className="btn-link-auth" onClick={() => setStep(1)}>Corrigir número</button>
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
                  <button type="submit" className="btn-auth-submit" disabled={loading || !formData.nome}>{loading ? 'Criando conta...' : 'Finalizar Cadastro'}</button>
                </form>
              )}
            </div>
            <div className="modal-auth-footer"><p>Já tem uma conta? <button type="button" onClick={() => { fecharModal(); login(); }}>Faça Login</button></p></div>
          </div>
        </div>
      )}

      {modalRecuperarAberto && (
        <div className="modal-auth-overlay" onClick={fecharModalRecuperar}>
          <div className="modal-auth-card" onClick={(e) => e.stopPropagation()}>
            <button className="btn-fechar-modal-auth" onClick={fecharModalRecuperar}><FiX size={20} /></button>
            <div className="modal-auth-header"><h2>Recuperar Senha</h2><p>Digite seu WhatsApp para receber uma senha provisória.</p></div>
            <form onSubmit={handleRecuperarSenha} className="fade-in">
              <div style={{ marginBottom: '20px' }}><WhatsAppInput required={true} value={whatsAppRecuperar} onChange={(v) => setWhatsAppRecuperar(v)} /></div>
              <button type="submit" className="btn-auth-submit" disabled={loadingRecuperar || whatsAppRecuperar.length < 10}>{loadingRecuperar ? 'Enviando...' : 'Receber Nova Senha no Zap'}</button>
            </form>
            <div className="modal-auth-footer"><p>Lembrou a senha? <button type="button" onClick={() => { fecharModalRecuperar(); login(); }}>Faça Login</button></p></div>
          </div>
        </div>
      )}
    </>
  );
}