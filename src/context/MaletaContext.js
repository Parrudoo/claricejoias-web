import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { CarrinhoService } from '../services/CarrinhoService';
import { useAuth } from './AuthProvider'; // Integração com o Keycloak/Login
import { useLoja } from './LojaContext';

const MaletaContext = createContext();

export const MaletaProvider = ({ children }) => {
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  // Ref para controlar o disparo duplo do React Strict Mode
  const carrinhoJaCarregado = useRef(false);
  const { slug, revendedor: lojaRevendedor } = useLoja();

  // Puxamos os estados do sistema de autenticação
  const { logado, sincronizando } = useAuth();

  // =======================================================
  // 1. PROCESSADOR DE DADOS (Transforma DTO do Java pro React)
  // =======================================================
  const processarDadosCarrinho = (carrinhoDto) => {
    // Se o backend retornou null (204 No Content) ou vazio, limpamos a maleta
    if (!carrinhoDto || !carrinhoDto.itens || carrinhoDto.itens.length === 0) {
      setItens([]);
      setTotal(0);
      return;
    }

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
  };

  // =======================================================
  // 2. BUSCA INICIAL (Apenas espiar, sem criar lixo no banco)
  // =======================================================
  const carregarCarrinho = async () => {
    try {
      // O Axios interceptor vai colocar o revendedorId automaticamente!
      const dados = await CarrinhoService.obterCarrinho();
      processarDadosCarrinho(dados);
    } catch (error) {
      console.error("Erro ao consultar a maleta no servidor:", error);
    }
  };

  // =======================================================
  // 3. ORQUESTRAÇÃO DE CARREGAMENTO
  // =======================================================
  useEffect(() => {
    // 1. Se a autenticação ainda está carregando, ESPERA.
    if (sincronizando) {
      return;
    }

    // 2. Se a loja/revendedor ainda não carregou, ESPERA.
    if (!lojaRevendedor) {
      return;
    }

    // 3. Agora sim, com tudo carregado, buscamos a maleta!
    if (!carrinhoJaCarregado.current) {
      carregarCarrinho();
      carrinhoJaCarregado.current = true;
    }

    return () => {
      carrinhoJaCarregado.current = false;
    };

    // IMPORTANTE: Adicione lojaRevendedor aqui!
  }, [sincronizando, logado, slug, lojaRevendedor]);

  // =======================================================
  // 4. AÇÕES DA MALETA (Aqui o banco de dados trabalha de verdade)
  // =======================================================

  const adicionarItem = async (joia) => {
    try {
      // É AQUI que o Java realmente dá o INSERT e cria o Carrinho se ele não existia!
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