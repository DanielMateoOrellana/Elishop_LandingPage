import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';
import { products as fallbackProducts, categories as fallbackCategories } from '../data/products';

const WHATSAPP_NUMBER = '593967074437';

function slugify(value) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function getVisibleCount() {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1100) return 2;
    return 3;
}

function buildGroupedProducts(categories, products) {
    const grouped = {};
    categories.forEach((category) => {
        grouped[category.id] = products.filter((product) => product.categoryId === category.id);
    });
    return grouped;
}

function createFallbackCatalog() {
    const normalizedCategories = fallbackCategories.map((category) => ({
        id: slugify(category.name),
        name: category.name,
        icon: category.icon,
        color: category.color,
    }));

    const categoryByName = new Map(
        normalizedCategories.map((category) => [category.name.toLowerCase(), category]),
    );

    fallbackProducts.forEach((product) => {
        const key = product.category.toLowerCase();
        if (!categoryByName.has(key)) {
            const dynamicCategory = {
                id: slugify(product.category),
                name: product.category,
                icon: '🎀',
                color: '#ec4899',
            };
            categoryByName.set(key, dynamicCategory);
            normalizedCategories.push(dynamicCategory);
        }
    });

    const normalizedProducts = fallbackProducts.map((product, index) => {
        const category = categoryByName.get(product.category.toLowerCase());

        return {
            id: `fallback-${product.id ?? index}`,
            name: product.name,
            slug: slugify(product.name),
            price: 18.99 + index,
            compareAtPrice: product.featured ? 24.99 + index : null,
            categoryId: category.id,
            category,
            images: [{ url: product.image }],
            inventory: {
                stockZaruma: 2 + (index % 4),
                stockSangolqui: 1 + (index % 3),
            },
            isFeatured: Boolean(product.featured),
        };
    });

    return {
        categories: normalizedCategories,
        products: normalizedProducts,
    };
}

