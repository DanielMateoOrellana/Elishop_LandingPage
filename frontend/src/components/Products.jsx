import { useState, useEffect } from 'react';
import api from '../api';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';

const WHATSAPP_NUMBER = "593967074437";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [headerRef, headerVisible] = useScrollAnimation();
    const [gridRef, visibleItems] = useStaggeredAnimation(products.length, 80);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Traer productos activos
                const { data } = await api.get('/products?active=true&limit=12');
                // La API devuelve paginación { data: [], meta: ... }
                setProducts(data.data || []);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <section className="products" id="products">
            <div className="container">
                <div
                    className={`section-header ${headerVisible ? 'animate-visible' : ''}`}
                    ref={headerRef}
                >
                    <span className="section-tag">💎 Nuestros Productos</span>
                    <h2 className="section-title">
                        Catálogo <span className="gradient-text">Exclusivo</span>
                    </h2>
                    <p className="section-description">
                        Explora nuestra colección de joyería y accesorios seleccionados
                    </p>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Cargando catálogo...</p>
                    </div>
                ) : (
                    <div className="products-grid" ref={gridRef}>
                        {products.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                visible={visibleItems.includes(index)}
                            />
                        ))}
                        {products.length === 0 && (
                            <div className="empty-catalog">
                                <p>Próximamente agregaremos nuevos productos ✨</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .loading-container, .empty-catalog {
                    text-align: center;
                    padding: 4rem;
                    color: #fff;
                    font-size: 1.1rem;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(236, 72, 153, 0.3);
                    border-top-color: #ec4899;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </section>
    );
}

function ProductCard({ product, visible }) {
    // Obtener imagen principal o placeholder
    const imageUrl = product.images?.[0]?.url || 'https://placehold.co/400x400/1e1e1e/white?text=Sin+Imagen';

    // Crear mensaje de WhatsApp
    const message = `Hola! Me interesa el producto: ${product.name} (Precio: $${Number(product.price).toFixed(2)})`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // Calcular descuento
    const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
    const discountPercent = hasDiscount
        ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
        : 0;

    return (
        <div className={`product-card card-animate ${product.isFeatured ? 'featured' : ''} ${visible ? 'visible' : ''}`}>

            {/* Badges Overlay */}
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

            <div className="product-image">
                <img src={imageUrl} alt={product.name} loading="lazy" />
            </div>

            <div className="product-info">
                <span className="product-category">{product.category?.name || 'Joyería'}</span>
                <h3 className="product-name">{product.name}</h3>

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
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                
                .product-image img {
                    width: 100%;
                    height: 300px;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }

                .product-card:hover .product-image img {
                   transform: scale(1.05);
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

                .product-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1a1a2e;
                    margin-bottom: 1rem;
                    line-height: 1.3;
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .badges-overlay {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    align-items: flex-end;
                }
                .product-badge.discount {
                    background: #ef4444;
                    color: white;
                    font-weight: 800;
                    box-shadow: 0 2px 10px rgba(239, 68, 68, 0.4);
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                }
                .product-badge.star { 
                    background: linear-gradient(135deg, #ffd700, #ffb700); 
                    color: #000; 
                    font-weight: bold; 
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                }

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
                    font-size: 1.5rem;
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
                    transition: all 0.2s;
                    box-shadow: 0 4px 10px rgba(236, 72, 153, 0.3);
                }
                
                .product-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(236, 72, 153, 0.4);
                }
            `}</style>
        </div>
    );
}
