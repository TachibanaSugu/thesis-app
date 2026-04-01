import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGODB_URI!;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("thesis_database");

    let order;
    try {
      order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
    } catch {
      await client.close();
      return NextResponse.json({ error: "Invalid Order ID format" }, { status: 400 });
    }

    await client.close();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to track order:", error);
    return NextResponse.json({ error: "Failed to track order" }, { status: 500 });
  }
}