export default function CatalogScroll() {
    const [categories, setCategories] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(getVisibleCount);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: categoriesData } = await api.get('/categories');
                const { data: productsResponse } = await api.get('/products?active=true&limit=200');
                const liveProducts = productsResponse.data || [];

                if (categoriesData.length > 0 && liveProducts.length > 0) {
                    setCategories(categoriesData);
                    setProductsByCategory(buildGroupedProducts(categoriesData, liveProducts));
                    setSelectedCategory(categoriesData[0].id);
                } else {
                    const fallbackCatalog = createFallbackCatalog();
                    setCategories(fallbackCatalog.categories);
                    setProductsByCategory(buildGroupedProducts(fallbackCatalog.categories, fallbackCatalog.products));
                    setSelectedCategory(fallbackCatalog.categories[0]?.id ?? null);
                }
            } catch (error) {
                console.error('Error fetching catalog data:', error);
                const fallbackCatalog = createFallbackCatalog();
                setCategories(fallbackCatalog.categories);
                setProductsByCategory(buildGroupedProducts(fallbackCatalog.categories, fallbackCatalog.products));
                setSelectedCategory(fallbackCatalog.categories[0]?.id ?? null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setVisibleCount(getVisibleCount());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setCurrentIndex(0);
    }, [selectedCategory, visibleCount]);

    if (loading) {
        return (
            <div className="catalog-loading">
                <div className="spinner"></div>
                <p>Cargando catalogo...</p>
            </div>
        );
    }

    const allProducts = categories.flatMap((category) =>
        (productsByCategory[category.id] || []).map((product) => ({
            ...product,
            categoryInfo: category,
        })),
    );

    const displayedProducts = selectedCategory === null
        ? allProducts
        : allProducts.filter((product) => product.categoryId === selectedCategory);

    const maxIndex = Math.max(0, displayedProducts.length - visibleCount);
    const visibleProducts = displayedProducts.slice(currentIndex, currentIndex + visibleCount);
    const visibleColumns = Math.max(1, Math.min(visibleCount, visibleProducts.length || visibleCount));

    const goToPrevious = () => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
    };

    return (
        <section className="catalog-scroll" id="catalog">
            <div className="catalog-header">
                <h1 className="catalog-title">
                    Nuestro <span className="catalog-accent">Catalogo</span>
                </h1>
                <p className="catalog-subtitle">Usa las flechas para recorrer nuestros productos destacados.</p>
            </div>

            <div className="categories-filter">
                <button
                    className={`category-filter-btn ${selectedCategory === null ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    Todos
                </button>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        className={`category-filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category.id)}
                    >
                        <span className="filter-icon">{category.icon}</span>
                        {category.name}
                    </button>
                ))}
            </div>

            <div className="products-carousel-shell">
                <button
                    type="button"
                    className={`carousel-arrow ${currentIndex === 0 ? 'disabled' : ''}`}
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                    aria-label="Ver productos anteriores"
                >
                    <ChevronLeft size={28} />
                </button>

                <div className="products-carousel-stage">
                    {displayedProducts.length > 0 ? (
                        <>
                            <div className="products-carousel-meta">
                                <span>
                                    Mostrando {Math.min(currentIndex + 1, displayedProducts.length)} - {Math.min(currentIndex + visibleCount, displayedProducts.length)} de {displayedProducts.length}
                                </span>
                            </div>

                            <div
                                className="products-grid"
                                style={{ gridTemplateColumns: `repeat(${visibleColumns}, minmax(0, 1fr))` }}
                            >
                                {visibleProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-catalog">
                            <p>No hay productos disponibles</p>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className={`carousel-arrow ${currentIndex >= maxIndex ? 'disabled' : ''}`}
                    onClick={goToNext}
                    disabled={currentIndex >= maxIndex}
                    aria-label="Ver productos siguientes"
                >
                    <ChevronRight size={28} />
                </button>
            </div>

            <style>{`
                .catalog-scroll {
                    min-height: 100vh;
                    background: linear-gradient(180deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%);
                    padding: 6.5rem 0 3rem;
                    position: relative;
                    overflow: hidden;
                }

                .catalog-scroll::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(circle at 20% 30%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(219, 39, 119, 0.15) 0%, transparent 50%);
                    pointer-events: none;
                }

                .catalog-header {
                    text-align: center;
                    padding: 0 2rem 1.5rem;
                    max-width: 800px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }

                .catalog-title {
                    font-size: 3.5rem;
                    font-weight: 900;
                    color: #d61f69;
                    margin-bottom: 1rem;
                    line-height: 1.2;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
                }

                .catalog-accent {
                    color: inherit;
                }

                .catalog-subtitle {
                    font-size: 1.05rem;
                    color: #9f1239;
                    font-weight: 500;
                }

                .categories-filter {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem 2rem;
                    overflow-x: auto;
                    position: relative;
                    z-index: 1;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .category-filter-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    background: white;
                    border: 2px solid transparent;
                    border-radius: 9999px;
                    color: #831843;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    white-space: nowrap;
                }

                .category-filter-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(236, 72, 153, 0.3);
                    border-color: #fbcfe8;
                }

                .category-filter-btn.active {
                    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
                    color: white;
                    border-color: #be185d;
                    box-shadow: 0 8px 30px rgba(236, 72, 153, 0.5);
                }

                .filter-icon {
                    font-size: 1.2rem;
                }

                .products-carousel-shell {
                    display: grid;
                    grid-template-columns: auto minmax(0, 1fr) auto;
                    gap: 1rem;
                    align-items: center;
                    padding: 1.5rem 2rem 0;
                    max-width: 1380px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }

                .products-carousel-stage {
                    min-height: 100%;
                }

                .products-carousel-meta {
                    display: flex;
                    justify-content: flex-end;
                    color: #9f1239;
                    font-size: 0.92rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    padding-right: 0.5rem;
                }

                .products-grid {
                    display: grid;
                    gap: 2rem;
                    align-items: stretch;
                }

                .carousel-arrow {
                    width: 56px;
                    height: 56px;
                    border: none;
                    border-radius: 9999px;
                    background: rgba(255, 255, 255, 0.92);
                    color: #be185d;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 10px 25px rgba(190, 24, 93, 0.18);
                    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
                }

                .carousel-arrow:hover:not(.disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 16px 35px rgba(190, 24, 93, 0.26);
                }

                .carousel-arrow.disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .empty-catalog {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: white;
                    border-radius: 1.5rem;
                    color: #9f1239;
                    font-size: 1.3rem;
                    font-weight: 600;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    margin: 0 auto;
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

                @media (max-width: 768px) {
                    .catalog-scroll {
                        padding-top: 5.75rem;
                    }

                    .catalog-title {
                        font-size: 2.5rem;
                    }

                    .catalog-subtitle {
                        font-size: 0.95rem;
                    }

                    .categories-filter {
                        padding: 1rem;
                        gap: 0.75rem;
                        justify-content: flex-start;
                    }

                    .category-filter-btn {
                        padding: 0.6rem 1.1rem;
                        font-size: 0.9rem;
                    }

                    .filter-icon {
                        font-size: 1rem;
                    }

                    .products-carousel-shell {
                        grid-template-columns: 44px minmax(0, 1fr) 44px;
                        gap: 0.75rem;
                        padding: 1rem;
                    }

                    .carousel-arrow {
                        width: 44px;
                        height: 44px;
                    }
                }
            `}</style>
        </section>
    );
}

function ProductCard({ product }) {
    const imageUrl = product.images?.[0]?.url || 'https://placehold.co/400x400/1e1e1e/white?text=Sin+Imagen';

    const productUrl = `${window.location.origin}/producto/${product.slug}`;
    const message = `Hola! Me interesa el producto: ${product.name} (Precio: $${Number(product.price).toFixed(2)})\nVer producto: ${productUrl}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
    const discountPercent = hasDiscount
        ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
        : 0;

    return (
        <div className={`product-card ${product.isFeatured ? 'featured' : ''}`}>
            <div className="badges-overlay">
                {hasDiscount && (
                    <div className="product-badge discount">
                        -{discountPercent}%
                    </div>
                )}
                {product.isFeatured && !hasDiscount && (
                    <div className="product-badge star">
                        Destacado
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

                <div className="stock-info">
                    <div className={`stock-location ${product.inventory?.stockZaruma > 0 ? 'text-green' : 'text-gray'}`}>
                        Zaruma: <strong>{product.inventory?.stockZaruma || 0}</strong>
                    </div>
                    <div className={`stock-location ${product.inventory?.stockSangolqui > 0 ? 'text-green' : 'text-gray'}`}>
                        Sangolqui: <strong>{product.inventory?.stockSangolqui || 0}</strong>
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
                    Lo quiero
                </a>
            </div>

            <style>{`
                .product-card {
                    background: white;
                    border-radius: 1rem;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
                    transition: all 0.3s ease;
                    position: relative;
                    width: 100%;
                    min-width: 0;
                    height: 100%;
                }

                .product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 50px rgba(236, 72, 153, 0.28);
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
                    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
                }

                .product-badge.star {
                    background: linear-gradient(135deg, #ffd700, #ffb700);
                    color: #000;
                    font-weight: 700;
                    padding: 0.5rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
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
                    transform: scale(1.06);
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
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    font-size: 0.85rem;
                    margin-bottom: 1rem;
                    background: #f8fafc;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.5rem;
                }

                .stock-location {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .text-green { color: #16a34a; }
                .text-gray { color: #94a3b8; opacity: 0.85; }

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
                    box-shadow: 0 8px 25px rgba(236, 72, 153, 0.45);
                }
            `}</style>
        </div>
    );
}
