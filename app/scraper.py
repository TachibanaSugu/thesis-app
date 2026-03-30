import pymongo
from datetime import datetime

# 1. THE CONNECTION (I pasted your real link for you!)
MONGO_URI = "mongodb+srv://gabgab_db_user:X5g15TprqkZf95kF@cluster0.b1ppjdr.mongodb.net/?appName=Cluster0"

print("Connecting to MongoDB...")
client = pymongo.MongoClient(MONGO_URI)
db = client["thesis_database"]
collection = db["pc_parts"]

# 2. THE EXPANDED DATA FEED (Complete PC Parts Catalog)
scraped_parts = [
    # CPUs
    {"name": "AMD Ryzen 5 5600X", "category": "CPU", "price": 8500, "stock": 12},
    {"name": "Intel Core i5-12400F", "category": "CPU", "price": 8200, "stock": 5},
    {"name": "AMD Ryzen 7 7800X3D", "category": "CPU", "price": 22000, "stock": 3},
    
    # GPUs
    {"name": "NVIDIA RTX 4060", "category": "GPU", "price": 18000, "stock": 8},
    {"name": "AMD Radeon RX 7600", "category": "GPU", "price": 16500, "stock": 3},
    {"name": "NVIDIA RTX 4070 Super", "category": "GPU", "price": 36000, "stock": 4},
    
    # Motherboards
    {"name": "MSI B550M PRO-VDH WiFi", "category": "Motherboard", "price": 6000, "stock": 15},
    {"name": "Gigabyte B660M DS3H AX", "category": "Motherboard", "price": 6500, "stock": 10},
    {"name": "ASUS TUF Gaming B650-PLUS", "category": "Motherboard", "price": 11000, "stock": 6},
    
    # RAM
    {"name": "16GB Corsair Vengeance LPX DDR4", "category": "RAM", "price": 2500, "stock": 20},
    {"name": "32GB G.Skill Trident Z5 NEO RGB DDR5", "category": "RAM", "price": 7500, "stock": 10},
    
    # Storage
    {"name": "1TB Kingston NV2 PCIe 4.0 NVMe", "category": "Storage", "price": 3200, "stock": 25},
    {"name": "2TB Samsung 990 PRO NVMe", "category": "Storage", "price": 10500, "stock": 8},
    
    # Power Supplies (PSU)
    {"name": "Corsair CV650 650W 80+ Bronze", "category": "PSU", "price": 3500, "stock": 18},
    {"name": "Seasonic Focus GX-750 750W 80+ Gold", "category": "PSU", "price": 6500, "stock": 12},
    
    # Cases
    {"name": "Tecware Forge M Omni ARGB", "category": "Case", "price": 2800, "stock": 14},
    {"name": "NZXT H5 Flow", "category": "Case", "price": 5000, "stock": 7}
]

print("Starting automated database sync. Injecting full PC catalog...")

# 3. THE UPSERT LOGIC
for part in scraped_parts:
    collection.update_one(
        {"name": part["name"]}, 
        {"$set": {
            "category": part["category"],
            "price": part["price"],
            "stock": part["stock"],
            "last_updated": datetime.now()
        }}, 
        upsert=True
    )
    print(f"✅ Synced: {part['name']} - ₱{part['price']} ({part['category']})")

print("🚀 Database sync complete! Your AI can now build complete rigs.")