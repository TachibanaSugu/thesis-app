import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI;

export async function GET() {
  try {
    const client = new MongoClient(uri!);
    await client.connect();
    
    const db = client.db("thesis_database");
    const { enrichWithVendors } = await import('../../lib/aggregator');
    // This fetches EVERY part from your collection
    const rawProducts = await db.collection("pc_parts").find({}).toArray();
    const products = rawProducts.map(enrichWithVendors);
    
    await client.close();
    
    return NextResponse.json(products);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}