import React, { useState, useRef, useEffect } from 'react';
import { FiUser, FiChevronDown, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthProvider';
import { authService } from '../services/authService';
import './Menu.css';
import WhatsAppInput from './WhatsAppInput';

export function Menu({ categorias, aoClicarCategoria }) {
  const { logado, keycloakData, ehAdmin, login, logout } = useAuth();

  const [modalAberto, setModalAberto] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    senha: ''
  });

  // 👇 NOVO ESTADO: Controla se a roleta deve ser ativada ou não
  const [isRoleta, setIsRoleta] = useState(false);

  const menuRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isDragging = useRef(false); 

  const primeiroNome = keycloakData?.primeiroNome || 'Cliente';

  // --- LÓGICA INTELIGENTE DE TELA (RESIZE E OVERFLOW) ---
  useEffect(() => {
    const checarEspaco = () => {
      if (!menuRef.current) return;
      const nav = menuRef.current;
      
      // Se já estiver triplicado, a largura real é 1/3 do total. Se não, é o total.
      const larguraOriginal = isRoleta ? nav.scrollWidth / 3 : nav.scrollWidth;
      
      // Verifica se a largura dos itens é maior que a largura da tela (precisa de scroll)
      if (larguraOriginal > nav.clientWidth) {
        setIsRoleta(true);
      } else {
        setIsRoleta(false);
      }
    };

    // Roda a checagem ao carregar a página
    checarEspaco();

    // Roda a checagem toda vez que o usuário redimensionar a janela (ex: virar o celular)
    window.addEventListener('resize', checarEspaco);
    return () => window.removeEventListener('resize', checarEspaco);
  }, [isRoleta, categorias]);

  // Se ativou a roleta, joga o scroll para o meio invisivelmente
  useEffect(() => {
    if (isRoleta && menuRef.current) {
      menuRef.current.scrollLeft = menuRef.current.scrollWidth / 3;
    }
  }, [isRoleta]);

  // Decide qual lista renderizar com base no espaço da tela
  const categoriasParaRenderizar = isRoleta 
    ? [...categorias, ...categorias, ...categorias] 
    : categorias;

  // --- Função da Roleta Infinita ---
  const handleScroll = () => {
    if (!isRoleta || !menuRef.current) return; // Só faz o "pulo" se estiver no celular (roleta ativada)
    
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

  const abrirModalCadastro = () => setModalAberto(true);
  const fecharModal = () => setModalAberto(false);

  const handleMinhaConta = () => {
    if (ehAdmin) {
      window.location.href = '/admin';
    } else {
      alert("A área de perfil do cliente estará disponível em breve!");
    }
  };

  const handleCadastroSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.cadastrar({
        nome: formData.nome,
        whatsapp: formData.whatsapp,
        email: formData.email,
        senha: formData.senha
      });

      alert("Conta criada com sucesso! Você será redirecionado para o login.");

      setFormData({ nome: '', whatsapp: '', email: '', senha: '' });
      fecharModal();
      login();
    } catch (error) {
      // Tratar erro
    }
  };

  const voltarAoTopo = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    setTimeout(() => {
      isDragging.current = false;
    }, 50);
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

      if (calculatedLeft + submenuWidth > window.innerWidth) {
        calculatedLeft = window.innerWidth - submenuWidth - 15; 
      }

      if (calculatedLeft < 15) {
        calculatedLeft = 15; 
      }

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
            {/* Renderiza a lista normal ou a triplicada, dependendo do estado */}
            {categoriasParaRenderizar.map((cat, i) => (
              <li 
                key={`${cat.categoria}-${i}`} 
                className="menu-item"
                onMouseEnter={posicionarSubmenu}
              >
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

      {/* O SEU MODAL CONTINUA EXATAMENTE AQUI, SEM MUDANÇAS */}
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
                <label>E-mail</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="seu@email.com" />
              </div>

              <WhatsAppInput required={true} value={formData.whatsapp} onChange={(valorMascarado) => setFormData({ ...formData, whatsapp: valorMascarado })} />

              <div className="auth-form-group">
                <label>Senha</label>
                <input type="password" name="senha" value={formData.senha} onChange={handleChange} required placeholder="••••••••" />
              </div>

              <button type="submit" className="btn-auth-submit">Cadastrar</button>
            </form>

            <div className="modal-auth-footer">
              <p>Já tem uma conta? <button type="button" onClick={() => { fecharModal(); login(); }}>Faça Login</button></p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}