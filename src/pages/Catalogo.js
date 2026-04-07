import React from 'react';
import { FiShoppingBag, FiUser } from 'react-icons/fi';
import { CardItem } from '../components/CardItem';
import { Menu } from '../components/Menu';
import { useMaleta } from '../context/MaletaContext';
import './Catalogo.css';

export default function Catalogo() {
    const { adicionarItem, itens, total, setCarrinhoAberto } = useMaleta();
    const qtdTotal = itens.reduce((acc, curr) => acc + curr.quantidade, 0);
    // Função para rolar até a categoria clicada
    const rolarPara = (id) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.scrollIntoView({ behavior: 'smooth' });
    };


    const acervo = [
        {
            categoria: "Joias",
            subcategorias: [
                {
                    nome: "Colares",
                    itens: [
                        // Exemplo de como deve ficar cada item no seu acervo:
                        {
                            id: 1,
                            nome: "Colar Riviera Clássico",
                            preco: 280.00,
                            imagens: [
                                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
                                "https://via.placeholder.com/400x400?text=Angulo+2",
                                "https://via.placeholder.com/400x400?text=No+Corpo"
                            ],
                            material: "Ouro 18k"
                        },
                        { id: 2, nome: "Colar Veneziana com Pingente", preco: 150.00, img: "https://images.unsplash.com/photo-1515562141207-7a18b5ce7142?w=400", material: "Prata 925" },
                        { id: 3, nome: "Choker Elos Dourados", preco: 190.00, img: "https://images.unsplash.com/photo-1611085583191-a3b1a308c021?w=400", material: "Banho Ouro" },
                        { id: 4, nome: "Colar Ponto de Luz", preco: 95.00, img: "https://via.placeholder.com/400x400?text=Colar+Ponto+Luz", material: "Prata 925" },
                        { id: 5, nome: "Colar de Pérolas Barrocas", preco: 320.00, img: "https://via.placeholder.com/400x400?text=Colar+Perolas", material: "Pérola Natural" },
                        { id: 6, nome: "Colar Terço Delicado", preco: 140.00, img: "https://via.placeholder.com/400x400?text=Terco", material: "Banho Ouro" },
                        { id: 7, nome: "Colar Medalha Signo", preco: 125.00, img: "https://via.placeholder.com/400x400?text=Medalha", material: "Banho Ouro" },
                        { id: 8, nome: "Colar Gravatinha Zircônia", preco: 175.00, img: "https://via.placeholder.com/400x400?text=Gravatinha", material: "Ródio" },
                        { id: 9, nome: "Colar Nome Personalizado", preco: 210.00, img: "https://via.placeholder.com/400x400?text=Personalizado", material: "Ouro 18k" },
                        { id: 10, nome: "Colar Corrente Grumet", preco: 290.00, img: "https://via.placeholder.com/400x400?text=Grumet", material: "Prata 925" }
                    ]
                },
                {
                    nome: "Brincos",
                    itens: [
                        { id: 11, nome: "Argola Cravejada G", preco: 135.00, img: "https://via.placeholder.com/400x400?text=Argola+G", material: "Banho Ouro" },
                        { id: 12, nome: "Brinco Gota Safira", preco: 89.00, img: "https://via.placeholder.com/400x400?text=Gota+Safira", material: "Zircônia/Prata" },
                        { id: 13, nome: "Ear Cuff Brilho", preco: 110.00, img: "https://via.placeholder.com/400x400?text=Ear+Cuff", material: "Ródio" },
                        { id: 14, nome: "Ponto de Luz Clássico", preco: 45.00, img: "https://via.placeholder.com/400x400?text=Ponto+Luz", material: "Prata 925" },
                        { id: 15, nome: "Brinco Leque Texturizado", preco: 160.00, img: "https://via.placeholder.com/400x400?text=Leque", material: "Ouro 18k" },
                        { id: 16, nome: "Brinco Trio Bolinhas", preco: 75.00, img: "https://via.placeholder.com/400x400?text=Trio", material: "Ouro 18k" },
                        { id: 17, nome: "Argola Coração", preco: 95.00, img: "https://via.placeholder.com/400x400?text=Argola+Coracao", material: "Banho Ouro" },
                        { id: 18, nome: "Brinco Cascata Cristais", preco: 220.00, img: "https://via.placeholder.com/400x400?text=Cascata", material: "Ródio Negro" },
                        { id: 19, nome: "Maxi Brinco Festa", preco: 185.00, img: "https://via.placeholder.com/400x400?text=Maxi+Brinco", material: "Zircônia" },
                        { id: 20, nome: "Brinco Pérola Shell", preco: 120.00, img: "https://via.placeholder.com/400x400?text=Perola+Shell", material: "Prata 925" }
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
                        { id: 23, nome: "Minaudiere Pedraria", preco: 590.00, img: "https://via.placeholder.com/400x400?text=Minaudiere", material: "Cristais" },
                        { id: 24, nome: "Bolsa Envelope Prata", preco: 210.00, img: "https://via.placeholder.com/400x400?text=Envelope+Prata", material: "Sintético" },
                        { id: 25, nome: "Clutch Acrílico Marble", preco: 420.00, img: "https://via.placeholder.com/400x400?text=Acrilico", material: "Acrílico" },
                        { id: 26, nome: "Bolsa Alça Corrente", preco: 380.00, img: "https://via.placeholder.com/400x400?text=Alca+Corrente", material: "Couro Legítimo" },
                        { id: 27, nome: "Clutch Veludo Noite", preco: 260.00, img: "https://via.placeholder.com/400x400?text=Veludo", material: "Veludo" },
                        { id: 28, nome: "Bolsa Rígida Metalizada", preco: 310.00, img: "https://via.placeholder.com/400x400?text=Rigida", material: "Metal" },
                        { id: 29, nome: "Mini Bag Matelassê", preco: 450.00, img: "https://via.placeholder.com/400x400?text=Matelasse", material: "Couro" },
                        { id: 30, nome: "Bolsa Redonda Bordada", preco: 395.00, img: "https://via.placeholder.com/400x400?text=Bordada", material: "Têxtil" }
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
                        { id: 32, nome: "Porta Cartões Magnético", preco: 85.00, img: "https://via.placeholder.com/400x400?text=Porta+Cartoes", material: "Alumínio/Couro" },
                        { id: 33, nome: "Carteira Feminina Zíper", preco: 195.00, img: "https://via.placeholder.com/400x400?text=Carteira+Ziper", material: "Couro" },
                        { id: 34, nome: "Carteira Compacta Nude", preco: 140.00, img: "https://via.placeholder.com/400x400?text=Compacta", material: "Sintético" },
                        { id: 35, nome: "Necessaire Organizadora", preco: 95.00, img: "https://via.placeholder.com/400x400?text=Necessaire", material: "Nylon Luxo" },
                        { id: 36, nome: "Porta Passaporte Couro", preco: 110.00, img: "https://via.placeholder.com/400x400?text=Passaporte", material: "Couro" },
                        { id: 37, nome: "Carteira Masculina Bifold", preco: 155.00, img: "https://via.placeholder.com/400x400?text=Bifold", material: "Couro Nobre" },
                        { id: 38, nome: "Clutch Phone Holder", preco: 220.00, img: "https://via.placeholder.com/400x400?text=Phone+Holder", material: "Sintético" },
                        { id: 39, nome: "Carteira Longa Matelassê", preco: 240.00, img: "https://via.placeholder.com/400x400?text=Longa+Matelasse", material: "Couro" },
                        { id: 40, nome: "Porta Moedas Retrô", preco: 45.00, img: "https://via.placeholder.com/400x400?text=Porta+Moedas", material: "Metal/Tecido" }
                    ]
                }
            ]
        }
    ];

    return (
        <div className="catalogo-container">
            {/* O Menu já contém o topo-fixo e as duas barras */}
            <Menu categorias={acervo} aoClicarCategoria={rolarPara} />

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
                            <div key={sub.nome} className="container-subcategoria">
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