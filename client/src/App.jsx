import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import LocationFinder from './pages/LocationFinder';
import FAQ from './pages/FAQ'; // Import the FAQ page
import Contact from './pages/Contact'; // Import the Contact Us page
import PrivacyPolicy from './pages/PrivacyPolicy'; // Import the Privacy Policy page

const App = () => {


  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track-order" element={<OrderTracking />} />
            <Route path="/locations" element={<LocationFinder />} />
            <Route path="/faq" element={<FAQ />} /> {/* FAQ page route */}
            <Route path="/contact" element={<Contact />} /> {/* Contact Us page route */}
            <Route path="/privacy" element={<PrivacyPolicy />} /> {/* Privacy Policy page route */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
