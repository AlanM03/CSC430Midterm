import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { Minus, Plus } from 'lucide-react';
import burgerItem from '../assets/burgerItem.png';


const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState('burgers');
  const [customizations, setCustomizations] = useState({});

  const handleCustomization = (itemId, option, value) => {
    setCustomizations(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [option]: value
      }
    }));
  };

  const addToCart = (item) => {
    // TODO: Implement cart functionality
    console.log('Adding to cart:', item, customizations[item.id]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Category Navigation */}
      <div className="flex overflow-x-auto space-x-4 pb-4 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems
          .filter((item) => item.category === selectedCategory)
          .map((item) => (
            <div
              key={item.id}
              className="border rounded-lg overflow-hidden shadow-lg"
            >
              <img
                src={burgerItem}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <p className="text-lg font-bold mb-4">${item.price.toFixed(2)}</p>

                {/* Customization Options */}
                {item.customizations && (
                  <div className="space-y-4 mb-4">
                    {item.customizations.map((custom) => (
                      <div key={custom.name}>
                        <h4 className="font-semibold mb-2">{custom.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {custom.options.map((option) => (
                            <button
                              key={option}
                              onClick={() =>
                                handleCustomization(item.id, custom.name, option)
                              }
                              className={`px-3 py-1 rounded-full text-sm ${
                                customizations[item.id]?.[custom.name] === option
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => addToCart(item)}
                  className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

const categories = [
  { id: 'burgers', name: 'Burgers' },
  { id: 'hotdogs', name: 'Hot Dogs' },
  { id: 'sandwiches', name: 'Sandwiches' },
  { id: 'fries', name: 'Fries & Sides' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'shakes', name: 'Shakes' },
];

const menuItems = [
  {
    id: 1,
    name: 'Hamburger',
    description: 'Fresh, hand-formed patty with your choice of toppings',
    price: 7.99,
    category: 'burgers',
    customizations: [
      {
        name: 'Doneness',
        options: ['Well Done', 'Medium Well']
      },
      {
        name: 'Toppings',
        options: ['Lettuce', 'Tomato', 'Onions', 'Pickles', 'Mushrooms']
      }
    ]
  },
  // Add more menu items here
];

export default Menu;
