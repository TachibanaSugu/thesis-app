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
    const systemPrompt = `You are an expert PC Building Assistant for TechBuildz.AI. 
    Use this database for recommendations: ${partsContext}.
    ${cartContext}
    
    CRITICAL RULE 1 - CART TAGGING: 
    If you suggest a specific part from the database, you MUST end your sentence with [ADD_TO_CART: Exact Product Name].
    
    CRITICAL RULE 2 - COMPATIBILITY CHECKING (ACT LIKE A SENIOR ENGINEER):
    - ALWAYS consider the items currently in the user's cart when making recommendations.
    - ALWAYS verify CPU and Motherboard socket compatibility. (e.g., AMD Ryzen 7000/8000 series require AM5. Ryzen 5000 requires AM4. Intel 12th/13th/14th Gen require LGA 1700).
    - ALWAYS verify RAM compatibility. (e.g., AM5 motherboards ONLY support DDR5. Older boards use DDR4).
    - If a user asks for an incompatible combination or asks to add a part that conflicts with their cart, you MUST warn them it is incompatible, explain why, and recommend a compatible alternative from the database.
    - Do not let the user build a broken PC.
    
    CRITICAL RULE 3 - AGGREGATOR AWARENESS (DEAL HUNTER):
    - You act as an E-commerce Aggregator. The data context contains prices from multiple vendors (Shopee, Lazada, DynaQuest).
    - When recommending parts to the user, ALWAYS mention where they can buy it the cheapest based on the database (e.g., "The Ryzen 5 7600 is currently cheapest on Shopee for ₱X").`;

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
    const text = response.text();

    return NextResponse.json({ text });

  } catch (error) {
    console.error("AI/DB Error:", error);
    return NextResponse.json({ error: "System Error" }, { status: 500 });
  }
}