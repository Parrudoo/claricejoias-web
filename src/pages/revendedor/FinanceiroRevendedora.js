import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { FinanceiroService } from '../../services/FinanceiroService';
import { FiDollarSign, FiTrendingUp, FiBriefcase, FiCalendar } from 'react-icons/fi';
import './Financeiro.css'; // Vamos criar o CSS logo abaixo

const FinanceiroRevendedora = () => {
    const { keycloakData } = useAuth();
    // Pega o ID da revendedora logada no momento
    const revendedorId = keycloakData?.id; 

    const dataAtual = new Date();
    const [mes, setMes] = useState(dataAtual.getMonth() + 1); // getMonth começa em 0
    const [ano, setAno] = useState(dataAtual.getFullYear());
    
    const [acerto, setAcerto] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (revendedorId) {
            carregarFinanceiro();
        }
    }, [mes, ano, revendedorId]);

    const carregarFinanceiro = async () => {
        setLoading(true);
        try {
            const dados = await FinanceiroService.obterAcertoMensal(revendedorId, mes, ano);
            setAcerto(dados);
        } catch (error) {
            console.error("Erro ao carregar dados financeiros.");
            setAcerto(null);
        } finally {
            setLoading(false);
        }
    };

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    };

    // Nomes dos meses para o select
    const meses = [
        { valor: 1, nome: 'Janeiro' }, { valor: 2, nome: 'Fevereiro' },
        { valor: 3, nome: 'Março' }, { valor: 4, nome: 'Abril' },
        { valor: 5, nome: 'Maio' }, { valor: 6, nome: 'Junho' },
        { valor: 7, nome: 'Julho' }, { valor: 8, nome: 'Agosto' },
        { valor: 9, nome: 'Setembro' }, { valor: 10, nome: 'Outubro' },
        { valor: 11, nome: 'Novembro' }, { valor: 12, nome: 'Dezembro' }
    ];

    return (
        <div className="financeiro-container">
            <header className="financeiro-header">
                <div>
                    <h1>Meu Financeiro</h1>
                    <p>Fechamento e acerto de contas mensal.</p>
                </div>

                <div className="filtros-data">
                    <FiCalendar size={20} color="#666" />
                    <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                        {meses.map(m => (
                            <option key={m.valor} value={m.valor}>{m.nome}</option>
                        ))}
                    </select>
                    <select value={ano} onChange={(e) => setAno(Number(e.target.value))}>
                        {/* Mostra o ano atual e o passado */}
                        <option value={dataAtual.getFullYear()}>{dataAtual.getFullYear()}</option>
                        <option value={dataAtual.getFullYear() - 1}>{dataAtual.getFullYear() - 1}</option>
                    </select>
                </div>
            </header>

            {loading ? (
                <div className="loading-financeiro">Calculando fechamento... ⏳</div>
            ) : !acerto ? (
                <div className="erro-financeiro">Nenhum dado encontrado para este período.</div>
            ) : (
                <main className="financeiro-dashboard">
                    {/* CARDS DE RESUMO */}
                    <div className="cards-grid">
                        <div className="card-financeiro neutro">
                            <div className="card-icone"><FiBriefcase /></div>
                            <div className="card-info">
                                <span>Total Vendido ({acerto.quantidadeVendas} vendas)</span>
                                <h3>{formatarMoeda(acerto.totalVendido)}</h3>
                            </div>
                        </div>

                        <div className="card-financeiro destaque-lucro">
                            <div className="card-icone"><FiTrendingUp /></div>
                            <div className="card-info">
                                <span>O Meu Lucro</span>
                                <h3>{formatarMoeda(acerto.lucroRevendedor)}</h3>
                            </div>
                        </div>

                        <div className="card-financeiro alerta-repasse">
                            <div className="card-icone"><FiDollarSign /></div>
                            <div className="card-info">
                                <span>Repasse para a Loja</span>
                                <h3>{formatarMoeda(acerto.repasseMatriz)}</h3>
                            </div>
                        </div>
                    </div>

                    {/* GRÁFICO VISUAL (BARRA DE DIVISÃO) */}
                    <div className="grafico-divisao-container">
                        <h3>Divisão do Faturamento</h3>
                        <div className="barra-progresso-total">
                            {acerto.totalVendido > 0 ? (
                                <>
                                    <div 
                                        className="barra-lucro" 
                                        style={{ width: `${(acerto.lucroRevendedor / acerto.totalVendido) * 100}%` }}
                                        title={`Seu Lucro: ${formatarMoeda(acerto.lucroRevendedor)}`}
                                    >
                                        {((acerto.lucroRevendedor / acerto.totalVendido) * 100).toFixed(0)}%
                                    </div>
                                    <div 
                                        className="barra-repasse" 
                                        style={{ width: `${(acerto.repasseMatriz / acerto.totalVendido) * 100}%` }}
                                        title={`Repasse Clarice: ${formatarMoeda(acerto.repasseMatriz)}`}
                                    >
                                        {((acerto.repasseMatriz / acerto.totalVendido) * 100).toFixed(0)}%
                                    </div>
                                </>
                            ) : (
                                <div className="barra-vazia">Sem vendas no período</div>
                            )}
                        </div>
                        
                        <div className="legenda-grafico">
                            <span className="dot-lucro"></span> Sua parte
                            <span className="dot-repasse" style={{marginLeft: '15px'}}></span> Parte da Clarice Joias
                        </div>
                    </div>

                    {/* PAINEL DE AÇÃO (EX: BOTAO PARA ENVIAR PIX) */}
                    <div className="painel-acao-acerto">
                        <div className="acao-texto">
                            <h4>Pronta para o Acerto?</h4>
                            <p>O valor de <strong>{formatarMoeda(acerto.repasseMatriz)}</strong> deve ser repassado para a loja até o dia 05.</p>
                        </div>
                        <button className="btn-gerar-pix">
                            Gerar PIX de Repasse
                        </button>
                    </div>
                </main>
            )}
        </div>
    );
};

export default FinanceiroRevendedora;