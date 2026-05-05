import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaleta } from '../context/MaletaContext';
import { FiArrowLeft, FiShield, FiSmartphone, FiCheckCircle, FiCreditCard, FiMessageCircle, FiLock, FiUserCheck } from 'react-icons/fi';
import { MdOutlinePix } from 'react-icons/md';
import { leadService } from '../services/leadService';
import { ImagemService } from '../services/ImagemService';
import { useAuth } from '../context/AuthProvider'; // 👈 Importando o seu super Hook
import './Checkout.css'; 

export default function Checkout() {
  const { itens, total } = useMaleta();
  const navigate = useNavigate();

  // 👈 Puxando tudo de uma vez do seu AuthProvider!
  const { logado, keycloakData, dadosPessoais, carregando } = useAuth();

  // Estados do Fluxo de Steps
  const [step, setStep] = useState(1);
  
  // Dados do Cliente
  const [whatsapp, setWhatsapp] = useState('');
  const [codigoOtp, setCodigoOtp] = useState('');
  const [nome, setNome] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [loading, setLoading] = useState(false);

  // Redireciona se o carrinho estiver vazio
  useEffect(() => {
    if (itens.length === 0) navigate('/');
  }, [itens, navigate]);

  // 👈 SE LOGADO: Pula para o passo 3 e preenche os dados
  useEffect(() => {
    if (logado && !carregando) {
      setStep(3); // Pula as etapas de OTP
      
      setNome(keycloakData?.nomeCompleto || '');
      
      // Pega o WhatsApp do banco (dadosPessoais) se existir. 
      // Se não, tenta pegar pelo e-mail falso do Keycloak (ex: 86999999999@clarice...)
      const numeroUser = dadosPessoais?.whatsapp || keycloakData?.email?.split('@')[0] || '';
      setWhatsapp(numeroUser.replace(/\D/g, ''));
    }
  }, [logado, carregando, keycloakData, dadosPessoais]);

  // ================= AÇÕES DO FLUXO INTEGRADO AO BACKEND =================

  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    setLoading(true);
    const whatsappLimpo = whatsapp.replace(/\D/g, '');
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
    const whatsappLimpo = whatsapp.replace(/\D/g, '');
    try {
      await leadService.validarCodigo(whatsappLimpo, codigoOtp);
      setLoading(false);
      setStep(3);
    } catch (error) {
      setLoading(false);
      alert("Código de segurança inválido. Tente novamente.");
    }
  };

  const handleFinalizarPedido = async () => {
    setLoading(true);
    const whatsappLimpo = whatsapp.replace(/\D/g, '');

    try {
      await leadService.salvar({ 
        nome, 
        whatsapp: whatsappLimpo, 
        formaPagamento,
        criarConta: !logado, // 👈 Se já está logado, NÃO tenta criar conta de novo
        itens 
      });
      
      setLoading(false);
      alert(logado ? "Pedido enviado com sucesso! 🎉" : "Identidade confirmada e pedido enviado! 🎉 Olhe seu WhatsApp.");
      navigate('/'); 
    } catch (error) {
      setLoading(false);
      
    }
  };

  return (
    <div className="checkout-container-ml">
      
      <header className="checkout-header-seguro">
        <button onClick={() => navigate('/')} className="btn-voltar-simples">
          <FiArrowLeft /> Voltar à loja
        </button>
        <div className="selo-seguranca">
          <FiShield className="icone-verde" />
          <span>Ambiente Seguro</span>
        </div>
      </header>

      <div className="checkout-content">
        
        <div className="checkout-steps">
          
          {/* STEP 1: IDENTIFICAÇÃO */}
          <div className={`step-card ${step === 1 ? 'ativo' : step > 1 ? 'concluido' : 'bloqueado'}`}>
            <div className="step-header">
              <span className="step-number">1</span>
              <h3>Identificação</h3>
              {step > 1 && <FiCheckCircle className="icone-sucesso-step" />}
            </div>
            
            {/* Se logado, exibe mensagem confirmando a sessão */}
            {logado && step > 1 ? (
              <div className="step-resumo-texto" style={{ color: '#00a650', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiUserCheck size={18} />
                <strong>Sessão ativa e confirmada!</strong>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <form onSubmit={handleSolicitarCodigo} className="step-body fade-in">
                    <p className="step-descricao">Para sua segurança e confirmação de identidade, validaremos seu acesso via WhatsApp.</p>
                    <div className="input-group-moderno">
                      <FiSmartphone className="input-icon" />
                      <input 
                        type="tel" 
                        placeholder="(DDD) 90000-0000" 
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <button type="submit" className="btn-primario" disabled={loading || whatsapp.length < 10}>
                      {loading ? 'Enviando SMS/Whats...' : 'Receber código de acesso'}
                    </button>
                  </form>
                )}
                {step > 1 && !logado && (
                  <div className="step-resumo-texto">WhatsApp: <strong>{whatsapp}</strong></div>
                )}
              </>
            )}
          </div>

          {/* STEP 2: CÓDIGO DE VERIFICAÇÃO */}
          <div className={`step-card ${step === 2 ? 'ativo' : step > 2 ? 'concluido' : 'bloqueado'}`}>
            <div className="step-header">
              <span className="step-number">2</span>
              <h3>Código de Segurança</h3>
              {step > 2 && <FiCheckCircle className="icone-sucesso-step" />}
            </div>
            
            {logado && step > 2 ? (
               <div className="step-resumo-texto">
                 Verificação automática concluída.
               </div>
            ) : (
              step === 2 && (
                <form onSubmit={handleValidarCodigo} className="step-body fade-in">
                  <p className="step-descricao">Digite o código de 6 dígitos que enviamos para o seu WhatsApp agora mesmo.</p>
                  <div className="input-group-moderno input-codigo">
                    <FiLock className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="000000" 
                      maxLength="6"
                      value={codigoOtp}
                      onChange={(e) => setCodigoOtp(e.target.value.replace(/\D/g, ''))}
                      required
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="btn-primario" disabled={loading || codigoOtp.length < 6}>
                    {loading ? 'Validando...' : 'Confirmar Código'}
                  </button>
                  <button type="button" className="btn-link" onClick={() => setStep(1)}>
                    Não recebeu? Corrigir número
                  </button>
                </form>
              )
            )}
          </div>

          {/* STEP 3: PAGAMENTO E CONCLUSÃO */}
          <div className={`step-card ${step === 3 ? 'ativo' : 'bloqueado'}`}>
            <div className="step-header">
              <span className="step-number">3</span>
              <h3>Finalização e Pagamento</h3>
            </div>
            
            {step === 3 && (
              <div className="step-body fade-in">
                
                {/* Mostra o Whats do cara bloqueado para leitura se ele já estiver logado */}
                {logado && (
                  <div className="input-group-moderno mb-20" style={{ opacity: 0.7 }}>
                    <label className="label-moderno">Seu WhatsApp de contato</label>
                    <input type="text" value={whatsapp} disabled className="input-nome" />
                  </div>
                )}

                <div className="input-group-moderno mb-20">
                  <label className="label-moderno">Como podemos te chamar?</label>
                  <input 
                    type="text" 
                    placeholder="Seu nome completo" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="input-nome"
                    required
                  />
                </div>

                <label className="label-moderno">Escolha como prefere pagar:</label>
                <div className="grid-pagamentos">
                  <div className={`card-pagamento ${formaPagamento === 'pix' ? 'selecionado' : ''}`} onClick={() => setFormaPagamento('pix')}>
                    <MdOutlinePix className="icone-pagamento" />
                    <strong>PIX</strong>
                    <span>Chave enviada no Whats</span>
                  </div>
                  
                  <div className={`card-pagamento ${formaPagamento === 'cartao' ? 'selecionado' : ''}`} onClick={() => setFormaPagamento('cartao')}>
                    <FiCreditCard className="icone-pagamento" />
                    <strong>Cartão</strong>
                    <span>Link de pagamento</span>
                  </div>
                  
                  <div className={`card-pagamento ${formaPagamento === 'negociar' ? 'selecionado' : ''}`} onClick={() => setFormaPagamento('negociar')}>
                    <FiMessageCircle className="icone-pagamento" />
                    <strong>Negociar</strong>
                    <span>Falar com vendedora</span>
                  </div>
                </div>

                <button onClick={handleFinalizarPedido} className="btn-primario btn-finalizar" disabled={loading || !nome || !whatsapp}>
                  {loading ? 'Finalizando...' : 'Confirmar Pedido 🛍️'}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* SIDEBAR DE RESUMO */}
        <aside className="checkout-sidebar">
          <div className="resumo-pedido-card">
            <h3>Resumo da Compra</h3>
            <div className="lista-itens-resumo">
              {itens.map(item => (
                <div key={item.id} className="item-mini">
                  <img src={ImagemService.getUrl(item.imagens?.[0])} alt={item.nome} />
                  <div className="item-mini-info">
                    <span className="item-nome">{item.nome}</span>
                    <span className="item-preco">{item.quantidade}x R$ {item.preco.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="linha-divisoria"></div>
            <div className="total-resumo">
              <span>Total a pagar</span>
              <strong>R$ {total.toFixed(2).replace('.', ',')}</strong>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}