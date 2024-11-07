import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Five Guys</h3>
            <p className="text-gray-400">
              Hand-crafted burgers and fries since 1986.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/menu" className="text-gray-400 hover:text-white">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/locations" className="text-gray-400 hover:text-white">
                  Locations
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-gray-400 hover:text-white">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="text-lg font-bold mb-4">Help & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-bold mb-4">Connect With Us</h3>
            {/* Change flex to flex-col for vertical alignment */}
            <div className="flex flex-col space-y-2">
              <a
                href="https://www.facebook.com/fiveguys/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <span className="sr-only">Facebook</span>
                Facebook
              </a>
              <a
                href="https://x.com/FiveGuys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <span className="sr-only">Twitter</span>
                X (Twitter)
              </a>
              <a
                href="https://www.instagram.com/fiveguys/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <span className="sr-only">Instagram</span>
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Five Guys. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
