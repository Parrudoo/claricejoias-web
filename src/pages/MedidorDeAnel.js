import React, { useState, useMemo } from 'react';

// Tabela exata extraída da sua imagem (Tamanho e Circunferência em cm)
const TABELA_MEDIDAS = [
  { tamanho: 10, circ: 4.6 }, { tamanho: 11, circ: 4.7 }, { tamanho: 12, circ: 4.9 },
  { tamanho: 13, circ: 5.0 }, { tamanho: 14, circ: 5.1 }, { tamanho: 15, circ: 5.2 },
  { tamanho: 16, circ: 5.3 }, { tamanho: 17, circ: 5.4 }, { tamanho: 18, circ: 5.5 },
  { tamanho: 19, circ: 5.6 }, { tamanho: 20, circ: 5.7 }, { tamanho: 21, circ: 5.8 },
  { tamanho: 22, circ: 5.9 }, { tamanho: 23, circ: 6.0 }, { tamanho: 24, circ: 6.1 },
  { tamanho: 25, circ: 6.3 }, { tamanho: 26, circ: 6.4 }, { tamanho: 27, circ: 6.5 },
  { tamanho: 28, circ: 6.6 }, { tamanho: 29, circ: 6.7 }, { tamanho: 30, circ: 6.8 },
  { tamanho: 31, circ: 6.9 }, { tamanho: 32, circ: 7.0 }, { tamanho: 33, circ: 7.1 },
];

export default function MedidorDeAnel() {
  const [etapa, setEtapa] = useState(1);
  
  // Largura do cartão na tela em pixels (padrão inicial)
  const [larguraCartaoPx, setLarguraCartaoPx] = useState(280);
  
  // Diâmetro do círculo do anel em pixels
  const [diametroAnelPx, setDiametroAnelPx] = useState(100);

  // O tamanho físico real de um cartão de crédito padrão é 8.56 cm
  const LARGURA_CARTAO_REAL_CM = 8.56;

  // Calcula quantos pixels equivalem a 1 centímetro na tela atual da cliente
  const pixelsPorCm = larguraCartaoPx / LARGURA_CARTAO_REAL_CM;

  // Lógica para encontrar o tamanho do anel
  const resultado = useMemo(() => {
    // 1. Converte o diâmetro de pixels para centímetros
    const diametroCm = diametroAnelPx / pixelsPorCm;
    
    // 2. Calcula a circunferência (Perímetro = Diâmetro * PI)
    const circunferenciaCm = diametroCm * Math.PI;

    // 3. Procura na tabela qual é a medida mais próxima
    let tamanhoEncontrado = TABELA_MEDIDAS[0];
    let menorDiferenca = Math.abs(circunferenciaCm - TABELA_MEDIDAS[0].circ);

    TABELA_MEDIDAS.forEach((item) => {
      const diferenca = Math.abs(circunferenciaCm - item.circ);
      if (diferenca < menorDiferenca) {
        menorDiferenca = diferenca;
        tamanhoEncontrado = item;
      }
    });

    return {
      circunferenciaAtual: circunferenciaCm.toFixed(2),
      tamanho: tamanhoEncontrado.tamanho
    };
  }, [diametroAnelPx, pixelsPorCm]);

  const irParaMedicao = () => setEtapa(2);
  const refazerCalibracao = () => setEtapa(1);

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif', padding: '20px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
      <h2 style={{ color: '#1a1a1a' }}>Descubra seu Tamanho de Anel</h2>

      {etapa === 1 && (
        <div>
          <p style={{ color: '#666', fontSize: '14px' }}>
            <strong>Passo 1: Calibração de Tela.</strong><br/>
            Para a medida ser exata, encoste qualquer cartão de crédito na tela e ajuste a barra abaixo até o quadrado ficar do exato tamanho do seu cartão físico.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0' }}>
            <div style={{
              width: `${larguraCartaoPx}px`,
              height: `${larguraCartaoPx * 0.63}px`, // Proporção real de um cartão
              backgroundColor: '#D4AF37',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}>
              Seu Cartão
            </div>
          </div>

          <input 
            type="range" 
            min="150" 
            max="500" 
            value={larguraCartaoPx} 
            onChange={(e) => setLarguraCartaoPx(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />

          <button 
            onClick={irParaMedicao}
            style={{ marginTop: '20px', width: '100%', padding: '15px', backgroundColor: '#000', color: '#D4AF37', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}
          >
            Confirmar e Medir Anel
          </button>
        </div>
      )}

      {etapa === 2 && (
        <div>
          <p style={{ color: '#666', fontSize: '14px' }}>
            <strong>Passo 2: Medição.</strong><br/>
            Coloque um anel que sirva bem sobre o círculo abaixo. Ajuste a barra até que a linha preta encoste exatamente na <strong>parte de dentro</strong> do seu anel.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0', height: '150px', alignItems: 'center' }}>
            <div style={{
              width: `${diametroAnelPx}px`,
              height: `${diametroAnelPx}px`,
              border: '4px solid #1a1a1a',
              borderRadius: '50%',
              backgroundColor: '#fff',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
            }}></div>
          </div>

          <input 
            type="range" 
            min="30" 
            max="250" 
            value={diametroAnelPx} 
            onChange={(e) => setDiametroAnelPx(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />

          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <h3 style={{ margin: '0', color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>O tamanho do seu anel é:</h3>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#D4AF37', margin: '10px 0' }}>
              {resultado.tamanho}
            </div>
            <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
              Circunferência aproximada: {resultado.circunferenciaAtual} cm
            </p>
          </div>

          <button 
            onClick={refazerCalibracao}
            style={{ marginTop: '20px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Recalibrar Tela
          </button>
        </div>
      )}
    </div>
  );
}