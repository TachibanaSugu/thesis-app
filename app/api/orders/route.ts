import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGODB_URI!;

export async function GET() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("thesis_database");

    // Fetch all orders and sort them by the newest date first
    const orders = await db.collection("orders").find({}).sort({ orderDate: -1 }).toArray();

    await client.close();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}