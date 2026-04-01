import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGODB_URI!;

// GET - Fetch all products (for admin inventory view)
export async function GET() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("thesis_database");
    const products = await db.collection("pc_parts").find({}).toArray();
    await client.close();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST - Add a new product
export async function POST(req: Request) {
  try {
    const { name, category, price, stock } = await req.json();
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("thesis_database");

    const result = await db.collection("pc_parts").insertOne({
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      last_updated: new Date(),
    });

    await client.close();
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Failed to add product:", error);
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}

// PUT - Update an existing product
export async function PUT(req: Request) {
  try {
    const { _id, name, category, price, stock } = await req.json();
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("thesis_database");

    await db.collection("pc_parts").updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          name,
          category,
          price: Number(price),
          stock: Number(stock),
          last_updated: new Date(),
        },
      }
    );

    await client.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE - Remove a product
export async function DELETE(req: Request) {
  try {
    const { _id } = await req.json();
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("thesis_database");

    await db.collection("pc_parts").deleteOne({ _id: new ObjectId(_id) });

    await client.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
