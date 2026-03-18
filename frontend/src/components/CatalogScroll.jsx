import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const WHATSAPP_NUMBER = "593967074437";

export default function CatalogScroll() {
    const [categories, setCategories] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener categorías
                const { data: categoriesData } = await api.get('/categories');
                setCategories(categoriesData);

                // Obtener productos
                const { data: productsResponse } = await api.get('/products?active=true&limit=200');
                const products = productsResponse.data || [];

                // Agrupar productos por categoría
                const grouped = {};
                categoriesData.forEach(category => {
                    grouped[category.id] = products.filter(p => p.categoryId === category.id);
                });

                setProductsByCategory(grouped);

                // Seleccionar primera categoría por defecto
                if (categoriesData.length > 0) {
                    setSelectedCategory(categoriesData[0].id);
                }
            } catch (error) {
                console.error("Error fetching catalog data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="catalog-loading">
                <div className="spinner"></div>
                <p>Cargando catálogo...</p>
            </div>
        );
    }

    return (
        <section className="catalog-scroll" id="catalog">
            {/* Cabecera del catálogo */}
            <div className="catalog-header">
                <h1 className="catalog-title">
                    Nuestro <span className="gradient-text">Catálogo</span>
                </h1>
                <p className="catalog-subtitle">Desliza horizontalmente para explorar nuestras categorías</p>
            </div>

            {/* Scroll horizontal de categorías con sus productos */}
            <div className="categories-horizontal-container">
                {categories.map(category => (
                    <div key={category.id} className="category-section">
                        {/* Header de la categoría */}
                        <div className="category-header" style={{ '--accent-color': category.color }}>
                            <span className="category-icon-large">{category.icon}</span>
                            <h2 className="category-name">{category.name}</h2>
                            <p className="category-description">{category.description}</p>
                            <span className="category-product-count">
                                {productsByCategory[category.id]?.length || 0} productos
                            </span>
                        </div>

                        {/* Productos de la categoría en horizontal */}
                        <div className="products-horizontal-scroll">
                            {productsByCategory[category.id]?.length > 0 ? (
                                productsByCategory[category.id].map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                <div className="empty-category">
                                    <p>No hay productos en esta categoría</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .catalog-scroll {
                    min-height: 100vh;
                    background: linear-gradient(180deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%);
                    padding: 2rem 0;
                    position: relative;
                    overflow: hidden;
                }

                .catalog-scroll::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background:
                        radial-gradient(circle at 20% 30%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(219, 39, 119, 0.15) 0%, transparent 50%);
                    pointer-events: none;
                }

                .catalog-header {
                    text-align: center;
                    padding: 3rem 2rem 2rem;
                    max-width: 800px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }

                .catalog-title {
                    font-size: 3.5rem;
                    font-weight: 900;
                    color: #831843;
                    margin-bottom: 1rem;
                    line-height: 1.2;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
                }

                .catalog-subtitle {
                    font-size: 1.3rem;
                    color: #9f1239;
                    font-weight: 500;
                }

                .gradient-text {
                    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    filter: drop-shadow(0 2px 4px rgba(236, 72, 153, 0.3));
                }

                /* Contenedor horizontal de categorías */
                .categories-horizontal-container {
                    display: grid;
                    grid-auto-flow: column;
                    grid-auto-columns: minmax(350px, 1fr);
                    gap: 2rem;
                    padding: 2rem;
                    overflow-x: auto;
                    scroll-behavior: smooth;
                    scrollbar-width: thin;
                    scrollbar-color: #ec4899 rgba(255, 255, 255, 0.3);
                    position: relative;
                    z-index: 1;
                }

                .categories-horizontal-container::-webkit-scrollbar {
                    height: 12px;
                }

                .categories-horizontal-container::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 10px;
                    margin: 0 2rem;
                }

                .categories-horizontal-container::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(236, 72, 153, 0.4);
                }

                /* Sección de cada categoría */
                .category-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                /* Header de categoría */
                .category-header {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 1.5rem;
                    text-align: center;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
                    border: 3px solid var(--accent-color, #ec4899);
                }

                .category-icon-large {
                    font-size: 3rem;
                    display: block;
                    margin-bottom: 0.75rem;
                    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
                }

                .category-name {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #831843;
                    margin-bottom: 0.5rem;
                }

                .category-description {
                    font-size: 0.9rem;
                    color: #9f1239;
                    margin-bottom: 0.75rem;
                    line-height: 1.4;
                }

                .category-product-count {
                    display: inline-block;
                    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
                    color: white;
                    padding: 0.4rem 1rem;
                    border-radius: 9999px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
                }

                /* Scroll horizontal de productos */
                .products-horizontal-scroll {
                    display: flex;
                    gap: 1.5rem;
                    overflow-x: auto;
                    padding: 1rem 0.5rem;
                    scrollbar-width: thin;
                    scrollbar-color: #ec4899 rgba(255, 255, 255, 0.3);
                }

                .products-horizontal-scroll::-webkit-scrollbar {
                    height: 8px;
                }

                .products-horizontal-scroll::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 10px;
                }

                .products-horizontal-scroll::-webkit-scrollbar-thumb {
                    background: #ec4899;
                    border-radius: 10px;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .empty-category {
                    text-align: center;
                    padding: 3rem 2rem;
                    background: white;
                    border-radius: 1.5rem;
                    color: #9f1239;
                    font-size: 1.2rem;
                    font-weight: 600;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    min-width: 320px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .catalog-loading {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(180deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%);
                    color: #831843;
                }

                .catalog-loading p {
                    font-size: 1.2rem;
                    font-weight: 600;
                }

                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(236, 72, 153, 0.3);
                    border-top-color: #ec4899;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .catalog-title {
                        font-size: 2.5rem;
                    }

                    .catalog-subtitle {
                        font-size: 1rem;
                    }

                    .categories-horizontal-container {
                        grid-auto-columns: minmax(280px, 1fr);
                        padding: 1rem;
                        gap: 1rem;
                    }

                    .category-header {
                        padding: 1rem;
                    }

                    .category-name {
                        font-size: 1.25rem;
                    }

                    .category-icon-large {
                        font-size: 2.5rem;
                    }

                    .category-description {
                        font-size: 0.8rem;
                    }

                    .product-card {
                        min-width: 250px;
                        max-width: 250px;
                    }
                }

                @media (min-width: 769px) and (max-width: 1200px) {
                    .categories-horizontal-container {
                        grid-auto-columns: minmax(300px, 1fr);
                    }
                }
            `}</style>
        </section>
    );
}

function ProductCard({ product }) {
    const imageUrl = product.images?.[0]?.url || 'https://placehold.co/400x400/1e1e1e/white?text=Sin+Imagen';

    const productUrl = `${window.location.origin}/producto/${product.slug}`;
    const message = `Hola! Me interesa el producto: ${product.name} (Precio: $${Number(product.price).toFixed(2)})\n🔗 Ver producto: ${productUrl}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
    const discountPercent = hasDiscount
        ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
        : 0;

    return (
        <div className={`product-card ${product.isFeatured ? 'featured' : ''}`}>
            {/* Badges */}
            <div className="badges-overlay">
                {hasDiscount && (
                    <div className="product-badge discount">
                        🔥 -{discountPercent}%
                    </div>
                )}
                {product.isFeatured && !hasDiscount && (
                    <div className="product-badge star">
                        ⭐ Destacado
                    </div>
                )}
            </div>

            <Link to={`/producto/${product.slug}`} className="product-image-link">
                <div className="product-image">
                    <img src={imageUrl} alt={product.name} loading="lazy" />
                </div>
            </Link>

            <div className="product-info">
                <span className="product-category">{product.category?.name || 'Producto'}</span>

                <Link to={`/producto/${product.slug}`} className="product-title-link">
                    <h3 className="product-name">{product.name}</h3>
                </Link>

                {/* Stock Info */}
                <div className="stock-info">
                    <div className={`stock-location ${product.inventory?.stockZaruma > 0 ? 'text-green' : 'text-gray'}`}>
                        📍 Zaruma: <strong>{product.inventory?.stockZaruma || 0}</strong>
                    </div>
                    <div className={`stock-location ${product.inventory?.stockSangolqui > 0 ? 'text-green' : 'text-gray'}`}>
                        📍 Sangolquí: <strong>{product.inventory?.stockSangolqui || 0}</strong>
                    </div>
                </div>

                <div className="price-block">
                    {hasDiscount && (
                        <span className="compare-price">
                            ${Number(product.compareAtPrice).toFixed(2)}
                        </span>
                    )}
                    <span className={`price ${hasDiscount ? 'highlight' : ''}`}>
                        ${Number(product.price).toFixed(2)}
                    </span>
                </div>

                <a
                    href={whatsappUrl}
                    className="product-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Lo quiero 🛍️
                </a>
            </div>

            <style>{`
                .product-card {
                    background: white;
                    border-radius: 1rem;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    transition: all 0.3s ease;
                    position: relative;
                    min-width: 320px;
                    max-width: 320px;
                    flex-shrink: 0;
                }

                .product-card:hover {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 20px 50px rgba(236, 72, 153, 0.4);
                }

                .badges-overlay {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .product-badge.discount {
                    background: #ef4444;
                    color: white;
                    font-weight: 800;
                    padding: 0.5rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.5);
                }

                .product-badge.star {
                    background: linear-gradient(135deg, #ffd700, #ffb700);
                    color: #000;
                    font-weight: bold;
                    padding: 0.5rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
                }

                .product-image-link {
                    display: block;
                    position: relative;
                    overflow: hidden;
                }

                .product-image img {
                    width: 100%;
                    height: 300px;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }

                .product-card:hover .product-image img {
                    transform: scale(1.1);
                }

                .product-info {
                    padding: 1.5rem;
                }

                .product-category {
                    color: #ec4899;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: block;
                    margin-bottom: 0.5rem;
                }

                .product-title-link {
                    text-decoration: none;
                    color: inherit;
                }

                .product-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1a1a2e;
                    margin-bottom: 0.75rem;
                    line-height: 1.3;
                    transition: color 0.2s;
                }

                .product-title-link:hover .product-name {
                    color: #ec4899;
                }

                .stock-info {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.85rem;
                    margin-bottom: 1rem;
                    background: #f8fafc;
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                }

                .stock-location {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .text-green { color: #16a34a; }
                .text-gray { color: #94a3b8; opacity: 0.8; }

                .price-block {
                    display: flex;
                    align-items: baseline;
                    gap: 0.75rem;
                    margin: 0.5rem 0 1.5rem 0;
                }

                .price {
                    color: #1a1a2e;
                    font-weight: 700;
                    font-size: 1.5rem;
                }

                .price.highlight {
                    color: #ec4899;
                }

                .compare-price {
                    color: #94a3b8;
                    text-decoration: line-through;
                    font-size: 1rem;
                }

                .product-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    padding: 0.75rem;
                    background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
                }

                .product-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(236, 72, 153, 0.5);
                }
            `}</style>
        </div>
    );
}
