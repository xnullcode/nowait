import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HubPage from './pages/HubPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import WelcomePage from './pages/WelcomePage';
import LandingPage from './pages/LandingPage';

// Simple protected route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('cafe_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/', '/login', '/register', '/welcome', '/menu', '/cart', '/checkout'];
  const isKioskOrLanding = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-white">
      {!isKioskOrLanding && <Navbar />}
      <main className={isKioskOrLanding ? "flex-grow flex flex-col" : "flex-grow container mx-auto px-4 py-8"}>
        <Routes>
          {/* Public/Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route path="/welcome" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />
          <Route path="/hub" element={<ProtectedRoute><HubPage /></ProtectedRoute>} />
          
          {/* Kiosk Routes */}
          <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          
          {/* Dashboards */}
          <Route path="/staff" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
}

export default App;
