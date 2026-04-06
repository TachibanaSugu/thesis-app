import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI;

export async function POST() {
  try {
    const client = new MongoClient(uri!);
    await client.connect();
    
    const db = client.db("thesis_database");
    const collection = db.collection("pc_parts");
    
    // The complete PC Parts Catalog with Multi-Vendor Support
    const scraped_parts = [
      // CPUs
      {"name": "AMD Ryzen 5 5600X", "category": "CPU", "price": 8500, "stock": 50, "vendor": "Shopee"},
      {"name": "Intel Core i5-12400F", "category": "CPU", "price": 8200, "stock": 40, "vendor": "Lazada"},
      {"name": "AMD Ryzen 7 7800X3D", "category": "CPU", "price": 22000, "stock": 10, "vendor": "DynaQuest"},
      {"name": "Intel Core i9-14900K", "category": "CPU", "price": 38000, "stock": 5, "vendor": "Shopee"},
      
      // GPUs
      {"name": "NVIDIA RTX 4060", "category": "GPU", "price": 18000, "stock": 25, "vendor": "Lazada"},
      {"name": "AMD Radeon RX 7600", "category": "GPU", "price": 16500, "stock": 15, "vendor": "Shopee"},
      {"name": "NVIDIA RTX 4070 Super", "category": "GPU", "price": 36000, "stock": 12, "vendor": "DynaQuest"},
      {"name": "AMD Radeon RX 7900 XTX", "category": "GPU", "price": 62000, "stock": 2, "vendor": "Shopee"},
      
      // Motherboards
      {"name": "MSI B550M PRO-VDH WiFi", "category": "Motherboard", "price": 6000, "stock": 30, "vendor": "Shopee"},
      {"name": "Gigabyte B660M DS3H AX", "category": "Motherboard", "price": 6500, "stock": 20, "vendor": "Lazada"},
      {"name": "ASUS TUF Gaming B650-PLUS", "category": "Motherboard", "price": 11000, "stock": 15, "vendor": "DynaQuest"},
      
      // RAM
      {"name": "16GB Corsair Vengeance LPX DDR4", "category": "RAM", "price": 2500, "stock": 100, "vendor": "Shopee"},
      {"name": "32GB G.Skill Trident Z5 NEO RGB DDR5", "category": "RAM", "price": 7500, "stock": 40, "vendor": "Lazada"},
      
      // Storage
      {"name": "1TB Kingston NV2 PCIe 4.0 NVMe", "category": "Storage", "price": 3200, "stock": 80, "vendor": "Shopee"},
      {"name": "2TB Samsung 990 PRO NVMe", "category": "Storage", "price": 10500, "stock": 30, "vendor": "DynaQuest"},
      
      // Power Supplies (PSU)
      {"name": "Corsair CV650 650W 80+ Bronze", "category": "PSU", "price": 3500, "stock": 45, "vendor": "Shopee"},
      {"name": "Seasonic Focus GX-750 750W 80+ Gold", "category": "PSU", "price": 6500, "stock": 25, "vendor": "Lazada"},
      
      // Cases
      {"name": "Tecware Forge M Omni ARGB", "category": "Case", "price": 2800, "stock": 20, "vendor": "Shopee"},
      {"name": "NZXT H5 Flow", "category": "Case", "price": 5000, "stock": 15, "vendor": "DynaQuest"}
    ];

    let syncedCount = 0;
    
    // Upsert logic
    for (const part of scraped_parts) {
      await collection.updateOne(
        { name: part.name },
        { 
          $set: {
            category: part.category,
            price: part.price,
            stock: part.stock,
            vendor: part.vendor,
            last_updated: new Date()
          } 
        },
        { upsert: true }
      );
      syncedCount++;
    }
    
    await client.close();
    
    return NextResponse.json({ message: "Database sync complete!", count: syncedCount });
  } catch (error) {
    console.error("Database Sync Error:", error);
    return NextResponse.json({ error: "Failed to sync products" }, { status: 500 });
  }
}
