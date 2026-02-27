import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import OrdersModule from '../modules/orders';
import CircularsModule from '../modules/circulars';
import SignalsModule from '../modules/signals';
import DirectoryModule from '../modules/directory';
import ChannelsModule from '../modules/channels';
import DocumentsModule from '../modules/documents';
import RolesModule from '../modules/roles';

// Dashboard module orchestration:
// fetchAll() is the central refresh trigger passed to modules after mutations.
const CommandDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [circulars, setCirculars] = useState([]);
  const [signals, setSignals] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [docs, setDocs] = useState([]);
  const [channels, setChannels] = useState([]);

  /**
   * Centralized refresh keeps module state consistent after
   * route writes and socket-driven workflow events.
   */
  const fetchAll = useCallback(async () => {
    const baseURL = process.env.REACT_APP_BACKEND_URL;

    try {
      const [ordersRes, circularRes, signalRes, directoryRes, docsRes, channelsRes] = await Promise.all([
        axios.get(`${baseURL}/api/orders`, { withCredentials: true }),
        axios.get(`${baseURL}/api/circulars`, { withCredentials: true }),
        axios.get(`${baseURL}/api/signals`, { withCredentials: true }),
        axios.get(`${baseURL}/api/directory`, { withCredentials: true }),
        axios.get(`${baseURL}/api/documents`, { withCredentials: true }),
        axios.get(`${baseURL}/api/channels`, { withCredentials: true }),
      ]);

      setOrders(ordersRes.data.data || []);
      setCirculars(circularRes.data.data || []);
      setSignals(signalRes.data.data || []);
      setPersonnel(directoryRes.data.data || []);
      setDocs(docsRes.data.data || []);
      setChannels(channelsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const baseURL = process.env.REACT_APP_BACKEND_URL;
    const token = localStorage.getItem('token');

    const orderSocket = io(`${baseURL}/orders`, { auth: { token } });
    const channelSocket = io(`${baseURL}/channels`, { auth: { token } });

    orderSocket.on('orders:updated', fetchAll);
    channelSocket.on('channels:updated', fetchAll);

    return () => {
      orderSocket.disconnect();
      channelSocket.disconnect();
    };
  }, [fetchAll]);

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:p-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">CommandLink Administrative HQ</h1>
        <p className="text-slate-600">Structured command communications, directives, and internal governance.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <ChannelsModule channels={channels} personnel={personnel} onRefresh={fetchAll} />
          <DirectoryModule personnel={personnel} />
        </div>

        <div className="space-y-4">
          <OrdersModule orders={orders} onRefresh={fetchAll} />
          <CircularsModule circulars={circulars} />
          <DocumentsModule docs={docs} />
        </div>

        <div className="space-y-4">
          <SignalsModule signals={signals} />
          <RolesModule />
        </div>
      </div>
    </div>
  );
};

export default CommandDashboard;
