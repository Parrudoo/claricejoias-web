import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaleta } from '../context/MaletaContext';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { leadService } from '../services/leadService';
import { useAuth } from '../hooks/useAuth';
import './Checkout.css';

export default function Checkout() {
  const { itens, total } = useMaleta();
  const navigate = useNavigate();
  const { logado, nomeCompleto, email: emailUsuario } = useAuth(); 

  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [criarConta, setCriarConta] = useState(false);
  const [senha, setSenha] = useState('');

  // Preenche os dados automaticamente se estiver logado
  useEffect(() => {
    if (logado) {
      setNome(nomeCompleto || '');
      setEmail(emailUsuario || '');
    }
  }, [logado, nomeCompleto, emailUsuario]);

  // Função auxiliar isolada apenas para montar o texto do WhatsApp (Clean Code)
  const gerarLinkWhatsApp = () => {
    const MINIO_URL = "http://localhost:9000/claricejoias/";
    let mensagem = `Olá! Meu nome é *${nome}* e tenho interesse nestas joias do catálogo:\n\n`;

    itens.forEach(item => {
      const nomeArquivo = (item.imagemSelecionada || (item.imagens && item.imagens[0]) || item.pathImg);
      const linkImagem = nomeArquivo ? `${MINIO_URL}${nomeArquivo}` : 'Sem foto';

      mensagem += `*Produto:* ${item.nome}\n`;
      mensagem += `*Qtd:* ${item.quantidade}x — *Preço:* R$ ${(item.preco * item.quantidade).toFixed(2)}\n`;
      mensagem += `*Foto:* ${linkImagem}\n`;
      mensagem += `--------------------------\n`;
    });

    mensagem += `\n*Total estimado:* R$ ${total.toFixed(2)}`;
    mensagem += `\n*Meu contato:* ${whatsapp}`;
    if (email) mensagem += `\n*Meu E-mail:* ${email}`;

    const numeroLoja = "5586995646615"; 
    return `https://wa.me/${numeroLoja}?text=${encodeURIComponent(mensagem)}`;
  };

  const enviarWhatsApp = async (e) => { 
    e.preventDefault();

    try {
      await leadService.salvar({ 
        nome, 
        whatsapp, 
        email, 
        criarConta: logado ? false : criarConta, 
        senha: (criarConta && !logado) ? senha : null, 
        itens 
      });
    } catch (error) {
      // O interceptador global (Toastify) já avisa o usuário do erro.
      // O "return" aqui impede que o WhatsApp abra se o cadastro falhar!
      return; 
    }

    // Se salvou com sucesso, gera o link e abre o WhatsApp
    window.open(gerarLinkWhatsApp(), '_blank');
  };

  return (
    <div className="checkout-minimalista">
      <button className="btn-voltar" onClick={() => navigate('/')}>
        <FiArrowLeft /> Voltar ao catálogo
      </button>

      <h2>Quase lá! ✨</h2>
      <p>Confirme suas escolhas e nos chame para um atendimento exclusivo.</p>

      <form onSubmit={enviarWhatsApp}>
        
        {logado ? (
          <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #bbf7d0' }}>
            <p style={{ margin: 0, color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCheckCircle size={18} />
              Você está comprando como <strong>{nome}</strong>
            </p>
            
            <div className="campo-form" style={{ marginTop: '15px', marginBottom: 0 }}>
               <label style={{ color: '#166534' }}>Confirme seu WhatsApp para contato</label>
               <input 
                type="tel" 
                placeholder="(DDD) 90000-0000" 
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required 
                style={{ borderColor: '#bbf7d0' }}
              />
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}

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