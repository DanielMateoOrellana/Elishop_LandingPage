import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Package, FolderTree, LogOut, Menu, X, ShoppingBag, ReceiptText, Video } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import { useState } from 'react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: ShoppingBag, label: 'Productos' },
    { path: '/admin/inventory', icon: Package, label: 'Inventario' },
    { path: '/admin/categories', icon: FolderTree, label: 'Categorías' },
    { path: '/admin/accounting', icon: ReceiptText, label: 'Contabilidad' },
    { path: '/admin/tiktok', icon: Video, label: 'TikToks' },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <header className="admin-header-mobile">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="menu-btn">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="brand">Elishop Admin</span>
      </header>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">E</div>
          <h2>Elishop</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-title">MENU</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ marginBottom: '1rem' }}>
            <ThemeToggle />
          </div>
          <div className="user-info">
            <div className="avatar">{user?.name?.charAt(0) || 'A'}</div>
            <div className="details">
              <span className="name">{user?.name}</span>
              <span className="role">{user?.role}</span>
            </div>
            <button onClick={logout} className="logout-btn" title="Cerrar sesión">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <Outlet />
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background-color: var(--admin-bg);
          color: var(--admin-text-main);
        }

        /* Sidebar Styles */
        .admin-sidebar {
          width: 280px;
          background: var(--admin-sidebar-bg);
          border-right: 1px solid var(--admin-border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 50;
          transition: transform 0.3s ease, background-color 0.3s ease;
        }

        .sidebar-header {
          padding: 1.75rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 1px solid var(--admin-border);
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: var(--admin-accent-gradient);
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .sidebar-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--admin-text-main);
          margin: 0;
          letter-spacing: -0.5px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          overflow-y: auto;
        }

        .nav-group-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--admin-text-muted);
          padding-left: 1rem;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border-radius: 0.75rem;
          color: var(--admin-text-muted);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap; /* Evitar que el texto se rompa */
        }

        .nav-item:hover {
          background: var(--admin-hover);
          color: var(--admin-text-main);
        }

        .nav-item.active {
          background: rgba(236, 72, 153, 0.1);
          color: var(--admin-accent);
          border-left: 3px solid var(--admin-accent);
        }

        .sidebar-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--admin-border);
          display: flex;
          flex-direction: column; /* Apilar verticalmente */
          gap: 1rem;
          background: var(--admin-sidebar-bg);
        }

        .user-info {
          display: flex;
          align-items: center;
          justify-content: space-between; /* Separar avatar/info del boton logout */
          gap: 0.5rem;
          width: 100%;
        }
        
        .user-info-left {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex: 1;
            min-width: 0; /* Para que el truncate funcione */
        }

        .avatar {
          width: 36px;
          height: 36px;
          background: var(--admin-badge-bg);
          color: var(--admin-text-muted);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          border: 2px solid var(--admin-border);
          flex-shrink: 0;
        }

        .details {
          display: flex;
          flex-direction: column;
          min-width: 0; /* Para truncate */
        }

        .details .name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--admin-text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .details .role {
          font-size: 0.75rem;
          color: var(--admin-text-muted);
        }

        .logout-btn {
          background: rgba(239, 68, 68, 0.1);
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .logout-btn:hover {
          background: #ef4444;
          color: white;
        }

        /* Main Content */
        .admin-content {
          flex: 1;
          margin-left: 280px;
          padding: 2.5rem;
          overflow-y: auto;
          background-color: var(--admin-bg);
        }

        .admin-header-mobile {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: var(--admin-sidebar-bg);
          border-bottom: 1px solid var(--admin-border);
          z-index: 40;
          padding: 0 1rem;
          align-items: center;
          gap: 1rem;
        }
        
        .brand {
          color: var(--admin-text-main);
          font-weight: 700;
          font-size: 1.1rem;
        }
        
        .menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--admin-text-main);
        }

        .sidebar-overlay {
          display: none;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .admin-sidebar {
            width: 260px;
          }
           .admin-content {
            margin-left: 260px;
          }
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }
          
          .admin-sidebar.open {
            transform: translateX(0);
          }

          .admin-content {
            margin-left: 0;
            padding: 1.5rem;
            padding-top: 5.5rem;
          }

          .admin-header-mobile {
            display: flex;
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(2px);
            z-index: 45;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
