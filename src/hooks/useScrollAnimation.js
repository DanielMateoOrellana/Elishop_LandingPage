import { useEffect, useRef, useState } from 'react';

export function useScrollAnimation(options = {}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Una vez visible, dejamos de observar para que la animación no se repita
                    if (ref.current) {
                        observer.unobserve(ref.current);
                    }
                }
            },
            {
                threshold: options.threshold || 0.1,
                rootMargin: options.rootMargin || '0px 0px -50px 0px'
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [options.threshold, options.rootMargin]);

    return [ref, isVisible];
}

export function useStaggeredAnimation(itemCount, baseDelay = 100) {
    const [visibleItems, setVisibleItems] = useState([]);
    const containerRef = useRef(null);
    const hasTriggered = useRef(false);

    useEffect(() => {
        // Función para mostrar todos los items
        const showAllItems = () => {
            if (hasTriggered.current) return;
            hasTriggered.current = true;

            for (let i = 0; i < itemCount; i++) {
                setTimeout(() => {
                    setVisibleItems(prev => [...prev, i]);
                }, i * baseDelay);
            }
        };

        // Fallback: si después de 1 segundo no se ha disparado, mostrar todo
        // Esto garantiza que en móviles el contenido siempre se muestre
        const fallbackTimer = setTimeout(() => {
            if (!hasTriggered.current) {
                showAllItems();
            }
        }, 1000);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    showAllItems();
                    if (containerRef.current) {
                        observer.unobserve(containerRef.current);
                    }
                }
            },
            {
                threshold: 0.01, // Threshold más bajo para móviles
                rootMargin: '50px 0px' // Detectar antes de que entre al viewport
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            clearTimeout(fallbackTimer);
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, [itemCount, baseDelay]);

    return [containerRef, visibleItems];
}
