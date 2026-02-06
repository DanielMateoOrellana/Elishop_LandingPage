import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api';
import {
    TrendingUp,
    TrendingDown,
    History,
    Calendar,
    Filter,
    ReceiptText,
    Plus,
    X,
    ShoppingCart
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function Accounting() {
    const [movements, setMovements] = useState([]);
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({
        totalSales: 0,
        totalPurchases: 0,
        netIncome: 0
    });
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('ALL');
    const [searchParams] = useSearchParams();

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [transactionType, setTransactionType] = useState('SALE'); // SALE | PURCHASE
    const [formData, setFormData] = useState({
        productId: '',
        location: 'Zaruma',
        quantity: 1,
        notes: ''
    });

    useEffect(() => {
        fetchData();
        loadProducts();

        if (searchParams.get('action') === 'new-sale') {
            setTransactionType('SALE');
            setShowModal(true);
        }
    }, [filterType, searchParams]); // Añadido searchParams a dependencias

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = { limit: 50 };
            if (filterType !== 'ALL') params.type = filterType;

            const { data } = await api.get('/inventory/movements', { params });

            setMovements(data.movements);

            // Calculate simple stats
            let sales = 0;
            let purchases = 0;

            data.movements.forEach(m => {
                const amount = (m.quantity * (m.inventory?.product?.price || 0));
                if (m.type === 'SALE') {
                    sales += Math.abs(amount);
                } else if (m.type === 'PURCHASE') {
                    purchases += Math.abs(amount);
                }
            });

            setStats({
                totalSales: sales,
                totalPurchases: purchases,
                netIncome: sales - purchases
            });

        } catch (error) {
            console.error(error);
            toast.error('Error al cargar movimientos');
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const { data } = await api.get('/products?active=true&limit=100');
            setProducts(data.data || []);
        } catch (error) {
            console.error("Error loading products", error);
        }
    };

    const handleRegisterTransaction = async (e) => {
        e.preventDefault();
        if (!formData.productId) {
            toast.error('Selecciona un producto');
            return;
        }

        try {
            const finalQuantity = transactionType === 'SALE'
                ? -Math.abs(formData.quantity)
                : Math.abs(formData.quantity);

            await api.post(`/inventory/product/${formData.productId}/update-stock`, {
                quantity: finalQuantity,
                location: formData.location,
                type: transactionType,
                reason: formData.notes || `${transactionType === 'SALE' ? 'Venta' : 'Compra'} registrada manual`
            });

            toast.success(`${transactionType === 'SALE' ? 'Venta' : 'Compra'} registrada correctamente`);
            setShowModal(false);
            setFormData({ productId: '', location: 'Zaruma', quantity: 1, notes: '' });
            fetchData();

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error al registrar transacción');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'SALE': return 'text-emerald-400 bg-emerald-400/10';
            case 'PURCHASE': return 'text-blue-400 bg-blue-400/10';
            case 'ADJUSTMENT': return 'text-amber-400 bg-amber-400/10';
            case 'RETURN': return 'text-red-400 bg-red-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            SALE: 'Venta',
            PURCHASE: 'Compra / Reposición',
            ADJUSTMENT: 'Ajuste',
            RETURN: 'Devolución',
            DAMAGE: 'Daño / Pérdida',
            TRANSFER: 'Transferencia'
        };
        return labels[type] || type;
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1>Contabilidad y Movimientos</h1>
                    <p>Registro histórico de transacciones e inventario</p>
                </div>
                <div className="header-buttons">
                    <button className="action-btn primary" onClick={() => { setTransactionType('SALE'); setShowModal(true); }}>
                        <Plus size={20} /> Nueva Transacción
                    </button>
                    <button className="action-btn secondary" onClick={fetchData}>
                        <History size={20} /> Actualizar
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon income">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Ventas (Estimadas)</h3>
                        <p className="stat-value">{formatCurrency(stats.totalSales)}</p>
                        <span className="stat-desc">En los últimos 50 movimientos</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon expense">
                        <TrendingDown size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Compras (Costo)</h3>
                        <p className="stat-value">{formatCurrency(stats.totalPurchases)}</p>
                        <span className="stat-desc">Reposición de inventario</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon balance">
                        <ReceiptText size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Balance (Estimado)</h3>
                        <p className={`stat-value ${stats.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(stats.netIncome)}
                        </p>
                        <span className="stat-desc">Ingresos - Egresos</span>
                    </div>
                </div>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2>Historial de Transacciones</h2>
                    <div className="header-actions">
                        <div className="filter-group">
                            <Filter size={18} />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="filter-select"
                            >
                                <option value="ALL">Todos los tipos</option>
                                <option value="SALE">Ventas</option>
                                <option value="PURCHASE">Compras</option>
                                <option value="ADJUSTMENT">Ajustes</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Detalle / Ubicación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8">Cargando datos...</td>
                                </tr>
                            ) : movements.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8">No hay movimientos registrados</td>
                                </tr>
                            ) : (
                                movements.map((move) => (
                                    <tr key={move.id}>
                                        <td>
                                            <div className="date-cell">
                                                <Calendar size={14} />
                                                {formatDate(move.createdAt)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${getTypeColor(move.type)}`}>
                                                {getTypeLabel(move.type)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="product-cell">
                                                <span className="product-name">{move.inventory?.product?.name || 'Producto eliminado'}</span>
                                                {move.inventory?.product?.price && (
                                                    <span className="product-price text-xs text-gray-500 ml-2">
                                                        ({formatCurrency(move.inventory.product.price)})
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className={move.quantity > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                                            {move.quantity > 0 ? '+' : ''}{move.quantity}
                                        </td>
                                        <td className="text-sm text-gray-400">
                                            {move.reason || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>
                                <ShoppingCart size={24} className="mr-2 inline" />
                                {transactionType === 'SALE' ? 'Registrar Venta' : 'Registrar Compra / Stock'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="close-btn">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="type-selector">
                            <button
                                className={`type-btn ${transactionType === 'SALE' ? 'active-sale' : ''}`}
                                onClick={() => setTransactionType('SALE')}
                            >
                                Venta (Salida)
                            </button>
                            <button
                                className={`type-btn ${transactionType === 'PURCHASE' ? 'active-purchase' : ''}`}
                                onClick={() => setTransactionType('PURCHASE')}
                            >
                                Compra (Entrada)
                            </button>
                        </div>

                        <form onSubmit={handleRegisterTransaction} className="modal-form">
                            <div className="form-group">
                                <label>Producto</label>
                                <select
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    required
                                    className="form-select"
                                >
                                    <option value="">Selecciona un producto...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Stock Total: {p.inventory?.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Bodega ({transactionType === 'SALE' ? 'Origen' : 'Destino'})</label>
                                    <select
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="form-select"
                                    >
                                        <option value="Zaruma">📍 Zaruma</option>
                                        <option value="Sangolqui">📍 Sangolquí</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Cantidad</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Notas (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder={transactionType === 'SALE' ? "Ej: Cliente Daniel, Factura #100" : "Ej: Proveedor XYZ, Factura #999"}
                                    className="form-input"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={`submit-btn ${transactionType === 'SALE' ? 'btn-sale' : 'btn-purchase'}`}
                                >
                                    {transactionType === 'SALE' ? 'Confirmar Venta' : 'Confirmar Ingreso'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .admin-page { padding: 2rem; max-width: 1600px; margin: 0 auto; font-family: var(--font-body); }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .header-buttons { display: flex; gap: 1rem; }
                .page-header h1 { font-size: 1.875rem; font-weight: 700; color: var(--admin-text); margin-bottom: 0.5rem; }
                .page-header p { color: var(--admin-text-muted); }

                /* Stats & Filters */
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
                .stat-card { background: var(--admin-card-bg); border: 1px solid var(--admin-border); border-radius: 1rem; padding: 1.5rem; display: flex; align-items: center; gap: 1.5rem; }
                .stat-icon { width: 56px; height: 56px; border-radius: 1rem; display: flex; align-items: center; justify-content: center; }
                .stat-icon.income { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .stat-icon.expense { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .stat-icon.balance { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .stat-info h3 { font-size: 0.875rem; color: var(--admin-text-muted); margin-bottom: 0.5rem; }
                .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--admin-text); margin-bottom: 0.25rem; }
                .stat-desc { font-size: 0.75rem; color: var(--admin-text-muted); }

                .content-card { background: var(--admin-card-bg); border: 1px solid var(--admin-border); border-radius: 1rem; overflow: hidden; }
                .card-header { padding: 1.5rem; border-bottom: 1px solid var(--admin-border); display: flex; justify-content: space-between; align-items: center; }
                
                .filter-group { display: flex; align-items: center; gap: 0.75rem; background: var(--admin-bg); padding: 0.5rem 1rem; border-radius: 0.5rem; border: 1px solid var(--admin-border); color: var(--admin-text-muted); }
                .filter-select { background: transparent; border: none; color: var(--admin-text); font-size: 0.875rem; outline: none; font-family: var(--font-body); }
                
                .table-container { overflow-x: auto; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th { text-align: left; padding: 1rem 1.5rem; background: rgba(0, 0, 0, 0.2); color: var(--admin-text-muted); font-weight: 500; font-size: 0.875rem; }
                .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--admin-border); color: var(--admin-text); font-size: 0.95rem; }
                
                .product-cell { display: flex; flex-direction: column; }
                .product-name {
                    font-weight: 600;
                    color: var(--admin-text);
                    font-family: var(--font-body);
                }

                .date-cell { display: flex; align-items: center; gap: 0.5rem; color: var(--admin-text-muted); font-size: 0.875rem; }
                .badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }

                /* Colors */
                .text-green-400 { color: #4ade80; }
                .text-red-400 { color: #f87171; }
                .text-emerald-400 { color: #34d399; }
                .text-blue-400 { color: #60a5fa; }
                .text-amber-400 { color: #fbbf24; }
                .text-gray-400 { color: #9ca3af; }
                .bg-emerald-400\\/10 { background-color: rgba(52, 211, 153, 0.1); }
                .bg-blue-400\\/10 { background-color: rgba(96, 165, 250, 0.1); }
                .bg-amber-400\\/10 { background-color: rgba(251, 191, 36, 0.1); }
                .bg-red-400\\/10 { background-color: rgba(248, 113, 113, 0.1); }
                .bg-gray-400\\/10 { background-color: rgba(156, 163, 175, 0.1); }

                .action-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; transition: all 0.2s; cursor: pointer; border: none; }
                .action-btn.primary { background: var(--admin-accent-gradient); color: white; }
                .action-btn.secondary { background: var(--admin-card-bg); border: 1px solid var(--admin-border); color: var(--admin-text); }

                /* Modal */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
                .modal-content { background: var(--admin-card-bg); border: 1px solid var(--admin-border); border-radius: 1.5rem; width: 100%; max-width: 500px; padding: 0; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); animation: modalSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--admin-border); display: flex; justify-content: space-between; align-items: center; }
                .modal-header h2 { font-size: 1.25rem; color: var(--admin-text); display: flex; align-items: center; }
                .close-btn { background: none; border: none; color: var(--admin-text-muted); cursor: pointer; }
                
                .type-selector { display: flex; padding: 0.5rem 1.5rem 0; gap: 1rem; margin-top: 1rem; }
                .type-btn { flex: 1; padding: 0.75rem; background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-text-muted); border-radius: 0.5rem; cursor: pointer; font-weight: 600; transition: all 0.2s; font-family: var(--font-body); }
                .type-btn.active-sale { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }
                .type-btn.active-purchase { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-color: #3b82f6; }

                .modal-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .form-group label { color: var(--admin-text-muted); font-size: 0.875rem; font-weight: 500; }
                .form-input, .form-select { background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-text); padding: 0.75rem 1rem; border-radius: 0.75rem; font-size: 0.95rem; width: 100%; font-family: var(--font-body); }
                
                .modal-actions { display: flex; gap: 1rem; margin-top: 1rem; }
                .cancel-btn { flex: 1; padding: 0.875rem; background: transparent; border: 1px solid var(--admin-border); color: var(--admin-text); border-radius: 0.75rem; font-weight: 600; cursor: pointer; }
                .submit-btn { flex: 1; padding: 0.875rem; border: none; color: white; border-radius: 0.75rem; font-weight: 600; cursor: pointer; }
                .btn-sale { background: #ef4444; }
                .btn-purchase { background: #3b82f6; }

                @keyframes modalSlide { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @media (max-width: 768px) { .admin-page { padding: 1rem; padding-top: 5rem; } .stats-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
}
