import { categories } from '../data/products';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';

export default function Categories() {
    const [headerRef, headerVisible] = useScrollAnimation();
    const [gridRef, visibleItems] = useStaggeredAnimation(categories.length, 100);

    return (
        <section className="categories" id="categories">
            <div className="container">
                <div
                    className={`section-header ${headerVisible ? 'animate-visible' : ''}`}
                    ref={headerRef}
                >
                    <span className="section-tag">📦 Explora por Categoría</span>
                    <h2 className="section-title">
                        Nuestras <span className="gradient-text">Colecciones</span>
                    </h2>
                </div>

                <div className="categories-grid" ref={gridRef}>
                    {categories.map((category, index) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            visible={visibleItems.includes(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function CategoryCard({ category, visible }) {
    return (
        <div
            className={`category-card animate-scale-in ${visible ? 'visible' : ''}`}
            style={{ '--accent-color': category.color }}
            onClick={() => {
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
            }}
        >
            <div className="category-icon">{category.icon}</div>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <span className="category-count">{category.count}</span>
        </div>
    );
}
