import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, Truck } from 'lucide-react';
import api from '../api';
import { WHATSAPP_NUMBER } from '../data/products';
import '../styles/catalog.css';

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/f6eef1/a59a9e?text=Sin+Imagen';
const LOW_STOCK_THRESHOLD = 3;
const MAX_STAGGER_ITEMS = 12;

function buildGroupedProducts(categories, products) {
    const grouped = {};
    categories.forEach((category) => {
        grouped[category.id] = products.filter((product) => product.categoryId === category.id);
    });
    return grouped;
}

function getTotalStock(product) {
    return (product.inventory?.stockZaruma || 0) + (product.inventory?.stockSangolqui || 0);
}

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
    const [categories, setCategories] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [sortBy, setSortBy] = useState('price-asc');
    const [isLoading, setIsLoading] = useState(true);

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
                    setIsLoading(false);
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
    // Cambiar la key remonta el grid y vuelve a disparar la entrada escalonada de las tarjetas
    const gridKey = `${selectedCategory ?? 'all'}-${sortBy}`;

    return (
        <section className="catalog-scroll" id="catalog">
            <header className="catalog-header">
                <span className="catalog-eyebrow">Hecho con amor · Ecuador</span>
                <h1 className="catalog-title">
                    Nuestro <em>Catálogo</em>
                </h1>
                <ul className="catalog-trust">
                    <li><Truck size={16} strokeWidth={1.75} /> Envíos a todo Ecuador</li>
                    <li><MapPin size={16} strokeWidth={1.75} /> Stock en Zaruma y Sangolquí</li>
                    <li><MessageCircle size={16} strokeWidth={1.75} /> Atención directa por WhatsApp</li>
                </ul>
            </header>

            {!isLoading ? (
                <CategoryFilters
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                />
            ) : null}

            {!isLoading ? <div className="catalog-toolbar">
                <p className="catalog-count">
                    <strong>{displayedProducts.length}</strong>{' '}
                    {displayedProducts.length === 1 ? 'producto' : 'productos'}
                </p>

                <label className="sort-control">
                    <span>Ordenar por</span>
                    <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                        <option value="price-asc">Precio más bajo</option>
                        <option value="price-desc">Precio más alto</option>
                    </select>
                </label>
            </div> : null}

            <div className="products-list-shell">
                {!isLoading && displayedProducts.length > 0 ? (
                    <div className="catalog-grid" key={gridKey}>
                        {displayedProducts.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                staggerIndex={Math.min(index, MAX_STAGGER_ITEMS)}
                            />
                        ))}
                    </div>
                ) : !isLoading ? (
                    <div className="empty-catalog">
                        <p>No hay productos para ese filtro.</p>
                    </div>
                ) : null}
            </div>
        </section>
    );
}

function CategoryFilters({ categories, selectedCategory, onSelect }) {
    const containerRef = useRef(null);
    const [indicator, setIndicator] = useState(null);

    // Mide el botón activo para mover la píldora de fondo hasta él
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return undefined;
        }

        const updateIndicator = () => {
            const activeButton = container.querySelector('[aria-pressed="true"]');
            if (!activeButton) {
                setIndicator(null);
                return;
            }

            setIndicator({
                x: activeButton.offsetLeft,
                y: activeButton.offsetTop,
                width: activeButton.offsetWidth,
                height: activeButton.offsetHeight,
            });
        };

        updateIndicator();

        const resizeObserver = new ResizeObserver(updateIndicator);
        resizeObserver.observe(container);
        container.querySelectorAll('button').forEach((button) => resizeObserver.observe(button));

        return () => resizeObserver.disconnect();
    }, [categories, selectedCategory]);

    return (
        <div
            className={`catalog-filters ${indicator ? 'has-indicator' : ''}`}
            ref={containerRef}
            role="group"
            aria-label="Filtrar por categoría"
        >
            {indicator ? (
                <span
                    className="filter-indicator"
                    aria-hidden="true"
                    style={{
                        width: indicator.width,
                        height: indicator.height,
                        transform: `translate(${indicator.x}px, ${indicator.y}px)`,
                    }}
                />
            ) : null}

            <button
                type="button"
                className="filter-btn"
                aria-pressed={selectedCategory === null}
                onClick={() => onSelect(null)}
            >
                Todos
            </button>
            {categories.map((category) => (
                <button
                    type="button"
                    key={category.id}
                    className="filter-btn"
                    aria-pressed={selectedCategory === category.id}
                    onClick={() => onSelect(category.id)}
                >
                    {category.icon ? <span className="filter-icon">{category.icon}</span> : null}
                    {category.name}
                </button>
            ))}
        </div>
    );
}

