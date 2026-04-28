import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { CarrinhoService } from '../services/CarrinhoService';
import { useAuth } from './AuthProvider'; // 👈 IMPORTANTE: Integração com o Keycloak/Login

const MaletaContext = createContext();

export const MaletaProvider = ({ children }) => {
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  
  // Ref para controlar o disparo duplo do React Strict Mode
  const carrinhoJaCarregado = useRef(false);

  // Puxamos os estados do sistema de autenticação
  const { logado, sincronizando } = useAuth(); 

  // =======================================================
  // 1. PROCESSADOR DE DADOS (Transforma DTO do Java pro React)
  // =======================================================
  const processarDadosCarrinho = (carrinhoDto) => {
    if (carrinhoDto && carrinhoDto.itens) {
        const itensFormatados = carrinhoDto.itens.map(itemDb => ({
          id: itemDb.produto.id,
          nome: itemDb.produto.nome,
          preco: Number(itemDb.produto.preco),
          material: itemDb.produto.material,
          codigo: itemDb.produto.codigo,
          imagens: itemDb.produto.imagens || [],
          quantidade: itemDb.quantidade
        }));
        
        setItens(itensFormatados);
        setTotal(Number(carrinhoDto.valorTotal || 0));
    } else {
        setItens([]);
        setTotal(0);
    }
  };

  // =======================================================
  // 2. BUSCA INICIAL
  // =======================================================
  const carregarCarrinho = async () => {
    try {
      const dados = await CarrinhoService.obterCarrinho();
      processarDadosCarrinho(dados);
    } catch (error) {
      console.error("Erro ao carregar o carrinho do servidor:", error);
    }
  };

  // =======================================================
  // 3. ORQUESTRAÇÃO DE CARREGAMENTO (Evita Race Condition)
  // =======================================================
  useEffect(() => {
    // Regra 1: Se o AuthProvider ainda está decidindo se o usuário 
    // está logado ou criando o cliente no banco, a maleta ESPERA.
    if (sincronizando) {
        return; 
    }

    // Regra 2: Só busca se ainda não buscou nesta renderização 
    // (Impede o disparo duplo chato do React 18 no ambiente local)
    if (!carrinhoJaCarregado.current) {
        carregarCarrinho();
        carrinhoJaCarregado.current = true;
    }

    // Limpeza: Se o usuário deslogar ou o status mudar drasticamente, 
    // permitimos que a maleta busque os dados novamente na próxima rodada.
    return () => {
        carrinhoJaCarregado.current = false;
    };

  }, [sincronizando, logado]);

  // =======================================================
  // 4. AÇÕES DA MALETA (Usando retorno imediato da API)
  // =======================================================
  
  const adicionarItem = async (joia) => {
    try {
      // O Java já retorna o carrinho atualizado, então não precisamos chamar carregarCarrinho() de novo!
      const carrinhoAtualizado = await CarrinhoService.adicionarItem(joia.id, 1);
      processarDadosCarrinho(carrinhoAtualizado);
      setCarrinhoAberto(true);
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      alert("Não foi possível adicionar a joia à maleta.");
    }
  };

  const removerItem = async (id) => {
    try {
      const carrinhoAtualizado = await CarrinhoService.removerItem(id);
      processarDadosCarrinho(carrinhoAtualizado);
    } catch (error) {
      console.error("Erro ao remover produto:", error);
    }
  };

  const alterarQuantidade = async (id, delta) => {
    try {
      // Delta pode ser +1 ou -1. O Java já tem a inteligência de excluir se chegar a zero.
      const carrinhoAtualizado = await CarrinhoService.adicionarItem(id, delta);
      processarDadosCarrinho(carrinhoAtualizado);
    } catch (error) {
      console.error("Erro ao alterar quantidade:", error);
    }
  };

  return (
    <MaletaContext.Provider value={{ 
      itens, 
      adicionarItem, 
      removerItem, 
      alterarQuantidade, 
      total, 
      carrinhoAberto, 
      setCarrinhoAberto, 
      carregarCarrinho 
    }}>
      {children}
    </MaletaContext.Provider>
  );
};

export const useMaleta = () => useContext(MaletaContext);