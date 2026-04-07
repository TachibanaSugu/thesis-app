import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { reviews, productName } = await req.json();

    if (!reviews || !reviews.length) {
      return NextResponse.json({ summary: "No reviews available to analyze." });
    }

    const reviewsText = reviews.map((r: any, i: number) => `Review ${i+1}: "${r.text}" Rating: ${r.rating}/5`).join("\n");
    const systemPrompt = `You are a strict data-driven sentiment analysis AI for PCpartSmart.
Analyze the following reviews for the product "${productName}".
Summarize the general sentiment in exactly ONE concise sentence (max 15 words) focusing on the most critical hardware insight (e.g. "Users report great performance but frequent BIOS issues with 14th Gen").
Do NOT use robotic intro phrases. Provide just the insight.`;

    if (process.env.USE_OLLAMA === 'true') {
      const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
      const ollamaModel = process.env.OLLAMA_MODEL || "gemma:2b";
      
      const response = await fetch(`${ollamaHost}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: reviewsText }],
          stream: false
        }),
      });

      if (!response.ok) throw new Error("Ollama connection failed");
      const data = await response.json();
      return NextResponse.json({ summary: data.message.content.trim() });
    } else {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(`${systemPrompt}\n\nReviews:\n${reviewsText}`);
      return NextResponse.json({ summary: result.response.text().trim() });
    }

  } catch(error) {
    console.error("Sentiment API error:", error);
    return NextResponse.json({ summary: "Sentiment analysis currently unavailable." }, { status: 500 });
  }
}
