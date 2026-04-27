import React, { createContext, useState, useContext, useEffect } from 'react';
import { CarrinhoService } from '../services/CarrinhoService';

const MaletaContext = createContext();

export const MaletaProvider = ({ children }) => {
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  // =======================================================================
  // 1. FUNÇÃO DE MAPEAMENTO (Transforma DTO do Java para padrão React)
  // =======================================================================
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

  // =======================================================================
  // 2. BUSCA INICIAL (Ao carregar a página)
  // =======================================================================
  const carregarCarrinho = async () => {
    try {
      const dados = await CarrinhoService.obterCarrinho();
      processarDadosCarrinho(dados);
    } catch (error) {
      console.error("Erro ao carregar o carrinho do servidor", error);
    }
  };

  useEffect(() => {
    carregarCarrinho();
  }, []);

  // =======================================================================
  // 3. AÇÕES (Usando o retorno imediato da API para evitar erros de trava)
  // =======================================================================
  
  const adicionarItem = async (joia) => {
    try {
      // O próprio retorno do POST já traz o carrinho atualizado
      const carrinhoAtualizado = await CarrinhoService.adicionarItem(joia.id, 1);
      processarDadosCarrinho(carrinhoAtualizado);
      setCarrinhoAberto(true);
    } catch (error) {
      console.error("Erro ao adicionar produto", error);
    }
  };

  const removerItem = async (id) => {
    try {
      const carrinhoAtualizado = await CarrinhoService.removerItem(id);
      processarDadosCarrinho(carrinhoAtualizado);
    } catch (error) {
      console.error("Erro ao remover produto", error);
    }
  };

  const alterarQuantidade = async (id, delta) => {
    try {
      // Delta pode ser +1 ou -1. O Java cuida de excluir se chegar a zero.
      const carrinhoAtualizado = await CarrinhoService.adicionarItem(id, delta);
      processarDadosCarrinho(carrinhoAtualizado);
    } catch (error) {
      console.error("Erro ao alterar quantidade", error);
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
      carregarCarrinho // Exportado caso precise forçar atualização externa
    }}>
      {children}
    </MaletaContext.Provider>
  );
};

export const useMaleta = () => useContext(MaletaContext);