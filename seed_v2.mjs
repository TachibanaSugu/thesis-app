import { MongoClient } from 'mongodb';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const mo_match = envFile.match(/MONGODB_URI=(.*)/);
const uriStr = mo_match ? mo_match[1].trim() : (process.env.MONGODB_URI || '');
const uri = uriStr.replace(/^["']|["']$/g, '');

const products = [
  // CPUs (TDP Wattage)
  { name: 'AMD Ryzen 9 7950X3D', category: 'CPU', price: 42000, stock: 15, wattage: 120, socket: 'AM5', imageUrl: 'https://m.media-amazon.com/images/I/616VM20+AzL._AC_SL1500_.jpg' },
  { name: 'AMD Ryzen 9 7900X', category: 'CPU', price: 29000, stock: 12, wattage: 170, socket: 'AM5', imageUrl: 'https://m.media-amazon.com/images/I/51fM0X2LEeL._AC_SL1500_.jpg' },
  { name: 'AMD Ryzen 7 7800X3D', category: 'CPU', price: 25000, stock: 40, wattage: 120, socket: 'AM5', imageUrl: 'https://m.media-amazon.com/images/I/51fM0X2LEeL._AC_SL1500_.jpg' },
  { name: 'AMD Ryzen 5 7600X', category: 'CPU', price: 14000, stock: 25, wattage: 105, socket: 'AM5', imageUrl: 'https://m.media-amazon.com/images/I/51fM0X2LEeL._AC_SL1500_.jpg' },
  { name: 'AMD Ryzen 5 7600', category: 'CPU', price: 12500, stock: 35, wattage: 65, socket: 'AM5', imageUrl: 'https://m.media-amazon.com/images/I/51fM0X2LEeL._AC_SL1500_.jpg' },
  { name: 'AMD Ryzen 7 5800X3D', category: 'CPU', price: 19500, stock: 18, wattage: 105, socket: 'AM4', imageUrl: 'https://m.media-amazon.com/images/I/61Kq9QzXp2L._AC_SL1500_.jpg' },
  { name: 'AMD Ryzen 5 5600X', category: 'CPU', price: 9500, stock: 55, wattage: 65, socket: 'AM4', imageUrl: 'https://m.media-amazon.com/images/I/61vGQNUEsGL._AC_SL1500_.jpg' },
  { name: 'Intel Core i9-14900K', category: 'CPU', price: 38000, stock: 12, wattage: 253, socket: 'LGA1700', imageUrl: 'https://m.media-amazon.com/images/I/51aP2k7X2fL._AC_SL1500_.jpg' },
  { name: 'Intel Core i7-14700K', category: 'CPU', price: 27000, stock: 30, wattage: 253, socket: 'LGA1700', imageUrl: 'https://m.media-amazon.com/images/I/51H8K-pX4nL._AC_SL1500_.jpg' },
  { name: 'Intel Core i5-14600K', category: 'CPU', price: 19500, stock: 25, wattage: 181, socket: 'LGA1700', imageUrl: 'https://m.media-amazon.com/images/I/61Nl-HhC+QL._AC_SL1500_.jpg' },
  { name: 'Intel Core i5-13600K', category: 'CPU', price: 18000, stock: 50, wattage: 181, socket: 'LGA1700', imageUrl: 'https://m.media-amazon.com/images/I/61Nl-HhC+QL._AC_SL1500_.jpg' },
  { name: 'Intel Core i5-12400F', category: 'CPU', price: 8500, stock: 65, wattage: 65, socket: 'LGA1700', imageUrl: 'https://m.media-amazon.com/images/I/51f-50d4wFL._AC_SL1500_.jpg' },
  { name: 'Intel Core i3-12100F', category: 'CPU', price: 5500, stock: 40, wattage: 58, socket: 'LGA1700', imageUrl: 'https://m.media-amazon.com/images/I/616VM20+AzL._AC_SL1500_.jpg' },

  // GPUs (TBP Wattage, Length)
  { name: 'ASUS ROG Strix RTX 4090 24GB', category: 'GPU', price: 135000, stock: 5, wattage: 450, length_mm: 358, imageUrl: 'https://m.media-amazon.com/images/I/81P2JmYF-IL._AC_SL1500_.jpg' },
  { name: 'MSI Gaming X Trio RTX 4080 Super', category: 'GPU', price: 68000, stock: 15, wattage: 320, length_mm: 337, imageUrl: 'https://m.media-amazon.com/images/I/71P4rK09lTL._AC_SL1500_.jpg' },
  { name: 'Gigabyte Eagle OC RTX 4070 Ti Super', category: 'GPU', price: 54000, stock: 20, wattage: 285, length_mm: 261, imageUrl: 'https://m.media-amazon.com/images/I/71Y0bK-QALL._AC_SL1500_.jpg' },
  { name: 'ASUS Dual RTX 4070 Super O12G', category: 'GPU', price: 42000, stock: 25, wattage: 220, length_mm: 267, imageUrl: 'https://m.media-amazon.com/images/I/71P4rK09lTL._AC_SL1500_.jpg' },
  { name: 'ZOTAC Twin Edge RTX 4060 Ti 8GB', category: 'GPU', price: 26000, stock: 35, wattage: 160, length_mm: 225, imageUrl: 'https://m.media-amazon.com/images/I/716hAByc0wL._AC_SL1500_.jpg' },
  { name: 'ZOTAC Twin Edge RTX 4060 8GB', category: 'GPU', price: 18500, stock: 45, wattage: 115, length_mm: 225, imageUrl: 'https://m.media-amazon.com/images/I/716hAByc0wL._AC_SL1500_.jpg' },
  { name: 'MSI Ventus 2X RTX 3060 12GB', category: 'GPU', price: 17000, stock: 50, wattage: 170, length_mm: 235, imageUrl: 'https://m.media-amazon.com/images/I/71H4DqE3U7L._AC_SL1500_.jpg' },
  { name: 'Sapphire Nitro+ RX 7900 XTX', category: 'GPU', price: 65000, stock: 10, wattage: 355, length_mm: 320, imageUrl: 'https://m.media-amazon.com/images/I/71H4DqE3U7L._AC_SL1500_.jpg' },
  { name: 'PowerColor Red Devil RX 7800 XT', category: 'GPU', price: 34000, stock: 25, wattage: 263, length_mm: 332, imageUrl: 'https://m.media-amazon.com/images/I/81I2bXYRwqL._AC_SL1500_.jpg' },
  { name: 'Gigabyte Gaming OC RX 7700 XT', category: 'GPU', price: 28000, stock: 30, wattage: 245, length_mm: 302, imageUrl: 'https://m.media-amazon.com/images/I/71Y0bK-QALL._AC_SL1500_.jpg' },
  { name: 'XFX Speedster SWFT 210 RX 7600', category: 'GPU', price: 16500, stock: 40, wattage: 165, length_mm: 241, imageUrl: 'https://m.media-amazon.com/images/I/81I2bXYRwqL._AC_SL1500_.jpg' },
  { name: 'Sapphire Pulse RX 6600 8GB', category: 'GPU', price: 12500, stock: 60, wattage: 132, length_mm: 193, imageUrl: 'https://m.media-amazon.com/images/I/71H4DqE3U7L._AC_SL1500_.jpg' },
  
  // MBs (Avg 50W base)
  { name: 'ASUS ROG Crosshair X670E Hero (AM5)', category: 'Motherboard', price: 42000, stock: 8, wattage: 50, socket: 'AM5', imageUrl: 'https://m.media-amazon.com/images/I/81kKjF5+BVL._AC_SL1500_.jpg' },
  { name: 'Gigabyte X670 AORUS Elite AX (AM5)', category: 'Motherboard', price: 19500, stock: 15, wattage: 45, socket: 'AM5', imageUrl: 'https://m.media-amazon.com/images/I/81l3AIfhI+L._AC_SL1500_.jpg' },
  { name: 'MSI MAG B650 Tomahawk WiFi (AM5)', category: 'Motherboard', price: 14000, stock: 35, wattage: 40, socket: 'AM5', imageUrl: 'https://m.media-amazon.com/images/I/81a+l+s-TjL._AC_SL1500_.jpg' },
  { name: 'ASRock B650M Pro RS WiFi (AM5)', category: 'Motherboard', price: 9000, stock: 45, wattage: 35, socket: 'AM5', imageUrl: 'https://m.media-amazon.com/images/I/71I5kIhWbEL._AC_SL1500_.jpg' },
  { name: 'ASUS TUF Gaming X570-Plus (AM4)', category: 'Motherboard', price: 11000, stock: 20, wattage: 40, socket: 'AM4', imageUrl: 'https://m.media-amazon.com/images/I/81kKjF5+BVL._AC_SL1500_.jpg' },
  { name: 'MSI B550-A PRO (AM4)', category: 'Motherboard', price: 7500, stock: 50, wattage: 35, socket: 'AM4', imageUrl: 'https://m.media-amazon.com/images/I/81l3AIfhI+L._AC_SL1500_.jpg' },
  { name: 'ASUS ROG Maximus Z790 Hero (Intel)', category: 'Motherboard', price: 38000, stock: 5, wattage: 50, socket: 'LGA1700', imageUrl: 'https://m.media-amazon.com/images/I/81a+l+s-TjL._AC_SL1500_.jpg' },
  { name: 'Gigabyte Z790 AORUS Elite AX (Intel)', category: 'Motherboard', price: 16500, stock: 25, wattage: 50, socket: 'LGA1700', imageUrl: 'https://m.media-amazon.com/images/I/81a+l+s-TjL._AC_SL1500_.jpg' },
  { name: 'MSI PRO Z690-A WiFi (Intel)', category: 'Motherboard', price: 12500, stock: 30, wattage: 45, socket: 'LGA1700', imageUrl: 'https://m.media-amazon.com/images/I/71I5kIhWbEL._AC_SL1500_.jpg' },
  { name: 'ASRock B760M Steel Legend WiFi (Intel)', category: 'Motherboard', price: 9500, stock: 40, wattage: 40, socket: 'LGA1700', imageUrl: 'https://m.media-amazon.com/images/I/71I5kIhWbEL._AC_SL1500_.jpg' },

  // RAM (Average 10W per kit)
  { name: 'Corsair Dominator Titanium 64GB (2x32GB) DDR5-6600', category: 'RAM', price: 19500, stock: 15, wattage: 14, imageUrl: 'https://m.media-amazon.com/images/I/61H4hVqBItL._AC_SL1500_.jpg' },
  { name: 'Corsair Vengeance RGB 64GB (2x32GB) DDR5-6600', category: 'RAM', price: 16000, stock: 20, wattage: 12, imageUrl: 'https://m.media-amazon.com/images/I/61H4hVqBItL._AC_SL1500_.jpg' },
  { name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000', category: 'RAM', price: 8500, stock: 60, wattage: 10, imageUrl: 'https://m.media-amazon.com/images/I/61gR7m2tXOL._AC_SL1500_.jpg' },
  { name: 'Kingston Fury Beast 16GB (2x8GB) DDR5-5200', category: 'RAM', price: 4500, stock: 80, wattage: 8, imageUrl: 'https://m.media-amazon.com/images/I/71u12N+C+WL._AC_SL1500_.jpg' },
  { name: 'Corsair Vengeance LPX 32GB (2x16GB) DDR4-3200', category: 'RAM', price: 4300, stock: 55, wattage: 10, imageUrl: 'https://m.media-amazon.com/images/I/61H4hVqBItL._AC_SL1500_.jpg' },
  { name: 'G.Skill Ripjaws V 16GB (2x8GB) DDR4-3600', category: 'RAM', price: 2800, stock: 90, wattage: 8, imageUrl: 'https://m.media-amazon.com/images/I/61gR7m2tXOL._AC_SL1500_.jpg' },

  // Storage (Average 8W load)
  { name: 'Samsung 990 Pro 2TB NVMe M.2 SSD', category: 'Storage', price: 11000, stock: 40, wattage: 8, imageUrl: 'https://m.media-amazon.com/images/I/81+o9+RjGmL._AC_SL1500_.jpg' },
  { name: 'Samsung 980 Pro 1TB NVMe M.2 SSD', category: 'Storage', price: 6200, stock: 65, wattage: 7, imageUrl: 'https://m.media-amazon.com/images/I/81+o9+RjGmL._AC_SL1500_.jpg' },
  { name: 'WD Black SN850X 2TB NVMe M.2 SSD', category: 'Storage', price: 10500, stock: 35, wattage: 8, imageUrl: 'https://m.media-amazon.com/images/I/71L5-L1C0qL._AC_SL1500_.jpg' },
  { name: 'WD Black SN850X 1TB NVMe M.2 SSD', category: 'Storage', price: 6500, stock: 55, wattage: 8, imageUrl: 'https://m.media-amazon.com/images/I/71L5-L1C0qL._AC_SL1500_.jpg' },
  { name: 'Crucial P3 Plus 4TB NVMe M.2 SSD', category: 'Storage', price: 14500, stock: 15, wattage: 8, imageUrl: 'https://m.media-amazon.com/images/I/71I3Rk8K40L._AC_SL1500_.jpg' },
  { name: 'Crucial P3 Plus 1TB NVMe M.2 SSD', category: 'Storage', price: 4200, stock: 70, wattage: 6, imageUrl: 'https://m.media-amazon.com/images/I/71I3Rk8K40L._AC_SL1500_.jpg' },
  { name: 'Seagate Barracuda 2TB 7200RPM HDD', category: 'Storage', price: 3500, stock: 100, wattage: 15, imageUrl: 'https://m.media-amazon.com/images/I/71Czt9qTbUL._AC_SL1500_.jpg' },
  { name: 'Western Digital Blue 1TB 7200RPM HDD', category: 'Storage', price: 2500, stock: 85, wattage: 12, imageUrl: 'https://m.media-amazon.com/images/I/71Czt9qTbUL._AC_SL1500_.jpg' },

  // PSUs (Max Capacity, Tiers)
  { name: 'Corsair AX1600i 1600W 80+ Titanium', category: 'PSU', price: 35000, stock: 5, wattage: 1600, tier: 'A', imageUrl: 'https://m.media-amazon.com/images/I/71c6X1OQkVL._AC_SL1500_.jpg' },
  { name: 'Corsair RM1000x 1000W 80+ Gold Fully Modular', category: 'PSU', price: 11500, stock: 20, wattage: 1000, tier: 'A', imageUrl: 'https://m.media-amazon.com/images/I/71c6X1OQkVL._AC_SL1500_.jpg' },
  { name: 'EVGA SuperNOVA 850G3 850W 80+ Gold', category: 'PSU', price: 8500, stock: 35, wattage: 850, tier: 'A', imageUrl: 'https://m.media-amazon.com/images/I/71qS5m+H4zL._AC_SL1500_.jpg' },
  { name: 'NZXT C750 750W 80+ Gold Fully Modular', category: 'PSU', price: 6500, stock: 50, wattage: 750, tier: 'B', imageUrl: 'https://m.media-amazon.com/images/I/61H4hVqBItL._AC_SL1500_.jpg' },
  { name: 'Thermaltake Toughpower GF1 650W 80+ Gold', category: 'PSU', price: 5200, stock: 45, wattage: 650, tier: 'B', imageUrl: 'https://m.media-amazon.com/images/I/71qS5m+H4zL._AC_SL1500_.jpg' },
  { name: 'Corsair CX650M 650W 80+ Bronze', category: 'PSU', price: 4200, stock: 65, wattage: 650, tier: 'C', imageUrl: 'https://m.media-amazon.com/images/I/71c6X1OQkVL._AC_SL1500_.jpg' },
  { name: 'Generic ATX Power 800W Unrated', category: 'PSU', price: 1200, stock: 100, wattage: 800, tier: 'F', imageUrl: 'https://m.media-amazon.com/images/I/71c6X1OQkVL._AC_SL1500_.jpg' }, // Added dangerous PSU for testing

  // Cases (Fans draw ~15W, max GPU clearance)
  { name: 'Lian Li O11 Dynamic EVO (Black)', category: 'Case', price: 9500, stock: 15, wattage: 20, max_gpu_length_mm: 426, imageUrl: 'https://m.media-amazon.com/images/I/71Q34H2TfBL._AC_SL1500_.jpg' },
  { name: 'NZXT H9 Flow Dual-Chamber (White)', category: 'Case', price: 10500, stock: 20, wattage: 20, max_gpu_length_mm: 435, imageUrl: 'https://m.media-amazon.com/images/I/61iVfA9l80L._AC_SL1500_.jpg' },
  { name: 'NZXT H5 Flow (Black)', category: 'Case', price: 6500, stock: 30, wattage: 15, max_gpu_length_mm: 365, imageUrl: 'https://m.media-amazon.com/images/I/61iVfA9l80L._AC_SL1500_.jpg' },
  { name: 'Corsair 5000D Airflow (Black)', category: 'Case', price: 9200, stock: 25, wattage: 20, max_gpu_length_mm: 400, imageUrl: 'https://m.media-amazon.com/images/I/81hLUb2-LML._AC_SL1500_.jpg' },
  { name: 'Corsair 4000D Airflow (Black)', category: 'Case', price: 5500, stock: 45, wattage: 15, max_gpu_length_mm: 360, imageUrl: 'https://m.media-amazon.com/images/I/81hLUb2-LML._AC_SL1500_.jpg' },
  { name: 'Fractal Design North (Charcoal Black, Mesh)', category: 'Case', price: 8500, stock: 12, wattage: 15, max_gpu_length_mm: 355, imageUrl: 'https://m.media-amazon.com/images/I/81QZpED6cRL._AC_SL1500_.jpg' },
  { name: 'Phanteks Eclipse G360A (Satin Black)', category: 'Case', price: 5800, stock: 35, wattage: 15, max_gpu_length_mm: 400, imageUrl: 'https://m.media-amazon.com/images/I/71Q34H2TfBL._AC_SL1500_.jpg' },
  { name: 'Montech AIR 903 MAX (Black)', category: 'Case', price: 3800, stock: 60, wattage: 15, max_gpu_length_mm: 400, imageUrl: 'https://m.media-amazon.com/images/I/81hLUb2-LML._AC_SL1500_.jpg' }
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('thesis_database');
    const partsCollection = db.collection('pc_parts');
    console.log("Emptying old db...");
    await partsCollection.deleteMany({});
    console.log(`Seeding ${products.length} Real World Parts...`);
    await partsCollection.insertMany(products);
    console.log("Success! Real world catalog injected.");
  } finally {
    await client.close();
  }
}
seed().catch(console.dir);
