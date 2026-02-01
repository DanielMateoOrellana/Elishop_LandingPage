import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Package, FolderTree, LogOut, Menu, X, ShoppingBag } from 'lucide-react';
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
          <div className="user-info">
            <div className="avatar">{user?.name?.charAt(0) || 'A'}</div>
            <div className="details">
              <span className="name">{user?.name}</span>
              <span className="role">{user?.role}</span>
            </div>
          </div>
          <button onClick={logout} className="logout-btn" title="Cerrar sesión">
            <LogOut size={20} />
          </button>
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
          background-color: #0f1115;
          color: #f8fafc;
        }

        /* Sidebar Styles */
        .admin-sidebar {
          width: 280px;
          background: #181b21;
          border-right: 1px solid #2d323b;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 50;
          transition: transform 0.3s ease;
        }

        .sidebar-header {
          padding: 1.75rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 1px solid #2d323b;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
        }

        .sidebar-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f8fafc;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 2rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-group-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          padding-left: 1rem;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.875rem 1rem;
          border-radius: 0.75rem;
          color: #94a3b8;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #f8fafc;
        }

        .nav-item.active {
          background: linear-gradient(90deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%);
          color: #ec4899;
          border-left: 3px solid #ec4899;
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid #2d323b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #15181e;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }

        .avatar {
          width: 40px;
          height: 40px;
          background: #2d323b;
          color: #cbd5e1;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          border: 2px solid #181b21;
        }

        .details {
          display: flex;
          flex-direction: column;
        }

        .details .name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #f8fafc;
        }

        .details .role {
          font-size: 0.75rem;
          color: #64748b;
        }

        .logout-btn {
          background: rgba(239, 68, 68, 0.1);
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0.6rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
          display: flex;
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
        }

        .admin-header-mobile {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: #181b21;
          border-bottom: 1px solid #2d323b;
          z-index: 40;
          padding: 0 1rem;
          align-items: center;
          gap: 1rem;
        }
        
        .brand {
          color: #f8fafc;
          font-weight: 700;
          font-size: 1.1rem;
        }
        
        .menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #f8fafc;
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
