import React, { useState } from 'react';
import axios from 'axios';

const OrdersModule = ({ orders = [], onRefresh }) => {
  const [error, setError] = useState('');
  const baseURL = process.env.REACT_APP_BACKEND_URL;

  /**
   * Runs a server-side lifecycle transition and refreshes dashboard state.
   */
  const transition = async (orderId, action) => {
    try {
      setError('');
      await axios.post(`${baseURL}/api/orders/${orderId}/${action}`, {}, { withCredentials: true });
      onRefresh?.();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to update order status.');
    }
  };

  const acknowledge = async (orderId) => {
    try {
      setError('');
      await axios.post(`${baseURL}/api/orders/${orderId}/acknowledge`, {}, { withCredentials: true });
      onRefresh?.();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to acknowledge order.');
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold text-slate-800 mb-2">Official Orders</h3>
      <p className="text-sm text-slate-500 mb-3">Lifecycle: Draft → Published → Acknowledged → Archived</p>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <ul className="space-y-2 text-sm">
        {orders.slice(0, 5).map((order) => (
          <li key={order._id} className="border rounded p-2">
            <div className="flex justify-between gap-2">
              <strong>{order.title}</strong>
              <span>{order.priority}</span>
            </div>
            <div className="text-xs text-slate-500 mb-2">{order.status}</div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => transition(order._id, 'publish')} className="border px-2 rounded" disabled={order.status === 'Published' || order.status === 'Archived'}>Publish</button>
              <button onClick={() => acknowledge(order._id)} className="border px-2 rounded" disabled={order.status === 'Acknowledged' || order.status === 'Archived'}>Acknowledge</button>
              <button onClick={() => transition(order._id, 'archive')} className="border px-2 rounded" disabled={order.status === 'Archived'}>Archive</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersModule;