function getBadge(product, { isSoldOut, hasDiscount }) {
    if (isSoldOut) {
        return { label: 'Agotado', className: 'is-soldout' };
    }

    if (hasDiscount) {
        const discount = Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100);
        return { label: `-${discount}%`, className: 'is-sale' };
    }

    if (product.isNew) {
        return { label: 'Nuevo', className: '' };
    }

    return null;
}

function ProductCard({ product, staggerIndex }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [primaryImage, setPrimaryImage] = useState(product.images?.[0]?.url || PLACEHOLDER_IMAGE);
    const secondaryImage = product.images?.[1]?.url;

    // Las imágenes en caché pueden terminar de cargar antes de que React escuche onLoad
    const imageRef = useCallback((node) => {
        if (node?.complete && node.naturalWidth > 0) {
            setIsLoaded(true);
        }
    }, []);

    const productPath = `/producto/${product.slug}`;
    const productUrl = `${window.location.origin}${productPath}`;
    const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
    const hasInventory = Boolean(product.inventory);
    const totalStock = getTotalStock(product);
    const isSoldOut = hasInventory && totalStock === 0;
    const isLowStock = hasInventory && totalStock > 0 && totalStock <= LOW_STOCK_THRESHOLD;
    const badge = getBadge(product, { isSoldOut, hasDiscount });
    const categoryLabel = product.category?.name || product.categoryInfo?.name || 'Producto';

    const message = isSoldOut
        ? `Hola! ¿Tendrán nuevamente disponible el producto: ${product.name}?\nVer producto: ${productUrl}`
        : `Hola! Me interesa el producto: ${product.name} (Precio: $${Number(product.price).toFixed(2)})\nVer producto: ${productUrl}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    const cardClassName = [
        'catalog-card',
        isLoaded ? 'is-loaded' : '',
        secondaryImage ? 'has-secondary' : '',
        isSoldOut ? 'is-soldout' : '',
    ].filter(Boolean).join(' ');

    return (
        <article className={cardClassName} style={{ '--i': staggerIndex }}>
            <Link to={productPath} className="card-media" aria-label={product.name}>
                <img
                    ref={imageRef}
                    className="card-img-primary"
                    src={primaryImage}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setIsLoaded(true)}
                    onError={() => {
                        setPrimaryImage(PLACEHOLDER_IMAGE);
                        setIsLoaded(true);
                    }}
                />
                {secondaryImage ? (
                    <img
                        className="card-img-secondary"
                        src={secondaryImage}
                        alt=""
                        loading="lazy"
                        decoding="async"
                    />
                ) : null}
                {badge ? <span className={`card-badge ${badge.className}`}>{badge.label}</span> : null}
            </Link>

            <div className="card-body">
                <span className="card-category">{categoryLabel}</span>

                <Link to={productPath} className="card-title-link">
                    <h3 className="card-title">{product.name}</h3>
                </Link>

                {product.description ? <p className="card-desc">{product.description}</p> : null}

                <div className="card-price-row">
                    <span className="card-price">${Number(product.price).toFixed(2)}</span>
                    {hasDiscount ? (
                        <span className="card-compare">${Number(product.compareAtPrice).toFixed(2)}</span>
                    ) : null}
                </div>

                {isLowStock ? (
                    <span className="card-stock-note">
                        {totalStock === 1 ? '¡Última unidad!' : `¡Últimas ${totalStock} unidades!`}
                    </span>
                ) : null}

                <a
                    href={whatsappUrl}
                    className="card-cta"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <MessageCircle size={16} strokeWidth={2} aria-hidden="true" />
                    {isSoldOut ? 'Consultar' : 'Lo quiero'}
                </a>
            </div>
        </article>
    );
}
