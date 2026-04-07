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

    const partsContext = rawParts.map(p => {
      let details = `₱${p.price} | ${p.wattage || 0}W`;
      if (p.socket) details += ` | Socket: ${p.socket}`;
      if (p.length_mm) details += ` | Len: ${p.length_mm}mm`;
      if (p.max_gpu_length_mm) details += ` | MaxGPU: ${p.max_gpu_length_mm}mm`;
      if (p.tier) details += ` | Tier: ${p.tier}`;
      return `${p.name} (${p.category}): ${details}`;
    }).join("\n    ");

    const systemPrompt = `You are "The Architect", an elite AI PC builder.
    Build a mathematically perfect PC consisting of EXACTLY 1 CPU, 1 GPU, 1 Motherboard, 1 RAM, 1 Storage, 1 Case, and 1 PSU.
    
    DATABASE:
    ${partsContext}

    STRICT COMPATIBILITY & SAFETY HEURISTICS:
    1. Socket Matching: CPU socket MUST match Motherboard socket (e.g. AM5 to AM5, LGA1700 to LGA1700). DDR5 RAM only with AM5 or Z790/B760.
    2. Physical Clearance: The GPU 'Len' MUST be less than or equal to the Case 'MaxGPU'.
    3. Wattage Buffer: The total system wattage * 1.3 MUST be less than or equal to the PSU wattage.
    4. PSU Quality: NEVER use a Tier F PSU. Use Tier A or B for high-end builds.
    
    Respond EXACTLY in this JSON format. No markdown, no intro.
    {
      "build": ["Exact Name 1", "Exact Name 2", "Exact Name 3", "Exact Name 4", "Exact Name 5", "Exact Name 6", "Exact Name 7"],
      "justification": {
        "budgetAllocation": "Briefly explain why you allocated the budget this way (e.g. focused on GPU for 1440p gaming).",
        "bottleneckVisual": { "cpuUtil": 85, "gpuUtil": 98, "explanation": "Brief explanation of load balance." },
        "futureProofing": "Brief socket longevity and upgrade path score.",
        "safetyWarning": "If Tier F PSU was blocked or wattage was close, mention it. Otherwise write null."
      }
    }`;

    let selectedNames: string[] = [];
    let justification: any = null;

    if (process.env.USE_OLLAMA === 'true') {
      const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
      const ollamaModel = process.env.OLLAMA_MODEL || "gemma:2b";
      
      const response = await fetch(`${ollamaHost}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          messages: [{ role: "user", content: `${systemPrompt}\nUser target: ${type}` }],
          stream: false,
          format: "json"
        }),
      });

      if (!response.ok) throw new Error("Ollama connection failed");
      const data = await response.json();
      const content = data.message.content;
      
      try {
        const match = content.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(match ? match[0] : content);
        selectedNames = parsed.build || [];
        justification = parsed.justification || {};
      } catch (pe) {
        console.error("JSON Parse Error on Ollama output:", content);
        throw pe;
      }
    } else {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(`${systemPrompt}\nUser target: ${type}`);
      const parsed = JSON.parse(result.response.text());
      selectedNames = parsed.build || [];
      justification = parsed.justification || {};
    }

    // Filter database for matched parts & enrich them for frontend logic
    const matchedParts = rawParts.filter(p => {
      return selectedNames.some(name => p.name.includes(name) || name.includes(p.name));
    }).map(enrichWithVendors);
    
    return NextResponse.json({ build: matchedParts, justification });
  } catch(error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate autobuild via AI' }, { status: 500 });
  }
}
