import { useState, useEffect } from 'react';
import api from '../../api';
import { Package, Plus, Pencil, Trash2, X, Save, Search, Image as ImageIcon, Tag, UploadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductsPage = () => {
    // List State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '', // Restaurado
        price: '',
        compareAtPrice: '', // New field for original price
        categoryId: '',
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
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            setProducts(productsRes.data.data || []); // Handle paginated response structure
            setCategories(categoriesRes.data); // Store categories for the select dropdown
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

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                slug: product.slug,
                description: product.description || '', // Cargar descripción
                price: product.price,
                compareAtPrice: product.compareAtPrice || '',
                categoryId: product.categoryId,
                // Inventory fields are usually not editable here directly, handled via inventory module
                // Inventory
                stockZaruma: product.inventory?.stockZaruma || 0,
                stockSangolqui: product.inventory?.stockSangolqui || 0,
                minStock: product.inventory?.minStock || 5,
                images: product.images?.length > 0 ? product.images.map(img => ({ url: img.url })) : [{ url: '' }],
                isActive: product.isActive,
                isFeatured: product.isFeatured
            });
        } else {
            setEditingProduct(null);
            // Default Values
            setFormData({
                name: '',
                slug: '',
                description: '', // Reset descripción
                price: '',
                compareAtPrice: '',
                categoryId: categories[0]?.id || '', // Default to first category if exists
                categoryId: categories[0]?.id || '', // Default to first category if exists
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
            // Prepare Payload
            const payload = {
                name: formData.name,
                slug: formData.slug || generateSlug(formData.name),
                description: formData.description, // Enviar descripción
                price: parseFloat(formData.price),
                compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
                categoryId: formData.categoryId,

                // Inventory (solo creation)
                // Inventory fields (now editable)
                stockZaruma: parseInt(formData.stockZaruma),
                stockSangolqui: parseInt(formData.stockSangolqui),
                minStock: parseInt(formData.minStock),

                // Filter out empty image URLs
                images: formData.images.filter(img => img.url.trim() !== ''),
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

            // Detectar error de duplicidad (Prisma P2002 suele devolver mensaje genérico en prod, pero NestJS puede detallarlo)
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

    const addImageField = () => {
        setFormData({ ...formData, images: [...formData.images, { url: '' }] });
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
                                            <button onClick={() => handleOpenModal(product)} className="btn-icon">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(product.id)} className="btn-icon delete">
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

                            {/* Contenedor con scroll para los campos */}
                            <div className="form-scroll-area">
                                {/* 1. SECCIÓN DE IMAGEN */}
                                <div className="image-upload-section">
                                    <label className="image-preview-box">
                                        {formData.images[0].url ? (
                                            <img src={formData.images[0].url} alt="Preview" />
                                        ) : (
                                            <div className="placeholder">
                                                <UploadCloud size={48} className="text-gray-500 mb-2" />
                                                <span>Subir Imagen Principal</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(0, e.target.files[0])}
                                        />
                                    </label>
                                    <input type="hidden" value={formData.images[0].url} />
                                </div>

                                {/* 2. CAMPOS DEL FORMULARIO */}
                                <div className="form-grid">

                                    {/* 1. Nombre */}
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

                                    {/* 2. Categoría */}
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

                                    {/* 3. Descripción */}
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

                                    {/* 4. Fila de Precios */}
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

                                    {/* 5. Stocks por Sucursal */}
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

            {/* ESTILOS */}
            <style>{`
                /* Estilos globales del modulo */
                .products-page {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                /* ... (otros estilos previos) ... */

                /* Modal Mejorado Responsive */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .modal-content {
                    background: #1e293b;
                    border-radius: 16px;
                    border: 1px solid #334155;
                    width: 100%;
                    max-height: 90vh; /* Máximo alto del viewport */
                    display: flex;
                    flex-direction: column; /* Flex vertical */
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    animation: modal-in 0.3s ease-out;
                    overflow: hidden; /* Importante para que el radio no corte */
                }

                .modal-content.medium {
                    max-width: 600px;
                }
                
                .modal-header {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #334155;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #1e293b;
                    flex-shrink: 0; /* No encoger */
                }

                .modal-form {
                    display: flex;
                    flex-direction: column;
                    flex: 1; /* Ocupar espacio restante */
                    min-height: 0; /* Para permitir scroll interno flex */
                }

                .form-scroll-area {
                    flex: 1;
                    overflow-y: auto; /* Scroll AQUI */
                    padding: 1.5rem;
                }

                .modal-actions {
                    padding: 1.25rem 1.5rem;
                    border-top: 1px solid #334155;
                    background: #1e293b; /* Fondo para tapar contenido al scrollear */
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    flex-shrink: 0; /* No encoger */
                }

                /* Inputs y Textarea */
                input, select, textarea {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: #0f172a;
                    border: 1px solid #334155;
                    border-radius: 8px;
                    color: white;
                    font-size: 0.95rem;
                    transition: border-color 0.2s;
                }
                
                input:focus, select:focus, textarea:focus {
                    outline: none;
                    border-color: #ec4899;
                    box-shadow: 0 0 0 1px rgba(236, 72, 153, 0.2);
                }

                textarea {
                    resize: vertical;
                    min-height: 80px;
                    font-family: inherit;
                }

                /* Corrección input precio */
                .input-prefix {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                
                .input-prefix span {
                    position: absolute;
                    left: 1rem;
                    color: #94a3b8;
                    font-weight: 600;
                    pointer-events: none;
                }
                
                .input-prefix input {
                    padding-left: 2rem; /* Espacio suficiente para el $ */
                }

                /* Grid Layout */
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                    margin-top: 1.5rem;
                }
                
                .span-2 {
                    grid-column: span 2;
                }
                
                .form-group label {
                    display: block;
                    color: #cbd5e1;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                }
                
                .image-upload-section { display: flex; justify-content: center; }
                
                .image-preview-box {
                    border: 2px dashed #475569;
                    border-radius: 12px;
                    height: 160px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    overflow: hidden;
                    transition: all 0.2s;
                    background: rgba(15, 23, 42, 0.5);
                    color: #94a3b8;
                }

                .image-preview-box:hover {
                    border-color: #ec4899;
                    color: #ec4899;
                    background: rgba(236, 72, 153, 0.05);
                }
                
                .image-preview-box img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                
                .placeholder { display: flex; flex-direction: column; align-items: center; color: #64748b; font-size: 0.9rem; }
                .hidden { display: none; }

                /* Mobile Friendly */
                @media (max-width: 640px) {
                    .products-page { padding: 1rem; }
                    .modal-content { max-height: 95vh; } /* Más altura en móvil */
                    .form-grid { grid-template-columns: 1fr; gap: 1rem; } /* Pila vertical */
                    .span-2 { grid-column: span 1; }
                }
        .products-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        /* ... Estilos Generales mantenidos ... */
        .page-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--admin-border); padding-bottom: 1rem; }
        .page-header h1 { font-size: 1.75rem; color: var(--admin-text-main); font-weight: 700; margin: 0; }
        .page-header p { color: var(--admin-text-muted); margin: 0.25rem 0 0 0; font-size: 0.9rem; }
        .btn-primary { background: var(--admin-accent-gradient); color: white; padding: 0.75rem 1.25rem; border-radius: 0.75rem; border: none; font-weight: 600; display: flex; gap: 0.5rem; align-items: center; cursor: pointer; }
        .filters-bar { background: var(--admin-card-bg); padding: 1rem; border-radius: 1rem; border: 1px solid var(--admin-border); }
        .search-box { position: relative; max-width: 400px; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--admin-text-muted); }
        .search-box input { width: 100%; background: var(--admin-input-bg); border: 1px solid var(--admin-border); padding: 0.75rem 1rem 0.75rem 3rem; border-radius: 0.75rem; color: var(--admin-text-main); }
        .table-container { background: var(--admin-card-bg); border-radius: 1rem; border: 1px solid var(--admin-border); overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .data-table { width: 100%; border-collapse: collapse; color: var(--admin-text-muted); }
        .data-table th { background: var(--admin-card-header); padding: 1rem; text-align: left; font-weight: 600; color: var(--admin-text-muted); border-bottom: 1px solid var(--admin-border); font-size: 0.85rem; text-transform: uppercase; white-space: nowrap; }
        .data-table td { padding: 1rem; border-bottom: 1px solid var(--admin-border); vertical-align: middle; white-space: nowrap; color: var(--admin-text-main); }
        
        .product-cell { display: flex; align-items: center; gap: 1rem; }
        .product-thumb { width: 40px; height: 40px; background: var(--admin-border); border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .product-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .category-tag { background: var(--admin-border); padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; color: var(--admin-text-muted); }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
        .status-badge.active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-badge.inactive { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .row-actions { display: flex; gap: 0.5rem; }
        .btn-icon { padding: 0.5rem; border-radius: 0.5rem; background: transparent; border: 1px solid var(--admin-border); color: var(--admin-text-muted); cursor: pointer; }

        /* MODAL ESTILOS NUEVOS */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); z-index: 100; display: flex; justify-content: center; align-items: center; padding: 1rem; }
        
        .modal-content.medium {
           background: var(--admin-card-bg);
           width: 100%;
           max-width: 500px; /* Más angosto */
           border-radius: 1.5rem;
           border: 1px solid var(--admin-border);
           display: flex;
           flex-direction: column;
           overflow: hidden;
           box-shadow: 0 25px 50px rgba(0,0,0,0.5);
           color: var(--admin-text-main);
        }

        .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--admin-border); display: flex; justify-content: space-between; align-items: center; background: var(--admin-card-header); }
        .modal-header h2 { margin: 0; color: var(--admin-text-main); font-size: 1.25rem; }
        .close-btn { background: none; border: none; color: var(--admin-text-muted); cursor: pointer; }

        .modal-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }

        /* UPLOAD STYLE */
        .image-upload-section { display: flex; justify-content: center; }
        
        .image-preview-box {
            width: 100%;
            height: 180px;
            background: var(--admin-input-bg);
            border: 2px dashed var(--admin-border);
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            overflow: hidden;
            transition: all 0.2s;
            position: relative;
            color: var(--admin-text-muted);
        }

        .image-preview-box:hover { border-color: var(--admin-accent); background: var(--admin-hover); color: var(--admin-accent); }
        
        .image-preview-box img { width: 100%; height: 100%; object-fit: contain; }
        
        .placeholder { display: flex; flex-direction: column; align-items: center; color: var(--admin-text-muted); font-size: 0.9rem; }
        .hidden { display: none; }

        /* FORM GRID */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .span-2 { grid-column: span 2; }

        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { color: var(--admin-text-muted); font-size: 0.85rem; font-weight: 500; }
        
        .form-group input, .form-group select {
           background: var(--admin-input-bg);
           border: 1px solid var(--admin-border);
           padding: 0.75rem;
           border-radius: 0.75rem;
           color: var(--admin-text-main);
           font-size: 0.95rem;
           transition: border-color 0.2s;
        }

        .form-group input:focus, .form-group select:focus { outline: none; border-color: var(--admin-accent); }
        
        .input-lg { font-size: 1.1rem; padding: 0.85rem; }

        .modal-footer {
           margin-top: 1rem;
           display: flex;
           justify-content: flex-end;
           gap: 1rem;
        }
        
        .btn-secondary { background: transparent; border: 1px solid var(--admin-border); color: var(--admin-text-muted); padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; cursor: pointer; }
        
        .loading-state, .empty-state { padding: 3rem; text-align: center; color: var(--admin-text-muted); }
        .spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid rgba(236,72,153, 0.3); border-top-color: #ec4899; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 0.5rem; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ProductsPage;
