import { useState, useEffect } from 'react';
import api from '../../api';
import { Package, Search, Plus, AlertCircle, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [showLowStock]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/inventory', {
        params: {
          lowStockOnly: showLowStock,
          search: searchTerm || undefined,
        },
      });
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1>Gestión de Inventario</h1>
          <p>Control de stock y movimientos</p>
        </div>
        <button className="btn-primary">
          <Plus size={20} /> Nuevo Movimiento
        </button>
      </div>

      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <label className="toggle-label">
          <input
            type="checkbox"
            checked={showLowStock}
            onChange={(e) => setShowLowStock(e.target.checked)}
          />
          <div className="toggle-switch"></div>
          <span className="toggle-text">
            {showLowStock ? '⚠️ Stock Bajo' : '📦 Todo'}
          </span>
        </label>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Cargando inventario...</span>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Stock Actual</th>
                <th>Estado</th>
                <th>Última Venta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td className="product-cell">
                    <div className="product-img">
                      {item.product.images[0] ? (
                        <img src={item.product.images[0].url} alt={item.product.name} />
                      ) : (
                        <Package size={24} />
                      )}
                    </div>
                    <div className="product-info">
                      <span className="name">{item.product.name}</span>
                      <span className="category">{item.product.category?.name}</span>
                    </div>
                  </td>
                  <td><span className="sku-badge">{item.product.sku || '-'}</span></td>
                  <td>
                    <div className="stock-badge">
                      <span className={`stock-count ${item.stock <= item.minStock ? 'low' : 'good'}`}>
                        {item.stock}
                      </span>
                    </div>
                  </td>
                  <td>
                    {item.stock === 0 ? (
                      <span className="status-badge out">Agotado</span>
                    ) : item.stock <= item.minStock ? (
                      <span className="status-badge low">Stock Bajo</span>
                    ) : (
                      <span className="status-badge good">Disponible</span>
                    )}
                  </td>
                  <td>
                    {item.lastSold ? new Date(item.lastSold).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <button className="btn-icon" title="Ver movimientos">
                      <ArrowUpDown size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="empty-content">
                      <Search size={48} />
                      <h3>No se encontraron productos</h3>
                      <p>Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .inventory-page {
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

        .filters-bar {
          display: flex;
          gap: 1.5rem;
          background: #181b21;
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid #2d323b;
          align-items: center;
        }

        .search-box {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1px solid #2d323b;
          background: #0f1115;
          border-radius: 0.75rem;
          color: #f8fafc;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        
        .search-box input:focus {
          outline: none;
          border-color: #ec4899;
          box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.2);
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-size: 0.9rem;
          color: #cbd5e1;
          user-select: none;
        }
        
        .toggle-label input {
          display: none;
        }
        
        .toggle-switch {
          width: 40px;
          height: 22px;
          background: #2d323b;
          border-radius: 20px;
          position: relative;
          transition: all 0.3s;
        }
        
        .toggle-switch::after {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: all 0.3s;
        }
        
        .toggle-label input:checked + .toggle-switch {
          background: #ec4899;
        }
        
        .toggle-label input:checked + .toggle-switch::after {
          transform: translateX(18px);
        }

        .table-container {
          background: #181b21;
          border-radius: 1rem;
          border: 1px solid #2d323b;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background: #1e2229;
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #2d323b;
        }

        .data-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #2d323b;
          font-size: 0.9rem;
          color: #e2e8f0;
        }
        
        .data-table tr:last-child td {
          border-bottom: none;
        }
        
        .data-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .product-cell {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .product-img {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          background: #2d323b;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          overflow: hidden;
          border: 1px solid #374151;
        }
        
        .product-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .product-info .name {
          font-weight: 600;
          color: #f8fafc;
        }
        
        .product-info .category {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        
        .sku-badge {
          font-family: monospace;
          background: #0f1115;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          color: #94a3b8;
          border: 1px solid #2d323b;
          font-size: 0.8rem;
        }

        .stock-badge .stock-count {
          font-weight: 700;
          font-size: 1rem;
        }
        
        .stock-count.low { color: #ef4444; }
        .stock-count.good { color: #10b981; }

        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
        }

        .status-badge.out { 
          background: rgba(239, 68, 68, 0.15); 
          color: #ef4444; 
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        
        .status-badge.low { 
          background: rgba(245, 158, 11, 0.15); 
          color: #fbbf24; 
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        
        .status-badge.good { 
          background: rgba(16, 185, 129, 0.15); 
          color: #34d399; 
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .btn-icon {
          background: transparent;
          border: 1px solid #374151;
          padding: 0.5rem;
          border-radius: 0.5rem;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #2d323b;
          color: #ec4899;
          border-color: #ec4899;
        }
        
        .loading-state {
          padding: 4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: #94a3b8;
        }
        
        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(236, 72, 153, 0.3);
          border-top-color: #ec4899;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }
        
        .empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #64748b;
        }
        
        .empty-content h3 {
          color: #f8fafc;
          margin: 1rem 0 0.5rem 0;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default InventoryPage;
