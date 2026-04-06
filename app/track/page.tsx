"use client";
import { useState } from "react";

const statusSteps = ["Pending Processing", "Processing", "Shipped", "Delivered"];

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setError("");
    setOrder(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/track?id=${orderId.trim()}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data);
      } else {
        setError(data.error || "Order not found");
      }
    } catch {
      setError("Failed to connect to server");
    }
    setLoading(false);
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>PCpartSmart - Invoice ${order._id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo { font-size: 24px; font-weight: 900; font-style: italic; color: #000; }
            .logo span { color: #020617; }
            .invoice-title { font-size: 32px; font-weight: 800; color: #64748b; margin: 0; }
            .details { margin-bottom: 40px; display: flex; justify-content: space-between; }
            .details div { flex: 1; }
            .label { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 4px; display: block; }
            .value { font-size: 14px; font-weight: 600; color: #0f172a; margin: 0 0 16px 0; }
            table { border-collapse: collapse; margin-bottom: 30px; width: 100%; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
            td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
            .price { text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; }
            .total-row { border-top: 2px solid #e2e8f0; }
            .total-label { text-align: right; padding: 16px 12px; font-weight: bold; font-size: 16px; color: #64748b; }
            .total-value { text-align: right; padding: 16px 12px; font-weight: 900; font-size: 24px; color: #0f172a; }
            .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 50px; font-weight: 500; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo"><span>PCpartSmart</span></div>
            <h1 class="invoice-title">INVOICE</h1>
          </div>
          
          <div class="details">
            <div>
              <span class="label">Invoice To</span>
              <p class="value">Valued Customer</p>
            </div>
            <div style="text-align: right;">
              <span class="label">Invoice Number</span>
              <p class="value">${order._id}</p>
              <span class="label">Date</span>
              <p class="value">${new Date(order.orderDate).toLocaleDateString()}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Category</th>
                <th class="price">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map((item: any) => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td>${item.category}</td>
                  <td class="price">₱${item.price.toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="2" class="total-label">Balance Due</td>
                <td class="total-value">₱${order.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Thank you for shopping with PCpartSmart!</p>
            <p>If you have any questions concerning this invoice, contact support@pcpartsmart.com.</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const currentStep = statusSteps.indexOf(order?.status || "Pending Processing");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="text-2xl font-black tracking-tighter italic">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">PCpartSmart</span>
          </a>
          <a href="/" className="bg-slate-800 hover:bg-slate-700 px-5 py-2 rounded-lg text-sm font-bold transition-colors text-white">
            ← Back to Store
          </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3">Track Your Order</h1>
          <p className="text-slate-400">Enter your Order ID from your receipt to check the status</p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-3 mb-10">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Paste your Order ID here..."
            className="flex-1 bg-slate-900 border border-slate-700 text-white px-5 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl font-black text-sm hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-cyan-500/20"
          >
            {loading ? "..." : "Track"}
          </button>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl text-sm font-bold text-center mb-8">
            {error}
          </div>
        )}

        {order && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            {/* Status Progress */}
            <div className="mb-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Order Progress</p>
              <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-800"></div>
                <div
                  className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-700"
                  style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                ></div>

                {statusSteps.map((step, i) => (
                  <div key={step} className="relative flex flex-col items-center z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all ${
                      i <= currentStep
                        ? "bg-gradient-to-r from-cyan-500 to-purple-500 border-transparent text-white"
                        : "bg-slate-950 border-slate-700 text-slate-600"
                    }`}>
                      {i <= currentStep ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <p className={`text-[10px] font-bold mt-2 text-center max-w-[80px] ${
                      i <= currentStep ? "text-cyan-400" : "text-slate-600"
                    }`}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-sm text-slate-500 font-bold">Order ID</span>
                <span className="text-sm text-slate-300 font-mono">{order._id}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-sm text-slate-500 font-bold">Date</span>
                <span className="text-sm text-slate-300">
                  {new Date(order.orderDate).toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' })}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-sm text-slate-500 font-bold">Status</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full border ${
                  order.status === "Delivered" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                  order.status === "Shipped" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                  order.status === "Processing" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                  "bg-purple-500/10 text-purple-400 border-purple-500/30"
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="pt-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Items Ordered</p>
                <div className="space-y-2">
                  {(order.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-950 px-4 py-3 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] font-bold">{item.category}</span>
                        <span className="text-sm text-slate-300">{item.name}</span>
                      </div>
                      <span className="text-sm font-black text-white">₱{item.price?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800 mt-4">
                <span className="text-lg text-slate-400 font-bold">Total</span>
                <span className="text-2xl font-black text-cyan-400">₱{order.totalAmount?.toLocaleString()}</span>
              </div>
              
              <div className="pt-8 border-t border-slate-800 mt-4">
                 <button
                   onClick={handleDownloadInvoice}
                   className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-4 rounded-xl font-bold transition-all border border-slate-700 hover:border-slate-600 flex justify-center items-center gap-2"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                   Download PDF Invoice
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
