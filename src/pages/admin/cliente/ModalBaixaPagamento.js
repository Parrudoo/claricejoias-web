import React, { useState, useEffect } from 'react';
import { ClienteService } from '../../../services/ClienteService';
import './ModalBaixaPagamento.css'; // Ajuste o caminho se necessário

export default function ModalBaixaPagamento({ cliente, parcela, onClose, onSucesso }) {
  // Se vier uma parcela específica, trava o valor e formata. Se não, começa zerado.
  const [valorPago, setValorPago] = useState(parcela ? parcela.valor : '');
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [observacao, setObservacao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Caso a prop parcela mude de repente
    if (parcela) {
      setValorPago(parcela.valor);
    }
  }, [parcela]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valorPago || valorPago <= 0) {
      alert('Informe um valor válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        valorPago: parseFloat(valorPago),
        formaPagamento: formaPagamento,
        observacao: observacao,
        parcelaId: parcela ? parcela.id : null, // Envia o ID da parcela se existir
        dataPagamento: new Date().toISOString().split('T')[0]
      };

      await ClienteService.registrarPagamento(cliente.id, payload);
      onSucesso();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      alert(error.response?.data?.message || 'Erro ao processar o pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{parcela ? `Pagar ${parcela.numeroParcela}ª Parcela` : 'Registrar Recebimento'}</h2>
        <p>Cliente: <strong>{cliente?.nome}</strong></p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Valor a Receber (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              value={valorPago} 
              onChange={(e) => setValorPago(e.target.value)} 
              required 
              disabled={parcela != null} // Bloqueia a edição do valor se for pagamento de parcela
            />
            {parcela && <small style={{color: '#6b7280'}}>O valor da parcela não pode ser alterado.</small>}
          </div>

          <div className="form-group">
            <label>Forma de Pagamento</label>
            <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="transferencia">Transferência Bancária</option>
            </select>
          </div>

          <div className="form-group">
            <label>Observação (Opcional)</label>
            <textarea 
              value={observacao} 
              onChange={(e) => setObservacao(e.target.value)} 
              placeholder="Ex: Pago pelo marido da cliente..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancelar" disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className="btn-confirmar" disabled={isSubmitting}>
              {isSubmitting ? 'Processando...' : 'Confirmar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}