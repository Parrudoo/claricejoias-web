import React from 'react';
import './CupomVenda.css';

// Usamos forwardRef para poder chamar a impressão desse componente a partir do PDV
const CupomVenda = React.forwardRef(({ venda }, ref) => {
    if (!venda) return null;

    const formatarDinheiro = (valor) => {
        return Number(valor).toFixed(2).replace('.', ',');
    };

    return (
        <div className="cupom-wrapper" ref={ref}>
            <div className="cupom-container">
                {/* CABEÇALHO */}
                <div className="cupom-header">
                    <h2>CLARICE JOIAS</h2>
                    <p>CNPJ/CPF: 00.000.000/0000-00</p>
                    <p>Rua Exemplo, 123 - Centro</p>
                    <p>WhatsApp: (86) 99999-9999</p>
                    <div className="cupom-divisor">--------------------------------</div>
                    <p><strong>RECIBO DE VENDA NÃO FISCAL</strong></p>
                    <p>Venda N°: {venda.id?.toString().padStart(6, '0')}</p>
                    <p>Data: {new Date().toLocaleString('pt-BR')}</p>
                    <div className="cupom-divisor">--------------------------------</div>
                </div>

                {/* ITENS */}
                <div className="cupom-items">
                    <table className="cupom-table">
                        <thead>
                            <tr>
                                <th className="text-left">ITEM</th>
                                <th>QTD</th>
                                <th>VL.UN</th>
                                <th className="text-right">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {venda.itens.map((item, index) => (
                                <tr key={index}>
                                    <td className="text-left">{item.nome.substring(0, 15)}</td>
                                    <td>{item.quantidade}</td>
                                    <td>{formatarDinheiro(item.preco)}</td>
                                    <td className="text-right">{formatarDinheiro(item.preco * item.quantidade)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="cupom-divisor">--------------------------------</div>

                {/* TOTAIS E PAGAMENTO */}
                <div className="cupom-totais">
                    <div className="linha-total">
                        <span>TOTAL:</span>
                        <span>R$ {formatarDinheiro(venda.total)}</span>
                    </div>
                    <div className="linha-pagamento">
                        <span>Pagamento:</span>
                        <span className="uppercase">{venda.pagamento.metodo}</span>
                    </div>
                    
                    {venda.pagamento.metodo === 'especie' && (
                        <>
                            <div className="linha-pagamento">
                                <span>Recebido:</span>
                                <span>R$ {formatarDinheiro(venda.pagamento.valorRecebido)}</span>
                            </div>
                            <div className="linha-pagamento">
                                <span>Troco:</span>
                                <span>R$ {formatarDinheiro(venda.pagamento.valorRecebido - venda.total)}</span>
                            </div>
                        </>
                    )}

                    {venda.pagamento.metodo === 'fiado' && (
                        <>
                            <div className="linha-pagamento">
                                <span>Entrada:</span>
                                <span>R$ {formatarDinheiro(venda.pagamento.valorEntrada)}</span>
                            </div>
                            <div className="linha-pagamento">
                                <span>Resta ({venda.pagamento.parcelas}x):</span>
                                <span>R$ {formatarDinheiro(venda.total - venda.pagamento.valorEntrada)}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="cupom-divisor">--------------------------------</div>

                {/* CLIENTE E RODAPÉ */}
                {venda.cliente && (
                    <div className="cupom-cliente">
                        <p>Cliente: {venda.cliente.nome}</p>
                        <p>Contato: {venda.cliente.telefone}</p>
                        <div className="cupom-divisor">--------------------------------</div>
                    </div>
                )}

                <div className="cupom-footer">
                    <p>Obrigado pela preferência!</p>
                    <p>Volte Sempre</p>
                    <br />
                    <p>*** SEM VALOR FISCAL ***</p>
                </div>
            </div>
        </div>
    );
});

export default CupomVenda;