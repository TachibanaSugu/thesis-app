"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "./components/Toast";

const getImageForCategory = (category: string) => {
  const images: Record<string, string> = {
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

// Helper for random but consistent rating
const getRating = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const stars = 4 + (Math.abs(hash) % 10) / 10;
  const reviews = 10 + (Math.abs(hash) % 200);
  return { stars: stars.toFixed(1), reviews };
};

// Helper for dynamic reviews
const getFakeReviews = (name: string) => {
  const reviewsPool = [
    "Absolutely stellar performance. Highly recommended!",
    "Good value for the price. Installation was easy.",
    "Works exactly as expected. Benchmark scores are solid.",
    "A bit louder than I anticipated, but the thermals are great.",
    "Perfect for my latest 1440p gaming build.",
    "Solid build quality, premium feel. Would buy again.",
    "It's decent. Nothing mind-blowing, but gets the job done."
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const idx1 = Math.abs(hash) % reviewsPool.length;
  const idx2 = (Math.abs(hash) + 2) % reviewsPool.length;
  
  return [
    { author: "VerifiedBuyer_" + (Math.abs(hash) % 99), text: reviewsPool[idx1], rating: 5 },
    { author: "TechEnthusiast_" + ((Math.abs(hash) + 7) % 88), text: reviewsPool[idx2], rating: 4 },
  ];
};

export default function Home() {
  const [isOpen, setIsOpen] = useState(false); 
  const [isCartOpen, setIsCartOpen] = useState(false); 
  const [cart, setCart] = useState<any[]>([]); 
  
  // 🧾 NEW: Receipt State
  const [receipt, setReceipt] = useState<any>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<any[]>([{ role: "bot", text: "SYSTEM ONLINE. I am your AI PC Building Consultant. What is your budget?" }]);
  const [loading, setLoading] = useState(false);
  
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [theme, setTheme] = useState<'dark' | 'cyberpunk'>('dark');
  const [lang, setLang] = useState<'en' | 'fil'>('en');
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, text: 'Welcome to TechBuildz.AI!', type: 'info', time: new Date().toISOString(), read: false },
    { id: 2, text: 'New RTX 4090 stock available on Shopee', type: 'deal', time: new Date().toISOString(), read: false },
    { id: 3, text: 'Price drop detected on AMD Ryzen 7 7800X3D', type: 'alert', time: new Date().toISOString(), read: false },
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [savedBuilds, setSavedBuilds] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [saveBuildName, setSaveBuildName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya' | null>(null);
  const [simulatingPayment, setSimulatingPayment] = useState(false);

  // Sync state cleanly with localStorage on mount so /profile can access them natively
  useEffect(() => {
    const localW = localStorage.getItem('tb_wishlist');
    const localB = localStorage.getItem('tb_builds');
    if (localW) setWishlist(JSON.parse(localW));
    if (localB) setSavedBuilds(JSON.parse(localB));
  }, []);

  useEffect(() => {
    if (wishlist.length > 0) localStorage.setItem('tb_wishlist', JSON.stringify(wishlist));
    if (savedBuilds.length > 0) localStorage.setItem('tb_builds', JSON.stringify(savedBuilds));
  }, [wishlist, savedBuilds]);

  // 🌐 LANGUAGE PACK
  const t = lang === 'en' ? {
    hero: 'Build Your Dream', heroSub: 'PC with AI', heroDesc: 'Get expert component recommendations, real-time compatibility checking, and smart build suggestions — all powered by artificial intelligence.',
    marketplace: 'Marketplace', searchPlaceholder: 'Search components...', cart: 'CART', checkout: 'CHECKOUT NOW',
    totalAmount: 'Total Amount', powerDraw: 'Power Draw', perfSim: 'Performance Simulator', buildChecklist: 'Build Checklist',
    exportBuild: 'Export Build Summary', talkAI: 'Talk to AI Builder', trackOrder: 'Track Order', costBreakdown: 'Cost Breakdown',
    saveBuild: 'Save This Build', compareBuilds: 'Compare Builds', notifications: 'Notifications', markAllRead: 'Mark all read',
    startingAt: 'Starting at', addToCart: 'Add to Cart', outOfStock: 'Out of Stock', compareAndBuy: 'Compare & Buy (Aggregator Views)',
    noComponents: 'No components found matching your search.', all: 'All', savedBuilds: 'Saved Builds',
  } : {
    hero: 'Bumuo ng Iyong Pangarap', heroSub: 'na PC gamit ang AI', heroDesc: 'Kumuha ng mga rekomendasyon ng eksperto, real-time na pagsusuri ng compatibility, at matalinong mga suhestiyon — lahat pinapagana ng artificial intelligence.',
    marketplace: 'Tindahan', searchPlaceholder: 'Maghanap ng mga bahagi...', cart: 'KARITON', checkout: 'MAG-CHECKOUT NGAYON',
    totalAmount: 'Kabuuang Halaga', powerDraw: 'Lakas ng Kuryente', perfSim: 'Tagasuri ng Performance', buildChecklist: 'Listahan ng Build',
    exportBuild: 'I-download ang Build Summary', talkAI: 'Makipag-usap sa AI Builder', trackOrder: 'I-track ang Order', costBreakdown: 'Breakdown ng Gastos',
    saveBuild: 'I-save ang Build na Ito', compareBuilds: 'Ikumpara ang mga Build', notifications: 'Mga Abiso', markAllRead: 'Markahang lahat na nabasa',
    startingAt: 'Simula sa', addToCart: 'Idagdag sa Kariton', outOfStock: 'Wala ng Stock', compareAndBuy: 'Ikumpara at Bumili (Aggregator Views)',
    noComponents: 'Walang nahanap na mga bahagi sa iyong paghahanap.', all: 'Lahat', savedBuilds: 'Mga Na-save na Build',
  };

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
      setProductsLoading(false);
    };
    fetchProducts();
    
    // Fetch auth session safely without forcing a Provider re-render
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(session => {
        if (session && Object.keys(session).length > 0) {
          setSessionUser(session.user);
        }
      })
      .catch(err => console.error("Session check skipped", err));
  }, []);

  // Shared Cart Loader
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedString = params.get('cart');
    if (sharedString) {
      try {
        const decodedCart = JSON.parse(atob(sharedString));
        setCart(decodedCart);
        setIsCartOpen(true);
        // Remove toast warning for simplicity because toast isn't available outside context yet, we just set the cart.
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Invalid shared cart");
      }
    }
  }, []);

  // Scroll listener for back-to-top button
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let result = products;
    if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory);
    }
    if (searchQuery.trim() !== "") {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    // Sort
    if (sortBy === "price-low") result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    setFilteredProducts(result);
  }, [searchQuery, activeCategory, products, sortBy]);

  const addToCart = (product: any) => {
    // 🛡️ Strict Compatibility Engine
    if (product.category === "CPU" || product.category === "Motherboard") {
      const isProductIntel = product.name.toLowerCase().includes("intel") || product.name.toLowerCase().includes("z790") || product.name.toLowerCase().includes("b760");
      const isProductAMD = product.name.toLowerCase().includes("amd") || product.name.toLowerCase().includes("ryzen") || product.name.toLowerCase().includes("b650") || product.name.toLowerCase().includes("x670") || product.name.toLowerCase().includes("am5");
      
      const cartCPU = cart.find(item => item.category === "CPU");
      const cartMobo = cart.find(item => item.category === "Motherboard");

      if (product.category === "CPU" && cartMobo) {
        const isMoboIntel = cartMobo.name.toLowerCase().includes("intel") || cartMobo.name.toLowerCase().includes("z790") || cartMobo.name.toLowerCase().includes("b760");
        const isMoboAMD = cartMobo.name.toLowerCase().includes("amd") || cartMobo.name.toLowerCase().includes("b650") || cartMobo.name.toLowerCase().includes("x670") || cartMobo.name.toLowerCase().includes("am5");
        
        if (isProductIntel && isMoboAMD) {
          addToast("Compatibility Rule: Intel CPU cannot be used with an AMD Motherboard.", "error");
          return;
        }
        if (isProductAMD && isMoboIntel) {
          addToast("Compatibility Rule: AMD CPU cannot be used with an Intel Motherboard.", "error");
          return;
        }
      }

      if (product.category === "Motherboard" && cartCPU) {
        const isCPUIntel = cartCPU.name.toLowerCase().includes("intel");
        const isCPUAMD = cartCPU.name.toLowerCase().includes("amd") || cartCPU.name.toLowerCase().includes("ryzen");
        
        if (isProductIntel && isCPUAMD) {
          addToast("Compatibility Rule: Intel Motherboard cannot be used with an AMD CPU.", "error");
          return;
        }
        if (isProductAMD && isCPUIntel) {
          addToast("Compatibility Rule: AMD Motherboard cannot be used with an Intel CPU.", "error");
          return;
        }
      }
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.name === product.name);
      if (existing) {
        return prevCart.map((item) =>
          item.name === product.name ? { ...item, qty: (item.qty || 1) + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
    addToast(`${product.name} added to cart!`, "success");
  };

  const copyShareLink = () => {
    const minCart = cart.map(item => ({ name: item.name, price: item.price, stock: item.stock, category: item.category, qty: item.qty }));
    const encoded = btoa(JSON.stringify(minCart));
    const url = `${window.location.origin}/?cart=${encoded}`;
    navigator.clipboard.writeText(url);
    addToast("Build link copied to clipboard!", "success");
  };

  const removeFromCart = (productName: string) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.name === productName);
      if (existing && (existing.qty || 1) > 1) {
        return prevCart.map((item) =>
          item.name === productName ? { ...item, qty: item.qty - 1 } : item
        );
      }
      return prevCart.filter((item) => item.name !== productName);
    });
    addToast("Item removed", "info");
  };

  const deleteFromCart = (productName: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.name !== productName));
    addToast("Item removed from cart", "info");
  };

  const clearCart = () => {
    setCart([]);
    addToast("Cart cleared", "info");
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
  const cartItemCount = cart.reduce((count, item) => count + (item.qty || 1), 0);

  // ⚡ HARDWARE ENGINEERING: WATTAGE & FPS ENGINES
  const totalWattage = cart.reduce((sum, item) => sum + (item.category !== 'PSU' ? (item.wattage || 0) * (item.qty || 1) : 0), 0) + (cart.length > 0 ? 50 : 0);
  const psuCapacity = cart.filter((i:any) => i.category === 'PSU').reduce((sum, item) => sum + (item.wattage || 0) * (item.qty || 1), 0);
  const hasPSU = cart.some((i:any) => i.category === 'PSU');
  const isPowerDangerous = hasPSU && (totalWattage > psuCapacity * 0.9);

  // ⚠️ STRICT HARDWARE COMPATIBILITY ENGINE
  let compatibilityError: string | null = null;
  const cartCPU = cart.find((i:any) => i.category === 'CPU');
  const cartMobo = cart.find((i:any) => i.category === 'Motherboard');
  
  if (cartCPU && cartMobo) {
    const cpuName = cartCPU.name.toLowerCase();
    const moboName = cartMobo.name.toLowerCase();
    
    // Simple Heuristics for Sockets
    const isCpuAM5 = cpuName.includes('ryzen 7000') || cpuName.includes('ryzen 9000') || cpuName.includes('8000G') || cpuName.includes('7800x3d');
    const isCpuAM4 = cpuName.includes('ryzen 5000') || cpuName.includes('ryzen 3000') || cpuName.includes('5800x3d');
    const isCpuLGA1700 = cpuName.includes('core i') && (cpuName.includes('12') || cpuName.includes('13') || cpuName.includes('14'));
    
    const isMoboAM5 = moboName.includes('x670') || moboName.includes('b650') || moboName.includes('a620');
    const isMoboAM4 = moboName.includes('x570') || moboName.includes('b550') || moboName.includes('a520');
    const isMoboLGA1700 = moboName.includes('z790') || moboName.includes('z690') || moboName.includes('b760') || moboName.includes('b660');

    if (isCpuAM5 && !isMoboAM5) compatibilityError = "INCOMPATIBLE: AM5 CPU requires an AM5 (X670/B650) motherboard.";
    else if (isCpuAM4 && !isMoboAM4) compatibilityError = "INCOMPATIBLE: AM4 CPU requires an AM4 (X570/B550) motherboard.";
    else if (isCpuLGA1700 && !isMoboLGA1700) compatibilityError = "INCOMPATIBLE: LGA1700 CPU requires an LGA1700 (Z790/B760) motherboard.";
    else if (!isCpuAM5 && !isCpuAM4 && !isCpuLGA1700 && (isMoboAM5 || isMoboAM4 || isMoboLGA1700)) {
      if (cpuName.includes('intel') && (isMoboAM5 || isMoboAM4)) compatibilityError = "INCOMPATIBLE: Intel CPU cannot fit an AMD Motherboard.";
      else if (cpuName.includes('amd') && isMoboLGA1700) compatibilityError = "INCOMPATIBLE: AMD CPU cannot fit an Intel Motherboard.";
    }
  }

  let fpsEstimate = null;
  const cartGPU = cart.find((i:any) => i.category === 'GPU');
  if (cartCPU && cartGPU) {
    const gName = cartGPU.name.toLowerCase();
    if (gName.includes('4090')) fpsEstimate = "4K Ultra: 144+ FPS | 1440p: 240+ FPS";
    else if (gName.includes('4080') || gName.includes('7900')) fpsEstimate = "4K Max: 100+ FPS | 1440p: 180+ FPS";
    else if (gName.includes('4070') || gName.includes('7800')) fpsEstimate = "1440p Ultra: 140+ FPS | 4K: 70+ FPS";
    else fpsEstimate = "1080p Ultra: 144+ FPS | 1440p: 90+ FPS";
  }

  // 🚀 UPDATED: Checkout Engine with Payment Interception
  const handleCheckout = () => {
    if (cart.length === 0 || isPowerDangerous || compatibilityError) return;
    setShowPaymentModal(true);
  };

  const processSimulatedPayment = async () => {
    setSimulatingPayment(true);
    try {
      // Fake processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const flatItems = cart.flatMap((item) =>
        Array.from({ length: item.qty || 1 }, () => ({ name: item.name, category: item.category, price: item.price }))
      );

      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: flatItems, total: cartTotal }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setReceipt({
          orderId: data.orderId, items: [...cart], total: cartTotal, date: new Date().toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' })
        });
        setCart([]); setShowPaymentModal(false); setIsCartOpen(false);
        addToast("Payment Verified. Order placed! 🎉", "success");
      } else addToast("Checkout failed via server.", "error");
    } catch (error) {
      addToast("Connection error during payment.", "error");
    }
    setSimulatingPayment(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const sendMessage = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ history: chatLog, message: input, cart: cart }),
      });
      
      const data = await res.json();
      const botRawMessage = data.text || data.error;

      if (botRawMessage.includes("[ADD_TO_CART:")) {
        const partName = botRawMessage.split("[ADD_TO_CART:")[1].split("]")[0].trim();
        const productToAdd = products.find(p => p.name.toLowerCase() === partName.toLowerCase());
        if (productToAdd) addToCart(productToAdd);
      }
      
      const cleanMessage = botRawMessage.replace(/\[ADD_TO_CART:.*?\]/g, "").trim();
      setChatLog([...newChat, { role: "bot", text: cleanMessage }]);

    } catch (error) {
      setChatLog([...newChat, { role: "bot", text: "CONNECTION LOST. Please try again." }]);
    }
    setLoading(false);
  };

  const [isBuilding, setIsBuilding] = useState(false);
  const handleAutoBuild = async (type: string) => {
    setIsBuilding(true);
    addToast(`Building ${type} rig in the cloud...`, "info");
    try {
      const res = await fetch("/api/autobuild", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.build && data.build.length > 0) {
        setCart(data.build.map((p:any) => {
           const vendor = (p.vendors && p.vendors.length > 0) ? p.vendors[0] : { name: "System", price: p.price };
           return { ...p, qty: 1, name: `${p.name} [via ${vendor.name}]`, price: vendor.price };
        }));
        setIsOpen(false);
        setIsCartOpen(true);
        addToast("Rig constructed successfully!", "success");
      } else {
        addToast("Automated construction failed.", "error");
      }
    } catch(e) {
      addToast("Network error during Auto-Build.", "error");
    }
    setIsBuilding(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tighter italic flex items-center gap-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">TECHBUILDZ</span>.AI
            {sessionUser?.role === 'admin' && (
              <a href="/admin" className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded hover:bg-slate-700 hover:text-white transition-colors">Admin</a>
            )}
          </h1>
          <div className="flex gap-3 items-center">
             {sessionUser ? (
               <a href={sessionUser.role === 'admin' ? "/admin" : "/profile"} className="text-xs font-bold text-slate-400 hover:text-white transition-colors mr-2 flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                   {sessionUser.name?.charAt(0) || "U"}
                 </div>
                 {sessionUser.name}
               </a>
             ) : (
               <a href="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors mr-2">Login</a>
             )}

             {/* 🌐 LANGUAGE TOGGLE */}
             <button 
               onClick={() => setLang(l => l === 'en' ? 'fil' : 'en')}
               className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition-all border border-slate-700 text-slate-300"
             >
               {lang === 'en' ? '🇵🇭 FIL' : '🇺🇸 EN'}
             </button>
             
             <button 
               onClick={() => setTheme(t => t === 'dark' ? 'cyberpunk' : 'dark')}
               className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                 theme === 'cyberpunk' 
                   ? 'bg-pink-500/20 text-pink-400 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.4)]' 
                   : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
               }`}
             >
               {theme === 'dark' ? 'Cyberpunk Mode' : 'Dark Mode'}
             </button>

             {/* 🔔 NOTIFICATION BELL */}
             <div className="relative">
               <button 
                 onClick={() => setShowNotifs(!showNotifs)}
                 className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition-all border border-slate-700 text-slate-300 relative"
               >
                 🔔
                 {notifications.filter(n => !n.read).length > 0 && (
                   <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                     {notifications.filter(n => !n.read).length}
                   </span>
                 )}
               </button>
               {showNotifs && (
                 <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                   <div className="flex justify-between items-center p-4 border-b border-slate-800">
                     <span className="text-sm font-black text-white">{t.notifications}</span>
                     <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-[10px] text-cyan-400 font-bold hover:underline">{t.markAllRead}</button>
                   </div>
                   <div className="max-h-72 overflow-y-auto">
                     {notifications.length === 0 ? (
                       <p className="p-4 text-sm text-slate-500 text-center">No notifications</p>
                     ) : notifications.map(n => (
                       <div key={n.id} className={`px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-cyan-500/5' : ''}`}>
                         <div className="flex items-start gap-3">
                           <span className="text-sm mt-0.5">{n.type === 'deal' ? '🏷️' : n.type === 'alert' ? '📉' : 'ℹ️'}</span>
                           <div className="flex-1 min-w-0">
                             <p className={`text-xs font-bold ${!n.read ? 'text-white' : 'text-slate-400'}`}>{n.text}</p>
                             <p className="text-[10px] text-slate-600 mt-1">{new Date(n.time).toLocaleString('en-PH', { timeStyle: 'short', dateStyle: 'short' })}</p>
                           </div>
                           {!n.read && <span className="w-2 h-2 bg-cyan-500 rounded-full shrink-0 mt-1.5"></span>}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>

             <a href="/track" className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors text-white border border-slate-700">{t.trackOrder}</a>
             <button 
                onClick={() => setIsCartOpen(true)}
                className="bg-cyan-500/10 border border-cyan-500/50 px-4 py-2 rounded-lg text-xs font-bold text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
             >
                {t.cart} ({cartItemCount})
             </button>
          </div>
        </div>
      </header>

      {/* 🚀 HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            AI-POWERED PC BUILDING
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
            {t.hero}
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">{t.heroSub}</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mb-8 leading-relaxed">
            {t.heroDesc}
          </p>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <button 
              onClick={() => setIsOpen(true)}
              className="bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-sm hover:scale-105 hover:bg-slate-700 transition-all border border-slate-700 shadow-xl"
            >
              {t.talkAI}
            </button>
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-4 animate-pulse">
             Powered by Google Gemini 2.0 Agentic APIs
          </p>
        </div>
      </section>

      {/* 🏗️ HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.3em] mb-3">{lang === 'en' ? 'How It Works' : 'Paano Ito Gumagana'}</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">{lang === 'en' ? 'Build in 3 Easy Steps' : 'Bumuo sa 3 Madaling Hakbang'}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🔍', title: lang === 'en' ? 'Browse & Compare' : 'Maghanap at Ikumpara', desc: lang === 'en' ? 'Explore 31+ components across multiple vendors. Compare prices from Shopee, Lazada & DynaQuest in real-time.' : 'Tuklasin ang 31+ na bahagi mula sa iba\'t ibang tindahan. Ikumpara ang mga presyo mula sa Shopee, Lazada at DynaQuest.' },
            { icon: '🤖', title: lang === 'en' ? 'AI Builds Your PC' : 'Ang AI ang Bubuo ng PC Mo', desc: lang === 'en' ? 'Our Gemini-powered AI checks compatibility, calculates wattage, and estimates FPS — or auto-builds your entire rig in seconds.' : 'Sinusuri ng aming AI ang compatibility, kinakalkula ang wattage, at tinatantya ang FPS — o awtomatikong binubuo ang rig mo.' },
            { icon: '🛒', title: lang === 'en' ? 'Save & Checkout' : 'I-save at Mag-checkout', desc: lang === 'en' ? 'Save multiple builds, compare them side-by-side, export summaries, and checkout with vendor-specific pricing.' : 'Mag-save ng maraming build, ikumpara sila, mag-export ng summary, at mag-checkout sa presyo ng bawat tindahan.' },
          ].map((step, idx) => (
            <div key={idx} className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center hover:border-cyan-500/30 transition-all group">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-cyan-500 rounded-full text-white text-sm font-black flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">{idx + 1}</div>
              <div className="text-4xl mb-4 mt-2 group-hover:scale-110 transition-transform">{step.icon}</div>
              <h3 className="text-lg font-black text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      <main id="marketplace" className="max-w-7xl mx-auto px-6 py-12">
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

          <div className="relative w-full md:w-auto flex gap-3 items-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="name">Name: A → Z</option>
            </select>
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
        </div>

        {productsLoading ? (
          /* SKELETON LOADER */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
                <div className="aspect-square bg-slate-800 rounded-lg mb-4"></div>
                <div className="h-3 bg-slate-800 rounded w-16 mb-2"></div>
                <div className="h-4 bg-slate-800 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-slate-800 rounded w-24 mb-3"></div>
                <div className="h-10 bg-slate-800 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-xl font-bold">No components found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => {
              const rating = getRating(product.name);
              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedProduct(product)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 transition-all group flex flex-col cursor-pointer"
                >
                  <div className="aspect-square bg-slate-800 rounded-lg mb-4 overflow-hidden relative group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all">
                    <img src={product.imageUrl || getImageForCategory(product.category)} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                    {/* ❤️ WISHLIST HEART */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setWishlist(prev => prev.includes(product.name) ? prev.filter(n => n !== product.name) : [...prev, product.name]); }}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${wishlist.includes(product.name) ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-black/40 text-white/60 hover:bg-red-500/80 hover:text-white backdrop-blur-sm'}`}
                    >
                      <svg className="w-4 h-4" fill={wishlist.includes(product.name) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>
                    {product.vendors && product.vendors.filter((v:any) => v.stock > 0).length === 0 && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-black text-sm uppercase tracking-wider">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">{product.category}</p>
                    <h3 className="font-bold text-slate-100 mb-2 line-clamp-2">{product.name}</h3>
                    
                    {/* Interactive Ratings */}
                    <div className="flex items-center gap-2 mb-2">
                       <div className="flex text-amber-400 text-xs">
                         {[1,2,3,4,5].map(star => (
                           <svg key={star} className={`w-3 h-3 ${star <= Math.round(Number(rating.stars)) ? 'fill-current' : 'text-slate-700 fill-slate-700'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                         ))}
                       </div>
                       <span className="text-[10px] text-slate-500 font-bold">{rating.stars} ({rating.reviews})</span>
                    </div>

                    {product.vendors && (
                      <div className="flex gap-1 mt-2 mb-1">
                        {product.vendors.filter((v:any) => v.stock > 0).map((v:any, vi:number) => (
                           <span key={vi} className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${v.badgeColor}`}>
                             {v.name}
                           </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-bold text-slate-500 uppercase">Starting at</p>
                    <p className="text-xl font-black text-white mb-3">₱{(product.startingPrice || product.price).toLocaleString()}</p>
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }} 
                      disabled={product.vendors && product.vendors.filter((v:any) => v.stock > 0).length === 0}
                      className="w-full bg-slate-800 hover:bg-cyan-500 hover:text-white py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:bg-slate-700"
                    >
                      {product.vendors && product.vendors.filter((v:any) => v.stock > 0).length === 0 ? 'Out of Stock' : 'Compare Deals'}
                    </motion.button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* SHOPPING CART SIDEBAR */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsCartOpen(false)}
            ></motion.div>
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md bg-slate-900 h-full shadow-2xl border-l border-slate-800 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white">Your Cart</h2>
                <div className="flex items-center gap-3">
                  {cart.length > 0 && (
                    <>
                      <button 
                        onClick={copyShareLink}
                        className="text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-2"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        Share Build
                      </button>
                      <button 
                        onClick={clearCart}
                        className="text-xs font-bold text-slate-500 hover:text-red-400 transition-colors"
                      >
                        Clear All
                      </button>
                    </>
                  )}
                  <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white text-3xl ml-2">&times;</button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {cart.length === 0 ? (
                  <p className="text-slate-500 text-center mt-20">Your cart is empty.</p>
                ) : (
                  cart.map((item: any, i) => (
                    <motion.div 
                      key={item.name} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img src={item.imageUrl || getImageForCategory(item.category)} className="w-10 h-10 rounded-md object-cover opacity-80 shrink-0" alt="part" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-cyan-400 font-bold uppercase">{item.category}</p>
                          <p className="text-sm font-bold text-white line-clamp-1">{item.name}</p>
                          <p className="text-xs text-slate-400">₱{item.price.toLocaleString()} each</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 bg-slate-900 rounded-lg border border-slate-700">
                          <button 
                            onClick={() => removeFromCart(item.name)}
                            className="px-2 py-1 text-slate-400 hover:text-white transition-colors text-sm font-bold"
                          >
                            −
                          </button>
                          <span className="px-2 text-sm font-black text-white min-w-[24px] text-center">{item.qty || 1}</span>
                          <button 
                            onClick={() => addToCart(item)}
                            className="px-2 py-1 text-slate-400 hover:text-cyan-400 transition-colors text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => deleteFromCart(item.name)}
                          className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                          title="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* 🔧 BUILD COMPLETENESS CHECKER */}
              {cart.length > 0 && (
                <div className="border-t border-slate-800 pt-4 mt-4 mb-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Build Checklist</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU", "Case"].map((cat) => {
                      const hasIt = cart.some((item: any) => item.category === cat);
                      return (
                        <div key={cat} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
                          hasIt ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800/50 text-slate-600"
                        }`}>
                          {hasIt ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                          )}
                          {cat}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 📊 COST BREAKDOWN DONUT */}
              {cart.length > 1 && (() => {
                const catSpend: Record<string,number> = {};
                cart.forEach((item:any) => { catSpend[item.category] = (catSpend[item.category] || 0) + item.price * (item.qty || 1); });
                const cats = Object.entries(catSpend).sort(([,a],[,b]) => b - a);
                const total = cats.reduce((s,[,v]) => s + v, 0);
                const donutColors: Record<string,string> = { CPU:'#06b6d4', GPU:'#a855f7', Motherboard:'#3b82f6', RAM:'#f59e0b', Storage:'#10b981', PSU:'#f43f5e', Case:'#8b5cf6' };
                let cum = 0;
                return (
                  <div className="border-t border-slate-800 pt-4 mt-4 mb-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{t.costBreakdown}</p>
                    <div className="flex items-center gap-4">
                      <svg viewBox="0 0 100 100" className="w-20 h-20 shrink-0">
                        {cats.map(([cat, spend], idx) => {
                          const frac = spend / total;
                          const start = cum; cum += frac;
                          const sA = (start * 360 - 90) * Math.PI / 180;
                          const eA = (cum * 360 - 90) * Math.PI / 180;
                          const x1 = 50 + 40 * Math.cos(sA), y1 = 50 + 40 * Math.sin(sA);
                          const x2 = 50 + 40 * Math.cos(eA), y2 = 50 + 40 * Math.sin(eA);
                          const la = frac > 0.5 ? 1 : 0;
                          const ix1 = 50 + 25 * Math.cos(eA), iy1 = 50 + 25 * Math.sin(eA);
                          const ix2 = 50 + 25 * Math.cos(sA), iy2 = 50 + 25 * Math.sin(sA);
                          return <path key={idx} d={`M ${x1} ${y1} A 40 40 0 ${la} 1 ${x2} ${y2} L ${ix1} ${iy1} A 25 25 0 ${la} 0 ${ix2} ${iy2} Z`} fill={donutColors[cat]||'#64748b'} stroke="#0f172a" strokeWidth="0.5" />
                        })}
                      </svg>
                      <div className="space-y-1 flex-1">
                        {cats.map(([cat, spend]) => (
                          <div key={cat} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: donutColors[cat]||'#64748b'}}></div>
                            <span className="text-[10px] text-slate-400 font-bold flex-1">{cat}</span>
                            <span className="text-[10px] text-white font-black">{Math.round(spend/total*100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 💾 SAVE / COMPARE BUILD */}
              {cart.length > 0 && (
                <div className="border-t border-slate-800 pt-4 mt-4 mb-2 flex gap-2">
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="flex-1 py-2 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                  >
                    💾 {t.saveBuild}
                  </button>
                  {savedBuilds.length > 0 && (
                    <button
                      onClick={() => setShowComparison(true)}
                      className="flex-1 py-2 rounded-lg text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-all"
                    >
                      📊 {t.compareBuilds} ({savedBuilds.length})
                    </button>
                  )}
                </div>
              )}

              {/* ⚡ SMART WATTAGE ENGINE */}
              {cart.length > 0 && (
                <div className="border-t border-slate-800 pt-4 mt-4 mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Power Draw
                    </p>
                    <p className={`text-xs font-black ${isPowerDangerous ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>{totalWattage}W / {hasPSU ? `${psuCapacity}W` : 'No PSU'}</p>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 mb-2 overflow-hidden border border-slate-800 relative">
                    <div 
                      className={`absolute top-0 left-0 h-1.5 rounded-full transition-all duration-1000 ${isPowerDangerous ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-cyan-500'}`} 
                      style={{ width: `${Math.min(100, hasPSU ? (totalWattage / psuCapacity) * 100 : (totalWattage / 850) * 100)}%` }}
                    ></div>
                  </div>
                  {isPowerDangerous && (
                    <div className="flex items-start gap-2 bg-red-500/10 p-2.5 rounded-lg border border-red-500/30">
                      <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Warning: System Draw Exceeds Capacity! Upgrade PSU.</p>
                    </div>
                  )}
                  {!hasPSU && totalWattage > 0 && <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-1">Add a PSU to handle {totalWattage}W Load</p>}
                </div>
              )}

              {/* 🎮 FPS SIMULATOR */}
              {fpsEstimate && (
                 <div className="border-t border-slate-800 pt-4 mt-4 mb-2">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                     <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     Performance Simulator
                   </p>
                   <div className="bg-purple-500/10 border border-purple-500/30 p-2.5 rounded-lg flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <span className="text-[11px] font-black text-purple-400 tracking-wider shadow-sm">{fpsEstimate}</span>
                   </div>
                 </div>
              )}

              <div className="border-t border-slate-800 pt-6 mt-4">
                {/* ⚠️ COMPATIBILITY WARNING */}
                {compatibilityError && (
                  <div className="mb-4 bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <p className="text-xs text-red-400 font-bold leading-tight">{compatibilityError}</p>
                  </div>
                )}

                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-400 font-bold">Total Amount:</span>
                  <span className="text-3xl font-black text-cyan-400">₱{cartTotal.toLocaleString()}</span>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  disabled={isCheckingOut || isPowerDangerous || !!compatibilityError}
                  className={`w-full py-4 rounded-xl font-black transition-all ${(isPowerDangerous || compatibilityError) ? 'bg-red-500/20 text-red-500 border border-red-500/50 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:scale-[1.02]'}`}
                >
                  {isCheckingOut ? "PROCESSING..." : compatibilityError ? "SOCKET MISMATCH - SEE WARNING" : isPowerDangerous ? "PSU CAPACITY TOO LOW" : "CHECKOUT NOW"}
                </motion.button>
                {cart.length > 0 && (
                  <button
                    onClick={() => {
                      const now = new Date().toLocaleString('en-PH', { dateStyle: 'full', timeStyle: 'short' });
                      let doc = `╔══════════════════════════════════════╗\n║    TECHBUILDZ.AI  BUILD SUMMARY      ║\n╚══════════════════════════════════════╝\n\nGenerated: ${now}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n COMPONENTS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                      cart.forEach((item: any, i: number) => {
                        doc += `\n ${i + 1}. [${item.category}]  ${item.name}\n    Price: ₱${item.price.toLocaleString()}    Qty: ${item.qty || 1}\n    Wattage: ${item.wattage || 'N/A'}W\n`;
                      });
                      doc += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n SYSTEM ANALYSIS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                      doc += `\n  Total Power Draw:  ${totalWattage}W`;
                      doc += `\n  PSU Capacity:      ${hasPSU ? psuCapacity + 'W' : 'Not Selected'}`;
                      doc += `\n  Power Status:      ${isPowerDangerous ? '⚠️  DANGEROUS - Upgrade PSU!' : hasPSU ? '✅ Safe' : 'ℹ️  Add a PSU'}`;
                      if (fpsEstimate) doc += `\n\n  Gaming Performance: ${fpsEstimate}`;
                      doc += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n  TOTAL: ₱${cartTotal.toLocaleString()}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n  Powered by TechBuildz.AI\n  https://techbuildz.ai\n`;
                      const blob = new Blob([doc], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `TechBuildz_Build_Summary_${new Date().toISOString().split('T')[0]}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                      addToast("Build summary downloaded!", "success");
                    }}
                    className="w-full mt-3 py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Export Build Summary
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 💳 NEW: PAYMENT SIMULATION MODAL */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !simulatingPayment && setShowPaymentModal(false)}></motion.div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-white">Select Payment</h2>
                <p className="text-slate-400 text-sm mt-1">Scan QR code to simulate checkout</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button 
                  onClick={() => setPaymentMethod('gcash')}
                  disabled={simulatingPayment}
                  className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'gcash' ? 'border-[#007DFE] bg-[#007DFE]/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
                >
                  <div className="text-[#007DFE] font-black text-xl italic tracking-tighter">GCash</div>
                  {paymentMethod === 'gcash' && <div className="absolute top-2 right-2 w-3 h-3 bg-[#007DFE] rounded-full shadow-[0_0_10px_#007DFE]"></div>}
                </button>
                <button 
                  onClick={() => setPaymentMethod('maya')}
                  disabled={simulatingPayment}
                  className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'maya' ? 'border-[#12C85D] bg-[#12C85D]/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
                >
                  <div className="text-[#12C85D] font-black text-xl italic tracking-tighter">maya</div>
                  {paymentMethod === 'maya' && <div className="absolute top-2 right-2 w-3 h-3 bg-[#12C85D] rounded-full shadow-[0_0_10px_#12C85D]"></div>}
                </button>
              </div>

              {paymentMethod && (
                <div className="bg-white p-4 rounded-2xl mb-6 mx-auto w-48 h-48 flex items-center justify-center border-4 border-slate-800 relative shadow-inner">
                  <div className={`absolute inset-2 border-4 border-dashed rounded-lg opacity-30 ${paymentMethod === 'gcash' ? 'border-[#007DFE]' : 'border-[#12C85D]'}`}></div>
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-slate-900" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3zm2 2v4h4V5zM13 3h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zm13-2h3v2h-3zm-3 0h2v2h-2zm3 3h3v2h-3zm-3 3h3v2h-3zm3 3h3v2h-3zm-3-6h2v2h-2zm0 6h2v2h-2zm-3-3h2v2h-2zm0-6h2v2h-2zm0 3h2v2h-2z" /></svg>
                    <p className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${paymentMethod === 'gcash' ? 'text-[#007DFE]' : 'text-[#12C85D]'}`}>Scan to Pay</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-6 px-4 py-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold text-sm">Amount Due:</span>
                <span className="text-2xl font-black text-white">₱{cartTotal.toLocaleString()}</span>
              </div>

              <button
                onClick={processSimulatedPayment}
                disabled={!paymentMethod || simulatingPayment}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-4 rounded-xl font-black transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {simulatingPayment ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    PROCESSING...
                  </>
                ) : (
                  "SIMULATE PAYMENT"
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🧾 NEW: DIGITAL RECEIPT MODAL */}
      {receipt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setReceipt(null)}></div>
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-8 overflow-hidden">
            {/* Top decorative bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 to-purple-500"></div>
            
            <div className="text-center mb-8 mt-2">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-3xl font-black text-white">Payment Successful</h2>
              <p className="text-slate-400 text-sm mt-2">Thank you for shopping with TechBuildz.AI</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 mb-6">
              <div className="flex justify-between text-sm mb-2 border-b border-slate-800 pb-2">
                <span className="text-slate-500">Order ID:</span>
                <span className="text-slate-300 font-mono">{receipt.orderId}</span>
              </div>
              <div className="flex justify-between text-sm mb-4 border-b border-slate-800 pb-2">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-300">{receipt.date}</span>
              </div>
              
              <div className="space-y-3 mt-4 max-h-40 overflow-y-auto scrollbar-hide">
                {receipt.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-300 line-clamp-1 pr-4">{item.name}</span>
                    <span className="text-cyan-400 font-bold whitespace-nowrap">₱{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mb-8 px-2">
              <span className="text-lg text-slate-400 font-bold">Total Paid</span>
              <span className="text-3xl font-black text-emerald-400">₱{receipt.total.toLocaleString()}</span>
            </div>

            <div className="flex gap-3">
              <a 
                href={`/track?id=${receipt.orderId}`}
                className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 py-3 rounded-xl font-bold transition-colors text-sm text-center"
              >
                Track Order
              </a>
              <button 
                onClick={() => {
                  const printContent = document.getElementById('receipt-print');
                  if (printContent) {
                    const win = window.open('', '_blank');
                    win?.document.write(`<html><head><title>TECHBUILDZ.AI Receipt</title><style>body{font-family:system-ui;padding:40px;max-width:500px;margin:auto}h1{font-size:24px;margin-bottom:20px}table{width:100%;border-collapse:collapse}td{padding:8px 4px;border-bottom:1px solid #eee}td:last-child{text-align:right;font-weight:bold}.total{font-size:20px;font-weight:bold;margin-top:16px;text-align:right}.header{text-align:center;margin-bottom:24px}.meta{color:#666;font-size:12px}</style></head><body><div class='header'><h1>TECHBUILDZ.AI</h1><p class='meta'>Order Receipt</p></div><p class='meta'>Order ID: ${receipt.orderId}</p><p class='meta'>Date: ${receipt.date}</p><br/><table>${receipt.items.map((item: any) => `<tr><td>${item.name}</td><td>₱${item.price.toLocaleString()}</td></tr>`).join('')}</table><p class='total'>Total: ₱${receipt.total.toLocaleString()}</p><br/><p style='text-align:center;color:#999;font-size:11px'>Thank you for shopping with TECHBUILDZ.AI</p></body></html>`);
                    win?.document.close();
                    win?.print();
                  }
                }}
                className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 py-3 rounded-xl font-bold transition-colors text-sm"
              >
                Print Receipt
              </button>
              <button onClick={() => setReceipt(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-colors text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI CHAT WIDGET */}
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

      {/* FOOTER */}
      <footer className="border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-md mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-xl font-black tracking-tighter italic mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">TECHBUILDZ</span>
                <span className="text-white">.AI</span>
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                AI-powered PC component marketplace with smart compatibility checking and build recommendations.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#marketplace" className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">Marketplace</a></li>
                <li><button onClick={() => setIsOpen(true)} className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">AI Consultant</button></li>
                <li><button onClick={() => setIsCartOpen(true)} className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">Shopping Cart</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {["CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU", "Case"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="bg-slate-800 text-slate-400 hover:text-cyan-400 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-10 pt-6 text-center">
            <p className="text-slate-600 text-xs font-bold">
              &copy; {new Date().getFullYear()} TECHBUILDZ.AI — Thesis Project. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* BACK TO TOP */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-2xl flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          Back to Top
        </button>
      )}
      {/* QUICK VIEW MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-10">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedProduct(null)}></div>
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors text-2xl"
              >
                &times;
              </button>

              <div className="md:w-1/2 bg-slate-950 p-10 flex items-center justify-center relative border-r border-slate-800">
                <div className="absolute top-6 left-6">
                  <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest">{selectedProduct.category}</span>
                </div>
                <img 
                  src={selectedProduct.imageUrl || getImageForCategory(selectedProduct.category)} 
                  alt={selectedProduct.name} 
                  className="w-full h-auto max-h-[400px] object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:scale-105 transition-transform duration-500" 
                />
              </div>

              <div className="md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{selectedProduct.name}</h2>
                
                <div className="flex items-center gap-2 mb-6 pb-6 border-b border-slate-800">
                   <div className="flex text-amber-400">
                     {[1,2,3,4,5].map(star => {
                        const r = getRating(selectedProduct.name);
                        return <svg key={star} className={`w-4 h-4 ${star <= Math.round(Number(r.stars)) ? 'fill-current' : 'text-slate-700 fill-slate-700'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
                     })}
                   </div>
                   <span className="text-sm text-slate-400 font-bold">{getRating(selectedProduct.name).reviews} Reviews</span>
                </div>

                <div className="mb-8 flex-1">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Technical Specifications</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-800/50">
                      <span className="text-slate-400 text-sm">Manufacturer</span>
                      <span className="text-white text-sm font-bold">{selectedProduct.name.split(' ')[0]}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800/50">
                      <span className="text-slate-400 text-sm">Performance Tier</span>
                      <span className="text-cyan-400 text-sm font-bold">Enthusiast</span>
                    </div>
                    {selectedProduct.category === 'CPU' && (
                      <div className="flex justify-between py-2 border-b border-slate-800/50">
                        <span className="text-slate-400 text-sm">Architecture</span>
                        <span className="text-white text-sm font-bold">{selectedProduct.name.toLowerCase().includes('amd') ? 'Zen 4' : 'Raptor Lake'}</span>
                      </div>
                    )}
                    {selectedProduct.category === 'Motherboard' && (
                      <div className="flex justify-between py-2 border-b border-slate-800/50">
                        <span className="text-slate-400 text-sm">Socket Support</span>
                        <span className="text-white text-sm font-bold">{selectedProduct.name.toLowerCase().includes('z790') ? 'LGA 1700' : 'AM5'}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-slate-800/50">
                      <span className="text-slate-400 text-sm">Stock Availability</span>
                      <span className={`text-sm font-bold ${selectedProduct.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {selectedProduct.stock > 0 ? `${selectedProduct.stock} Units` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 📈 PRICE TREND CHART */}
                <div className="mb-6 border-t border-slate-800 pt-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">30-Day Price Trend</h3>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 relative overflow-hidden">
                    {(() => {
                      const basePrice = selectedProduct.price;
                      const seed = selectedProduct.name.split('').reduce((a:number,c:string) => a + c.charCodeAt(0), 0);
                      const points = Array.from({length: 30}, (_, i) => {
                        const noise = Math.sin(seed + i * 0.7) * 0.08 + Math.cos(seed * 0.3 + i * 1.1) * 0.05;
                        const trend = -0.002 * i;
                        return basePrice * (1 + noise + trend);
                      });
                      const minP = Math.min(...points) * 0.98;
                      const maxP = Math.max(...points) * 1.02;
                      const w = 280; const h = 80;
                      const pathD = points.map((p, i) => {
                        const x = (i / 29) * w;
                        const y = h - ((p - minP) / (maxP - minP)) * h;
                        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                      }).join(' ');
                      const areaD = pathD + ` L ${w} ${h} L 0 ${h} Z`;
                      const currentPrice = points[points.length - 1];
                      const startPrice = points[0];
                      const change = ((currentPrice - startPrice) / startPrice * 100).toFixed(1);
                      const isDown = currentPrice < startPrice;
                      return (
                        <>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs text-slate-400">₱{Math.round(minP).toLocaleString()} - ₱{Math.round(maxP).toLocaleString()}</span>
                            <span className={`text-xs font-black ${isDown ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isDown ? '↓' : '↑'} {Math.abs(Number(change))}% vs 30d ago
                            </span>
                          </div>
                          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20">
                            <defs>
                              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isDown ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={isDown ? '#10b981' : '#ef4444'} stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <path d={areaD} fill="url(#trendGrad)" />
                            <path d={pathD} fill="none" stroke={isDown ? '#10b981' : '#ef4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx={(29/29)*w} cy={h - ((currentPrice - minP) / (maxP - minP)) * h} r="3" fill={isDown ? '#10b981' : '#ef4444'} />
                          </svg>
                          <div className="flex justify-between mt-2">
                            <span className="text-[9px] text-slate-600 font-bold">30 days ago</span>
                            <span className="text-[9px] text-slate-600 font-bold">Today</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* DYNAMIC REVIEWS PANEL */}
                <div className="mb-6 border-t border-slate-800 pt-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Customer Reviews</h3>
                  <div className="space-y-4">
                    {getFakeReviews(selectedProduct.name).map((rev, i) => (
                      <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-cyan-400 font-bold text-xs">{rev.author}</span>
                          <div className="flex text-amber-400">
                             {[1,2,3,4,5].map(star => (
                               <svg key={star} className={`w-3 h-3 ${star <= rev.rating ? 'fill-current' : 'text-slate-700 fill-slate-700'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                             ))}
                          </div>
                        </div>
                        <p className="text-slate-300 text-sm italic">"{rev.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-800">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Compare & Buy (Aggregator Views)</h3>
                  <div className="space-y-3">
                    {selectedProduct.vendors ? (
                      selectedProduct.vendors.map((vendor: any, idx: number) => {
                        const isDiscounted = vendor.price < vendor.originalPrice;
                        return (
                          <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/50 rounded-xl border transition-colors ${vendor.stock <= 0 ? 'border-red-500/20 opacity-60' : 'border-slate-800 hover:border-slate-700'}`}>
                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                              <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${vendor.badgeColor}`}>
                                {vendor.name}
                              </span>
                              {vendor.official && (
                                <span className="bg-emerald-500/10 text-emerald-400 p-1 rounded-full border border-emerald-500/30" title="Official Store Verified">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                </span>
                              )}
                              {isDiscounted && vendor.stock > 0 && (
                                <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[10px] font-bold border border-red-500/30 animate-pulse">SALE</span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                              <div className="text-right flex-1 sm:flex-none">
                                 {isDiscounted && <p className="text-xs text-slate-500 line-through">₱{vendor.originalPrice.toLocaleString()}</p>}
                                 <p className="text-xl font-black text-white">₱{vendor.price.toLocaleString()}</p>
                              </div>
                              <button 
                                onClick={() => {
                                  addToCart({ 
                                    ...selectedProduct, 
                                    name: `${selectedProduct.name} [via ${vendor.name}]`, 
                                    price: vendor.price 
                                  });
                                  setSelectedProduct(null);
                                }}
                                disabled={vendor.stock <= 0}
                                className="bg-slate-800 hover:bg-cyan-500 hover:text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 hover:border-cyan-500 whitespace-nowrap"
                              >
                                {vendor.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                              </button>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Price</span>
                          <span className="text-3xl font-black text-white">₱{selectedProduct.price.toLocaleString()}</span>
                        </div>
                        <button 
                          onClick={() => {
                            addToCart(selectedProduct);
                            setSelectedProduct(null);
                          }}
                          disabled={selectedProduct.stock !== undefined && selectedProduct.stock <= 0}
                          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105 text-white px-8 py-4 rounded-xl font-black transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-cyan-500/20"
                        >
                          Add to Cart
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 💾 SAVE BUILD MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowSaveModal(false)}></div>
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-8">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-t-2xl"></div>
            <h2 className="text-xl font-black text-white mb-4 mt-2">💾 {t.saveBuild}</h2>
            <input
              type="text"
              value={saveBuildName}
              onChange={(e) => setSaveBuildName(e.target.value)}
              placeholder={lang === 'en' ? 'Enter build name...' : 'Ilagay ang pangalan ng build...'}
              className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-all mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowSaveModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-colors">Cancel</button>
              <button 
                onClick={() => {
                  if (!saveBuildName.trim()) return;
                  setSavedBuilds(prev => [...prev, {
                    name: saveBuildName.trim(),
                    items: [...cart],
                    total: cartTotal,
                    wattage: totalWattage,
                    fps: fpsEstimate,
                    date: new Date().toISOString()
                  }]);
                  setSaveBuildName('');
                  setShowSaveModal(false);
                  addToast(`Build "${saveBuildName}" saved!`, 'success');
                  setNotifications(prev => [{id: Date.now(), text: `Build "${saveBuildName}" saved successfully`, type: 'info', time: new Date().toISOString(), read: false}, ...prev]);
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-xl font-black transition-all hover:scale-[1.02]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📊 BUILD COMPARISON MODAL */}
      {showComparison && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowComparison(false)}></div>
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-400 to-pink-500"></div>
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white">📊 {t.compareBuilds}</h2>
                <button onClick={() => setShowComparison(false)} className="w-10 h-10 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center text-2xl">&times;</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedBuilds.map((build, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-6 hover:border-purple-500/50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-black text-white">{build.name}</h3>
                        <p className="text-[10px] text-slate-500 font-bold">{new Date(build.date).toLocaleDateString('en-PH')}</p>
                      </div>
                      <button onClick={() => setSavedBuilds(prev => prev.filter((_:any, i:number) => i !== idx))} className="text-slate-600 hover:text-red-400 transition-colors text-xs">✕</button>
                    </div>
                    <div className="space-y-2 mb-4">
                      {build.items.map((item:any, i:number) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-slate-400 truncate flex-1 mr-2">{item.name}</span>
                          <span className="text-white font-bold shrink-0">₱{item.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-800 pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold">Total</span>
                        <span className="text-cyan-400 font-black text-lg">₱{build.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Power Draw</span>
                        <span className="text-amber-400 font-bold">{build.wattage}W</span>
                      </div>
                      {build.fps && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Est. FPS</span>
                          <span className="text-purple-400 font-bold text-[10px]">{build.fps}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => { setCart(build.items); setShowComparison(false); setIsCartOpen(true); addToast(`Loaded build: ${build.name}`, 'success'); }}
                      className="w-full mt-4 py-2 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-all"
                    >
                      Load This Build
                    </button>
                  </div>
                ))}
              </div>
              {savedBuilds.length === 0 && <p className="text-slate-500 text-center py-12">No saved builds yet. Save a build from the cart first!</p>}
            </div>
          </div>
        </div>
      )}

      {/* 🦶 PROFESSIONAL FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-black tracking-tighter italic mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">TECHBUILDZ</span>.AI
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">{lang === 'en' ? 'The Philippines\' #1 AI-powered PC building platform. Compare prices across multiple vendors and build your dream setup.' : 'Ang #1 AI-powered PC building platform sa Pilipinas. Ikumpara ang mga presyo sa iba\'t ibang tindahan at buuin ang pangarap mong setup.'}</p>
              <div className="flex gap-3">
                {['M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z', 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z', 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z'].map((path, i) => (
                  <a key={i} href="#" className="w-9 h-9 bg-slate-800 hover:bg-cyan-500 rounded-lg flex items-center justify-center transition-all border border-slate-700 hover:border-cyan-500 group">
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d={path}/></svg>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{lang === 'en' ? 'Quick Links' : 'Mabilisang Links'}</h4>
              <ul className="space-y-3">
                {[{l: lang === 'en' ? 'Browse Parts' : 'Tumingin ng Parts', h: '#marketplace'}, {l: lang === 'en' ? 'AI Consultant' : 'AI Consultant', h: '#'}, {l: lang === 'en' ? 'Track Order' : 'I-track ang Order', h: '/track'}, {l: lang === 'en' ? 'Admin Panel' : 'Admin Panel', h: '/admin'}].map((link, i) => (
                  <li key={i}><a href={link.h} className="text-sm text-slate-400 hover:text-cyan-400 transition-colors font-medium">{link.l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{lang === 'en' ? 'Vendors' : 'Mga Tindahan'}</h4>
              <ul className="space-y-3">
                {['Shopee Philippines', 'Lazada Philippines', 'DynaQuest PC', 'PC Express'].map((v, i) => (
                  <li key={i} className="text-sm text-slate-400 font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>{v}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{lang === 'en' ? 'Technology' : 'Teknolohiya'}</h4>
              <ul className="space-y-3">
                {['Next.js 16 (App Router)', 'Google Gemini 2.0 Flash', 'MongoDB Atlas', 'Vercel Deployment'].map((tech, i) => (
                  <li key={i} className="text-sm text-slate-400 font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>{tech}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-600 font-bold">&copy; {new Date().getFullYear()} TechBuildz.AI — Capstone Project. All rights reserved.</p>
            <p className="text-xs text-slate-700 font-medium">Built with ❤️ for Academic Excellence</p>
          </div>
        </div>
      </footer>

      {/* ADVANCED THEME SWITCHER OVERRIDE */}
      {theme === 'cyberpunk' && (
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            background-color: #090014 !important;
          }
           .bg-slate-950 {
             filter: hue-rotate(290deg) saturate(2.5) contrast(1.1);
           }
           img {
             filter: hue-rotate(-290deg) saturate(0.4) contrast(0.9);
           }
        `}} />
      )}

    </div>
  );
}