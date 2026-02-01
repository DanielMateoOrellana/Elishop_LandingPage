import { testimonials } from '../data/products';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';

export default function Testimonials() {
    const [headerRef, headerVisible] = useScrollAnimation();
    const [sliderRef, visibleItems] = useStaggeredAnimation(testimonials.length, 150);

    return (
        <section className="testimonials" id="testimonials">
            <div className="container">
                <div
                    className={`section-header ${headerVisible ? 'animate-visible' : ''}`}
                    ref={headerRef}
                >
                    <span className="section-tag">💬 Lo Que Dicen</span>
                    <h2 className="section-title">
                        Nuestros <span className="gradient-text">Clientes Felices</span>
                    </h2>
                </div>

                <div className="testimonials-slider" ref={sliderRef}>
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={testimonial.id}
                            testimonial={testimonial}
                            visible={visibleItems.includes(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function TestimonialCard({ testimonial, visible }) {
    return (
        <div className={`testimonial-card animate-bounce-in ${visible ? 'visible' : ''}`}>
            <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">"{testimonial.text}"</p>
            <div className="testimonial-author">
                <div className="author-avatar">{testimonial.avatar}</div>
                <div className="author-info">
                    <span className="author-name">{testimonial.name}</span>
                    <span className="author-location">{testimonial.location}</span>
                </div>
            </div>
        </div>
    );
}
