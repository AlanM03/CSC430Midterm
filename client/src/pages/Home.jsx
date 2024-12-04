import { Link } from 'react-router-dom';
import homeBanner from '../assets/homeBanner.jpg';
import burgers from '../assets/burgers.jpg';
import journey from '../assets/journey.webp';


const Home = () => {


  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[600px]">
        <div className="absolute inset-0 bg-black/50" />
        <img
          src={homeBanner} 
          alt="Five Guys Burger"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="text-5xl font-bold mb-4">Welcome to Five Guys</h1>
          <p className="text-xl mb-8">Fresh, hand-crafted burgers since 1986</p>
          <Link
            to="/menu"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md text-lg font-semibold"
          >
            Order Now
          </Link>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/menu?category=${category.id}`}
              className="group relative h-64 rounded-lg overflow-hidden flex items-center justify-center"
            >
              <img
                src={burgers}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold text-center">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Five Guys has been a family-owned and operated business since 1986. 
                Our commitment to quality ingredients and exceptional service has 
                made us one of America’s favorite burger joints.
              </p>
              <p className="text-gray-600">
                Every burger is hand-crafted with fresh, never frozen beef and 
                cooked to perfection. Choose from our extensive list of free 
                toppings to create your perfect burger.
              </p>
            </div>
            <div className="relative h-96">
              <img
                src={journey}
                alt="Five Guys restaurant"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const categories = [
  { id: 'burgers', name: 'Burgers' },
  { id: 'fries', name: 'Fries & Sides' },
  { id: 'drinks', name: 'Drinks & Shakes' },
];

export default Home;
