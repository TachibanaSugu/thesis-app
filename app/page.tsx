"use client";
import { useState, useRef, useEffect } from "react";

const getImageForCategory = (category) => {
  const images = {
    "CPU": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80",
    "GPU": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&q=80",
    "Motherboard": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80",
    "RAM": "https://images.unsplash.com/photo-1562976540-1502f75a6439?w=500&q=80",
    "Storage": "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=500&q=80",
    "PSU": "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&q=80",
    "Case": "https://images.unsplash.com/photo-1585565804112-f201f68c48b4?w=500&q=80"
  };
  return images[category] || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80";
};

export default function Home() {
  const [isOpen, setIsOpen] = useState(false); 
  const [isCartOpen, setIsCartOpen] = useState(false); 
  const [cart, setCart] = useState([]); 
  
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([{ role: "bot", text: "SYSTEM ONLINE. I am your AI PC Building Consultant. What is your budget?" }]);
  const [loading, setLoading] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  
  // 🔍 NEW: Search State
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };
    fetchProducts();
  }, []);

  // 🧠 NEW: The "Smart Filter" Engine (Reacts to both Search AND Category)
  useEffect(() => {
    let result = products;

    if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchQuery.trim() !== "") {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [searchQuery, activeCategory, products]);

  const addToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
    setIsCartOpen(true); 
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    alert("Processing your order... 🚀");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, total: cartTotal }),
      });
      if (res.ok) {
        alert("Payment Successful! Order saved to Database. ✅");
        setCart([]); 
        setIsCartOpen(false); 
      } else {
        alert("Checkout failed. Please try again.");
      }
    } catch (error) {
      console.error("Checkout failed", error);
      alert("Failed to connect to the server.");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newChat = [...chatLog, { role: "user", text: input }];
    setChatLog(newChat);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: chatLog, message: input }),
      });
      
      const data = await res.json();
      const botRawMessage = data.text || data.error;

      if (botRawMessage.includes("[ADD_TO_CART:")) {
        const partName = botRawMessage.split("[ADD_TO_CART:")[1].split("]")[0].trim();
        const productToAdd = products.find(p => p.name.toLowerCase() === partName.toLowerCase());
        
        if (productToAdd) {
          addToCart(productToAdd);
        }
      }
      
      const cleanMessage = botRawMessage.replace(/\[ADD_TO_CART:.*?\]/g, "").trim();
      setChatLog([...newChat, { role: "bot", text: cleanMessage }]);

    } catch (error) {
      setChatLog([...newChat, { role: "bot", text: "CONNECTION LOST. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tighter italic flex items-center gap-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">TECHBUILDZ</span>.AI
            <a href="/admin" className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded hover:bg-slate-700 hover:text-white transition-colors">Admin</a>
          </h1>
          <div className="flex gap-4">
             <button 
                onClick={() => setIsCartOpen(true)}
                className="bg-cyan-500/10 border border-cyan-500/50 px-4 py-2 rounded-lg text-xs font-bold text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
             >
                CART ({cart.length})
             </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black mb-4 text-white">Marketplace</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {["All", "CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU", "Case"].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    activeCategory === cat ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 🔍 NEW: THE SEARCH BAR */}
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Search components..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl pl-10 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
            />
            <svg className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        {/* DYNAMIC PRODUCT GRID */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-xl font-bold">No components found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 transition-all group flex flex-col">
                <div className="aspect-square bg-slate-800 rounded-lg mb-4 overflow-hidden relative group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all">
                  <img 
                    src={getImageForCategory(product.category)} 
                    alt={product.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">{product.category}</p>
                  <h3 className="font-bold text-slate-100 mb-2 line-clamp-2">{product.name}</h3>
                </div>
                <div className="mt-4">
                  <p className="text-xl font-black text-white mb-3">₱{product.price.toLocaleString()}</p>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-slate-800 hover:bg-cyan-500 hover:text-white py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* SHOPPING CART SIDEBAR (Unchanged) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-slate-900 h-full shadow-2xl border-l border-slate-800 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white text-3xl">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {cart.length === 0 ? (
                <p className="text-slate-500 text-center mt-20">Your cart is empty. Start building!</p>
              ) : (
                cart.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3">
                      <img src={getImageForCategory(item.category)} className="w-10 h-10 rounded-md object-cover opacity-80" alt="part" />
                      <div>
                        <p className="text-[10px] text-cyan-400 font-bold uppercase">{item.category}</p>
                        <p className="text-sm font-bold text-white line-clamp-1">{item.name}</p>
                      </div>
                    </div>
                    <p className="font-black text-white pl-4">₱{item.price.toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-800 pt-6 mt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-400 font-bold">Total Amount:</span>
                <span className="text-3xl font-black text-cyan-400">₱{cartTotal.toLocaleString()}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-4 rounded-xl font-black hover:scale-[1.02] transition-transform"
              >
                CHECKOUT NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI CHAT WIDGET (Unchanged) */}
      <div className="fixed bottom-6 right-6 z-50">
        {isOpen ? (
          <div className="w-[380px] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[550px] border border-slate-700/50 backdrop-blur-xl bg-slate-900/95">
            <div className="bg-slate-800 p-4 border-b border-slate-700/50 flex justify-between items-center">
              <span className="font-extrabold text-cyan-400">Assistant</span>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white font-bold text-2xl">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {chatLog.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <span className={`p-3 rounded-xl text-sm max-w-[85%] ${msg.role === "user" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"}`}>
                    {msg.text}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 bg-slate-900 border-t border-slate-700/50 flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about a build..." className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" />
              <button type="submit" className="px-4 py-2 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-400 shadow-lg shadow-cyan-500/20">
                {loading ? "..." : "Send"}
              </button>
            </form>
          </div>
        ) : (
          <button onClick={() => setIsOpen(true)} className="bg-cyan-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all h-16 w-16 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}