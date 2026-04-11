import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
                icon: '*',
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
            description: product.description || '',
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

const FALLBACK_CATALOG = createFallbackCatalog();

function sortProducts(products, sortBy) {
    const sortedProducts = [...products];

    switch (sortBy) {
        case 'price-asc':
            return sortedProducts.sort((a, b) => Number(a.price) - Number(b.price));
        case 'price-desc':
            return sortedProducts.sort((a, b) => Number(b.price) - Number(a.price));
        default:
            return sortedProducts.sort((a, b) => Number(a.price) - Number(b.price));
    }
}

export default function CatalogScroll() {
    const [categories, setCategories] = useState(() => FALLBACK_CATALOG.categories);
    const [productsByCategory, setProductsByCategory] = useState(() =>
        buildGroupedProducts(FALLBACK_CATALOG.categories, FALLBACK_CATALOG.products),
    );
    const [selectedCategory, setSelectedCategory] = useState(() => FALLBACK_CATALOG.categories[0]?.id ?? null);
    const [sortBy, setSortBy] = useState('price-asc');
    const [isSyncing, setIsSyncing] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const { data: categoriesData } = await api.get('/categories');
                const { data: productsResponse } = await api.get('/products?active=true&limit=200');
                const liveProducts = productsResponse.data || [];

                if (!isMounted) {
                    return;
                }

                if (categoriesData.length > 0 && liveProducts.length > 0) {
                    setCategories(categoriesData);
                    setProductsByCategory(buildGroupedProducts(categoriesData, liveProducts));
                    setSelectedCategory((previousCategory) =>
                        categoriesData.some((category) => category.id === previousCategory)
                            ? previousCategory
                            : (categoriesData[0]?.id ?? null),
                    );
                }
            } catch (error) {
                console.error('Error fetching catalog data:', error);
            } finally {
                if (isMounted) {
                    setIsSyncing(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    const allProducts = categories.flatMap((category) =>
        (productsByCategory[category.id] || []).map((product) => ({
            ...product,
            categoryInfo: category,
        })),
    );

    const categoryProducts = selectedCategory === null
        ? allProducts
        : allProducts.filter((product) => product.categoryId === selectedCategory);

    const displayedProducts = sortProducts(categoryProducts, sortBy);

    return (
        <section className="catalog-scroll" id="catalog">
            <div className="catalog-header">
                <h1 className="catalog-title">
                    Nuestro <span className="catalog-accent">Catalogo</span>
                </h1>
                <p className="catalog-subtitle">Explora nuestras tarjetitas y ordena por precio.</p>
                {isSyncing ? <p className="catalog-status">Actualizando productos...</p> : null}
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
                        {category.icon ? <span className="filter-icon">{category.icon}</span> : null}
                        {category.name}
                    </button>
                ))}
            </div>

            <div className="catalog-tools">
                <label className="tool-group">
                    <span>Precio</span>
                    <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                        <option value="price-asc">Precio mas bajo</option>
                        <option value="price-desc">Precio mas alto</option>
                    </select>
                </label>
            </div>

            <div className="products-list-shell">
                {displayedProducts.length > 0 ? (
                    <>
                        <div className="products-list-meta">
                            <span>{displayedProducts.length} productos</span>
                        </div>

                        <div className="products-grid">
                            {displayedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="empty-catalog">
                        <p>No hay productos para ese filtro.</p>
                    </div>
                )}
            </div>

            <style>{`
                .catalog-scroll {
                    min-height: 100vh;
                    background: linear-gradient(180deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%);
                    padding: 6rem 0 3rem;
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
                    padding: 0 1rem 1rem;
                    max-width: 840px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }

                .catalog-title {
                    font-size: 3.35rem;
                    font-weight: 900;
                    color: #d61f69;
                    margin-bottom: 0.85rem;
                    line-height: 1.05;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.08);
                }

                .catalog-accent {
                    color: inherit;
                }

                .catalog-subtitle {
                    font-size: 1rem;
                    color: #9f1239;
                    font-weight: 500;
                }

                .catalog-status {
                    margin-top: 0.7rem;
                    color: #be185d;
                    font-size: 0.84rem;
                    font-weight: 700;
                }

                .categories-filter {
                    display: flex;
                    gap: 0.85rem;
                    padding: 1rem 1rem 0.75rem;
                    overflow-x: auto;
                    position: relative;
                    z-index: 1;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .category-filter-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    padding: 0.7rem 1.2rem;
                    background: rgba(255, 255, 255, 0.96);
                    border: 2px solid transparent;
                    border-radius: 0.9rem;
                    color: #831843;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                    white-space: nowrap;
                }

                .category-filter-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(236, 72, 153, 0.24);
                    border-color: #fbcfe8;
                }

                .category-filter-btn.active {
                    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
                    color: white;
                    border-color: #be185d;
                    box-shadow: 0 8px 24px rgba(236, 72, 153, 0.38);
                }

                .filter-icon {
                    font-size: 1rem;
                }

                .catalog-tools {
                    max-width: 1120px;
                    margin: 0 auto;
                    padding: 0.65rem 1rem 0;
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                    position: relative;
                    z-index: 1;
                }

                .tool-group {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    background: rgba(255, 255, 255, 0.92);
                    border: 1px solid rgba(236, 72, 153, 0.18);
                    border-radius: 0.9rem;
                    padding: 0.65rem 0.9rem;
                    box-shadow: 0 6px 18px rgba(190, 24, 93, 0.08);
                }

                .tool-group span {
                    color: #9f1239;
                    font-size: 0.85rem;
                    font-weight: 700;
                }

                .tool-group select {
                    border: none;
                    background: transparent;
                    color: #831843;
                    font-size: 0.92rem;
                    font-weight: 600;
                    outline: none;
                    cursor: pointer;
                }

                .products-list-shell {
                    max-width: 1260px;
                    margin: 0 auto;
                    padding: 1.25rem 1rem 0;
                    z-index: 1;
                }

                .products-list-meta {
                    display: flex;
                    justify-content: center;
                    color: #9f1239;
                    font-size: 0.9rem;
                    font-weight: 700;
                    margin-bottom: 0.9rem;
                }

                .products-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 1rem;
                    align-items: stretch;
                }

                .empty-catalog {
                    text-align: center;
                    padding: 3rem 1.25rem;
                    background: white;
                    border-radius: 1.5rem;
                    color: #9f1239;
                    font-size: 1.1rem;
                    font-weight: 700;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }

                @media (max-width: 1100px) {
                    .products-list-shell {
                        max-width: 980px;
                    }

                    .products-grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }

                @media (max-width: 768px) {
                    .catalog-scroll {
                        padding-top: 5.75rem;
                    }

                    .catalog-title {
                        font-size: 2.25rem;
                    }

                    .catalog-subtitle {
                        font-size: 0.92rem;
                    }

                    .catalog-status {
                        font-size: 0.78rem;
                    }

                    .categories-filter {
                        padding: 1rem 0.85rem 0.5rem;
                        gap: 0.6rem;
                        justify-content: center;
                    }

                    .category-filter-btn {
                        padding: 0.6rem 0.95rem;
                        font-size: 0.84rem;
                    }

                    .catalog-tools {
                        gap: 0.6rem;
                    }

                    .tool-group {
                        padding: 0.6rem 0.8rem;
                    }

                    .tool-group span,
                    .tool-group select {
                        font-size: 0.82rem;
                    }

                    .products-list-shell {
                        max-width: 760px;
                    }

                    .products-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 0.7rem;
                    }
                }

                @media (max-width: 520px) {
                    .catalog-header {
                        padding-bottom: 0.75rem;
                    }

                    .catalog-title {
                        font-size: 2rem;
                    }

                    .catalog-tools {
                        padding-top: 0.5rem;
                        gap: 0.5rem;
                    }

                    .tool-group {
                        width: calc(50% - 0.35rem);
                        justify-content: space-between;
                        gap: 0.35rem;
                        padding: 0.6rem 0.75rem;
                    }

                    .tool-group select {
                        width: 100%;
                        min-width: 0;
                        font-size: 0.78rem;
                    }

                    .products-list-shell {
                        padding-left: 0.75rem;
                        padding-right: 0.75rem;
                    }
                }

                @media (max-width: 360px) {
                    .products-grid {
                        grid-template-columns: minmax(0, 1fr);
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
    const categoryLabel = product.category?.name || product.categoryInfo?.name || 'Producto';
    const description = product.description || 'Detalle especial para regalar.';

    return (
        <article className={`product-card ${product.isFeatured ? 'featured' : ''}`}>
            <Link to={`/producto/${product.slug}`} className="product-image-link">
                <div className="product-image">
                    <img src={imageUrl} alt={product.name} loading="lazy" />
                    {hasDiscount && (
                        <span className="product-discount-badge">
                            Oferta
                        </span>
                    )}
                </div>
            </Link>

            <div className="product-info">
                <span className="product-category">{categoryLabel}</span>

                <Link to={`/producto/${product.slug}`} className="product-title-link">
                    <h3 className="product-name">{product.name}</h3>
                </Link>

                <p className="product-description">{description}</p>

                <div className="price-block">
                    <span className="price">
                        ${Number(product.price).toFixed(2)}
                    </span>
                    {hasDiscount && (
                        <span className="compare-price">
                            ${Number(product.compareAtPrice).toFixed(2)}
                        </span>
                    )}
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
                    background: rgba(255, 255, 255, 0.97);
                    border-radius: 1.2rem;
                    overflow: hidden;
                    box-shadow: 0 12px 26px rgba(131, 24, 67, 0.12);
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                    position: relative;
                    width: 100%;
                    min-width: 0;
                    height: 100%;
                    border: 1px solid rgba(255, 255, 255, 0.65);
                }

                .product-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 18px 34px rgba(236, 72, 153, 0.18);
                }

                .product-image-link {
                    display: block;
                }

                .product-image {
                    position: relative;
                    width: 100%;
                    height: 205px;
                    overflow: hidden;
                    background: #f8d9e7;
                }

                .product-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    display: block;
                }

                .product-discount-badge {
                    position: absolute;
                    top: 0.7rem;
                    left: 0.7rem;
                    background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
                    color: white;
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.02em;
                    padding: 0.35rem 0.6rem;
                    border-radius: 0.75rem;
                    box-shadow: 0 8px 20px rgba(190, 24, 93, 0.22);
                }

                .product-info {
                    padding: 0.85rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.55rem;
                }

                .product-category {
                    color: #ec4899;
                    font-size: 0.68rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .product-title-link {
                    color: inherit;
                    text-decoration: none;
                }

                .product-name {
                    font-size: 0.98rem;
                    line-height: 1.22;
                    color: #1a1a2e;
                    font-weight: 700;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    min-height: 2.35rem;
                }

                .product-description {
                    color: #64748b;
                    font-size: 0.78rem;
                    line-height: 1.35;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    min-height: 2.1rem;
                }

                .price-block {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: baseline;
                    gap: 0.35rem;
                }

                .price {
                    color: #1a1a2e;
                    font-weight: 800;
                    font-size: 1.12rem;
                }

                .compare-price {
                    color: #94a3b8;
                    text-decoration: line-through;
                    font-size: 0.78rem;
                }

                .product-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    min-height: 38px;
                    padding: 0.65rem;
                    background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 0.8rem;
                    font-weight: 700;
                    font-size: 0.86rem;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    box-shadow: 0 8px 20px rgba(236, 72, 153, 0.24);
                    margin-top: auto;
                }

                .product-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 24px rgba(236, 72, 153, 0.32);
                }

                @media (max-width: 768px) {
                    .product-image {
                        height: 118px;
                    }

                    .product-image img {
                        height: 100%;
                    }

                    .product-info {
                        padding: 0.68rem;
                        gap: 0.42rem;
                    }

                    .product-name {
                        font-size: 0.85rem;
                        min-height: 2rem;
                    }

                    .product-description {
                        font-size: 0.7rem;
                        min-height: 1.9rem;
                    }

                    .price {
                        font-size: 0.98rem;
                    }

                    .compare-price {
                        font-size: 0.68rem;
                    }

                    .product-btn {
                        min-height: 34px;
                        font-size: 0.78rem;
                        padding: 0.55rem;
                    }
                }

                @media (max-width: 420px) {
                    .product-image {
                        height: 108px;
                    }

                    .product-image img {
                        height: 100%;
                    }

                    .product-info {
                        padding: 0.6rem;
                    }

                    .product-category {
                        font-size: 0.62rem;
                    }

                    .product-name {
                        font-size: 0.8rem;
                    }

                    .product-description {
                        font-size: 0.67rem;
                    }

                    .price {
                        font-size: 0.92rem;
                    }
                }
            `}</style>
        </article>
    );
}
