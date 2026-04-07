import React, { createContext, useState, useContext } from 'react';

const MaletaContext = createContext();

export const MaletaProvider = ({ children }) => {
  const [itens, setItens] = useState([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  const adicionarItem = (joia) => {
    setItens(prevItens => {
      const itemExistente = prevItens.find(item => item.id === joia.id);
      if (itemExistente) {
        return prevItens.map(item =>
          item.id === joia.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...prevItens, { ...joia, quantidade: 1 }];
    });
    setCarrinhoAberto(true); // Abre o carrinho automaticamente ao adicionar
  };

  const removerItem = (id) => {
    setItens(prevItens => prevItens.filter(item => item.id !== id));
  };

  const alterarQuantidade = (id, delta) => {
    setItens(prevItens => prevItens.map(item => {
      if (item.id === id) {
        const novaQtd = item.quantidade + delta;
        return { ...item, quantidade: novaQtd > 0 ? novaQtd : 1 };
      }
      return item;
    }));
  };

  const total = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

  return (
    <MaletaContext.Provider value={{ 
      itens, 
      adicionarItem, 
      removerItem, 
      alterarQuantidade, 
      total,
      carrinhoAberto,
      setCarrinhoAberto 
    }}>
      {children}
    </MaletaContext.Provider>
  );
};

export const useMaleta = () => useContext(MaletaContext);