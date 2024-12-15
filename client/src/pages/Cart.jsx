import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import burgerItem from '../assets/burgerItem.png';
import error from '../assets/error.png';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [userToken, setUserToken] = useState(null);
  const [subtotal, setSubtotal] = useState(0);

  // Fetch user token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUserToken(token);
    } else {
      // Redirect to login page or show message if user is not logged in
      console.log('User not logged in');
    }
  }, []);

  // Fetch cart items from backend
  useEffect(() => {
    const fetchCartItems = async () => {
      if (userToken) {
        try {
          const response = await fetch('http://localhost:8080/cart/getCartItems', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'access-token': userToken,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setCartItems(data);
          } else {
            console.error('Failed to fetch cart items');
          }
        } catch (error) {
          console.error('Error fetching cart items:', error);
        }
      }
    };
    fetchCartItems();
  }, [userToken]);

  // Calculate subtotal whenever cart items change
  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
    setSubtotal(total);
  }, [cartItems]);

  // Handle quantity increase
  const increaseQuantity = async (item) => {
    if (userToken) {
      try {
        const response = await fetch('http://localhost:8080/cart/addToCart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'access-token': userToken,
          },
          body: JSON.stringify({ itemID: item.itemid }),
        });
        if (response.ok) {
          // Update cart items
          const updatedItems = cartItems.map((cartItem) =>
            cartItem.itemid === item.itemid
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
          setCartItems(updatedItems);
        } else {
          console.error('Failed to increase item quantity');
        }
      } catch (error) {
        console.error('Error increasing item quantity:', error);
      }
    }
  };

  // Handle quantity decrease
  const decreaseQuantity = async (item) => {
    if (userToken) {
      try {
        const response = await fetch(
          `http://localhost:8080/cart/deleteCartItem/${item.cartitemid}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'access-token': userToken,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (item.quantity > 1) {
            // Update cart items
            const updatedItems = cartItems.map((cartItem) =>
              cartItem.itemid === item.itemid
                ? { ...cartItem, quantity: cartItem.quantity - 1 }
                : cartItem
            );
            setCartItems(updatedItems);
          } else {
            // Remove item from cart if quantity is zero
            const updatedItems = cartItems.filter(
              (cartItem) => cartItem.itemid !== item.itemid
            );
            setCartItems(updatedItems);
          }
        } else {
          console.error('Failed to decrease item quantity');
        }
      } catch (error) {
        console.error('Error decreasing item quantity:', error);
      }
    }
  };

  // Remove item from cart
  const removeItem = async (item) => {
    if (userToken) {
      try {
        const response = await fetch(
          `http://localhost:8080/cart/deleteCartItem/${item.cartitemid}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'access-token': userToken,
            },
          }
        );
        if (response.ok) {
          // Remove item from cart
          const updatedItems = cartItems.filter(
            (cartItem) => cartItem.itemid !== item.itemid
          );
          setCartItems(updatedItems);
        } else {
          console.error('Failed to remove item from cart');
        }
      } catch (error) {
        console.error('Error removing item from cart:', error);
      }
    }
  };

  // Calculate tax and total
  const tax = subtotal * 0.0825; // 8.25% tax
  const total = subtotal + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
          <Link
            to="/menu"
            className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
                <div
                  key={item.itemid}
                  className="flex items-center gap-4 border rounded-lg p-4"
                >
                  <img
                      src={item.imageurl ? `/images/${item.imageurl}` : burgerItem}
                      alt={item.itemname}
                      className="w-24 h-24 object-cover rounded"
                    />
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold">{item.itemname}</h3>
                    <p className="text-gray-600 text-sm">
                      {item.description || 'No description'}
                    </p>

                    {/* Display Special Request if it exists */}
                    {item.request && (
                      <p className="text-gray-600 text-sm mt-1">
                        <strong>Special Request:</strong> {item.request}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decreaseQuantity(item)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    $
                    {(
                      parseFloat(item.price) * parseInt(item.quantity)
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 font-bold">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Link
                to="/checkout"
                className="block w-full bg-red-600 text-white text-center py-3 rounded-md hover:bg-red-700"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
