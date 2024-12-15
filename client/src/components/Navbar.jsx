import { useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Effect to load user information from the token if it exists
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    console.log(storedToken)
    if (storedToken) {
      try {
        const userObject = jwt_decode(storedToken);
        setUser({
          email: userObject.email || '',
          name: userObject.username || `${userObject.given_name || ''} ${userObject.family_name || ''}`.trim(),
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // Effect to load Google Identity Services script if the user is not logged in
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.google) {
          // Initialize Google Sign-In
          google.accounts.id.initialize({
            client_id: '493719321587-13u0nt8soj5m343q857krls3por6a1jj.apps.googleusercontent.com',
            callback: handleCallbackResponse,
          });

          // Render the Google Sign-In button
          google.accounts.id.renderButton(
            document.getElementById('googleSignInDiv'),
            {
              theme: 'outline',
              size: 'medium',
              text: 'signin_with',
            }
          );
        }
      };

      // Clean up the script when the component unmounts
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []); // Run only on mount

  const handleCallbackResponse = async (response) => {
    try {
      // Decode the JWT credential
      const userObject = jwt_decode(response.credential);

      // Extract necessary fields
      const email = userObject.email;
      const password = userObject.sub;
      const firstName = userObject.given_name || '';
      const lastName = userObject.family_name || '';
      const username = (firstName + lastName);

      // Set up the request body
      const requestBody = {
        email: email,
        password: password,
        username: username,
      };

      // Attempt to register the user
      let registerResponse = await fetch('http://localhost:8080/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!registerResponse.ok) {
        const registerError = await registerResponse.json();
        if (
          registerResponse.status === 400 &&
          registerError.error === 'Email already exists'
        ) {
          console.log('User already exists, proceeding to login');
        } else {
          console.error('Registration error:', registerError);
          return;
        }
      }

      // Proceed to login the user
      const loginResponse = await fetch('http://localhost:8080/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });

      if (loginResponse.ok) {
        // Login succeeded
        const loginData = await loginResponse.json();
        const newToken = loginData.token;

        // Store the token in localStorage
        localStorage.setItem('token', newToken);

        // Set the user state with full information
        setUser({
          email: userObject.email,
          name: firstName + lastName,
        });

        // Refresh the page to reflect changes
        window.location.reload();
      } else {
        const loginError = await loginResponse.json();
        console.error('Login failed:', loginError);
        return;
      }
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    // Remove the token from localStorage
    localStorage.removeItem('token');

    // Refresh the page to ensure Google Sign-In button shows up again
    window.location.reload();
  };

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

            {/* Google Sign-In / User Info */}
            {localStorage.getItem('token') ? (
              <div className="flex items-center space-x-2">
                <span>{user?.name || 'User'}</span>
                <button
                  onClick={handleSignOut}
                  className="px-2 py-1 bg-red-700 hover:bg-red-800 rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div id="googleSignInDiv"></div>
            )}
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

            {/* Google Sign-In / User Info */}
            {localStorage.getItem('token') ? (
              <div className="flex items-center space-x-2 mt-2">
                <span>{user?.name || 'User'}</span>
                <button
                  onClick={handleSignOut}
                  className="px-2 py-1 bg-red-700 hover:bg-red-800 rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div id="googleSignInDiv" className="mt-2"></div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
