export function enrichWithVendors(product: any) {
  let hash = 0;
  if (!product.name) return product;
  
  for (let i = 0; i < product.name.length; i++) {
    hash = product.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash);

  const basePrice = product.price || 5000;
  const dbStock = product.stock !== undefined ? product.stock : 10;

  // Simulate third-party vendor variations
  const vendors = [
    {
      id: "shopee",
      name: "Shopee",
      price: product.vendor === "Shopee" ? basePrice : Math.max(100, basePrice - (h % 800) + 200),
      originalPrice: (product.vendor === "Shopee" ? basePrice : basePrice + 300) + 100,
      stock: product.vendor === "Shopee" ? dbStock : Math.max(0, dbStock - (h % 5)),
      badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/30",
      iconColor: "text-orange-500",
      official: product.vendor === "Shopee" || h % 2 === 0,
      url: `https://shopee.ph/search?keyword=${encodeURIComponent(product.name)}`
    },
    {
      id: "lazada",
      name: "Lazada",
      price: product.vendor === "Lazada" ? basePrice : Math.max(100, basePrice - (h % 500) - 100),
      originalPrice: (product.vendor === "Lazada" ? basePrice : basePrice + 800) + 200,
      stock: product.vendor === "Lazada" ? dbStock : Math.max(0, dbStock + (h % 3) - 2),
      badgeColor: "bg-blue-600/10 text-blue-400 border-blue-600/30",
      iconColor: "text-blue-500",
      official: product.vendor === "Lazada" || h % 3 === 0,
      url: `https://www.lazada.com.ph/catalog/?q=${encodeURIComponent(product.name)}`
    },
    {
       id: "dynaquest",
       name: "DynaQuest PC",
       price: product.vendor === "DynaQuest" ? basePrice : basePrice + (h % 400),
       originalPrice: product.vendor === "DynaQuest" ? basePrice : basePrice + (h % 400),
       stock: product.vendor === "DynaQuest" ? dbStock : Math.max(0, dbStock - 2),
       badgeColor: "bg-emerald-600/10 text-emerald-400 border-emerald-600/30",
       iconColor: "text-emerald-500",
       official: true,
       url: `https://dynaquestpc.com/search?q=${encodeURIComponent(product.name)}`
    }
  ];

  // Calculate starting price for UI badge
  const activeVendors = vendors.filter(v => v.stock > 0);
  const startingPrice = activeVendors.length > 0 
    ? Math.min(...activeVendors.map(v => v.price))
    : basePrice;

  return {
    ...product,
    vendors: vendors.sort((a,b) => a.price - b.price), // Cheapest first
    startingPrice
  };
}
