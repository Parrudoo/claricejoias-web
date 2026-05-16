import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Importando o serviço que você acabou de criar
import { CatalogoService } from '../services/CatalogoService'; // Ajuste o caminho se necessário

const LojaContext = createContext();

export const LojaProvider = ({ children }) => {
  // 1. Usamos useLocation em vez de useParams
  const location = useLocation();

  // 2. Pegamos a primeira parte da URL após a barra inicial "/"
  // Ex: "site.com/maria-silva" -> "maria-silva"
  // Ex: "site.com/admin/dashboard" -> "admin"
  const pathSegment = location.pathname.split('/')[1];

  // 3. Definimos palavras proibidas (que são as suas rotas originais do sistema)
  const rotasReservadas = ['checkout', 'admin', 'revendedor', 'minha-conta', ''];

  // 4. A mágica: Se tiver uma palavra na URL e ela NÃO for uma rota do sistema, é um SLUG!
  const slug = pathSegment && !rotasReservadas.includes(pathSegment) ? pathSegment : null;

  const [revendedor, setRevendedor] = useState(null);
  const [carregandoLoja, setCarregandoLoja] = useState(false);

  useEffect(() => {
    
    const buscarRevendedor = async () => {
      if (!slug) {
        setRevendedor(null);
        setCarregandoLoja(false);
        return;
      }

      try {
        setCarregandoLoja(true);
        
        // Chamada real à sua API usando o CatalogoService!
        const dados = await CatalogoService.getPerfil(slug);
        console.log(dados)
        setRevendedor(dados);
      } catch (error) {
        console.error("Erro ao buscar loja do revendedor:", error);
        // Se der erro (ex: slug não existe no banco), garantimos que o revendedor fique nulo
        setRevendedor(null); 
      } finally {
        setCarregandoLoja(false);
      }
    };

    buscarRevendedor();
  }, [slug]);

  return (
    <LojaContext.Provider value={{ revendedor, slug, carregandoLoja }}>
      {children}
    </LojaContext.Provider>
  );
};

export const useLoja = () => useContext(LojaContext);