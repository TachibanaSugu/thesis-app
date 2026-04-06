"use client";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useToast } from "../components/Toast";
import { AnimatedCounter } from "../components/AnimatedCounter";

export default function AdminDashboard() {
  const [sessionUser, setSessionUser] = useState<any>(null);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "inventory" | "analytics">("orders");

  // Protect Admin Route Client-Side
  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(session => {
        if (!session || !session.user || session.user.role !== "admin") {
          window.location.href = "/";
        } else {
          setSessionUser(session.user);
        }
      })
      .catch(() => {
        window.location.href = "/";
      });
  }, []);

  // Product Form State
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", category: "CPU", price: "", stock: "" });
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [inventorySearch, setInventorySearch] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/admin/products"),
        ]);
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        setOrders(ordersData);
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockCount = products.filter((p) => p.stock !== undefined && p.stock <= 3).length;

  // Analytics Helpers
  const categoryDistribution = (() => {
    const dist: Record<string, number> = {};
    products.forEach(p => { dist[p.category] = (dist[p.category] || 0) + 1; });
    return Object.entries(dist).sort(([,a],[,b]) => b - a);
  })();

  const topSellingProducts = (() => {
    const sales: Record<string, { name: string; count: number; revenue: number }> = {};
    orders.forEach(order => {
      (order.items || []).forEach((item: any) => {
        const key = item.name || 'Unknown';
        if (!sales[key]) sales[key] = { name: key, count: 0, revenue: 0 };
        sales[key].count += 1;
        sales[key].revenue += (item.price || 0);
      });
    });
    return Object.values(sales).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  })();

  const orderTimeline = (() => {
    const timeline: Record<string, { count: number; revenue: number }> = {};
    orders.forEach(order => {
      const date = new Date(order.orderDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      if (!timeline[date]) timeline[date] = { count: 0, revenue: 0 };
      timeline[date].count += 1;
      timeline[date].revenue += (order.totalAmount || 0);
    });
    return Object.entries(timeline).slice(-14);
  })();

  const categoryColors: Record<string, string> = {
    CPU: '#06b6d4', GPU: '#a855f7', Motherboard: '#3b82f6', RAM: '#f59e0b',
    Storage: '#10b981', PSU: '#f43f5e', Case: '#8b5cf6'
  };

  // CRUD Handlers
  const openAddForm = () => {
    setEditingProduct(null);
    setFormData({ name: "", category: "CPU", price: "", stock: "" });
    setShowForm(true);
  };

  const openEditForm = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock ?? 0),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) return;

    if (editingProduct) {
      // UPDATE
      await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: editingProduct._id, ...formData }),
      });
    } else {
      // CREATE
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }

    // Refresh products
    const res = await fetch("/api/admin/products");
    setProducts(await res.json());
    setShowForm(false);
    addToast(editingProduct ? "Product updated!" : "Product added!", "success");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id }),
    });
    const res = await fetch("/api/admin/products");
    setProducts(await res.json());
    addToast("Product deleted", "info");
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await fetch("/api/orders/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: orderId, status: newStatus }),
    });
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
    addToast(`Order status → ${newStatus}`, "success");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-10 flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">Command Center</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={async () => {
                const res = await fetch("/api/admin/sync", { method: "POST" });
                if (res.ok) {
                  addToast("Database Synchronized!", "success");
                  const prodRes = await fetch("/api/admin/products");
                  setProducts(await prodRes.json());
                }
              }}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-xl font-black transition-colors text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              Sync Catalog
            </button>
            <a href="/" className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl font-bold transition-colors text-sm text-white flex items-center">
              &larr; Store
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-5 py-3 rounded-xl font-bold transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </header>

        {/* 📊 Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
            <h3 className="text-slate-500 font-bold mb-2 uppercase text-xs tracking-widest">Total Revenue</h3>
            <p className="text-4xl font-black text-cyan-400"><AnimatedCounter value={totalRevenue} prefix="₱" /></p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
            <h3 className="text-slate-500 font-bold mb-2 uppercase text-xs tracking-widest">Total Orders</h3>
            <p className="text-4xl font-black text-purple-400"><AnimatedCounter value={orders.length} /></p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
            <h3 className="text-slate-500 font-bold mb-2 uppercase text-xs tracking-widest">Total Products</h3>
            <p className="text-4xl font-black text-emerald-400"><AnimatedCounter value={products.length} /></p>
            <p className="text-xs text-slate-500 mt-1"><AnimatedCounter value={totalStock} /> total units in stock</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
            <h3 className="text-slate-500 font-bold mb-2 uppercase text-xs tracking-widest">Low Stock Alert</h3>
            <p className={`text-4xl font-black ${lowStockCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              <AnimatedCounter value={lowStockCount} />
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {lowStockCount > 0 ? "products need restocking" : "all products well stocked"}
            </p>
          </div>
        </div>

        {/* 📊 Revenue by Category Chart */}
        {orders.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-10 shadow-xl">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Revenue by Category</h3>
            <div className="space-y-3">
              {(() => {
                const categoryRevenue: Record<string, number> = {};
                orders.forEach((order) => {
                  (order.items || []).forEach((item: any) => {
                    categoryRevenue[item.category] = (categoryRevenue[item.category] || 0) + (item.price || 0);
                  });
                });
                const maxRevenue = Math.max(...Object.values(categoryRevenue), 1);
                return Object.entries(categoryRevenue)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, revenue]) => (
                    <div key={category} className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-400 w-24 shrink-0">{category}</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                          style={{ width: `${Math.max((revenue / maxRevenue) * 100, 8)}%` }}
                        >
                          <span className="text-[10px] font-black text-white">₱{revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ));
              })()}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "orders"
                ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Recent Transactions
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "inventory"
                ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Inventory Management
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "analytics"
                ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            📊 Analytics
          </button>
        </div>

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <>
            <h2 className="text-2xl font-black text-white mb-6 flex items-center justify-between">
              Recent Transactions
              {orders.length > 0 && (
                <button
                  onClick={() => {
                    const csvHeader = "Order ID,Date,Items,Total,Status\n";
                    const csvRows = orders.map((o: any) =>
                      `"${o._id}","${new Date(o.orderDate).toLocaleString()}","${o.items?.length || 0}","${o.totalAmount}","${o.status || 'Pending'}"`
                    ).join("\n");
                    const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `PCpartSmart_orders_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    addToast("Orders exported to CSV!", "success");
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2 rounded-xl text-xs font-bold transition-colors border border-slate-700"
                >
                  Export CSV
                </button>
              )}
            </h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-6">Order ID</th>
                    <th className="p-6">Date &amp; Time</th>
                    <th className="p-6">Items Built</th>
                    <th className="p-6">Total Value</th>
                    <th className="p-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold animate-pulse">Fetching Secure Data...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No orders yet. Start selling!</td></tr>
                  ) : orders.map((order, i) => (
                    <>
                      <tr 
                        key={i} 
                        className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                      >
                        <td className="p-6 font-mono text-xs text-slate-400">
                          <span className="inline-flex items-center gap-2">
                            <svg className={`w-3 h-3 transition-transform ${expandedOrder === order._id ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            {order._id.substring(0, 10)}...
                          </span>
                        </td>
                        <td className="p-6 text-sm font-medium text-slate-300">
                          {new Date(order.orderDate).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                        <td className="p-6">
                          <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700">
                            {order.items?.length || 0} Parts
                          </span>
                        </td>
                        <td className="p-6 font-black text-cyan-400 text-lg">₱{order.totalAmount?.toLocaleString()}</td>
                        <td className="p-6" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status || "Pending Processing"}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className={`text-xs font-bold px-3 py-2 rounded-lg border cursor-pointer transition-all focus:outline-none ${
                              (order.status || "Pending").includes("Delivered")
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : (order.status || "Pending").includes("Shipped")
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                : (order.status || "Pending").includes("Processing")
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            }`}
                          >
                            <option value="Pending Processing">Pending Processing</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                      {/* EXPANDED ORDER DETAILS */}
                      {expandedOrder === order._id && (
                        <tr key={`detail-${i}`}>
                          <td colSpan={5} className="p-0">
                            <div className="bg-slate-950/50 border-y border-slate-800 px-8 py-5">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Items in this order</p>
                              <div className="space-y-2">
                                {(order.items || []).map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center bg-slate-900/50 px-4 py-2.5 rounded-lg border border-slate-800">
                                    <div className="flex items-center gap-3">
                                      <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] font-bold">{item.category}</span>
                                      <span className="text-sm text-slate-300 font-medium">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-white">₱{item.price?.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* INVENTORY TAB */}
        {activeTab === "inventory" && (
          <>
            <div className="flex justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-black text-white">Inventory Management</h2>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition-all w-48"
                />
                <button
                  onClick={async () => {
                    const res = await fetch("/api/admin/sync", { method: "POST" });
                    if (res.ok) {
                      addToast("Global Scraper Sync Complete!", "success");
                      const prodRes = await fetch("/api/admin/products");
                      setProducts(await prodRes.json());
                    }
                  }}
                  className="bg-slate-800 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all border border-slate-700 hover:border-cyan-500 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 animate-pulse text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Trigger Scraper
                </button>
                <button
                  onClick={openAddForm}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 rounded-xl font-black text-sm transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] whitespace-nowrap"
                >
                  + Add Product
                </button>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-6">Product Name</th>
                    <th className="p-6">Category</th>
                    <th className="p-6">Price</th>
                    <th className="p-6">Stock</th>
                    <th className="p-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {products.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No products in database. Click &quot;Sync Catalog&quot; or add products manually.</td></tr>
                  ) : products.filter((p) => 
                    p.name?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                    p.category?.toLowerCase().includes(inventorySearch.toLowerCase())
                  ).length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No products match your search.</td></tr>
                  ) : products.filter((p) => 
                    p.name?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                    p.category?.toLowerCase().includes(inventorySearch.toLowerCase())
                  ).map((product, i) => (
                    <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-6 font-bold text-white">{product.name}</td>
                      <td className="p-6">
                        <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-6 font-black text-white">₱{product.price?.toLocaleString()}</td>
                      <td className="p-6">
                        <span className={`font-black text-lg ${
                          (product.stock ?? 0) > 5 ? "text-emerald-400" : (product.stock ?? 0) > 0 ? "text-amber-400" : "text-red-400"
                        }`}>
                          {product.stock ?? 0}
                        </span>
                        {(product.stock ?? 0) <= 3 && (product.stock ?? 0) > 0 && (
                          <span className="ml-2 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">LOW</span>
                        )}
                        {(product.stock ?? 0) <= 0 && (
                          <span className="ml-2 text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">OUT</span>
                        )}
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditForm(product)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-red-500/30"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <>
            <h2 className="text-2xl font-black text-white mb-6">Platform Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* CATEGORY DISTRIBUTION PIE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Product Distribution by Category</h3>
                <div className="flex items-center gap-8">
                  <svg viewBox="0 0 100 100" className="w-40 h-40 shrink-0">
                    {(() => {
                      const total = categoryDistribution.reduce((s,[,v]) => s + v, 0);
                      let cumAngle = 0;
                      return categoryDistribution.map(([cat, count], idx) => {
                        const frac = count / total;
                        const startAngle = cumAngle * 360;
                        const endAngle = (cumAngle + frac) * 360;
                        cumAngle += frac;
                        const startRad = (startAngle - 90) * (Math.PI / 180);
                        const endRad = (endAngle - 90) * (Math.PI / 180);
                        const x1 = 50 + 45 * Math.cos(startRad);
                        const y1 = 50 + 45 * Math.sin(startRad);
                        const x2 = 50 + 45 * Math.cos(endRad);
                        const y2 = 50 + 45 * Math.sin(endRad);
                        const largeArc = frac > 0.5 ? 1 : 0;
                        const d = `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`;
                        return <path key={idx} d={d} fill={categoryColors[cat] || '#64748b'} stroke="#0f172a" strokeWidth="1" className="hover:opacity-80 transition-opacity cursor-pointer" />
                      });
                    })()}
                  </svg>
                  <div className="space-y-2 flex-1">
                    {categoryDistribution.map(([cat, count]) => (
                      <div key={cat} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: categoryColors[cat] || '#64748b' }}></div>
                        <span className="text-sm text-slate-300 font-bold flex-1">{cat}</span>
                        <span className="text-sm text-slate-500 font-black">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* TOP SELLING PRODUCTS */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Top Selling Products</h3>
                {topSellingProducts.length === 0 ? (
                  <p className="text-slate-600 text-sm">No sales data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topSellingProducts.map((item, idx) => {
                      const maxRev = topSellingProducts[0]?.revenue || 1;
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-600 w-5">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-bold truncate">{item.name}</p>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700" style={{ width: `${(item.revenue / maxRev) * 100}%` }}></div>
                            </div>
                          </div>
                          <span className="text-xs font-black text-purple-400 shrink-0">₱{item.revenue.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ORDER TIMELINE CHART */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl mb-8">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Order Timeline (Last 14 Days)</h3>
              {orderTimeline.length === 0 ? (
                <p className="text-slate-600 text-sm">No orders yet to display.</p>
              ) : (
                <div className="flex items-end gap-2 h-48">
                  {orderTimeline.map(([date, data], idx) => {
                    const maxRev = Math.max(...orderTimeline.map(([,d]) => d.revenue), 1);
                    const height = Math.max((data.revenue / maxRev) * 100, 5);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="relative w-full flex justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap border border-slate-700">
                            ₱{data.revenue.toLocaleString()} ({data.count} orders)
                          </div>
                        </div>
                        <div 
                          className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-lg transition-all duration-700 hover:from-purple-500 hover:to-purple-400 cursor-pointer min-h-[4px]" 
                          style={{ height: `${height}%` }}
                        ></div>
                        <span className="text-[9px] text-slate-600 font-bold">{date}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* VENDOR VS CATEGORY BREAKDOWN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Avg. Order Value</p>
                <p className="text-3xl font-black text-cyan-400">₱{orders.length > 0 ? Math.round(totalRevenue / orders.length).toLocaleString() : 0}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Catalog Value</p>
                <p className="text-3xl font-black text-purple-400">₱{products.reduce((s,p) => s + (p.price || 0) * (p.stock || 0), 0).toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Fulfillment Rate</p>
                <p className="text-3xl font-black text-emerald-400">{orders.length > 0 ? Math.round(orders.filter(o => o.status === 'Delivered').length / orders.length * 100) : 0}%</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ADD/EDIT PRODUCT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-8">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-t-2xl"></div>
            
            <h2 className="text-2xl font-black text-white mb-6 mt-2">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-all"
                  placeholder="e.g. NVIDIA RTX 5090"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-all"
                >
                  {["CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU", "Case"].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Price (₱)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-xl font-black transition-all hover:scale-[1.02]"
              >
                {editingProduct ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}