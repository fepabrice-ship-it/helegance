import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import TattoosPage from "./pages/TattoosPage";
import ResellerPage from "./pages/ResellerPage";
import CartPage from "./pages/CartPage";
import AdminPage from "./pages/AdminPage";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthProvider";
import LoginPage from "./pages/LoginPage";
import ScrollToTop from "./components/ScrollToTop";

import { useEffect } from "react";
import { ACTIVE_THEME } from "./config/ThemeConfig";

function App() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", ACTIVE_THEME);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tattoos" element={<TattoosPage />} />
                <Route path="/reseller" element={<ResellerPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="*"
                  element={
                    <div className="text-center py-20">Page introuvable</div>
                  }
                />
              </Routes>
            </Layout>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
