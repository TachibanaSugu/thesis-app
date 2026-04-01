import { GoogleGenerativeAI } from "@google/generative-ai";
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const uri = process.env.MONGODB_URI!;

export async function POST(req: Request) {
  try {
    const { type } = await req.json();
    
    const { enrichWithVendors } = await import('../../lib/aggregator');
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("thesis_database");
    const rawParts = await db.collection("pc_parts").find({ stock: { $gt: 0 } }).toArray();
    await client.close();

    const partsContext = rawParts.map(p => `${p.name} (${p.category}): ₱${p.price}`).join(" | ");

    const systemPrompt = `You are an automated PC builder API.
    You must intelligently build a mathematically perfect PC consisting of EXACTLY 1 CPU, 1 GPU, 1 Motherboard, 1 RAM, 1 Storage, 1 Case, and 1 PSU.
    
    STRATEGIES:
    - If user asks for "budget", optimize for lowest price (~₱40k total max) while maintaining gaming capability.
    - If user asks for "esports", optimize for 1080p high FPS (~₱80k total max).
    - If user asks for "maxed", pick the absolute best parts (4090, 7950X, etc).
    
    DATABASE:
    ${partsContext}

    CRITICAL COMPATIBILITY RULES:
    1. ONLY pick parts EXACTLY matching the names from the database.
    2. Check socket compatibility. AM5 CPUs only go with AM5 Motherboards and DDR5 RAM. Intel 13/14th Gen only go with Intel Motherboards.
    3. Ensure the PSU is powerful enough for the CPU+GPU combo.

    Respond STRICTLY in JSON format. Provide an array of strings representing the exact part names you selected.
    Example output format:
    ["AMD Ryzen 5 7600X", "MSI MAG B650 Tomahawk WiFi (AM5)", "ZOTAC Twin Edge RTX 4060 8GB", "Kingston Fury Beast 16GB (2x8GB) DDR5-5200"]
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const result = await model.generateContent(`${systemPrompt}\nUser target: ${type}`);
    const selectedNames = JSON.parse(result.response.text());
    
    // Filter database for matched parts & enrich them for frontend logic
    const matchedParts = rawParts.filter(p => selectedNames.includes(p.name)).map(enrichWithVendors);
    
    return NextResponse.json({ build: matchedParts });
  } catch(error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate autobuild via AI' }, { status: 500 });
  }
}
