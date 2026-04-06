"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "model", text: "👋 Hello! I'm your PCpartSmart Assistant. How can I help you navigate our platform today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input, 
          history: messages,
          context: "support"
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "model", text: data.text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "model", text: "Sorry, I'm having trouble connecting to the support hub." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-80 md:w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-cyan-600 to-purple-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-white font-black text-sm leading-tight">PCpartSmart Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-cyan-100 font-bold uppercase tracking-widest">Platform Expert</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-cyan-600 text-white rounded-tr-none shadow-lg' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && <div className="text-cyan-500 font-bold text-[10px] animate-pulse uppercase tracking-widest ml-2">Assistant is typing...</div>}
            </div>

            {/* Input */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask about orders, vendors, or site features..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-medium"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-2 w-8 h-8 bg-cyan-500 text-slate-950 rounded-lg flex items-center justify-center hover:bg-cyan-400 transition-colors shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
              <p className="text-[9px] text-slate-600 text-center mt-3 font-bold uppercase tracking-widest">Powered by Gemini 2.0 Flash</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center border-2 border-white/20 transition-all relative group"
      >
        <span className="text-3xl group-hover:rotate-12 transition-transform">🤖</span>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-white animate-bounce">1</div>
      </motion.button>
    </div>
  );
}
