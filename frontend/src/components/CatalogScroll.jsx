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
                <p className="catalog-subtitle">Explora nuestras categorías y encuentra lo que buscas</p>
            </div>

            {/* Scroll horizontal de categorías */}
            <div className="categories-horizontal-scroll">
                <div className="categories-scroll-container">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category.id)}
                            style={{ '--accent-color': category.color }}
                        >
                            <span className="category-icon">{category.icon}</span>
                            <div className="category-tab-info">
                                <h3>{category.name}</h3>
                                <span className="product-count">
                                    {productsByCategory[category.id]?.length || 0} productos
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid vertical de productos de la categoría seleccionada */}
            <div className="products-vertical-container">
                {selectedCategory && productsByCategory[selectedCategory] && (
                    <div className="products-grid-vertical">
                        {productsByCategory[selectedCategory].length > 0 ? (
                            productsByCategory[selectedCategory].map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <div className="empty-category">
                                <p>No hay productos disponibles en esta categoría</p>
                            </div>
                        )}
                    </div>
                )}
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

                /* Scroll horizontal de categorías */
                .categories-horizontal-scroll {
                    padding: 2rem 1rem;
                    overflow-x: auto;
                    scrollbar-width: thin;
                    scrollbar-color: #ec4899 rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: center;
                }

                .categories-horizontal-scroll::-webkit-scrollbar {
                    height: 8px;
                }

                .categories-horizontal-scroll::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }

                .categories-horizontal-scroll::-webkit-scrollbar-thumb {
                    background: #ec4899;
                    border-radius: 10px;
                }

                .categories-scroll-container {
                    display: flex;
                    gap: 1rem;
                    padding: 0 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                    max-width: 1400px;
                }

                .category-tab {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.5rem 2rem;
                    background: white;
                    border: 3px solid transparent;
                    border-radius: 1.5rem;
                    color: #831843;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 250px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    position: relative;
                    z-index: 1;
                }

                .category-tab:hover {
                    background: #fff5f9;
                    transform: translateY(-4px);
                    box-shadow: 0 12px 35px rgba(236, 72, 153, 0.3);
                    border-color: #fbcfe8;
                }

                .category-tab.active {
                    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
                    color: white;
                    border-color: #be185d;
                    box-shadow: 0 15px 45px rgba(236, 72, 153, 0.5);
                    transform: scale(1.08);
                }

                .category-icon {
                    font-size: 2.5rem;
                    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15));
                }

                .category-tab-info {
                    text-align: left;
                }

                .category-tab-info h3 {
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                }

                .category-tab.active .category-tab-info h3 {
                    color: white;
                }

                .product-count {
                    font-size: 0.85rem;
                    color: #9f1239;
                    font-weight: 600;
                }

                .category-tab.active .product-count {
                    color: rgba(255, 255, 255, 0.9);
                }

                /* Grid vertical de productos */
                .products-vertical-container {
                    padding: 2rem 1rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }

                .products-grid-vertical {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 2rem;
                    animation: fadeIn 0.5s ease;
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
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 4rem 2rem;
                    background: white;
                    border-radius: 1.5rem;
                    color: #9f1239;
                    font-size: 1.3rem;
                    font-weight: 600;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
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
                        font-size: 2rem;
                    }

                    .catalog-subtitle {
                        font-size: 1rem;
                    }

                    .category-tab {
                        min-width: 200px;
                        padding: 1rem 1.5rem;
                    }

                    .category-icon {
                        font-size: 2rem;
                    }

                    .products-grid-vertical {
                        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                        gap: 1.5rem;
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
                }

                .product-card:hover {
                    transform: translateY(-5px);
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
