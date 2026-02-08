import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api';
import { Save, Video, Link as LinkIcon, ExternalLink } from 'lucide-react';

export default function TikTokManager() {
    const [videos, setVideos] = useState(['', '', '', '', '']);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const { data } = await api.get('/tiktok');
            // data es array de objetos { url, sortOrder, ... }

            if (data && data.length > 0) {
                const urls = Array(5).fill('');
                data.forEach((v, i) => {
                    if (i < 5) urls[i] = v.url;
                });
                setVideos(urls);
            } else {
                // Si no hay videos en BD, usar los por defecto para facilitar
                setVideos([
                    "https://www.tiktok.com/@elis_shop.ec/video/7604520250343902482",
                    "https://www.tiktok.com/@elis_shop.ec/video/7604517668057632007",
                    "https://www.tiktok.com/@elis_shop.ec/video/7604508393847524626",
                    "https://www.tiktok.com/@elis_shop.ec/video/7604503947918789895",
                    "https://www.tiktok.com/@elis_shop.ec/photo/7604257014038088968",
                ]);
            }

        } catch (error) {
            console.error("Error fetching tiktoks", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (index, value) => {
        const newVideos = [...videos];
        newVideos[index] = value;
        setVideos(newVideos);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/tiktok', { videos });
            toast.success('Enlaces de TikTok actualizados');
            fetchVideos();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar cambios');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="tiktok-manager-page">
            <div className="page-header">
                <div>
                    <h1>Administrar TikToks</h1>
                    <p>Gestiona los videos que aparecen en el carrusel de la página principal.</p>
                </div>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <Video className="icon" size={24} />
                    <h3>Enlaces de Video</h3>
                </div>

                <div className="inputs-grid">
                    {videos.map((url, index) => (
                        <div key={index} className="input-group">
                            <label>
                                Video #{index + 1}
                                {url && (
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="preview-link" title="Ver video">
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </label>
                            <div className="input-wrapper">
                                <LinkIcon size={18} className="input-icon" />
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    placeholder="https://www.tiktok.com/@usuario/video/..."
                                    disabled={loading || saving}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card-footer">
                    <button
                        onClick={handleSave}
                        disabled={loading || saving}
                        className="save-btn"
                    >
                        <Save size={20} />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            <style>{`
                .tiktok-manager-page {
                    padding: 2rem;
                    max-width: 800px;
                    margin: 0 auto;
                    font-family: var(--font-body);
                    color: var(--admin-text-main);
                }

                .page-header { margin-bottom: 2.5rem; }
                .page-header h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem; letter-spacing: -0.5px; }
                .page-header p { color: var(--admin-text-muted); font-size: 1.1rem; }

                .content-card {
                    background: var(--admin-card-bg);
                    border: 1px solid var(--admin-border);
                    border-radius: 1.5rem;
                    padding: 2rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--admin-border); }
                .card-header h3 { margin: 0; font-size: 1.25rem; font-weight: 600; }
                .card-header .icon { color: #ec4899; } /* TikTok like pink */

                .inputs-grid { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2.5rem; }

                .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .input-group label { font-size: 0.9rem; font-weight: 600; color: var(--admin-text-muted); display: flex; align-items: center; gap: 0.5rem; }
                .preview-link { color: #60a5fa; transition: color 0.2s; }
                .preview-link:hover { color: #3b82f6; }

                .input-wrapper { position: relative; }
                .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--admin-text-muted); pointer-events: none; }
                
                .input-wrapper input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 3rem;
                    background: rgba(255, 255, 255, 0.05); /* Ligeramente visible en fondo oscuro */
                    border: 1px solid var(--admin-border);
                    border-radius: 0.75rem;
                    color: var(--admin-text-main);
                    font-size: 1rem;
                    transition: all 0.2s;
                }
                
                /* Ajuste para fondo claro */
                [data-theme='light'] .input-wrapper input {
                     background: #f9fafb;
                }

                .input-wrapper input:focus {
                    outline: none;
                    border-color: #ec4899;
                    background: rgba(236, 72, 153, 0.05);
                    box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.1);
                }
                
                .input-wrapper input:disabled { opacity: 0.6; cursor: not-allowed; }

                .card-footer { display: flex; justify-content: flex-end; padding-top: 1rem; }

                .save-btn {
                    display: flex; align-items: center; gap: 0.75rem;
                    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
                    color: white;
                    border: none;
                    padding: 0.875rem 2rem;
                    border-radius: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
                }

                .save-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(236, 72, 153, 0.4);
                }

                .save-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
                
                /* Responsive */
                @media (max-width: 640px) {
                    .tiktok-manager-page { padding: 1rem; }
                    .content-card { padding: 1.5rem; }
                }
            `}</style>
        </div>
    );
}
