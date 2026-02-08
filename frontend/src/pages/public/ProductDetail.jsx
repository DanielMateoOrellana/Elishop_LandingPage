import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import {
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    MessageCircle,
    ArrowLeft,
    Package,
    ShieldCheck,
    Truck
} from 'lucide-react';

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
            alert("Por favor selecciona una ubicación de envío (Zaruma o Sangolquí)");
            return;
        }

        const phone = "593967074437";
        const locationName = selectedLocation === 'Sangolqui' ? 'Sangolquí' : selectedLocation;
        const message = `Hola, me interesa comprar: *${product.name}* \nPrecio: $${product.price} \nCantidad: ${quantity} \nDesde Bodega: *${locationName}*`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (loading) return <div className="loading-screen">Cargando detalles...</div>;
    if (!product) return <div className="error-screen">Producto no encontrado <Link to="/" className="btn-link">Volver al inicio</Link></div>;

    const images = product.images?.length ? product.images : [{ url: '/placeholder.png' }];

    // Inventory Logic
    const stockZaruma = product.inventory?.stockZaruma || 0;
    const stockSangolqui = product.inventory?.stockSangolqui || 0;

    const currentMaxStock = selectedLocation === 'Zaruma' ? stockZaruma
        : selectedLocation === 'Sangolqui' ? stockSangolqui
            : 0;

    const handleQuantityChange = (increment) => {
        setQuantity(prev => {
            const newValue = prev + increment;
            return Math.max(1, Math.min(newValue, currentMaxStock));
        });
    };

    return (
        <div className="product-detail-page">
            <nav className="detail-nav">
                <Link to="/" className="back-link">
                    <ArrowLeft size={20} /> Volver a la tienda
                </Link>
            </nav>

            <div className="detail-container">
                {/* Visualizador de Imágenes Premium */}
                <div className="product-gallery">
                    <div className="main-image-container">
                        <button onClick={prevImage} className="nav-btn prev">
                            <ChevronLeft size={32} />
                        </button>

                        <div className="image-viewport">
                            <img
                                src={images[currentImageIndex].url}
                                alt={product.name}
                                className="main-image fade-in"
                                key={currentImageIndex} // Key forces re-render for animation
                            />
                        </div>

                        <button onClick={nextImage} className="nav-btn next">
                            <ChevronRight size={32} />
                        </button>

                        <div className="image-counter">
                            {currentImageIndex + 1} / {images.length}
                        </div>
                    </div>

                    <div className="thumbnails-scroll">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`thumb-btn ${currentImageIndex === idx ? 'active' : ''}`}
                            >
                                <img src={img.url} alt={`View ${idx}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Información del Producto */}
                <div className="product-info-panel">
                    <div className="info-header">
                        <span className="category-badge">{product.category?.name || 'General'}</span>
                        {product.isNew && <span className="new-badge">Nuevo</span>}
                    </div>

                    <h1 className="product-title">{product.name}</h1>

                    <div className="price-block">
                        <span className="current-price">${Number(product.price).toFixed(2)}</span>
                        {product.compareAtPrice && (
                            <span className="original-price">${Number(product.compareAtPrice).toFixed(2)}</span>
                        )}
                    </div>

                    <p className="description">
                        {product.description || 'Sin descripción disponible para este producto premium.'}
                    </p>

                    {/* Selector de Ubicación */}
                    <div className="location-selector">
                        <p className="selector-label">Selecciona ubicación de envío:</p>
                        <div className="locations-grid">
                            <button
                                className={`location-card ${selectedLocation === 'Zaruma' ? 'selected' : ''} ${stockZaruma === 0 ? 'disabled' : ''}`}
                                onClick={() => {
                                    if (stockZaruma > 0) {
                                        setSelectedLocation('Zaruma');
                                        setQuantity(1);
                                    }
                                }}
                                disabled={stockZaruma === 0}
                            >
                                <div className="loc-icon">📍</div>
                                <div className="loc-info">
                                    <span className="loc-name">Zaruma</span>
                                    <span className="loc-stock">{stockZaruma > 0 ? `${stockZaruma} unid.` : 'Agotado'}</span>
                                </div>
                            </button>

                            <button
                                className={`location-card ${selectedLocation === 'Sangolqui' ? 'selected' : ''} ${stockSangolqui === 0 ? 'disabled' : ''}`}
                                onClick={() => {
                                    if (stockSangolqui > 0) {
                                        setSelectedLocation('Sangolqui');
                                        setQuantity(1);
                                    }
                                }}
                                disabled={stockSangolqui === 0}
                            >
                                <div className="loc-icon">📍</div>
                                <div className="loc-info">
                                    <span className="loc-name">Sangolquí</span>
                                    <span className="loc-stock">{stockSangolqui > 0 ? `${stockSangolqui} unid.` : 'Agotado'}</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="actions-block">
                        <div className={`quantity-selector ${!selectedLocation ? 'disabled' : ''}`}>
                            <button onClick={() => handleQuantityChange(-1)} disabled={!selectedLocation || quantity <= 1}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => handleQuantityChange(1)} disabled={!selectedLocation || quantity >= currentMaxStock}>+</button>
                        </div>

                        <button
                            onClick={handleWhatsApp}
                            className="whatsapp-btn"
                            disabled={!selectedLocation}
                        >
                            <MessageCircle size={20} />
                            {selectedLocation ? 'Comprar por WhatsApp' : 'Elige una ubicación'}
                        </button>
                    </div>

                    <div className="features-grid">
                        <div className="feature-item">
                            <ShieldCheck size={20} className="icon" />
                            <div>
                                <h4>Garantía de Calidad</h4>
                                <p>Productos verificados</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <Truck size={20} className="icon" />
                            <div>
                                <h4>Envíos a todo el país</h4>
                                <p>Seguro y rápido</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .product-detail-page {
                    min-height: 100vh;
                    background: #f8f9fa;
                    font-family: var(--font-body);
                    padding-bottom: 4rem;
                }

                .detail-nav {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--gray);
                    font-weight: 500;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .back-link:hover { color: var(--primary); }

                .detail-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 4rem;
                    align-items: start;
                }

                /* Gallery Styles */
                .product-gallery {
                    position: sticky;
                    top: 2rem;
                }

                .main-image-container {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 1/1; /* Cuadrado perfecto o ajustar según preferencia */
                    background: white;
                    border-radius: 2rem;
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    mb: 1.5rem;
                }

                .image-viewport {
                    width: 100%;
                    height: 100%;
                    padding: 2rem; /* Espacio blanco alrededor */
                }

                .main-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    transition: transform 0.3s ease;
                }

                .fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                .nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(4px);
                    border: 1px solid rgba(0,0,0,0.05);
                    color: var(--black);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    z-index: 10;
                }
                .nav-btn:hover { background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-50%) scale(1.1); }
                .nav-btn.prev { left: 1rem; }
                .nav-btn.next { right: 1rem; }

                .image-counter {
                    position: absolute;
                    bottom: 1rem;
                    right: 1.5rem;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .thumbnails-scroll {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.5rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                }

                .thumb-btn {
                    width: 80px;
                    height: 80px;
                    border-radius: 1rem;
                    overflow: hidden;
                    border: 2px solid transparent;
                    cursor: pointer;
                    opacity: 0.6;
                    transition: all 0.2s;
                    flex-shrink: 0;
                    background: white;
                    padding: 4px;
                }
                .thumb-btn.active { border-color: var(--primary); opacity: 1; transform: translateY(-2px); }
                .thumb-btn img { width: 100%; height: 100%; object-fit: contain; border-radius: 0.6rem; }

                /* Info Panel Styles */
                .product-info-panel {
                    padding-top: 1rem;
                }

                .info-header { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
                .category-badge { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; color: var(--primary); font-weight: 700; background: rgba(233, 30, 99, 0.08); padding: 4px 12px; border-radius: 20px; }
                .new-badge { background: var(--secondary); color: white; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; }

                .product-title {
                    font-size: 2.5rem;
                    line-height: 1.1;
                    color: var(--black);
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    font-family: var(--font-display);
                }

                .price-block { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 2rem; }
                .current-price { font-size: 2rem; font-weight: 700; color: var(--primary); }
                .original-price { font-size: 1.25rem; text-decoration: line-through; color: var(--gray); font-weight: 500; }

                .description {
                    font-size: 1.05rem;
                    line-height: 1.7;
                    color: var(--gray);
                    margin-bottom: 2.5rem;
                }

                /* Location Selector Styles */
                .location-selector { margin-bottom: 2rem; }
                .selector-label { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--black); }
                .locations-grid { display: flex; gap: 1rem; }
                
                .location-card {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 0.75rem;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                }
                
                .location-card:hover:not(.disabled) { border-color: var(--primary); background: #fdf2f8; }
                .location-card.selected { border-color: var(--primary); background: #fdf2f8; ring: 2px solid var(--primary); }
                .location-card.disabled { opacity: 0.6; cursor: not-allowed; background: #f1f5f9; border-color: #cbd5e1; }
                
                .loc-info { display: flex; flex-direction: column; }
                .loc-name { font-weight: 600; font-size: 0.9rem; color: var(--black); }
                .loc-stock { font-size: 0.8rem; color: var(--gray); }
                .location-card.selected .loc-stock { color: var(--primary); font-weight: 500; }

                .actions-block {
                    display: grid;
                    grid-template-columns: 120px 1fr;
                    gap: 1rem;
                    margin-bottom: 3rem;
                }

                .quantity-selector {
                    display: flex; align-items: center; justify-content: space-between;
                    border: 2px solid #e2e8f0; border-radius: 1rem;
                    padding: 0 0.5rem; font-weight: 600;
                    transition: all 0.2s;
                }
                .quantity-selector.disabled { opacity: 0.5; background: #f1f5f9; cursor: not-allowed; }
                .quantity-selector button { width: 32px; height: 32px; border: none; background: transparent; cursor: pointer; color: var(--gray); font-size: 1.2rem; }
                .quantity-selector button:hover:not(:disabled) { color: var(--black); }
                .quantity-selector button:disabled { color: #cbd5e1; cursor: not-allowed; }

                .whatsapp-btn {
                    border: none;
                    background: #25D366;
                    color: white;
                    font-weight: 600;
                    font-size: 1.05rem;
                    border-radius: 1rem;
                    display: flex; align-items: center; justify-content: center; gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
                }
                .whatsapp-btn:hover:not(:disabled) { background: #22c35e; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(37, 211, 102, 0.4); }
                .whatsapp-btn:disabled { background: var(--gray); cursor: not-allowed; box-shadow: none; opacity: 0.7; }

                .features-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 2rem;
                }
                .feature-item { display: flex; gap: 1rem; align-items:  flex-start; }
                .feature-item .icon { color: var(--primary); margin-top: 2px; }
                .feature-item h4 { font-weight: 600; margin-bottom: 0.25rem; font-size: 0.95rem; }
                .feature-item p { font-size: 0.85rem; color: var(--gray); margin: 0; }

                @media (max-width: 900px) {
                    .detail-container { grid-template-columns: 1fr; gap: 2rem; }
                    .product-gallery { position: static; }
                    .product-title { font-size: 2rem; }
                    .actions-block { grid-template-columns: 1fr; }
                    .quantity-selector { padding: 0.75rem; }
                }

                .loading-screen, .error-screen { 
                    height: 60vh; display: flex; flex-direction: column; 
                    align-items: center; justify-content: center; gap: 1rem; 
                    color: var(--gray); font-weight: 500; 
                }
                .btn-link { color: var(--primary); text-decoration: underline; cursor: pointer; }
            `}</style>
        </div>
    );
};

export default ProductDetail;
