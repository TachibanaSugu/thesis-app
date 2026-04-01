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

    // 3. Decrement stock for each purchased item
    for (const item of items) {
      await db.collection("pc_parts").updateOne(
        { name: item.name },
        { $inc: { stock: -1 } }
      );
    }

    const { getServerSession } = require("next-auth/next");
    const { authOptions } = require("../auth/[...nextauth]/route");
    const session = await getServerSession(authOptions);

    // 4. Create the Order Document
    const newOrder = {
      items: items,
      totalAmount: total,
      status: "Pending Processing",
      orderDate: new Date().toISOString(),
      userId: session?.user?.email || null, // Map directly to email so we can find it easily
    };

    // 5. Save it to the "orders" collection
    const result = await db.collection("orders").insertOne(newOrder);
    await client.close();

    return NextResponse.json({ success: true, orderId: result.insertedId });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}