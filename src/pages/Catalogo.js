import React from 'react';
import { FiShoppingBag } from 'react-icons/fi';
import { CardItem } from '../components/CardItem';
import { Menu } from '../components/Menu';
import { useMaleta } from '../context/MaletaContext';
import './Catalogo.css';

export default function Catalogo() {
    const { adicionarItem, itens, setCarrinhoAberto } = useMaleta();
    const qtdTotal = itens.reduce((acc, curr) => acc + curr.quantidade, 0);

    // Função para rolar até o ID da categoria ou subcategoria
    const rolarPara = (id) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            // Ajuste de offset para não ficar colado no topo por causa do menu fixo
            const yOffset = -100; 
            const y = elemento.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const acervo = [
        {
            categoria: "Joias",
            subcategorias: [
                {
                    nome: "Colares",
                    itens: [
                        { id: 1, nome: "Colar Riviera Clássico", preco: 280.00, img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400", material: "Ouro 18k" },
                        { id: 2, nome: "Colar Veneziana", preco: 150.00, img: "https://images.unsplash.com/photo-1515562141207-7a18b5ce7142?w=400", material: "Prata 925" },
                        { id: 3, nome: "Choker Elos Dourados", preco: 190.00, img: "https://images.unsplash.com/photo-1611085583191-a3b1a308c021?w=400", material: "Banho Ouro" },
                        { id: 4, nome: "Colar Ponto de Luz", preco: 95.00, img: "https://via.placeholder.com/400x400?text=Colar+Ponto+Luz", material: "Prata 925" },
                        { id: 5, nome: "Colar de Pérolas", preco: 320.00, img: "https://via.placeholder.com/400x400?text=Colar+Perolas", material: "Pérola Natural" },
                    ]
                },
                {
                    nome: "Brincos",
                    itens: [
                        { id: 11, nome: "Argola Cravejada G", preco: 135.00, img: "https://via.placeholder.com/400x400?text=Argola+G", material: "Banho Ouro" },
                        { id: 12, nome: "Brinco Gota Safira", preco: 89.00, img: "https://via.placeholder.com/400x400?text=Gota+Safira", material: "Zircônia/Prata" },
                    ]
                }
            ]
        },
        {
            categoria: "Bolsas",
            subcategorias: [
                {
                    nome: "Festa & Clutch",
                    itens: [
                        { id: 21, nome: "Clutch Dourada Glitter", preco: 350.00, img: "https://via.placeholder.com/400x400?text=Clutch+Dourada", material: "Sintético Premium" },
                        { id: 22, nome: "Bolsa Carteira Cetim", preco: 280.00, img: "https://via.placeholder.com/400x400?text=Bolsa+Cetim", material: "Têxtil" },
                    ]
                }
            ]
        },
        {
            categoria: "Carteiras",
            subcategorias: [
                {
                    nome: "Couro & Acessórios",
                    itens: [
                        { id: 31, nome: "Carteira Slim Couro", preco: 120.00, img: "https://via.placeholder.com/400x400?text=Slim+Couro", material: "Couro Bovino" },
                    ]
                }
            ]
        }
    ];

    // Transforma o acervo no formato que o Menu espera (com subitens)
    const dadosMenu = acervo.map(cat => ({
        categoria: cat.categoria,
        subitens: cat.subcategorias.map(sub => sub.nome)
    }));

    return (
        <div className="catalogo-container">
            {/* Passamos o array formatado para o Menu */}
            <Menu categorias={dadosMenu} aoClicarCategoria={rolarPara} />

            <div className="espacador-topo"></div>

            <header className="header-vitrine">
                <h1>Clarice Joias</h1>
                <p>Acessórios de luxo para momentos inesquecíveis.</p>
            </header>

            <main className="vitrine-conteudo">
                {acervo.map(cat => (
                    <section key={cat.categoria} id={cat.categoria} className="secao-categoria">
                        <h2 className="titulo-categoria">{cat.categoria}</h2>
                        
                        {cat.subcategorias.map(sub => (
                            <div key={sub.nome} id={sub.nome} className="container-subcategoria">
                                <h3 className="titulo-subcategoria">{sub.nome}</h3>
                                <div className="grid-produtos">
                                    {sub.itens.map(joia => (
                                        <CardItem
                                            key={joia.id}
                                            joia={joia}
                                            adicionarItem={adicionarItem}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>
                ))}
            </main>

            {itens.length > 0 && (
                <div className="botao-maleta-flutuante" onClick={() => setCarrinhoAberto(true)}>
                    <FiShoppingBag size={28} />
                    <span className="badge-contagem">{qtdTotal}</span>
                </div>
            )}
        </div>
    );
}