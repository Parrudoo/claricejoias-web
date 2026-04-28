import React, { createContext, useState, useContext, useEffect } from 'react';
import { CarrinhoService } from '../services/CarrinhoService';
// Importe o hook do seu sistema de autenticação (ex: Keycloak)
import { useKeycloak } from '@react-keycloak/web'; 

const MaletaContext = createContext();

export const MaletaProvider = ({ children }) => {
  const { keycloak, initialized } = useKeycloak(); // Captura o estado do Keycloak
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  // =======================================================================
  // 1. GESTÃO DO IDENTIFICADOR DE VISITANTE
  // =======================================================================
  const obterVisitorId = () => {
    let id = localStorage.getItem('X-Visitor-ID');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('X-Visitor-ID', id);
    }
    return id;
  };

  // =======================================================================
  // 2. FUNÇÃO DE MAPEAMENTO (DTO -> React)
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
  // 3. BUSCA E SINCRONIZAÇÃO (Onde a mágica do Backend acontece)
  // =======================================================================
  const carregarCarrinho = async () => {
    const visitorId = obterVisitorId();
    const token = keycloak?.token; // Pega o token se estiver logado

    try {
      // Passamos o visitorId e o token. 
      // Se houver os dois, o Spring faz a fusão e converte o Lead em Cliente.
      const dados = await CarrinhoService.obterCarrinho(visitorId, token);
      processarDadosCarrinho(dados);
    } catch (error) {
      console.error("Erro ao sincronizar o carrinho", error);
    }
  };

  // Dispara sempre que o site carrega ou quando o usuário LOGA/DESLOGA
  useEffect(() => {
    if (initialized) {
      carregarCarrinho();
    }
  }, [initialized, keycloak?.authenticated]); 

  // =======================================================================
  // 4. AÇÕES (Atualizadas para passar os identificadores)
  // =======================================================================
  
  const adicionarItem = async (joia) => {
    const visitorId = obterVisitorId();
    const token = keycloak?.token;

    try {
      const carrinhoAtualizado = await CarrinhoService.adicionarItem(joia.id, 1, visitorId, token);
      processarDadosCarrinho(carrinhoAtualizado);
      setCarrinhoAberto(true);
    } catch (error) {
      console.error("Erro ao adicionar produto", error);
    }
  };

  const removerItem = async (id) => {
    const visitorId = obterVisitorId();
    const token = keycloak?.token;

    try {
      const carrinhoAtualizado = await CarrinhoService.removerItem(id, visitorId, token);
      processarDadosCarrinho(carrinhoAtualizado);
    } catch (error) {
      console.error("Erro ao remover produto", error);
    }
  };

  const alterarQuantidade = async (id, delta) => {
    const visitorId = obterVisitorId();
    const token = keycloak?.token;

    try {
      const carrinhoAtualizado = await CarrinhoService.adicionarItem(id, delta, visitorId, token);
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
      carregarCarrinho 
    }}>
      {children}
    </MaletaContext.Provider>
  );
};

export const useMaleta = () => useContext(MaletaContext);