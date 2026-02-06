import { useState, useEffect } from 'react';
import api from '../../api';
import { Package, Search, AlertCircle, TrendingUp } from 'lucide-react';
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Intencionalmente simple, solo fecha.
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1>Gestión de Inventario</h1>
          <p>Visualización de stock por bodegas</p>
        </div>
      </div>

      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
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
                <th className="text-center">Stock Zaruma</th>
                <th className="text-center">Stock Sangolquí</th>
                <th className="text-center">Stock Total</th>
                <th>Estado</th>
                <th>Última Venta</th>
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

                  {/* Bodegas */}
                  <td className="text-center">
                    <span className="location-stock">{item.stockZaruma || 0}</span>
                  </td>
                  <td className="text-center">
                    <span className="location-stock">{item.stockSangolqui || 0}</span>
                  </td>

                  {/* Total */}
                  <td className="text-center">
                    <div className="stock-badge">
                      <span className={`stock-count ${item.stock <= item.minStock ? 'low' : 'good'}`}>
                        {item.stock}
                      </span>
                    </div>
                  </td>

                  {/* Estado */}
                  <td>
                    {item.stock === 0 ? (
                      <span className="status-badge out">Agotado</span>
                    ) : (
                      <span className="status-badge good">Disponible</span>
                    )}
                  </td>

                  {/* Última Venta */}
                  <td>
                    <div className="last-sold">
                      {item.lastSold ? (
                        <>
                          <TrendingUp size={14} className="text-gray-400" />
                          <span>{formatDate(item.lastSold)}</span>
                        </>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </div>
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
          color: var(--admin-text-main);
          font-family: var(--font-body); /* Asegurar fuente global */
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--admin-border);
        }

        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--admin-text-main);
          margin: 0;
          letter-spacing: -0.5px;
        }

        .page-header p {
          color: var(--admin-text-muted);
          font-size: 0.95rem;
          margin: 0.25rem 0 0 0;
        }

        /* ... filtros y header iguales ... */
        .filters-bar {
          display: flex;
          gap: 1.5rem;
          background: var(--admin-card-bg);
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid var(--admin-border);
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          position: relative;
          min-width: 200px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--admin-text-muted);
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1px solid var(--admin-border);
          background: var(--admin-input-bg);
          border-radius: 0.75rem;
          color: var(--admin-text-main);
          font-size: 0.95rem;
          transition: all 0.2s;
          font-family: var(--font-body);
        }
        
        .search-box input:focus {
          outline: none;
          border-color: var(--admin-accent);
          box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.2);
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--admin-text-muted);
          user-select: none;
        }
        
        .toggle-label input { display: none; }
        
        .toggle-switch {
          width: 40px; height: 22px; background: var(--admin-border);
          border-radius: 20px; position: relative; transition: all 0.3s;
        }
        .toggle-switch::after {
          content: ''; position: absolute; width: 18px; height: 18px;
          background: white; border-radius: 50%; top: 2px; left: 2px; transition: all 0.3s;
        }
        .toggle-label input:checked + .toggle-switch { background: var(--admin-accent); }
        .toggle-label input:checked + .toggle-switch::after { transform: translateX(18px); }

        .table-container {
          background: var(--admin-card-bg);
          border-radius: 1rem;
          border: 1px solid var(--admin-border);
          overflow-x: auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .data-table { width: 100%; border-collapse: collapse; white-space: nowrap; }

        .data-table th {
          background: var(--admin-card-header);
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--admin-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--admin-border);
        }
        .data-table th.text-center { text-align: center; }
        .data-table td.text-center { text-align: center; }

        .data-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--admin-border);
          font-size: 0.9rem;
          color: var(--admin-text-main);
          vertical-align: middle;
        }
        .data-table tr:hover td { background: var(--admin-hover); }

        .product-cell { display: flex; gap: 1rem; align-items: center; }
        .product-img {
          width: 48px; height: 48px; border-radius: 0.75rem;
          background: var(--admin-border); display: flex; align-items: center; justify-content: center;
          color: var(--admin-text-muted); overflow: hidden; border: 1px solid var(--admin-border); flex-shrink: 0;
        }
        .product-img img { width: 100%; height: 100%; object-fit: cover; }
        
        .product-info { display: flex; flex-direction: column; gap: 0.125rem; }
        .product-info .name {
            font-weight: 600;
            color: var(--admin-text-main);
            font-family: var(--font-body); /* IMPORTANTE: FUENTE ESTANDAR */
        }
        .product-info .category { font-size: 0.75rem; color: var(--admin-text-muted); }

        .stock-badge .stock-count { font-weight: 700; font-size: 1rem; }
        .stock-count.low { color: #ef4444; }
        .stock-count.good { color: #10b981; }
        
        .location-stock {
            /* Eliminado Space Mono */
            color: var(--admin-text-muted);
            font-size: 0.95rem;
            font-weight: 500;
        }

        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
        }
        .status-badge.out { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .status-badge.good { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }

        .last-sold { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--admin-text-muted); }

        .loading-state, .empty-state { padding: 4rem; text-align: center; color: var(--admin-text-muted); }
        .spinner {
          width: 24px; height: 24px; border: 3px solid rgba(236, 72, 153, 0.3);
          border-top-color: #ec4899; border-radius: 50%;
          animation: spin 1s linear infinite; margin: 0 auto 1rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .text-gray-400 { color: #9ca3af; }
        .text-gray-500 { color: #6b7280; }
        .font-bold { font-weight: 700; }
      `}</style>
    </div>
  );
};

export default InventoryPage;
