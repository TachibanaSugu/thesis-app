"use client";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the orders when the admin logs in
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  // Calculate total money made
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-10 flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">Command Center</p>
          </div>
          <a href="/" className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl font-bold transition-colors text-sm">
            &larr; Back to Store
          </a>
        </header>

        {/* 📊 Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
            <h3 className="text-slate-500 font-bold mb-2 uppercase text-xs tracking-widest">Total Revenue</h3>
            <p className="text-4xl font-black text-cyan-400">₱{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
            <h3 className="text-slate-500 font-bold mb-2 uppercase text-xs tracking-widest">Total Orders</h3>
            <p className="text-4xl font-black text-purple-400">{orders.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
            <h3 className="text-slate-500 font-bold mb-2 uppercase text-xs tracking-widest">System Status</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
              <p className="text-xl font-black text-emerald-400">Online</p>
            </div>
          </div>
        </div>

        {/* 📋 Data Table */}
        <h2 className="text-2xl font-black text-white mb-6">Recent Transactions</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-800">
              <tr>
                <th className="p-6">Order ID</th>
                <th className="p-6">Date & Time</th>
                <th className="p-6">Items Built</th>
                <th className="p-6">Total Value</th>
                <th className="p-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-bold animate-pulse">Fetching Secure Data...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No orders yet. Start selling!</td></tr>
              ) : orders.map((order, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-6 font-mono text-xs text-slate-400">{order._id.substring(0, 10)}...</td>
                  <td className="p-6 text-sm font-medium text-slate-300">
                    {new Date(order.orderDate).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="p-6">
                    <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700">
                      {order.items?.length || 0} Parts
                    </span>
                  </td>
                  <td className="p-6 font-black text-cyan-400 text-lg">₱{order.totalAmount?.toLocaleString()}</td>
                  <td className="p-6">
                    <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-4 py-1.5 rounded-full text-xs font-bold">
                      {order.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}