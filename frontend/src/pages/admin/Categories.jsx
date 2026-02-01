import { useState, useEffect } from 'react';
import api from '../../api';
import { FolderTree, Plus, Pencil, Trash2, X, Save, Loader2, Smile } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '📦',
        color: '#ec4899',
        sortOrder: 0
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error al cargar categorías');
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (text) => {
        return text
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                slug: category.slug,
                description: category.description || '',
                icon: category.icon || '📦',
                color: category.color || '#ec4899',
                sortOrder: category.sortOrder || 0
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                slug: '',
                description: '',
                icon: '📦',
                color: '#ec4899',
                sortOrder: categories.length + 1
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;

        try {
            await api.delete(`/categories/${id}`);
            toast.success('Categoría eliminada');
            fetchCategories();
        } catch (error) {
            toast.error('No se pudo eliminar la categoría');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                slug: formData.slug || generateSlug(formData.name)
            };

            if (editingCategory) {
                await api.patch(`/categories/${editingCategory.id}`, payload);
                toast.success('Categoría actualizada');
            } else {
                await api.post('/categories', payload);
                toast.success('Categoría creada');
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg[0] : 'Error al guardar categoría');
        }
    };

    return (
        <div className="categories-page">
            <div className="page-header">
                <div>
                    <h1>Categorías</h1>
                    <p>Organiza tus productos en secciones</p>
                </div>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={20} /> Nueva Categoría
                </button>
            </div>

            <div className="grid-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <span>Cargando categorías...</span>
                    </div>
                ) : (
                    categories.map((cat) => (
                        <div key={cat.id} className="category-card" style={{ '--accent-color': cat.color }}>
                            <div className="card-header">
                                <span className="icon" style={{ backgroundColor: cat.color }}>{cat.icon}</span>
                                <div className="actions">
                                    <button onClick={() => handleOpenModal(cat)} className="btn-icon">
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(cat.id)} className="btn-icon delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3>{cat.name}</h3>
                            <p>{cat.description || 'Sin descripción'}</p>
                            <div className="card-footer">
                                <span className="badge">{cat._count?.products || 0} Productos</span>
                                <span className="order-badge">Orden: {cat.sortOrder}</span>
                            </div>
                        </div>
                    ))
                )}

                {!loading && categories.length === 0 && (
                    <div className="empty-state">
                        <FolderTree size={48} />
                        <h3>No hay categorías</h3>
                        <p>Crea la primera para organizar tu catálogo</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="close-btn"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Ej: Collares"
                                    />
                                </div>
                                <div className="form-group w-32">
                                    <label>Icono (Emoji)</label>
                                    <div className="emoji-input-wrapper">
                                        <input
                                            type="text"
                                            className="emoji-input"
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            maxLength={2}
                                        />
                                        <Smile size={20} className="emoji-icon" />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Breve descripción de la categoría..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Color (Hex)</label>
                                    <div className="color-input-wrapper">
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group w-32">
                                    <label>Orden</label>
                                    <input
                                        type="number"
                                        value={formData.sortOrder}
                                        onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    <Save size={18} /> Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .categories-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid #2d323b;
        }

        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f8fafc;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .page-header p {
          color: #94a3b8;
          font-size: 0.95rem;
          margin: 0.25rem 0 0 0;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(236, 72, 153, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.4);
        }

        /* Grid de Tarjetas */
        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .category-card {
          background: #181b21;
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid #2d323b;
          border-top: 4px solid var(--accent-color);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: transform 0.2s;
        }

        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .icon {
          width: 48px;
          height: 48px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-icon {
          background: #2d323b;
          border: none;
          color: #94a3b8;
          width: 32px;
          height: 32px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #374151;
          color: #f8fafc;
        }

        .btn-icon.delete:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .category-card h3 {
          color: #f8fafc;
          font-size: 1.25rem;
          margin: 0;
          font-weight: 600;
        }

        .category-card p {
          color: #94a3b8;
          font-size: 0.9rem;
          margin: 0;
          flex: 1;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #2d323b;
          padding-top: 1rem;
          margin-top: auto;
        }

        .badge, .order-badge {
          font-size: 0.8rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-weight: 600;
        }

        .badge {
          background: #2d323b;
          color: #e2e8f0;
        }
        
        .order-badge {
          background: #0f1115;
          color: #64748b;
          border: 1px solid #2d323b;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 1rem;
        }

        .modal-content {
          background: #181b21;
          border-radius: 1.5rem;
          width: 100%;
          max-width: 500px;
          border: 1px solid #2d323b;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: modalSlide 0.3s ease-out;
        }

        @keyframes modalSlide {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #2d323b;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          color: #f8fafc;
          font-size: 1.25rem;
        }

        .close-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }
        
        .modal-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        
        .form-row {
          display: flex;
          gap: 1rem;
        }
        
        .flex-1 { flex: 1; }
        .w-32 { width: 8rem; }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-group label {
          color: #cbd5e1;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .form-group input, .form-group textarea {
          background: #0f1115;
          border: 1px solid #2d323b;
          padding: 0.75rem;
          border-radius: 0.75rem;
          color: #f8fafc;
          font-size: 0.95rem;
        }
        
        .form-group input:focus, .form-group textarea:focus {
          outline: none;
          border-color: #ec4899;
        }
        
        .emoji-input-wrapper {
          position: relative;
        }
        
        .emoji-input {
          width: 100% !important;
          padding-right: 2.5rem !important;
          text-align: center;
          font-size: 1.5rem !important;
        }
        
        .emoji-icon {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
        }
        
        .color-input-wrapper {
          display: flex;
          gap: 0.5rem;
        }
        
        .color-input-wrapper input[type="color"] {
          width: 50px;
          padding: 0;
          border: none;
          height: 42px;
          cursor: pointer;
        }
        
        .modal-footer {
          padding-top: 1rem;
          border-top: 1px solid #2d323b;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        
        .btn-secondary {
          background: transparent;
          border: 1px solid #374151;
          color: #e2e8f0;
          padding: 0.75rem 1.25rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }
        
        .btn-secondary:hover {
          background: #2d323b;
        }
        
        .loading-state, .empty-state {
          grid-column: 1 / -1;
          padding: 4rem;
          text-align: center;
          color: #94a3b8;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(236, 72, 153, 0.3);
          border-top-color: #ec4899;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default CategoriesPage;
