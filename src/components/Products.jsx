import { products, WHATSAPP_NUMBER } from '../data/products';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';

export default function Products() {
    const [headerRef, headerVisible] = useScrollAnimation();
    const [gridRef, visibleItems] = useStaggeredAnimation(products.length, 80);

    return (
        <section className="products" id="products">
            <div className="container">
                <div
                    className={`section-header ${headerVisible ? 'animate-visible' : ''}`}
                    ref={headerRef}
                >
                    <span className="section-tag">💎 Nuestros Productos</span>
                    <h2 className="section-title">
                        Catálogo <span className="gradient-text">2026</span>
                    </h2>
                    <p className="section-description">
                        Explora nuestra colección exclusiva de joyería y accesorios
                    </p>
                </div>

                <div className="products-grid" ref={gridRef}>
                    {products.map((product, index) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            visible={visibleItems.includes(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProductCard({ product, visible }) {
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(product.whatsappMessage)}`;

    return (
        <div className={`product-card card-animate ${product.featured ? 'featured' : ''} ${visible ? 'visible' : ''}`}>
            {product.badge && (
                <div className={`product-badge ${product.badgeClass}`}>
                    {product.badge}
                </div>
            )}
            <div className="product-image">
                <img src={product.image} alt={product.name} />
            </div>
            <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <a
                    href={whatsappUrl}
                    className="product-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Consultar Precio
                </a>
            </div>
        </div>
    );
}
