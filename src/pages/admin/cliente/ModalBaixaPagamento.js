import React, { useState } from 'react';
import { ClienteService } from '../../../services/ClienteService';
import './ModalBaixaPagamento.css'; // Importando o novo CSS

const ModalBaixaPagamento = ({ cliente, onClose, onSucesso }) => {
    const [valorPago, setValorPago] = useState(cliente?.valorDevido || '');
    const [formaPagamento, setFormaPagamento] = useState('PIX');
    const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
    const [observacao, setObservacao] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [erro, setErro] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro(null);
        setIsLoading(true);

        const payload = {
            valorPago: parseFloat(valorPago),
            formaPagamento,
            dataPagamento,
            observacao
        };

        try {
            await ClienteService.registrarPagamento(cliente.id, payload);
            onSucesso(); 
        } catch (error) {
            setErro('Erro ao registrar o pagamento. Verifique os dados e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!cliente) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Registrar Recebimento</h2>
                <p>Cliente: <strong>{cliente.nome}</strong></p>
                <p>Saldo Devedor Atual: <strong style={{ color: '#d32f2f' }}>R$ {cliente.valorDevido?.toFixed(2).replace('.', ',')}</strong></p>
                
                {erro && <div className="error-message">{erro}</div>}

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Valor a Receber (R$):</label>
                        <input 
                            type="number" 
                            step="0.01"
                            max={cliente.valorDevido}
                            value={valorPago} 
                            onChange={(e) => setValorPago(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Forma de Pagamento:</label>
                        <select 
                            value={formaPagamento} 
                            onChange={(e) => setFormaPagamento(e.target.value)}
                        >
                            <option value="PIX">PIX</option>
                            <option value="DINHEIRO">Dinheiro</option>
                            <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                            <option value="CARTAO_DEBITO">Cartão de Débito</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Data do Pagamento:</label>
                        <input 
                            type="date" 
                            value={dataPagamento} 
                            onChange={(e) => setDataPagamento(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Observação (opcional):</label>
                        <textarea 
                            value={observacao} 
                            onChange={(e) => setObservacao(e.target.value)} 
                            placeholder="Ex: Abatimento referente à pulseira de ouro..."
                        />
                    </div>

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="btn-cancelar" 
                            onClick={onClose} 
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="btn-confirmar" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Salvando...' : 'Confirmar Baixa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalBaixaPagamento;