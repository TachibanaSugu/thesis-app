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

  // Add Best Price flag
  const sortedVendors = vendors.sort((a,b) => a.price - b.price).map((v, i) => ({
    ...v,
    isBestPrice: i === 0 && v.stock > 0
  }));

  // Simulate Stock Trend Predictor
  const trendTypes = ["dropped", "increased", "stable"];
  const trend = trendTypes[h % 3];
  const percentage = (h % 15) + 2; // 2% to 16%
  const stockTrend = trend === "stable" 
      ? "Prices have been stable over the last 30 days."
      : `Prices have ${trend} ${percentage}% this week. ${trend === "dropped" ? "Great time to buy!" : "Consider waiting."}`;

  return {
    ...product,
    vendors: sortedVendors,
    startingPrice,
    stockTrend
  };
}

export function getDetailedSpecs(productName: string, category: string) {
  const name = productName.toLowerCase();
  
  if (category === "CPU") {
    const isAMD = name.includes("amd") || name.includes("ryzen");
    return [
      { label: "Architecture", value: isAMD ? "Zen 4" : "Raptor Lake Refresh" },
      { label: "Cores / Threads", value: name.includes("9") ? "16 / 32" : name.includes("7") ? "8 / 16" : "6 / 12" },
      { label: "Base Clock", value: name.includes("9") ? "4.2 GHz" : "3.7 GHz" },
      { label: "Socket", value: isAMD ? "AM5" : "LGA 1700" },
      { label: "TDP", value: name.includes("9") ? "170W" : "65W" }
    ];
  }
  
  if (category === "GPU") {
    return [
      { label: "VRAM Memory", value: name.includes("4070") ? "12GB GDDR6X" : name.includes("4060") ? "8GB GDDR6" : "16GB GDDR6" },
      { label: "Base Clock", value: "1830 MHz" },
      { label: "Interface", value: "PCIe 4.0 x16" },
      { label: "Recommended PSU", value: name.includes("4070") ? "650W" : "550W" },
      { label: "Ray Tracing", value: "3rd Gen Cores" }
    ];
  }

  if (category === "RAM") {
    return [
      { label: "Type", value: name.includes("ddr5") ? "DDR5" : "DDR4" },
      { label: "Speed", value: name.includes("ddr5") ? "6000 MHz" : "3200 MHz" },
      { label: "Latency", value: "CL30 / CL16" },
      { label: "Voltage", value: "1.35V" }
    ];
  }

  if (category === "Storage") {
    return [
      { label: "Form Factor", value: "M.2 2280" },
      { label: "Interface", value: "NVMe PCIe 4.0 x4" },
      { label: "Read Speed", value: name.includes("990") ? "7450 MB/s" : "3500 MB/s" },
      { label: "Write Speed", value: name.includes("990") ? "6900 MB/s" : "2100 MB/s" }
    ];
  }

  if (category === "Motherboard") {
    return [
      { label: "Chipset", value: name.includes("z790") ? "Intel Z790" : name.includes("b650") ? "AMD B650" : "H610" },
      { label: "Socket", value: name.includes("z790") ? "LGA 1700" : "AM5" },
      { label: "Form Factor", value: "ATX" },
      { label: "Max Memory", value: "128GB DDR5" },
      { label: "PCIe Gen", value: "PCIe 5.0 Support" }
    ];
  }

  if (category === "PSU") {
    return [
      { label: "Wattage", value: name.includes("850") ? "850W" : "750W" },
      { label: "Efficiency", value: "80+ Gold Certified" },
      { label: "Modular", value: "Fully Modular" },
      { label: "Protection", value: "OVP/UVP/SCP/OPP" },
      { label: "Fan Type", value: "120mm FDB" }
    ];
  }

  if (category === "Case") {
    return [
      { label: "Type", value: "ATX Mid Tower" },
      { label: "Side Panel", value: "Tempered Glass" },
      { label: "Max GPU Length", value: "360mm" },
      { label: "Pre-installed Fans", value: "3x 120mm ARGB" },
      { label: "I/O Ports", value: "USB-C, 2x USB 3.0" }
    ];
  }

  return [
    { label: "Manufacturer", value: productName.split(' ')[0] },
    { label: "Category", value: category },
    { label: "Condition", value: "Brand New" },
    { label: "Warranty", value: "1 Year Local" }
  ];
}
