import React, { useState, useEffect } from 'react';
import { evolutionService } from '../../../services/evolutionService';
import { useAuth } from '../../../context/AuthProvider';

const GerenciadorWhatsapp = ({ isRevendedor = false }) => {
    const { keycloakData } = useAuth();

    const [instancias, setInstancias] = useState([]);
    const [nomeInstancia, setNomeInstancia] = useState('');
    const [qrCodeBase64, setQrCodeBase64] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState('');

    useEffect(() => {
        carregarInstancias();
    }, [isRevendedor]);

    const carregarInstancias = async () => {
        try {
            // DICA DE OURO: O ideal é que para o revendedor, você chame uma rota tipo:
            // await evolutionService.listarMinhasInstancias(); 
            // Para que o backend já devolva apenas as dele.
            const data = await evolutionService.listarInstancias();
            const arrayInstancias = typeof data === 'string' ? JSON.parse(data) : data;

            if (isRevendedor) {
                // Como agora o nome é livre, se você ainda busca a lista global, 
                // você precisará de uma forma de saber quais são as do usuário.
                // Se o backend já retorna filtrado, basta fazer:
                setInstancias(arrayInstancias || []);
            } else {
                setInstancias(arrayInstancias || []);
            }
        } catch (error) {
            console.error("Erro ao carregar lista de instâncias:", error);
            setMensagem("Erro ao carregar as instâncias. Verifique sua conexão.");
        }
    };

    const handleCriarInstancia = async (e) => {
        e.preventDefault();
        
        // Remove espaços e caracteres especiais que quebram a API
        const nomeFormatado = nomeInstancia.trim().replace(/[^a-zA-Z0-9_-]/g, '');
        if (!nomeFormatado) {
            setMensagem('Por favor, digite um nome válido sem espaços.');
            return;
        }

        setLoading(true);
        setMensagem('');

        try {
            if (isRevendedor) {
                // AGORA VOCÊ ENVIA O NOME QUE ELE DIGITOU PARA O BACKEND
                await evolutionService.criarInstancia({ instanceName: nomeFormatado }); 
            } else {
                await evolutionService.criarInstancia({ instanceName: nomeFormatado });
            }

            setMensagem('Instância criada com sucesso!');
            setNomeInstancia(''); // Limpa o campo
            await carregarInstancias();
            // Passa o nome criado para buscar o QR Code
            buscarQrCode(nomeFormatado); 

        } catch (error) {
            if (error.response?.data?.message?.includes("already exists")) {
                setMensagem('Atenção: Já existe uma instância com este nome. Escolha outro.');
            } else {
                setMensagem('Erro ao criar instância. Verifique o console.');
            }
        } finally {
            setLoading(false);
        }
    };

    const buscarQrCode = async (nome) => {
        setMensagem(`Buscando QR Code...`);
        try {
            const response = await evolutionService.conectarInstancia(nome);
            if (response && response.base64) {
                setQrCodeBase64(response.base64);
                setMensagem('');
            } else {
                setMensagem('A instância já está conectada ou o QR Code não foi retornado.');
            }
        } catch (error) {
            setMensagem('Erro ao buscar QR Code.');
        }
    };

    const handleDesconectar = async (nomeParaDesconectar) => {
        if (!window.confirm(`Deseja realmente desconectar o WhatsApp da instância "${nomeParaDesconectar}"?`)) return;

        try {
            setMensagem(`Desconectando a instância ${nomeParaDesconectar}...`);
            if (isRevendedor) {
                await evolutionService.desconectarInstancia(nomeParaDesconectar);
            } else {
                await evolutionService.desconectarInstancia(nomeParaDesconectar);
            }
            setMensagem(`WhatsApp desconectado com sucesso!`);
            setQrCodeBase64('');
            carregarInstancias();
        } catch (error) {
            setMensagem(`Erro ao desconectar o WhatsApp.`);
        }
    };

    const handleDeletar = async (nomeParaDeletar) => {
        if (!window.confirm(`Tem certeza que deseja apagar a instância "${nomeParaDeletar}"?`)) return;

        try {
            if (isRevendedor) {
                await evolutionService.deletarInstancia(nomeParaDeletar);
            } else {
                await evolutionService.deletarInstancia(nomeParaDeletar);
            }
            setMensagem(`Instância "${nomeParaDeletar}" apagada com sucesso!`);
            setQrCodeBase64('');
            carregarInstancias();
        } catch (error) {
            setMensagem(`Erro ao apagar a instância.`);
        }
    };

    // Permite ocultar o formulário se o revendedor já tiver criado sua cota de instâncias
    // Supondo que ele só possa ter 1
    const revendedorJaTemInstancia = isRevendedor && instancias.length >= 1;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>{isRevendedor ? 'Meu WhatsApp de Atendimento' : 'Gerenciador de Conexão WhatsApp'}</h2>

            {isRevendedor && (
                <p style={{ color: '#666' }}>
                    Conecte o seu WhatsApp pessoal ou profissional. Escolha um nome para identificar sua conexão.
                </p>
            )}

            {mensagem && (
                <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3' }}>
                    {mensagem}
                </div>
            )}

            {!revendedorJaTemInstancia && (
                <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3>{isRevendedor ? 'Iniciar Minha Conexão' : 'Criar Nova Instância'}</h3>
                    <form onSubmit={handleCriarInstancia} style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
                        
                        {/* AGORA O INPUT APARECE PARA TODOS */}
                        <input
                            type="text"
                            value={nomeInstancia}
                            onChange={(e) => setNomeInstancia(e.target.value)}
                            placeholder={isRevendedor ? "Ex: minha_loja_whatsapp" : "Ex: atendimento_matriz"}
                            required
                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />

                        <button type="submit" disabled={loading} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#D4AF37', border: 'none', color: '#fff', borderRadius: '4px', fontWeight: 'bold' }}>
                            {loading ? 'Processando...' : 'Criar e Conectar'}
                        </button>
                    </form>
                </div>
            )}

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