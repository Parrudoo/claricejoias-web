import React, { useState, useEffect } from 'react';
import { evolutionService } from '../../../services/evolutionService';
import { useAuth } from '../../../context/AuthProvider';

const GerenciadorWhatsapp = ({ isRevendedor = false }) => {
    const { keycloakData } = useAuth();
    
    // Cria um nome único e padronizado para a revendedora baseado no login dela do Keycloak
    // Remove caracteres especiais que poderiam quebrar a URL da Evolution API
    const usernameLimpo = keycloakData?.preferred_username?.replace(/[^a-zA-Z0-9]/g, '') || 'user';
    const nomeInstanciaRevendedor = `rev_${usernameLimpo}`;

    const [instancias, setInstancias] = useState([]);
    const [nomeInstancia, setNomeInstancia] = useState('');
    const [qrCodeBase64, setQrCodeBase64] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState('');

    useEffect(() => {
        // Se for revendedor, o nome da instância é gerado automaticamente e não pode ser mudado
        if (isRevendedor) {
            setNomeInstancia(nomeInstanciaRevendedor);
        }
        carregarInstancias();
    }, [isRevendedor, nomeInstanciaRevendedor]);

    const carregarInstancias = async () => {
        try {
            const data = await evolutionService.listarInstancias();
            const arrayInstancias = typeof data === 'string' ? JSON.parse(data) : data;

            if (isRevendedor) {
                // Filtra para o Revendedor ver APENAS a instância dele
                setInstancias(arrayInstancias.filter(inst => inst.instance.instanceName === nomeInstanciaRevendedor));
            } else {
                // Admin vê a lista completa do servidor
                setInstancias(arrayInstancias || []);
            }
        } catch (error) {
            console.error("Erro ao carregar lista de instâncias:", error);
            setMensagem("Erro ao carregar as instâncias. Verifique sua conexão com a Evolution API.");
        }
    };

    const handleCriarInstancia = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensagem('');

        try {
            const payload = {
                instanceName: nomeInstancia,
                token: "claricejoias", // Token de segurança interno
                qrcode: true,
                integration: "WHATSAPP-BAILEYS"
            };

            await evolutionService.criarInstancia(payload);
            setMensagem('Instância criada com sucesso!');
            
            if (!isRevendedor) {
                setNomeInstancia(''); // Limpa o campo apenas para o Admin
            }

            await carregarInstancias();
            buscarQrCode(payload.instanceName);

        } catch (error) {
            if (error.response?.data?.message?.includes("already exists")) {
                setMensagem('Atenção: Essa instância já existe no servidor.');
            } else {
                setMensagem('Erro ao criar instância. Verifique o console.');
            }
        } finally {
            setLoading(false);
        }
    };

    const buscarQrCode = async (nome) => {
        setMensagem(`Buscando QR Code para: ${nome}...`);
        try {
            const response = await evolutionService.conectarInstancia(nome);
            if (response && response.base64) {
                setQrCodeBase64(response.base64);
                setMensagem('');
            } else {
                setMensagem('A instância já está conectada ou o QR Code não foi retornado.');
                setQrCodeBase64('');
            }
        } catch (error) {
            setMensagem('Erro ao buscar QR Code. Pode ser que ela já esteja conectada.');
            setQrCodeBase64('');
        }
    };

    const handleDesconectar = async (nomeParaDesconectar) => {
        if (!window.confirm(`Deseja realmente desconectar o WhatsApp da instância "${nomeParaDesconectar}"?`)) return;

        try {
            setMensagem(`Desconectando a instância ${nomeParaDesconectar}...`);
            await evolutionService.desconectarInstancia(nomeParaDesconectar);
            setMensagem(`Instância "${nomeParaDesconectar}" desconectada com sucesso!`);
            setQrCodeBase64('');
            carregarInstancias();
        } catch (error) {
            setMensagem(`Erro ao desconectar a instância ${nomeParaDesconectar}.`);
        }
    };

    const handleDeletar = async (nomeParaDeletar) => {
        if (!window.confirm(`Tem certeza que deseja apagar a instância "${nomeParaDeletar}"?`)) return;

        try {
            await evolutionService.deletarInstancia(nomeParaDeletar);
            setMensagem(`Instância "${nomeParaDeletar}" apagada com sucesso!`);
            setQrCodeBase64('');
            carregarInstancias();
        } catch (error) {
            setMensagem(`Erro ao apagar a instância ${nomeParaDeletar}.`);
        }
    };

    // Verifica se o revendedor já tem a instância dele criada para ocultar o botão de "Criar"
    const revendedorJaTemInstancia = isRevendedor && instancias.length > 0;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>{isRevendedor ? 'Meu WhatsApp de Atendimento' : 'Gerenciador de Conexão WhatsApp'}</h2>
            
            {isRevendedor && (
                <p style={{ color: '#666' }}>
                    Conecte o seu WhatsApp pessoal ou profissional para que o sistema envie os catálogos e cobranças automaticamente em seu nome.
                </p>
            )}

            {mensagem && (
                <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3' }}>
                    {mensagem}
                </div>
            )}

            {/* ÁREA DE CRIAÇÃO (Oculta para o revendedor se a instância dele já existir) */}
            {!revendedorJaTemInstancia && (
                <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3>{isRevendedor ? 'Iniciar Minha Conexão' : 'Criar Nova Instância'}</h3>
                    <form onSubmit={handleCriarInstancia} style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
                        
                        {isRevendedor ? (
                            <span style={{ flex: 1, padding: '8px', background: '#f5f5f5', borderRadius: '4px', color: '#555' }}>
                                Instância: <strong>{nomeInstancia}</strong>
                            </span>
                        ) : (
                            <input
                                type="text"
                                value={nomeInstancia}
                                onChange={(e) => setNomeInstancia(e.target.value)}
                                placeholder="Ex: atendimento_matriz"
                                required
                                style={{ flex: 1, padding: '8px' }}
                            />
                        )}

                        <button type="submit" disabled={loading} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#D4AF37', border: 'none', color: '#fff', borderRadius: '4px', fontWeight: 'bold' }}>
                            {loading ? 'Processando...' : 'Criar e Conectar'}
                        </button>
                    </form>
                </div>
            )}

            {/* ÁREA DO QR CODE ATIVO */}
            {qrCodeBase64 && (
                <div style={{ textAlign: 'center', marginBottom: '30px', border: '2px dashed #4caf50', padding: '20px', borderRadius: '8px' }}>
                    <h3>Leia o QR Code com o seu WhatsApp</h3>
                    <p>Abra o WhatsApp no celular {'>'} Aparelhos Conectados {'>'} Conectar um Aparelho.</p>
                    <img
                        src={qrCodeBase64}
                        alt="QR Code WhatsApp"
                        style={{ width: '250px', height: '250px' }}
                    />
                    <br />
                    <button onClick={() => setQrCodeBase64('')} style={{ marginTop: '15px', padding: '8px 15px', cursor: 'pointer' }}>
                        Fechar QR Code
                    </button>
                </div>
            )}

            {/* LISTAGEM DAS INSTÂNCIAS */}
            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>{isRevendedor ? 'Status da Conexão' : 'Instâncias Existentes'}</h3>
                {instancias.length === 0 ? (
                    <p>Nenhuma instância encontrada.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                                <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Nome da Instância</th>
                                <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Status</th>
                                <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instancias.map((inst, index) => (
                                <tr key={index}>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                                        <strong>{inst.instance.instanceName}</strong>
                                    </td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                                        {inst.instance.status === 'open' ? (
                                            <span style={{ color: '#27ae60', fontWeight: 'bold' }}>Conectado</span>
                                        ) : (
                                            <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>Desconectado</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', gap: '10px' }}>
                                        {inst.instance.status !== 'open' && (
                                            <button
                                                onClick={() => buscarQrCode(inst.instance.instanceName)}
                                                style={{ padding: '5px 10px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Conectar (QR)
                                            </button>
                                        )}

                                        {inst.instance.status === 'open' && (
                                            <button
                                                onClick={() => handleDesconectar(inst.instance.instanceName)}
                                                style={{ padding: '5px 10px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Desconectar
                                            </button>
                                        )}

                                        {/* Permite apagar a instância (O admin pode apagar qualquer uma, o revendedor pode resetar a própria) */}
                                        <button
                                            onClick={() => handleDeletar(inst.instance.instanceName)}
                                            style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Apagar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default GerenciadorWhatsapp;