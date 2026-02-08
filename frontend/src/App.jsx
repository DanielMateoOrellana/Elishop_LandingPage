import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Páginas Públicas
import LandingPage from './pages/public/LandingPage';
import ProductDetail from './pages/public/ProductDetail';

// Páginas Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import InventoryPage from './pages/admin/Inventory';
import CategoriesPage from './pages/admin/Categories';
import ProductsPage from './pages/admin/Products';
import AccountingPage from './pages/admin/Accounting';
import TikTokManager from './pages/admin/TikTokManager';

// Estilos globales
import './styles/index.css';

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  return user ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Ruta Pública (Landing Page) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/producto/:slug" element={<ProductDetail />} />

            {/* Rutas Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin" element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="accounting" element={<AccountingPage />} />
              <Route path="tiktok" element={<TikTokManager />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
