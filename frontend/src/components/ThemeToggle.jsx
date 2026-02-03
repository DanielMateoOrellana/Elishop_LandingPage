import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sparkles } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isPink = theme === 'pink';

    return (
        <button
            onClick={toggleTheme}
            className={`theme-toggle ${isPink ? 'pink' : 'dark'}`}
            title={`Cambiar a modo ${isPink ? 'Oscuro' : 'Pink'}`}
        >
            <div className="toggle-thumb">
                {isPink ? (
                    <Sparkles size={14} className="icon-pink" />
                ) : (
                    <Moon size={14} className="icon-dark" />
                )}
            </div>
            <span className="toggle-label">{isPink ? 'Pink Mode' : 'Dark Mode'}</span>

            <style jsx>{`
                .theme-toggle {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 6px 12px;
                    background: var(--admin-input-bg);
                    border: 1px solid var(--admin-border);
                    border-radius: 50px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    width: 100%;
                }

                .theme-toggle:hover {
                    border-color: var(--admin-accent);
                }

                .toggle-thumb {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--admin-bg);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .theme-toggle.pink .toggle-thumb {
                    background: #ff80ab;
                    transform: rotate(15deg);
                }

                .theme-toggle.dark .toggle-thumb {
                    background: #1e293b;
                }

                .icon-pink { color: white; }
                .icon-dark { color: #818cf8; }

                .toggle-label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--admin-text-muted);
                }
            `}</style>
        </button>
    );
};

export default ThemeToggle;
