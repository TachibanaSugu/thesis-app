import { GoogleGenerativeAI } from "@google/generative-ai";
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

// 1. Initialize API and DB URI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const uri = process.env.MONGODB_URI!;

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // 2. FETCH LATEST PARTS FROM MONGODB FOR CONTEXT
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("thesis_database");
    const parts = await db.collection("pc_parts").find({}).toArray();
    await client.close();

    // Create a string of parts for the AI to "read"
    const partsContext = parts.map(p => `${p.name} (${p.category}): ₱${p.price}`).join(", ");

    // 3. DEFINE THE AI PERSONALITY AND THE "ADD_TO_CART" RULE
    const systemPrompt = `You are an expert PC Building Assistant for TechBuildz.AI. 
    Use this database for recommendations: ${partsContext}.
    
    IMPORTANT: If you suggest a specific part from the database, you MUST end your sentence with [ADD_TO_CART: Exact Product Name].
    Example: "I suggest the RTX 4060 [ADD_TO_CART: NVIDIA RTX 4060]".`;

    // 4. SETUP THE GEMINI MODEL
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Convert history for Gemini format
    const chatHistory = history.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // Start Chat with System Prompt as the first instruction
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Acknowledged. I am ready to assist and tag products for the cart." }] },
        ...chatHistory
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // 5. RETURN THE RESPONSE (This is line 67 in your error!)
    return NextResponse.json({ text });

  } catch (error) {
    console.error("AI/DB Error:", error);
    return NextResponse.json({ error: "System Error" }, { status: 500 });
  }
}