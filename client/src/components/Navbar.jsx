import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-red-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold">FIVE GUYS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/menu" className="hover:text-red-200">Menu</Link>
            <Link to="/locations" className="hover:text-red-200">Locations</Link>
            <Link to="/track-order" className="hover:text-red-200">Track Order</Link>
            <Link to="/cart" className="hover:text-red-200">
              <ShoppingCart className="w-6 h-6" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-red-700"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/menu"
              className="block px-3 py-2 hover:bg-red-700 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Menu
            </Link>
            <Link
              to="/locations"
              className="block px-3 py-2 hover:bg-red-700 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Locations
            </Link>
            <Link
              to="/track-order"
              className="block px-3 py-2 hover:bg-red-700 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Track Order
            </Link>
            <Link
              to="/cart"
              className="block px-3 py-2 hover:bg-red-700 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Cart
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;