import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, Truck } from 'lucide-react';
import api from '../api';
import {
    products as fallbackProducts,
    categories as fallbackCategories,
    WHATSAPP_NUMBER,
} from '../data/products';
import '../styles/catalog.css';

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/f6eef1/a59a9e?text=Sin+Imagen';
// Tiempo máximo mostrando skeletons antes de enseñar el catálogo local mientras responde la API
const SKELETON_TIMEOUT_MS = 2500;
const SKELETON_COUNT = 8;
const LOW_STOCK_THRESHOLD = 3;
const MAX_STAGGER_ITEMS = 12;

function slugify(value) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
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

function getTotalStock(product) {
    return (product.inventory?.stockZaruma || 0) + (product.inventory?.stockSangolqui || 0);
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
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [dataSource, setDataSource] = useState('fallback');

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
                    setDataSource('live');
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
                    setShowSkeleton(false);
                }
            }
        };

        fetchData();
        const skeletonTimeoutId = window.setTimeout(() => setShowSkeleton(false), SKELETON_TIMEOUT_MS);

        return () => {
            isMounted = false;
            window.clearTimeout(skeletonTimeoutId);
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
    const gridKey = `${dataSource}-${selectedCategory ?? 'all'}-${sortBy}`;

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

            <CategoryFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
            />

            <div className="catalog-toolbar">
                <p className="catalog-count">
                    {showSkeleton ? (
                        'Cargando productos…'
                    ) : (
                        <>
                            <strong>{displayedProducts.length}</strong>{' '}
                            {displayedProducts.length === 1 ? 'producto' : 'productos'}
                        </>
                    )}
                    {!showSkeleton && isSyncing ? <span className="catalog-sync">Actualizando</span> : null}
                </p>

                <label className="sort-control">
                    <span>Ordenar por</span>
                    <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                        <option value="price-asc">Precio más bajo</option>
                        <option value="price-desc">Precio más alto</option>
                    </select>
                </label>
            </div>

            <div className="products-list-shell">
                {showSkeleton ? (
                    <div className="catalog-grid" aria-busy="true">
                        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                            <SkeletonCard key={index} />
                        ))}
                    </div>
                ) : displayedProducts.length > 0 ? (
                    <div className="catalog-grid" key={gridKey}>
                        {displayedProducts.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                staggerIndex={Math.min(index, MAX_STAGGER_ITEMS)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-catalog">
                        <p>No hay productos para ese filtro.</p>
                    </div>
                )}
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

function SkeletonCard() {
    return (
        <div className="catalog-card skeleton-card" aria-hidden="true">
            <div className="card-media" />
            <div className="card-body">
                <span className="skeleton-line is-short" />
                <span className="skeleton-line is-title" />
                <span className="skeleton-line is-price" />
                <span className="skeleton-line is-button" />
            </div>
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
