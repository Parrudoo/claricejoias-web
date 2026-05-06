import React, { useState, useEffect } from 'react';
import { evolutionService } from '../../../services/evolutionService';


const GerenciadorWhatsapp = () => {
    const [instancias, setInstancias] = useState([]);
    const [nomeInstancia, setNomeInstancia] = useState('');
    const [qrCodeBase64, setQrCodeBase64] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState('');

    // Carrega as instâncias assim que a tela abre
    useEffect(() => {
        carregarInstancias();
    }, []);

    const carregarInstancias = async () => {
        try {
            const data = await evolutionService.listarInstancias();

            // Garante que, se o Java mandar como texto, o React transforma em Array (JSON)
            const arrayInstancias = typeof data === 'string' ? JSON.parse(data) : data;

            setInstancias(arrayInstancias || []);
        } catch (error) {
            // Agora imprimimos o erro real para saber se o bloqueio é de rede/CORS
            console.error("Erro ao carregar lista de instâncias:", error);
            setMensagem("Erro ao carregar as instâncias. Verifique o console (F12).");
        }
    };


    // Função para Desconectar (Logout) uma instância
    const handleDesconectar = async (nomeParaDesconectar) => {
        if (!window.confirm(`Deseja realmente desconectar o WhatsApp da instância "${nomeParaDesconectar}"?`)) return;

        try {
            setMensagem(`Desconectando a instância ${nomeParaDesconectar}...`);
            await evolutionService.desconectarInstancia(nomeParaDesconectar);
            setMensagem(`Instância "${nomeParaDesconectar}" desconectada com sucesso!`);

            // Limpa o QR Code caso ele esteja aberto
            setQrCodeBase64('');

            // Recarrega a lista para o status mudar de "open" para outra coisa
            carregarInstancias();
        } catch (error) {
            setMensagem(`Erro ao desconectar a instância ${nomeParaDesconectar}.`);
        }
    };


    // Função para criar a instância
    const handleCriarInstancia = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensagem('');

        try {
            const payload = {
                instanceName: nomeInstancia,
                token: "claricejoias", // Use um padrão seguro
                qrcode: true,
                integration: "WHATSAPP-BAILEYS"
            };

            await evolutionService.criarInstancia(payload);
            setMensagem('Instância criada com sucesso!');
            setNomeInstancia('');

            // Recarrega a lista para mostrar a nova instância
            await carregarInstancias();

            // Já busca o QR Code dela automaticamente
            buscarQrCode(payload.instanceName);

        } catch (error) {
            // Verifica se o erro foi de instância já existente
            if (error.response?.data?.message?.includes("already exists")) {
                setMensagem('Atenção: Essa instância já existe.');
            } else {
                setMensagem('Erro ao criar instância. Verifique o console.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Função para buscar e exibir o QR Code de uma instância específica
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

    // Função para deletar (Apagar) uma instância da lista
    const handleDeletar = async (nomeParaDeletar) => {
        if (!window.confirm(`Tem certeza que deseja apagar a instância "${nomeParaDeletar}"?`)) return;

        try {
            await evolutionService.deletarInstancia(nomeParaDeletar);
            setMensagem(`Instância "${nomeParaDeletar}" apagada com sucesso!`);
            setQrCodeBase64(''); // Limpa o QR Code da tela se estiver aberto

            // Recarrega a lista para remover o item deletado da tela
            carregarInstancias();
        } catch (error) {
            setMensagem(`Erro ao apagar a instância ${nomeParaDeletar}.`);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Gerenciador de Conexão WhatsApp</h2>

            {mensagem && (
                <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3' }}>
                    {mensagem}
                </div>
            )}

            {/* ÁREA DE CRIAÇÃO */}
            <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>Criar Nova Instância</h3>
                <form onSubmit={handleCriarInstancia} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <input
                        type="text"
                        value={nomeInstancia}
                        onChange={(e) => setNomeInstancia(e.target.value)}
                        placeholder="Ex: atendimento_site"
                        required
                        style={{ flex: 1, padding: '8px' }}
                    />
                    <button type="submit" disabled={loading} style={{ padding: '8px 15px', cursor: 'pointer' }}>
                        {loading ? 'Criando...' : 'Criar e Conectar'}
                    </button>
                </form>
            </div>

            {/* ÁREA DO QR CODE ATIVO */}
            {qrCodeBase64 && (
                <div style={{ textAlign: 'center', marginBottom: '30px', border: '2px dashed #4caf50', padding: '20px', borderRadius: '8px' }}>
                    <h3>Leia o QR Code com o seu WhatsApp</h3>
                    <p>Para a instância que você acabou de selecionar/criar.</p>
                    <img
                        src={qrCodeBase64}
                        alt="QR Code WhatsApp"
                        style={{ width: '250px', height: '250px' }}
                    />
                    <br />
                    <button onClick={() => setQrCodeBase64('')} style={{ marginTop: '15px', padding: '8px 15px' }}>
                        Fechar QR Code
                    </button>
                </div>
            )}

            {/* LISTAGEM DAS INSTÂNCIAS */}
            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>Instâncias Existentes</h3>
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
                                        {inst.instance.status}
                                    </td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', gap: '10px' }}>

                                        {/* Se NÃO estiver conectado (status diferente de "open"), mostra botão de Conectar */}
                                        {inst.instance.status !== 'open' && (
                                            <button
                                                onClick={() => buscarQrCode(inst.instance.instanceName)}
                                                style={{ padding: '5px 10px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Conectar (QR)
                                            </button>
                                        )}

                                        {/* Se ESTIVER conectado (status "open"), mostra o botão de Desconectar */}
                                        {inst.instance.status === 'open' && (
                                            <button
                                                onClick={() => handleDesconectar(inst.instance.instanceName)}
                                                style={{ padding: '5px 10px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Desconectar
                                            </button>
                                        )}

                                        {/* Botão de Apagar sempre disponível */}
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