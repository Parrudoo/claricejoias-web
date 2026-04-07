import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importamos para poder voltar
import { useMaleta } from '../context/MaletaContext';
import { FiArrowLeft } from 'react-icons/fi'; // Ícone elegante de voltar
import './Checkout.css';

export default function Checkout() {
  const { itens, total } = useMaleta();
  const [nome, setNome] = useState('');
  const navigate = useNavigate(); // 2. Inicializamos o navegador

  const enviarWhatsApp = (e) => {
    e.preventDefault();
    
    let mensagem = `Olá! Meu nome é *${nome}* e tenho interesse nestas joias:\n\n`;

    itens.forEach(item => {
      mensagem += `• ${item.nome} (${item.quantidade}x) - R$ ${(item.preco * item.quantidade).toFixed(2)}\n`;
    });

    mensagem += `\n*Total estimado:* R$ ${total.toFixed(2)}`;

    const numeroLoja = "5586999999999"; 
    const link = `https://wa.me/${numeroLoja}?text=${encodeURIComponent(mensagem)}`;

    window.open(link, '_blank');
  };

  return (
    <div className="checkout-minimalista">
      {/* Botão de Voltar sutil e sofisticado */}
      <button className="btn-voltar" onClick={() => navigate('/')}>
        <FiArrowLeft /> Voltar ao catálogo
      </button>

      <h2>Quase lá! ✨</h2>
      <p>Confirme suas escolhas e nos chame para um atendimento exclusivo.</p>

      <form onSubmit={enviarWhatsApp}>
        <div className="campo-nome">
           <label>Como podemos lhe chamar?</label>
           <input 
            type="text" 
            placeholder="Digite seu nome completo" 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required 
          />
        </div>

        {/* 3. Preenchendo o resumo visual das peças */}
        <div className="lista-conferencia">
          <h3>Resumo da Maleta</h3>
          {itens.map(item => (
            <div key={item.id} className="checkout-item">
              <img 
                src={item.imagens ? item.imagens[0] : item.img} 
                alt={item.nome} 
                className="img-checkout"
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