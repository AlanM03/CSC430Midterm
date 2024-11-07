import { useState } from 'react';

const Checkout = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    paymentMethod: 'credit-card',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add checkout processing logic here
    alert('Order placed successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border px-4 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Payment Method</label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full border px-4 py-2"
          >
            <option value="credit-card">Credit Card</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
        >
          Place Order
        </button>
      </form>
    </div>
  );
};

export default Checkout;
