import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [userToken, setUserToken] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [formData, setFormData] = useState({
    paymentMethod: 'Credit Card',
  });

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
      (acc, item) => acc + parseFloat(item.price) * item.quantity,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (userToken) {
      try {
        const response = await fetch('http://localhost:8080/purchases/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'access-token': userToken,
          },
          body: JSON.stringify({ paymentMethod: formData.paymentMethod }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Checkout successful:', data);
          alert('Order placed successfully!');
          setCartItems([]);
          setSubtotal(0);
          // Optionally redirect to order confirmation page
        } else {
          const errorData = await response.json();
          console.error('Checkout failed:', errorData);
          alert('Checkout failed: ' + errorData.message);
        }
      } catch (error) {
        console.error('Error during checkout:', error);
      }
    } else {
      console.log('User not logged in');
      // Optionally redirect to login page or show a message
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Cart Items */}
      <div className="mb-8">
        {cartItems.length > 0 ? (
          <>
            <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="pb-2">Item</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Quantity</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.itemid} className="border-t">
                    <td className="py-2">{item.itemname}</td>
                    <td className="py-2">${parseFloat(item.price).toFixed(2)}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">
                      $
                      {(
                        parseFloat(item.price) * parseInt(item.quantity)
                      ).toFixed(2)}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => decreaseQuantity(item)}
                          className="p-1 bg-gray-200 rounded"
                        >
                          <Minus size={16} />
                        </button>
                        <button
                          onClick={() => increaseQuantity(item)}
                          className="p-1 bg-gray-200 rounded"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Subtotal */}
            <div className="text-right mt-4">
              <h3 className="text-xl font-bold">
                Subtotal: ${subtotal.toFixed(2)}
              </h3>
            </div>
          </>
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>

      {/* Checkout Form */}
      {cartItems.length > 0 && (
        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="block text-gray-700">Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full border px-4 py-2"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="PayPal">PayPal</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
          >
            Place Order
          </button>
        </form>
      )}
    </div>
  );
};

export default Checkout;
