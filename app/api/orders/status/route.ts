import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGODB_URI!;

// PUT - Update order status
export async function PUT(req: Request) {
  try {
    const { _id, status } = await req.json();
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("thesis_database");

    await db.collection("orders").updateOne(
      { _id: new ObjectId(_id) },
      { $set: { status } }
    );

    await client.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
