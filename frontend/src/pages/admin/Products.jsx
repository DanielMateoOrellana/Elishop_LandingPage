import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api';
import { Package, Plus, Pencil, Trash2, X, Save, Search, Image as ImageIcon, Tag, UploadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductsPage = () => {
    // List State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchParams] = useSearchParams();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        price: '',
        compareAtPrice: '',
        categoryId: '',
        stockZaruma: 0,
        stockSangolqui: 0,
        minStock: 5,
        images: [{ url: '' }],
        isActive: true,
        isFeatured: false
    });

    useEffect(() => {
        fetchData();
        if (searchParams.get('action') === 'new') {
            handleOpenModal();
        }
    }, [searchParams]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            setProducts(productsRes.data.data || []);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (text) => {
        return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    };

    const handleOpenModal = async (product = null) => {
        if (product) {
            try {
                // Fetch full product details to get all images
                const { data } = await api.get(`/products/${product.id}`);
                setEditingProduct(data);
                setFormData({
                    name: data.name,
                    slug: data.slug,
                    description: data.description || '',
                    price: data.price,
                    compareAtPrice: data.compareAtPrice || '',
                    categoryId: data.categoryId,
                    stockZaruma: data.inventory?.stockZaruma || 0,
                    stockSangolqui: data.inventory?.stockSangolqui || 0,
                    minStock: data.inventory?.minStock || 5,
                    images: data.images && data.images.length > 0 ? data.images : [{ url: '' }],
                    isActive: data.isActive,
                    isFeatured: data.isFeatured
                });
            } catch (error) {
                console.error("Error fetching product details", error);
                toast.error("Error al cargar detalles del producto");
                return;
            }
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                slug: '',
                description: '',
                price: '',
                compareAtPrice: '',
                categoryId: categories[0]?.id || '',
                stockZaruma: 0,
                stockSangolqui: 0,
                minStock: 5,
                images: [{ url: '' }],
                isActive: true,
                isFeatured: false
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar producto? Esta acción no se puede deshacer.')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Producto eliminado');
            fetchData();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.categoryId) {
            toast.error('Debes seleccionar una categoría');
            return;
        }

        try {
            const payload = {
                name: formData.name,
                slug: formData.slug || generateSlug(formData.name),
                description: formData.description,
                price: parseFloat(formData.price),
                compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
                categoryId: formData.categoryId,
                stockZaruma: parseInt(formData.stockZaruma),
                stockSangolqui: parseInt(formData.stockSangolqui),
                minStock: parseInt(formData.minStock),
                stockSangolqui: parseInt(formData.stockSangolqui),
                minStock: parseInt(formData.minStock),
                images: formData.images
                    .filter(img => img.url.trim() !== '')
                    .map(img => ({
                        url: img.url,
                        alt: img.alt,
                        sortOrder: img.sortOrder
                    })),
                isActive: formData.isActive,
                isFeatured: formData.isFeatured
            };

            if (editingProduct) {
                await api.patch(`/products/${editingProduct.id}`, payload);
                toast.success('Producto actualizado');
            } else {
                await api.post('/products', payload);
                toast.success('Producto creado');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error desconocido';
            if (msg.toString().includes('Unique constraint') || msg.toString().includes('slug')) {
                toast.error('Ya existe un producto con este nombre URL (slug). Intenta con otro.');
            } else {
                toast.error(Array.isArray(msg) ? msg[0] : 'Error al guardar');
            }
        }
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index].url = value;
        setFormData({ ...formData, images: newImages });
    };

    const handleFileUpload = async (index, file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const toastId = toast.loading('Subiendo imagen...');
        try {
            const { data } = await api.post('/uploads/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            handleImageChange(index, data.url);
            toast.success('Imagen subida', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Error al subir imagen', { id: toastId });
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="products-page">
            <div className="page-header">
                <div>
                    <h1>Productos</h1>
                    <p>Gestiona tu catálogo completo</p>
                </div>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={20} /> Nuevo Producto
                </button>
            </div>

            <div className="filters-bar">
                <div className="search-box">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div> Cargando productos...
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id}>
                                    <td className="product-cell">
                                        <div className="product-thumb">
                                            {product.images?.[0]?.url ? (
                                                <img src={product.images[0].url} alt={product.name} />
                                            ) : (
                                                <Package size={20} />
                                            )}
                                        </div>
                                        <span className="product-name">{product.name}</span>
                                    </td>
                                    <td>
                                        <span className="category-tag">
                                            {product.category?.name || 'Sin Categoría'}
                                        </span>
                                    </td>
                                    <td className="font-mono text-pink-400">${Number(product.price).toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                                            {product.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            <button onClick={() => handleOpenModal(product)} className="btn-icon edit" title="Editar">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(product.id)} className="btn-icon delete" title="Eliminar">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="empty-state">No se encontraron productos</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content medium">
                        <div className="modal-header">
                            <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="close-btn"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-scroll-area">
                                <div className="images-section">
                                    <label className="section-label">Imágenes (Máx. 5)</label>
                                    <div className="images-grid">
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="image-slot">
                                                <label className="image-preview-box">
                                                    {img.url ? (
                                                        <>
                                                            <img src={img.url} alt={`Preview ${index}`} />
                                                            <button
                                                                type="button"
                                                                className="remove-img-btn"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    const newImages = formData.images.filter((_, i) => i !== index);
                                                                    setFormData({ ...formData, images: newImages });
                                                                }}
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="placeholder">
                                                            <UploadCloud size={24} />
                                                            <span>Subir</span>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(index, e.target.files[0])}
                                                    />
                                                </label>
                                            </div>
                                        ))}

                                        {formData.images.length < 5 && (
                                            <button
                                                type="button"
                                                className="add-image-btn"
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    images: [...formData.images, { url: '' }]
                                                })}
                                            >
                                                <Plus size={24} />
                                                <span>Agregar</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group span-2">
                                        <label>Nombre del Producto</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Anillo de Plata"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="input-lg"
                                        />
                                    </div>

                                    <div className="form-group span-2">
                                        <label>Categoría</label>
                                        <select
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            required
                                        >
                                            <option value="">Seleccionar Categoría...</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group span-2">
                                        <label>Descripción</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Detalles del producto..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="input-area"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Precio Original</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Opcional"
                                            value={formData.compareAtPrice}
                                            onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Precio Oferta *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Stock Zaruma</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.stockZaruma}
                                            onChange={(e) => setFormData({ ...formData, stockZaruma: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Stock Sangolquí</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.stockSangolqui}
                                            onChange={(e) => setFormData({ ...formData, stockSangolqui: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    <Save size={20} /> Guardar Producto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .products-page {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .page-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--admin-border); padding-bottom: 1rem; }
                .page-header h1 { font-size: 1.75rem; color: var(--admin-text-main); font-weight: 700; margin: 0; }
                .page-header p { color: var(--admin-text-muted); margin: 0.25rem 0 0 0; font-size: 0.9rem; }
                .btn-primary { background: var(--admin-accent-gradient); color: white; padding: 0.75rem 1.25rem; border-radius: 0.75rem; border: none; font-weight: 600; display: flex; gap: 0.5rem; align-items: center; cursor: pointer; }
                .filters-bar { background: var(--admin-card-bg); padding: 1rem; border-radius: 1rem; border: 1px solid var(--admin-border); }
                .search-box { position: relative; max-width: 400px; }
                .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--admin-text-muted); }
                .search-box input { width: 100%; background: var(--admin-input-bg); border: 1px solid var(--admin-border); padding: 0.75rem 1rem 0.75rem 3rem; border-radius: 0.75rem; color: var(--admin-text-main); }
                .table-container { background: var(--admin-card-bg); border-radius: 1rem; border: 1px solid var(--admin-border); overflow-x: auto; }
                .data-table { width: 100%; border-collapse: collapse; color: var(--admin-text-muted); }
                .data-table th { background: var(--admin-card-header); padding: 1rem; text-align: left; font-weight: 600; color: var(--admin-text-muted); border-bottom: 1px solid var(--admin-border); font-size: 0.85rem; text-transform: uppercase; white-space: nowrap; }
                .data-table td { padding: 1rem; border-bottom: 1px solid var(--admin-border); vertical-align: middle; white-space: nowrap; color: var(--admin-text-main); }
                
                .product-cell { display: flex; align-items: center; gap: 1rem; }
                .product-thumb { width: 40px; height: 40px; background: var(--admin-border); border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
                .product-thumb img { width: 100%; height: 100%; object-fit: cover; }
                .product-name { font-weight: 600; color: var(--admin-text-main); font-family: var(--font-body); }

                .category-tag { background: var(--admin-border); padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; color: var(--admin-text-muted); }
                .status-badge { padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
                .status-badge.active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-badge.inactive { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                
                .row-actions { display: flex; gap: 0.5rem; }
                .btn-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s ease; }
                .btn-icon.edit { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
                .btn-icon.edit:hover { background: #0ea5e9; color: white; border-color: #0ea5e9; box-shadow: 0 0 12px rgba(14, 165, 233, 0.5); transform: translateY(-2px); }
                .btn-icon.delete { background: rgba(248, 113, 113, 0.15); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3); }
                .btn-icon.delete:hover { background: #ef4444; color: white; border-color: #ef4444; box-shadow: 0 0 12px rgba(239, 68, 68, 0.5); transform: translateY(-2px); }

                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); z-index: 100; display: flex; justify-content: center; align-items: center; padding: 1rem; }
                .modal-content.medium { background: var(--admin-card-bg); width: 100%; max-width: 500px; border-radius: 1.5rem; border: 1px solid var(--admin-border); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.5); color: var(--admin-text-main); max-height: 90vh; }
                .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--admin-border); display: flex; justify-content: space-between; align-items: center; background: var(--admin-card-header); flex-shrink: 0; }
                .modal-header h2 { margin: 0; color: var(--admin-text-main); font-size: 1.25rem; }
                .close-btn { background: none; border: none; color: var(--admin-text-muted); cursor: pointer; }
                .modal-form { padding: 0; display: flex; flex-direction: column; flex: 1; min-height: 0; }
                .form-scroll-area { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
                .modal-actions { padding: 1.25rem 1.5rem; border-top: 1px solid #334155; background: #1e293b; display: flex; justify-content: flex-end; gap: 1rem; flex-shrink: 0; }
                .images-section { display: flex; flex-direction: column; gap: 0.5rem; }
                .section-label { color: var(--admin-text-muted); font-size: 0.85rem; font-weight: 500; }
                .images-grid { display: flex; gap: 1rem; flex-wrap: wrap; }
                
                .image-slot { width: 100px; height: 100px; position: relative; }
                .image-preview-box { 
                    width: 100%; height: 100%; 
                    background: var(--admin-input-bg); 
                    border: 2px dashed var(--admin-border); 
                    border-radius: 0.75rem; 
                    display: flex; align-items: center; justify-content: center; 
                    overflow: hidden; cursor: pointer; position: relative;
                    transition: all 0.2s;
                }
                .image-preview-box:hover { border-color: var(--admin-accent); background: var(--admin-hover); }
                .image-preview-box img { width: 100%; height: 100%; object-fit: cover; }
                
                .placeholder { display: flex; flex-direction: column; align-items: center; color: var(--admin-text-muted); font-size: 0.75rem; gap: 0.25rem; }
                
                .remove-img-btn {
                    position: absolute; top: 4px; right: 4px;
                    background: rgba(0,0,0,0.6); color: white;
                    border: none; border-radius: 50%; width: 20px; height: 20px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; z-index: 10;
                }
                .remove-img-btn:hover { background: #ef4444; }

                .add-image-btn {
                    width: 100px; height: 100px; 
                    background: transparent; border: 2px dashed var(--admin-border);
                    border-radius: 0.75rem; display: flex; flex-direction: column;
                    align-items: center; justify-content: center; gap: 0.25rem;
                    color: var(--admin-text-muted); font-size: 0.75rem; cursor: pointer;
                    transition: all 0.2s;
                }
                .add-image-btn:hover { border-color: var(--admin-accent); color: var(--admin-accent); background: var(--admin-hover); }

                .hidden { display: none; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .span-2 { grid-column: span 2; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label { color: var(--admin-text-muted); font-size: 0.85rem; font-weight: 500; }
                .form-group input, .form-group select, textarea { background: var(--admin-input-bg); border: 1px solid var(--admin-border); padding: 0.75rem; border-radius: 0.75rem; color: var(--admin-text-main); font-size: 0.95rem; transition: border-color 0.2s; width: 100%; box-sizing: border-box; }
                .form-group input:focus, .form-group select:focus, textarea:focus { outline: none; border-color: var(--admin-accent); }
                .input-lg { font-size: 1.1rem; padding: 0.85rem; }
                .btn-secondary { background: transparent; border: 1px solid var(--admin-border); color: var(--admin-text-muted); padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; cursor: pointer; }
                .loading-state, .empty-state { padding: 3rem; text-align: center; color: var(--admin-text-muted); }
                .spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid rgba(236,72,153, 0.3); border-top-color: #ec4899; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 0.5rem; vertical-align: middle; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 640px) { .products-page { padding: 1rem; } .form-grid { grid-template-columns: 1fr; } .span-2 { grid-column: span 1; } }
            `}</style>
        </div>
    );
};

export default ProductsPage;
