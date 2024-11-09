import { useState } from 'react';

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);

  const handleTrackOrder = (e) => {
    e.preventDefault();
    // Simulate fetching order status
    setOrderStatus('Your order is being prepared and will be delivered soon.');
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Track Your Order</h1>
      <form onSubmit={handleTrackOrder} className="space-y-4">
        <div>
          <label className="block text-gray-700">Order ID</label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full border px-4 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
        >
          Track Order
        </button>
      </form>
      {orderStatus && (
        <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded">
          <p className="text-lg">{orderStatus}</p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
