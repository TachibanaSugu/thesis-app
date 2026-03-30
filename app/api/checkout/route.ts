import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGODB_URI!;

export async function POST(req: Request) {
  try {
    // 1. Get the cart items and total price from the frontend
    const { items, total } = await req.json();

    // 2. Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("thesis_database");

    // 3. Create the Order Document
    const newOrder = {
      items: items,
      totalAmount: total,
      status: "Pending Processing",
      orderDate: new Date().toISOString(),
    };

    // 4. Save it to a brand new "orders" collection!
    const result = await db.collection("orders").insertOne(newOrder);
    await client.close();

    return NextResponse.json({ success: true, orderId: result.insertedId });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}