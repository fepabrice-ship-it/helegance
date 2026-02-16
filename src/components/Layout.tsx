import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, User, Search } from "lucide-react";
import { useCart } from "../context/CartContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  const cartItemCount = totalItems || 0;

  const navLinks = [
    { name: "Tatouages", path: "/tattoos" },
    { name: "Montres", path: "/watches" },
    { name: "Espace Revendeur", path: "/reseller" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link
            to="/"
            className="flex items-center space-x-3 rtl:space-x-reverse group"
          >
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-white tracking-tight group-hover:text-primary transition-colors duration-300">
              Helegance
            </span>
          </Link>

          <div className="flex md:order-2 space-x-3 md:space-x-4 items-center">
            {/* Search - Hidden on mobile for simplicity initially */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors hidden sm:block">
              <Search size={20} />
            </button>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ShoppingBag size={20} />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Profile */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors hidden sm:block">
              <User size={20} />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-400 rounded-lg md:hidden hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600"
              aria-controls="navbar-sticky"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div
            className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
              isMenuOpen ? "block" : "hidden"
            }`}
            id="navbar-sticky"
          >
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-800 rounded-lg bg-gray-900/50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`block py-2 px-3 rounded md:p-0 transition-colors duration-200 ${
                      location.pathname === link.path
                        ? "text-primary"
                        : "text-gray-300 hover:text-white hover:bg-gray-800 md:hover:bg-transparent md:hover:text-primary"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-16 md:pt-20 px-4 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/40 border-t border-white/5 mt-auto">
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <Link
              to="/"
              className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
            >
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
                Helegance
              </span>
            </Link>
            <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-400 sm:mb-0">
              <li>
                <a
                  href="#"
                  className="hover:underline me-4 md:me-6 hover:text-primary"
                >
                  À propos
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:underline me-4 md:me-6 hover:text-primary"
                >
                  Confidentialité
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:underline me-4 md:me-6 hover:text-primary"
                >
                  Licences
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-primary">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <hr className="my-6 border-gray-800 sm:mx-auto lg:my-8" />
          <span className="block text-sm text-gray-500 sm:text-center">
            © {new Date().getFullYear()}{" "}
            <Link to="/" className="hover:underline hover:text-primary">
              Helegance™
            </Link>
            . Tous droits réservés.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
