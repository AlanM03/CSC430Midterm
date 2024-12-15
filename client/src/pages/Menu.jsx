import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import error from '../assets/error.png';

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [userToken, setUserToken] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [requests, setRequests] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUserToken(token);
    }
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8080/categories/getCategories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          if (data.length > 0) {
            setSelectedCategory(data[0].categoryid);
          }
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch menu items by category
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (selectedCategory) {
        try {
          const response = await fetch(`http://localhost:8080/items/getItemsByCategory/${selectedCategory}`);
          if (response.ok) {
            const data = await response.json();
            setMenuItems(data);
            const initialQuantities = {};
            data.forEach((item) => {
              initialQuantities[item.itemid] = 1;
            });
            setQuantities(initialQuantities);
          } else {
            console.error('Failed to fetch menu items');
            setMenuItems([]);
          }
        } catch (error) {
          console.error('Error fetching menu items:', error);
          setMenuItems([]);
        }
      }
    };
    fetchMenuItems();
  }, [selectedCategory]);

  const handleQuantityChange = (itemId, change) => {
    setQuantities((prevQuantities) => {
      const newQuantity = prevQuantities[itemId] + change;
      const item = menuItems.find((item) => item.itemid === itemId);
      if (newQuantity >= 1 && newQuantity <= item.stockquantity) {
        return { ...prevQuantities, [itemId]: newQuantity };
      } else {
        return prevQuantities;
      }
    });
  };

  const addToCart = async (item) => {
    if (userToken) {
      const quantity = quantities[item.itemid];
      const request = requests[item.itemid] || "";

      try {
        const response = await fetch('http://localhost:8080/cart/addToCart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'access-token': userToken,
          },
          body: JSON.stringify({ itemID: item.itemid, quantity, request }),
        });
        if (response.ok) {
          const data = await response.json();
          alert(`Added ${quantity} ${item.itemname}(s) to cart with request: "${request}"`);

          // Update stock locally
          setMenuItems((prevItems) =>
            prevItems.map((prevItem) =>
              prevItem.itemid === item.itemid
                ? { ...prevItem, stockquantity: prevItem.stockquantity - quantity }
                : prevItem
            )
          );
          // Reset quantity & request
          setQuantities((prev) => ({ ...prev, [item.itemid]: 1 }));
          setRequests((prev) => ({ ...prev, [item.itemid]: "" }));
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to add item to cart');
        }
      } catch (error) {
        console.error('Error adding item to cart:', error);
        alert('Error adding item to cart');
      }
    } else {
      alert('Please log in to add items to your cart.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Category Navigation */}
      <div className="flex overflow-x-auto space-x-4 pb-4 mb-8">
        {categories.map((category) => (
          <button
            key={category.categoryid}
            onClick={() => setSelectedCategory(category.categoryid)}
            className={`px-6 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === category.categoryid
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {category.categoryname}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          // Log the imageURL for debugging:
          //console.log("DEBUG: item.imageURL =", item.imageurl);

          return (
            <div
              key={item.itemid}
              className="border rounded-lg overflow-hidden shadow-lg"
            >
              <img
                src={item.imageurl ? `/images/${item.imageurl}` : error}
                alt={item.itemname}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{item.itemname}</h3>
                <p className="text-gray-600 mb-2">{item.description}</p>
                <p className="text-sm text-gray-500 mb-4">
                  In Stock: {item.stockquantity}
                </p>
                <p className="text-lg font-bold mb-4">
                  ${parseFloat(item.price).toFixed(2)}
                </p>

                {/* Quantity Selector */}
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => handleQuantityChange(item.itemid, -1)}
                    className="p-1 rounded-full hover:bg-gray-200"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="mx-2">{quantities[item.itemid]}</span>
                  <button
                    onClick={() => handleQuantityChange(item.itemid, 1)}
                    className="p-1 rounded-full hover:bg-gray-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Special Request Input */}
                <input
                  type="text"
                  placeholder="Special request..."
                  className="w-full border px-2 py-1 mb-2"
                  value={requests[item.itemid] || ""}
                  onChange={(e) =>
                    setRequests((prev) => ({ ...prev, [item.itemid]: e.target.value }))
                  }
                />

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(item)}
                  disabled={item.stockquantity === 0}
                  className={`w-full ${
                    item.stockquantity === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white py-2 rounded-md transition-colors`}
                >
                  {item.stockquantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Menu;
