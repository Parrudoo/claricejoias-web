import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaleta } from '../context/MaletaContext';
import { FiArrowLeft } from 'react-icons/fi';
import { leadService } from '../services/leadService'; // 1. Importando o serviço
import './Checkout.css';

export default function Checkout() {
  const { itens, total } = useMaleta();
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const navigate = useNavigate();

  const enviarWhatsApp = async (e) => { 
    e.preventDefault();

    // 2. Chamada real para o seu backend via serviço
    try {
      await leadService.salvar(nome, whatsapp, itens);
      console.log("Lead salvo no banco de dados com sucesso!", { nome, whatsapp });
    } catch (error) {
      console.error("Erro ao salvar o lead no backend", error);
      // O fluxo continua normalmente para o WhatsApp mesmo se a API falhar
    }

    // 3. Montar e enviar a mensagem para o WhatsApp da Loja
    let mensagem = `Olá! Meu nome é *${nome}* e tenho interesse nestas joias do catálogo:\n\n`;

    itens.forEach(item => {
      mensagem += `• ${item.nome} (${item.quantidade}x) - R$ ${(item.preco * item.quantidade).toFixed(2)}\n`;
    });

    mensagem += `\n*Total estimado:* R$ ${total.toFixed(2)}`;
    mensagem += `\n*Meu contato:* ${whatsapp}`;

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
        <div className="linha-inputs">
          <div className="campo-form">
             <label>Como podemos lhe chamar?</label>
             <input 
              type="text" 
              placeholder="Seu nome completo" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required 
            />
          </div>

          <div className="campo-form">
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
                /* Garantia extra: se o backend falhar, mostra erro */
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