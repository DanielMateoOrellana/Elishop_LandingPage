import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import {
    TrendingUp,
    ShoppingCart,
    Package,
    AlertTriangle,
    PlusCircle,
    ArrowRight
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStockCount: 0,
        salesToday: 0,
        revenueToday: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, movementsRes] = await Promise.all([
                api.get('/products'),
                api.get('/inventory/movements?limit=100')
            ]);

            const products = productsRes.data.data || [];
            const movements = movementsRes.data.movements || [];

            // Stats Básicos
            const lowStock = products.filter(p => !p.isActive || (p.inventory?.stock || 0) <= (p.inventory?.minStock || 5)).length;

            // Ventas de Hoy (Usando fecha local para coincidir con la experiencia del usuario)
            const today = new Date();
            const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD formato local

            const salesTodayMoves = movements.filter(m => {
                if (m.type !== 'SALE') return false;
                const mDate = new Date(m.createdAt).toLocaleDateString('en-CA');
                return mDate === todayStr;
            });

            const salesCount = salesTodayMoves.length;
            const revenue = salesTodayMoves.reduce((acc, m) => {
                return acc + (Math.abs(m.quantity) * (m.inventory?.product?.price || 0));
            }, 0);

            setStats({
                totalProducts: products.length,
                lowStockCount: lowStock,
                salesToday: salesCount,
                revenueToday: revenue
            });

            // Preparar datos para el gráfico (Últimos 7 días locales)
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d.toLocaleDateString('en-CA');
            }).reverse();

            const chart = last7Days.map(date => {
                const dayMoves = movements.filter(m => {
                    if (m.type !== 'SALE') return false;
                    const mDate = new Date(m.createdAt).toLocaleDateString('en-CA');
                    return mDate === date;
                });

                const dayRevenue = dayMoves.reduce((acc, m) =>
                    acc + (Math.abs(m.quantity) * (m.inventory?.product?.price || 0)), 0
                );

                // Formatear etiqueta DD/MM
                const [yyyy, mm, dd] = date.split('-');
                return {
                    fullDate: date,
                    label: `${dd}/${mm}`,
                    value: dayRevenue
                };
            });

            setChartData(chart);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    // Obtener el valor máximo para escalar el gráfico
    const maxVal = Math.max(...chartData.map(d => d.value), 10); // Min scale 10
    const hasData = chartData.some(d => d.value > 0);

    return (
        <div className="dashboard-page">
            <div className="welcome-banner">
                <h1>Hola, Elisa 👋</h1>
                <p>Aquí tienes el resumen de tu tienda hoy.</p>
            </div>

            <div className="quick-actions">
                <Link to="/admin/accounting?action=new-sale" className="action-card sale">
                    <div className="icon-box"><ShoppingCart size={24} /></div>
                    <div className="text-box">
                        <h3>Nueva Venta</h3>
                        <p>Registrar salida de mercadería</p>
                    </div>
                    <ArrowRight className="arrow" />
                </Link>

                <Link to="/admin/products?action=new" className="action-card product">
                    <div className="icon-box"><PlusCircle size={24} /></div>
                    <div className="text-box">
                        <h3>Nuevo Producto</h3>
                        <p>Agregar al catálogo</p>
                    </div>
                    <ArrowRight className="arrow" />
                </Link>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon revenue"><TrendingUp size={24} /></div>
                    <div>
                        <h3>Ventas Hoy ({stats.salesToday})</h3>
                        <p className="stat-val">{formatCurrency(stats.revenueToday)}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon products"><Package size={24} /></div>
                    <div>
                        <h3>Productos Totales</h3>
                        <p className="stat-val">{stats.totalProducts}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon alerts"><AlertTriangle size={24} /></div>
                    <div>
                        <h3>Stock Bajo / Inactivos</h3>
                        <p className="stat-val text-red">{stats.lowStockCount}</p>
                    </div>
                </div>
            </div>

            <div className="chart-section">
                <h2>Ventas: Últimos 7 Días</h2>
                <div className="chart-container">
                    {loading ? <p>Cargando datos...</p> : !hasData ? (
                        <div className="empty-chart">
                            <ShoppingCart size={48} />
                            <p>No hay ventas registradas en los últimos 7 días</p>
                        </div>
                    ) : (
                        <div className="bar-chart">
                            {chartData.map((d, i) => (
                                <div key={i} className="bar-group">
                                    <div className="bar-wrapper">
                                        <div
                                            className="bar"
                                            style={{ height: `${(d.value / maxVal) * 100}%` }}
                                            title={formatCurrency(d.value)}
                                        ></div>
                                    </div>
                                    <span className="bar-label">{d.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .dashboard-page { padding: 2rem; max-width: 1200px; margin: 0 auto;  font-family: var(--font-body); }
                .welcome-banner { margin-bottom: 2rem; }
                .welcome-banner h1 { font-size: 2rem; color: var(--admin-text-main); margin: 0; }
                .welcome-banner p { color: var(--admin-text-muted); }

                /* Quick Actions */
                .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2.5rem; }
                .action-card { 
                    background: var(--admin-card-bg); border: 1px solid var(--admin-border);
                    border-radius: 1.5rem; padding: 1.5rem; display: flex; align-items: center; gap: 1.5rem;
                    text-decoration: none; transition: all 0.2s; position: relative; overflow: hidden;
                }
                .action-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.3); }
                
                .action-card.sale:hover { border-color: #34d399; }
                .action-card.product:hover { border-color: #60a5fa; }

                .action-card .icon-box { 
                    width: 56px; height: 56px; border-radius: 1rem; display: flex; align-items: center; justify-content: center;
                    font-size: 1.5rem; flex-shrink: 0;
                }
                .action-card.sale .icon-box { background: rgba(52, 211, 153, 0.15); color: #34d399; }
                .action-card.product .icon-box { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }

                .text-box h3 { margin: 0; color: var(--admin-text-main); font-size: 1.25rem; font-weight: 700; }
                .text-box p { margin: 0.25rem 0 0; color: var(--admin-text-muted); font-size: 0.9rem; }
                .arrow { margin-left: auto; color: var(--admin-text-muted); opacity: 0.5; }

                /* Stats Grid */
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
                .stat-card { 
                    background: var(--admin-card-bg); border: 1px solid var(--admin-border);
                    border-radius: 1rem; padding: 1.25rem; display: flex; align-items: center; gap: 1rem;
                }
                .stat-icon { 
                    width: 48px; height: 48px; border-radius: 0.75rem; 
                    display: flex; align-items: center; justify-content: center; 
                    flex-shrink: 0; /* CORRECCION: Evitar deformación */
                }
                .stat-icon.revenue { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
                /* CORRECCION: Color mas bonito para productos */
                .stat-icon.products { background: rgba(14, 165, 233, 0.15); color: #0ea5e9; }
                .stat-icon.alerts { background: rgba(248, 113, 113, 0.1); color: #f87171; }
                
                .stat-card h3 { font-size: 0.85rem; color: var(--admin-text-muted); margin: 0 0 0.25rem; font-weight: 500; }
                .stat-val { font-size: 1.5rem; color: var(--admin-text-main); font-weight: 700; margin: 0; }
                .text-red { color: #f87171; }

                /* Chart Section */
                .chart-section { background: var(--admin-card-bg); border: 1px solid var(--admin-border); border-radius: 1.5rem; padding: 2rem; }
                .chart-section h2 { margin: 0 0 2rem; color: var(--admin-text-main); font-size: 1.25rem; }
                .chart-container { height: 220px; width: 100%; display: flex; flex-direction: column; justify-content: flex-end; }
                
                .empty-chart { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--admin-text-muted); opacity: 0.5; gap: 1rem; }
                
                .bar-chart { 
                    display: flex; align-items: flex-end; justify-content: space-between; 
                    height: 100%; width: 100%; gap: 16px; padding-top: 20px;
                }
                .bar-group { 
                    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; height: 100%; justify-content: flex-end;
                }
                .bar-wrapper {
                    width: 100%; flex: 1; display: flex; align-items: flex-end; background: rgba(255,255,255,0.03); border-radius: 8px; overflow: hidden;
                }
                .bar { 
                    width: 100%; background: #34d399; /* Green for money */
                    border-radius: 6px 6px 0 0; transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1); min-height: 4px; opacity: 0.9;
                }
                .bar:hover { opacity: 1; filter: brightness(1.1); }
                .bar-label { font-size: 0.8rem; color: var(--admin-text-muted); font-weight: 500; }

                @media (max-width: 768px) {
                    .quick-actions, .stats-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
