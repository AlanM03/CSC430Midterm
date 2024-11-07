import { useState } from 'react';

const LocationFinder = () => {
  const [location, setLocation] = useState('');
  const [locationsList, setLocationsList] = useState([]);

  const handleFindLocations = (e) => {
    e.preventDefault();
    // Simulate location search
    setLocationsList([
      { name: 'Five Guys Downtown', address: '123 Burger Lane, City Center' },
      { name: 'Five Guys Uptown', address: '456 Fry Ave, Uptown' },
    ]);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Find a Location</h1>
      <form onSubmit={handleFindLocations} className="space-y-4">
        <div>
          <label className="block text-gray-700">City or ZIP Code</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border px-4 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
        >
          Find Locations
        </button>
      </form>
      {locationsList.length > 0 && (
        <div className="mt-6 space-y-4">
          {locationsList.map((loc, index) => (
            <div key={index} className="p-4 bg-gray-100 border border-gray-300 rounded">
              <h2 className="text-xl font-bold">{loc.name}</h2>
              <p>{loc.address}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationFinder;
