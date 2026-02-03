import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Leemos del localStorage o usamos 'dark' por defecto
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('admin-theme') || 'dark';
    });

    useEffect(() => {
        // Guardamos en localStorage
        localStorage.setItem('admin-theme', theme);
        // Aplicamos el atributo al body para que el CSS sepa qué tema usar
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'pink' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
