"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileTabs({ orders }: { orders: any[] }) {
  const [activeTab, setActiveTab] = useState<"orders" | "builds" | "wishlist">("orders");
  const [savedBuilds, setSavedBuilds] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Load local storage items
    const localW = localStorage.getItem("tb_wishlist");
    const localB = localStorage.getItem("tb_builds");
    if (localW) setWishlistIds(JSON.parse(localW));
    if (localB) setSavedBuilds(JSON.parse(localB));

    // Fetch products to map wishlist IDs
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(console.error);
  }, []);

  const wishlistedProducts = products.filter(p => wishlistIds.includes(p._id));

  return (
    <div className="mt-8 relative z-10 w-full">
      {/* TABS HEADER */}
      <div className="flex gap-4 border-b border-slate-800 pb-px overflow-x-auto min-w-full">
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-4 px-2 text-sm font-bold transition-all relative whitespace-nowrap ${
            activeTab === "orders" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            Order History
          </div>
          {activeTab === "orders" && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-t-full shadow-[0_0_10px_#22d3ee]" />}
        </button>

        <button
          onClick={() => setActiveTab("builds")}
          className={`pb-4 px-2 text-sm font-bold transition-all relative whitespace-nowrap ${
            activeTab === "builds" ? "text-purple-400" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
            Saved PC Builds
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] ml-1">{savedBuilds.length}</span>
          </div>
          {activeTab === "builds" && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400 rounded-t-full shadow-[0_0_10px_#c084fc]" />}
        </button>

        <button
          onClick={() => setActiveTab("wishlist")}
          className={`pb-4 px-2 text-sm font-bold transition-all relative whitespace-nowrap ${
            activeTab === "wishlist" ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            My Wishlist
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] ml-1">{wishlistIds.length}</span>
          </div>
          {activeTab === "wishlist" && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-t-full shadow-[0_0_10px_#34d399]" />}
        </button>
      </div>

      {/* TABS CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
          className="mt-8"
        >
          {/* TAB 1: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                  <h3 className="text-xl font-bold text-slate-300 mb-2">No orders found</h3>
                  <p className="text-slate-500 mb-6 pb-6 border-b border-slate-800/50 max-w-sm mx-auto">Looks like you haven't built your dream PC yet. Head to the storefront to interact with our AI consultant.</p>
                  <Link href="/" className="text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-xl transition-colors inline-block shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    Build a PC
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order._id.toString()} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-colors group">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-cyan-400 font-bold">#{order._id.toString().substring(0, 8)}...</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border ${
                          order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          order.status === 'Shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                          order.status === 'Processing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        }`}>
                          {order.status || 'Processing'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">Placed on {new Date(order.orderDate).toLocaleDateString('en-PH', { dateStyle: 'long', timeStyle: 'short' })}</p>
                      <p className="text-white text-sm font-bold">{order.items?.length || 0} items</p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Paid</p>
                        <p className="text-2xl font-black text-white">₱{(order.totalAmount || 0).toLocaleString()}</p>
                      </div>
                      <Link 
                        href={`/track?id=${order._id.toString()}`}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-3 rounded-xl font-bold text-sm transition-colors border border-slate-700 h-fit"
                      >
                        Track
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: SAVED BUILDS */}
          {activeTab === "builds" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedBuilds.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
                   <p className="text-slate-500 text-sm">No saved builds. Create one in the Cart sidebar!</p>
                </div>
              ) : (
                savedBuilds.map(build => (
                  <div key={build.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-colors group">
                    <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-4">
                      <div>
                        <h3 className="text-lg font-black text-white group-hover:text-purple-400 transition-colors">{build.name}</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{new Date(build.date).toLocaleDateString()}</p>
                      </div>
                      <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded-lg text-xs font-bold border border-purple-500/30">
                        {build.items.length} Parts
                      </span>
                    </div>
                    <div className="space-y-2 mb-6 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                       {build.items.map((i:any, idx:number) => (
                         <div key={idx} className="flex gap-3 items-center group/item hover:bg-slate-800/50 p-1.5 rounded-lg transition-colors">
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover/item:bg-purple-500"></span>
                           <span className="text-xs text-slate-300 line-clamp-1 flex-1">{i.name}</span>
                         </div>
                       ))}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                       <span className="text-sm font-bold text-slate-400">Total</span>
                       <span className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors">₱{build.total.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === "wishlist" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlistIds.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
                   <p className="text-slate-500 text-sm">Your wishlist is empty. Tap the heart icon on products you like!</p>
                </div>
              ) : (
                wishlistedProducts.length === 0 ? (
                   <div className="col-span-full text-center py-12"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                ) : (
                  wishlistedProducts.map(product => (
                    <div key={product._id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-colors flex flex-col relative">
                      {/* Heart Icon active state */}
                      <button 
                        className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-900/80 text-red-500 hover:scale-110 shadow-lg border border-red-500/30"
                        onClick={() => {
                          const newWishlist = wishlistIds.filter(id => id !== product._id);
                          setWishlistIds(newWishlist);
                          localStorage.setItem('tb_wishlist', JSON.stringify(newWishlist));
                        }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      </button>

                      <div className="aspect-square bg-white flex items-center justify-center p-4 relative group">
                         {product.image ? (
                           <img src={product.image} alt={product.name} className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500" />
                         ) : (
                           <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 font-bold group-hover:scale-110 transition-transform">{product.category}</div>
                         )}
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{product.category}</span>
                        <h3 className="text-xs font-bold text-white mb-2 line-clamp-2 mt-1">{product.name}</h3>
                        <p className="text-sm font-black text-emerald-400 mt-auto">₱{product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
