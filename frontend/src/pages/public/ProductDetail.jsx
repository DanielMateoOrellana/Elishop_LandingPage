import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import { WHATSAPP_NUMBER } from '../../data/products';
import '../../styles/product-detail.css';
import {
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    ArrowLeft,
    MapPin,
    Truck
} from 'lucide-react';

const LOW_STOCK_THRESHOLD = 3;

const ProductDetail = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        fetchProduct();
        window.scrollTo(0, 0);
    }, [slug]);

    const fetchProduct = async () => {
        try {
            const { data } = await api.get(`/products/slug/${slug}`);
            setProduct(data);
            // Pre-select location if only one has stock
            const zStock = data.inventory?.stockZaruma || 0;
            const sStock = data.inventory?.stockSangolqui || 0;
            if (zStock > 0 && sStock === 0) setSelectedLocation('Zaruma');
            else if (sStock > 0 && zStock === 0) setSelectedLocation('Sangolqui');
        } catch (error) {
            console.error('Error loading product:', error);
        } finally {
            setLoading(false);
        }
    };

    // Carrusel Infinito (Circular Doubly Linked List Logic)
    const nextImage = () => {
        if (!product?.images?.length) return;
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    };

    const prevImage = () => {
        if (!product?.images?.length) return;
        setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    };

    const handleWhatsApp = () => {
        if (!product) return;

        if (!selectedLocation) {
            toast.error('Selecciona una ubicación de envío (Zaruma o Sangolquí)');
            return;
        }

        const locationName = selectedLocation === 'Sangolqui' ? 'Sangolquí' : selectedLocation;
        const productUrl = `${window.location.origin}/producto/${product.slug}`;
        const message = `Hola, me interesa comprar: *${product.name}* \nPrecio: $${product.price} \nCantidad: ${quantity} \nDesde Bodega: *${locationName}*\n🔗 Ver producto: ${productUrl}`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="product-detail-page">
                <DetailNav />
                <div className="detail-container" aria-busy="true">
                    <div className="detail-skeleton-media" />
                    <div className="detail-skeleton-info">
                        <span className="detail-skeleton-line is-short" />
                        <span className="detail-skeleton-line is-title" />
                        <span className="detail-skeleton-line is-title is-second" />
                        <span className="detail-skeleton-line is-price" />
                        <span className="detail-skeleton-line" />
                        <span className="detail-skeleton-line" />
                        <span className="detail-skeleton-line is-button" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <DetailNav />
                <div className="detail-empty">
                    <h1>Producto no encontrado</h1>
                    <p>Es posible que ya no esté disponible.</p>
                    <Link to="/" className="detail-empty-link">Volver al catálogo</Link>
                </div>
            </div>
        );
    }

    const images = product.images?.length ? product.images : [{ url: '/placeholder.png' }];
    const hasMultipleImages = images.length > 1;

    // Inventory Logic
    const stockZaruma = product.inventory?.stockZaruma || 0;
    const stockSangolqui = product.inventory?.stockSangolqui || 0;

    const currentMaxStock = selectedLocation === 'Zaruma' ? stockZaruma
        : selectedLocation === 'Sangolqui' ? stockSangolqui
            : 0;

    const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);

    const handleQuantityChange = (increment) => {
        setQuantity(prev => {
            const newValue = prev + increment;
            return Math.max(1, Math.min(newValue, currentMaxStock));
        });
    };

    const selectLocation = (location, stock) => {
        if (stock > 0) {
            setSelectedLocation(location);
            setQuantity(1);
        }
    };

    const renderStock = (stock) => {
        if (stock === 0) return 'Agotado';
        if (stock <= LOW_STOCK_THRESHOLD) return `Últimas ${stock} unid.`;
        return `${stock} unid. disponibles`;
    };

    return (
        <div className="product-detail-page">
            <DetailNav />

            <div className="detail-container">
                {/* Visualizador de Imágenes */}
                <div className="product-gallery">
                    <div className="main-image-container">
                        {hasMultipleImages && (
                            <button type="button" onClick={prevImage} className="gallery-nav prev" aria-label="Imagen anterior">
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        <div className="image-viewport">
                            <img
                                src={images[currentImageIndex].url}
                                alt={product.name}
                                className="main-image"
                                key={currentImageIndex} // Key forces re-render for animation
                            />
                        </div>

                        {hasMultipleImages && (
                            <button type="button" onClick={nextImage} className="gallery-nav next" aria-label="Imagen siguiente">
                                <ChevronRight size={24} />
                            </button>
                        )}

                        {hasMultipleImages && (
                            <div className="image-counter">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        )}
                    </div>

                    {hasMultipleImages && (
                        <div className="thumbnails-scroll">
                            {images.map((img, idx) => (
                                <button
                                    type="button"
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`thumb-btn ${currentImageIndex === idx ? 'active' : ''}`}
                                    aria-label={`Ver imagen ${idx + 1}`}
                                >
                                    <img src={img.url} alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Información del Producto */}
                <div className="product-info-panel">
                    <div className="info-header">
                        <span className="category-badge">{product.category?.name || 'General'}</span>
                        {product.isNew && <span className="new-badge">Nuevo</span>}
                    </div>

                    <h1 className="product-title">{product.name}</h1>

                    <div className="detail-price-block">
                        <span className="current-price">${Number(product.price).toFixed(2)}</span>
                        {hasDiscount && (
                            <span className="original-price">${Number(product.compareAtPrice).toFixed(2)}</span>
                        )}
                    </div>

                    <p className="description">
                        {product.description || 'Sin descripción disponible para este producto.'}
                    </p>

                    {/* Selector de Ubicación */}
                    <div className="location-selector">
                        <p className="selector-label">Selecciona ubicación de envío</p>
                        <div className="locations-grid">
                            <button
                                type="button"
                                className={`location-card ${selectedLocation === 'Zaruma' ? 'selected' : ''}`}
                                onClick={() => selectLocation('Zaruma', stockZaruma)}
                                disabled={stockZaruma === 0}
                                aria-pressed={selectedLocation === 'Zaruma'}
                            >
                                <MapPin size={18} className="loc-icon" />
                                <div className="loc-info">
                                    <span className="loc-name">Zaruma</span>
                                    <span className="loc-stock">{renderStock(stockZaruma)}</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                className={`location-card ${selectedLocation === 'Sangolqui' ? 'selected' : ''}`}
                                onClick={() => selectLocation('Sangolqui', stockSangolqui)}
                                disabled={stockSangolqui === 0}
                                aria-pressed={selectedLocation === 'Sangolqui'}
                            >
                                <MapPin size={18} className="loc-icon" />
                                <div className="loc-info">
                                    <span className="loc-name">Sangolquí</span>
                                    <span className="loc-stock">{renderStock(stockSangolqui)}</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="actions-block">
                        <div className={`quantity-selector ${!selectedLocation ? 'disabled' : ''}`}>
                            <button type="button" onClick={() => handleQuantityChange(-1)} disabled={!selectedLocation || quantity <= 1} aria-label="Disminuir cantidad">−</button>
                            <span>{quantity}</span>
                            <button type="button" onClick={() => handleQuantityChange(1)} disabled={!selectedLocation || quantity >= currentMaxStock} aria-label="Aumentar cantidad">+</button>
                        </div>

                        <button
                            type="button"
                            onClick={handleWhatsApp}
                            className="whatsapp-btn"
                            disabled={!selectedLocation}
                        >
                            <MessageCircle size={20} />
                            {selectedLocation ? 'Comprar por WhatsApp' : 'Elige una ubicación'}
                        </button>
                    </div>

                    <ul className="detail-perks">
                        <li><Truck size={16} strokeWidth={1.75} /> Envíos a todo Ecuador</li>
                        <li><MessageCircle size={16} strokeWidth={1.75} /> Te confirmamos tu pedido por WhatsApp</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

function DetailNav() {
    return (
        <nav className="detail-nav">
            <Link to="/" className="back-link">
                <ArrowLeft size={18} /> Volver a la tienda
            </Link>
        </nav>
    );
}

export default ProductDetail;
