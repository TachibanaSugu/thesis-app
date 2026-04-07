import { GoogleGenerativeAI } from "@google/generative-ai";
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const uri = process.env.MONGODB_URI!;

export async function POST(req: Request) {
  try {
    const { message, history, cart = [] } = await req.json();

    const { enrichWithVendors } = await import('../../lib/aggregator');
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("thesis_database");
    const rawParts = await db.collection("pc_parts").find({ stock: { $gt: 0 } }).toArray();
    await client.close();

    const parts = rawParts.map(enrichWithVendors);

    const partsContext = parts.map((p: any) => {
      const vendorString = p.vendors.filter((v:any)=>v.stock>0).map((v:any)=>`${v.name} ₱${v.price}`).join(", ");
      return `${p.name} (${p.category}) - Deals: [${vendorString}]`;
    }).join(" | ");
    const cartContext = cart.length > 0 
      ? `The user currently has these items in their cart: ${cart.map((c: any) => c.name).join(", ")}.` 
      : `The user's cart is currently empty.`;

    // 🧠 THE UPGRADED AI BRAIN WITH COMPATIBILITY RULES
    const systemPrompt = `You are an expert PC Building Assistant and Platform Guide for PCpartSmart. 
    Use this database for recommendations: ${partsContext}.
    ${cartContext}
    
    CRITICAL RULE 1 - CART TAGGING: 
    If you suggest a specific part from the database, you MUST end your sentence with [ADD_TO_CART: Exact Product Name].
    
    CRITICAL RULE 2 - COMPATIBILITY CHECKING:
    - ALWAYS verify CPU/Motherboard sockets (AM5, LGA 1700, etc.) and RAM types (DDR4 vs DDR5).
    - Warn users about incompatible combinations in their cart.
    
    CRITICAL RULE 3 - AGGREGATOR & PLATFORM SUPPORT:
    - You represent PCpartSmart, a multi-vendor aggregator (Shopee, Lazada, DynaQuest).
    - If asked about "problems" or "how to use the site":
      - Order Tracking: Users can track orders via the /track page using their Order ID.
      - Vendor Links: Explain that "Visit Store" buttons redirect to official Shopee/Lazada search results for that exact part.
      - Saved Builds: Users can export their build summary to PDF or share the URL.
      - Payment: We simulate GCash payments for academic demonstration.
    - If the user is confused, offer to "Guide them through the marketplace."`;

    // 🤖 CHOOSE AI ENGINE: GEMINI VS OLLAMA
    let text = "";

    if (process.env.USE_OLLAMA === "true") {
      try {
        const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
        const ollamaModel = process.env.OLLAMA_MODEL || "gemma:2b";

        const ollamaHistory = [
          { role: "system", content: systemPrompt },
          ...history.map((msg: any) => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.text,
          })),
          { role: "user", content: message }
        ];

        const ollamaResponse = await fetch(`${ollamaHost}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: ollamaModel,
            messages: ollamaHistory,
            stream: false
          }),
        });

        if (!ollamaResponse.ok) throw new Error("Ollama connection failed");
        const data = await ollamaResponse.json();
        text = data.message.content;
      } catch (ollamaErr) {
        console.error("Ollama Offline or Error:", ollamaErr);
        return NextResponse.json({ 
          text: "⚠️ **Ollama is Offline.** Please make sure Ollama is running on your computer and you have the `gemma:2b` model installed (`ollama run gemma:2b`)." 
        });
      }
    } else {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const chatHistory = history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Understood. I will enforce PC building compatibility rules and use the ADD_TO_CART tag." }] },
          ...chatHistory
        ],
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      text = response.text();
    }

    return NextResponse.json({ text });

  } catch (error) {
    console.error("AI/DB Error:", error);
    return NextResponse.json({ error: "System Error" }, { status: 500 });
  }
}