import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaleta } from '../context/MaletaContext';
import { FiArrowLeft } from 'react-icons/fi';
import { leadService } from '../services/leadService';
import './Checkout.css';

export default function Checkout() {
  const { itens, total } = useMaleta();
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  // NOVOS ESTADOS PARA A CRIAÇÃO DE CONTA OPCIONAL
  const [email, setEmail] = useState('');
  const [criarConta, setCriarConta] = useState(false);
  const [senha, setSenha] = useState('');
  
  const navigate = useNavigate();

  const enviarWhatsApp = async (e) => { 
    e.preventDefault();

    // 1. Chamada real para o seu backend via serviço (Agora enviando tudo como objeto)
    try {
      // Dica: Atualize o seu leadService.salvar para receber esse objeto!
      await leadService.salvar({ 
        nome, 
        whatsapp, 
        email, 
        criarConta, 
        senha: criarConta ? senha : null, 
        itens 
      });
      console.log("Lead salvo no banco de dados com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar o lead no backend", error);
      // O fluxo continua normalmente para o WhatsApp mesmo se a API falhar
    }

    // 2. Montar e enviar a mensagem para o WhatsApp da Loja
    let mensagem = `Olá! Meu nome é *${nome}* e tenho interesse nestas joias do catálogo:\n\n`;

    itens.forEach(item => {
      mensagem += `• ${item.nome} (${item.quantidade}x) - R$ ${(item.preco * item.quantidade).toFixed(2)}\n`;
    });

    mensagem += `\n*Total estimado:* R$ ${total.toFixed(2)}`;
    mensagem += `\n*Meu contato:* ${whatsapp}`;
    if (email) mensagem += `\n*Meu E-mail:* ${email}`;

    const numeroLoja = "5586995646615"; 
    const link = `https://wa.me/${numeroLoja}?text=${encodeURIComponent(mensagem)}`;

    window.open(link, '_blank');
  };

  return (
    <div className="checkout-minimalista">
      <button className="btn-voltar" onClick={() => navigate('/')}>
        <FiArrowLeft /> Voltar ao catálogo
      </button>

      <h2>Quase lá! ✨</h2>
      <p>Confirme suas escolhas e nos chame para um atendimento exclusivo.</p>

      <form onSubmit={enviarWhatsApp}>
        
        {/* Lado a lado em telas grandes */}
        <div className="linha-inputs">
          <div className="campo-form" style={{ flex: 2 }}>
             <label>Como podemos lhe chamar?</label>
             <input 
              type="text" 
              placeholder="Seu nome completo" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required 
            />
          </div>

          <div className="campo-form" style={{ flex: 1 }}>
             <label>Seu WhatsApp</label>
             <input 
              type="tel" 
              placeholder="(DDD) 90000-0000" 
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required 
            />
          </div>
        </div>

        {/* E-mail sempre visível para envio do recibo/contato */}
        <div className="campo-form" style={{ marginBottom: '20px' }}>
           <label>E-mail</label>
           <input 
            type="email" 
            placeholder="seu@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        {/* =======================================
            MÓDULO DE CRIAÇÃO DE CONTA (OPCIONAL)
            ======================================= */}
        <div className="modulo-criacao-conta">
          <label className="checkbox-conta">
            <input 
              type="checkbox" 
              checked={criarConta} 
              onChange={(e) => setCriarConta(e.target.checked)} 
            />
            Salvar meus dados e criar uma senha para acompanhar meus pedidos
          </label>

          {criarConta && (
            <div className="campo-form animate-fade-in" style={{ marginTop: '15px' }}>
              <label>Crie uma senha segura</label>
              <input 
                type="password" 
                placeholder="Mínimo 6 caracteres" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required={criarConta} 
              />
            </div>
          )}
        </div>

        <div className="lista-conferencia">
          <h3>Resumo da Maleta</h3>
          {itens.map(item => (
            <div key={item.id} className="checkout-item">
              <img 
                src={
                  (item.imagemSelecionada || (item.imagens && item.imagens[0]) || item.pathImg) 
                  ? `http://localhost:8080/arquivos/view/${(item.imagemSelecionada || (item.imagens && item.imagens[0]) || item.pathImg)}`
                  : 'https://via.placeholder.com/70x90?text=Sem+Foto'
                } 
                alt={item.nome} 
                className="img-checkout"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/70x90?text=Erro'; }}
              />
              <div className="checkout-item-info">
                <h4>{item.nome}</h4>
                <span>{item.quantidade}x — R$ {item.preco.toFixed(2)}</span>
              </div>
            </div>
          ))}
          
          <div className="checkout-total-final">
            <span>Total estimado</span>
            <strong>R$ {total.toFixed(2)}</strong>
          </div>
        </div>

        <button type="submit" className="btn-whatsapp">
          Solicitar via WhatsApp 💬
        </button>
      </form>
    </div>
  );
}