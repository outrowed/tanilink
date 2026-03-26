export interface Seller {
  id: number
  name: string
  location: string
  warehouse: string
  delivery: string
  rating: number
  price: number
  stockLabel: string
  busyLevel: "Low" | "Moderate" | "High"
  activeOrders: number
  handlingTime: string
  unitsSold: number
}

export interface PriceHistoryPoint {
  month: string
  price: number
}

export type PriceHistoryRange = "1y" | "6m" | "1m" | "1w" | "24h"

export interface SalesHistoryPoint {
  orders: number
  period: string
  revenue: number
  salePrice: number
  unitsSold: number
}

export interface SalesHistorySummary {
  averageSalePrice: number
  latestSalePrice: number
  totalOrders: number
  totalRevenue: number
  totalUnitsSold: number
}

export interface Product {
  id: number
  name: string
  slug: string
  icon: string
  category: "Staple" | "Protein" | "Vegetable" | "Spice" | "Pantry"
  unit: string
  description: string
  marketStatus: string
  averagePrice: number
  priceChange: number
  yearlyHigh: number
  yearlyLow: number
  leadTime: string
  chartColor: string
  priceHistory: PriceHistoryPoint[]
  priceHistoryByRange: Record<PriceHistoryRange, PriceHistoryPoint[]>
  productSalesHistory: SalesHistoryPoint[]
  productSalesHistoryByRange: Record<PriceHistoryRange, SalesHistoryPoint[]>
  sellers: Seller[]
}

export interface SearchBundleIngredient {
  productSlug: Product["slug"]
  quantity: string
  role: string
}

export interface SearchBundle {
  id: string
  name: string
  type: "Dish" | "Supply kit"
  aliases: string[]
  description: string
  servings: string
  outputLabel: string
  ingredients: SearchBundleIngredient[]
}

export type UserLocationId = "jakarta-selatan" | "beji-depok" | "bekasi-barat" | "coblong-bandung"

export interface UserLocationOption {
  id: UserLocationId
  area: string
  city: string
  province: string
  zone: string
}

type BaseSeller = Omit<Seller, "unitsSold">

type BaseProduct = Omit<
  Product,
  "priceHistoryByRange" | "productSalesHistory" | "productSalesHistoryByRange" | "sellers"
> & {
  sellers: BaseSeller[]
}

const baseProducts: BaseProduct[] = [
  {
    id: 1,
    name: "Premium Rice",
    slug: "premium-rice",
    icon: "BR",
    category: "Staple",
    unit: "per 5 kg sack",
    description: "High-volume core staple for restaurants and household buyers.",
    marketStatus: "Stable with slight upward pressure",
    averagePrice: 76500,
    priceChange: 4.8,
    yearlyHigh: 79200,
    yearlyLow: 70200,
    leadTime: "1 day delivery",
    chartColor: "#d97706",
    priceHistory: [
      { month: "January", price: 70200 },
      { month: "February", price: 71800 },
      { month: "March", price: 72600 },
      { month: "April", price: 74100 },
      { month: "May", price: 73500 },
      { month: "June", price: 74800 },
      { month: "July", price: 75600 },
      { month: "August", price: 76100 },
      { month: "September", price: 76900 },
      { month: "October", price: 77400 },
      { month: "November", price: 79200 },
      { month: "December", price: 78100 },
    ],
    sellers: [
      {
        id: 101,
        name: "Karawang Grain Union",
        location: "Karawang",
        warehouse: "East Jakarta Fulfillment Hub",
        delivery: "Arrives tomorrow",
        rating: 4.9,
        price: 75800,
        stockLabel: "Very high stock",
        busyLevel: "Low",
        activeOrders: 14,
        handlingTime: "Packed within 2 hours",
      },
      {
        id: 102,
        name: "Subang Padi Sentra",
        location: "Subang",
        warehouse: "Bekasi Cold & Dry Hub",
        delivery: "Arrives tomorrow",
        rating: 4.8,
        price: 77200,
        stockLabel: "Ready for bulk order",
        busyLevel: "Moderate",
        activeOrders: 31,
        handlingTime: "Packed within 4 hours",
      },
      {
        id: 103,
        name: "Mitra Beras Nusantara",
        location: "Cirebon",
        warehouse: "South Tangerang Hub",
        delivery: "2 day delivery",
        rating: 4.7,
        price: 78100,
        stockLabel: "Medium stock",
        busyLevel: "High",
        activeOrders: 46,
        handlingTime: "Packed within 7 hours",
      },
    ],
  },
  {
    id: 2,
    name: "Red Chili",
    slug: "red-chili",
    icon: "CH",
    category: "Spice",
    unit: "per kg",
    description: "High-volatility produce with strong demand from food vendors.",
    marketStatus: "Volatile, trending upward",
    averagePrice: 48200,
    priceChange: 12.4,
    yearlyHigh: 53800,
    yearlyLow: 31800,
    leadTime: "Same-day metro delivery",
    chartColor: "#dc2626",
    priceHistory: [
      { month: "January", price: 31800 },
      { month: "February", price: 35200 },
      { month: "March", price: 33700 },
      { month: "April", price: 39100 },
      { month: "May", price: 41800 },
      { month: "June", price: 40300 },
      { month: "July", price: 44700 },
      { month: "August", price: 46900 },
      { month: "September", price: 43800 },
      { month: "October", price: 49500 },
      { month: "November", price: 53800 },
      { month: "December", price: 48200 },
    ],
    sellers: [
      {
        id: 201,
        name: "Malang Chili Farmers",
        location: "Malang",
        warehouse: "West Jakarta Fresh Hub",
        delivery: "Same-day delivery",
        rating: 4.9,
        price: 46900,
        stockLabel: "Fresh harvest today",
        busyLevel: "High",
        activeOrders: 49,
        handlingTime: "Handled within 8 hours",
      },
      {
        id: 202,
        name: "Batu Agro Mandiri",
        location: "Batu",
        warehouse: "Depok Produce Hub",
        delivery: "Arrives tomorrow morning",
        rating: 4.8,
        price: 48800,
        stockLabel: "High stock",
        busyLevel: "Moderate",
        activeOrders: 27,
        handlingTime: "Handled within 5 hours",
      },
      {
        id: 203,
        name: "Lembang Spice House",
        location: "Lembang",
        warehouse: "Bogor Fresh Depot",
        delivery: "Arrives tomorrow",
        rating: 4.6,
        price: 50100,
        stockLabel: "Limited premium batch",
        busyLevel: "Low",
        activeOrders: 12,
        handlingTime: "Handled within 3 hours",
      },
    ],
  },
  {
    id: 3,
    name: "Broiler Chicken Fillet",
    slug: "chicken-fillet",
    icon: "CK",
    category: "Protein",
    unit: "per kg",
    description: "Restaurant-ready protein with cold-chain fulfillment.",
    marketStatus: "Balanced supply",
    averagePrice: 42800,
    priceChange: -2.1,
    yearlyHigh: 45600,
    yearlyLow: 40100,
    leadTime: "Same-day cold chain",
    chartColor: "#7c3aed",
    priceHistory: [
      { month: "January", price: 44500 },
      { month: "February", price: 45200 },
      { month: "March", price: 45600 },
      { month: "April", price: 44200 },
      { month: "May", price: 43500 },
      { month: "June", price: 42300 },
      { month: "July", price: 43100 },
      { month: "August", price: 40900 },
      { month: "September", price: 42200 },
      { month: "October", price: 43300 },
      { month: "November", price: 42500 },
      { month: "December", price: 41800 },
    ],
    sellers: [
      {
        id: 301,
        name: "Cianjur Fresh Protein",
        location: "Cianjur",
        warehouse: "North Jakarta Chill Hub",
        delivery: "Same-day cold chain",
        rating: 4.9,
        price: 41900,
        stockLabel: "High stock",
        busyLevel: "Moderate",
        activeOrders: 22,
        handlingTime: "Cold-packed within 4 hours",
      },
      {
        id: 302,
        name: "Sukabumi Poultry Center",
        location: "Sukabumi",
        warehouse: "South Jakarta Chill Hub",
        delivery: "Arrives tonight",
        rating: 4.8,
        price: 43100,
        stockLabel: "Ready for weekly contract",
        busyLevel: "Low",
        activeOrders: 16,
        handlingTime: "Cold-packed within 2 hours",
      },
      {
        id: 303,
        name: "Bandung Meatline",
        location: "Bandung",
        warehouse: "Bekasi Chill Hub",
        delivery: "Arrives tomorrow",
        rating: 4.7,
        price: 43800,
        stockLabel: "Medium stock",
        busyLevel: "High",
        activeOrders: 41,
        handlingTime: "Cold-packed within 6 hours",
      },
    ],
  },
  {
    id: 4,
    name: "Cooking Oil",
    slug: "cooking-oil",
    icon: "OL",
    category: "Pantry",
    unit: "per 2 L pouch",
    description: "Pantry essential with steady procurement demand.",
    marketStatus: "Very stable",
    averagePrice: 36200,
    priceChange: 1.2,
    yearlyHigh: 37100,
    yearlyLow: 34900,
    leadTime: "1 day delivery",
    chartColor: "#0891b2",
    priceHistory: [
      { month: "January", price: 34900 },
      { month: "February", price: 35200 },
      { month: "March", price: 35800 },
      { month: "April", price: 35400 },
      { month: "May", price: 36000 },
      { month: "June", price: 36200 },
      { month: "July", price: 36100 },
      { month: "August", price: 37100 },
      { month: "September", price: 36400 },
      { month: "October", price: 36200 },
      { month: "November", price: 36900 },
      { month: "December", price: 36400 },
    ],
    sellers: [
      {
        id: 401,
        name: "PantryFlow Wholesale",
        location: "Tangerang",
        warehouse: "Tangerang Dry Hub",
        delivery: "Arrives tomorrow",
        rating: 4.8,
        price: 35800,
        stockLabel: "Very high stock",
        busyLevel: "Low",
        activeOrders: 18,
        handlingTime: "Packed within 2 hours",
      },
      {
        id: 402,
        name: "Sembako Jaya",
        location: "Bekasi",
        warehouse: "Bekasi Dry Hub",
        delivery: "Arrives tomorrow",
        rating: 4.7,
        price: 36400,
        stockLabel: "High stock",
        busyLevel: "Moderate",
        activeOrders: 29,
        handlingTime: "Packed within 4 hours",
      },
      {
        id: 403,
        name: "Gudang Kebutuhan Dapur",
        location: "Depok",
        warehouse: "South Jakarta Dry Hub",
        delivery: "2 day delivery",
        rating: 4.6,
        price: 36900,
        stockLabel: "Bulk stock reserved",
        busyLevel: "High",
        activeOrders: 44,
        handlingTime: "Packed within 6 hours",
      },
    ],
  },
  {
    id: 5,
    name: "Shallots",
    slug: "shallots",
    icon: "SH",
    category: "Spice",
    unit: "per kg",
    description: "Daily aromatic base with moderate seasonality.",
    marketStatus: "Recovering after prior spike",
    averagePrice: 39600,
    priceChange: -5.6,
    yearlyHigh: 47200,
    yearlyLow: 38200,
    leadTime: "Next-morning delivery",
    chartColor: "#ea580c",
    priceHistory: [
      { month: "January", price: 47200 },
      { month: "February", price: 45100 },
      { month: "March", price: 45800 },
      { month: "April", price: 43900 },
      { month: "May", price: 42800 },
      { month: "June", price: 41600 },
      { month: "July", price: 40900 },
      { month: "August", price: 40100 },
      { month: "September", price: 39200 },
      { month: "October", price: 40100 },
      { month: "November", price: 38200 },
      { month: "December", price: 39600 },
    ],
    sellers: [
      {
        id: 501,
        name: "Brebes Onion Growers",
        location: "Brebes",
        warehouse: "East Jakarta Fresh Hub",
        delivery: "Arrives tomorrow morning",
        rating: 4.9,
        price: 38800,
        stockLabel: "Harvest week inventory",
        busyLevel: "Moderate",
        activeOrders: 26,
        handlingTime: "Handled within 4 hours",
      },
      {
        id: 502,
        name: "Pantura Spice Market",
        location: "Tegal",
        warehouse: "North Jakarta Produce Hub",
        delivery: "Arrives tomorrow",
        rating: 4.7,
        price: 39700,
        stockLabel: "Medium stock",
        busyLevel: "High",
        activeOrders: 37,
        handlingTime: "Handled within 6 hours",
      },
      {
        id: 503,
        name: "Lokal Bawang Nusantara",
        location: "Pemalang",
        warehouse: "Bekasi Produce Hub",
        delivery: "2 day delivery",
        rating: 4.6,
        price: 40400,
        stockLabel: "Limited premium batch",
        busyLevel: "Low",
        activeOrders: 11,
        handlingTime: "Handled within 3 hours",
      },
    ],
  },
  {
    id: 6,
    name: "Cabbage",
    slug: "cabbage",
    icon: "CB",
    category: "Vegetable",
    unit: "per head",
    description: "Volume vegetable favored by soup and street food operators.",
    marketStatus: "Seasonally soft",
    averagePrice: 11800,
    priceChange: -3.3,
    yearlyHigh: 14600,
    yearlyLow: 10900,
    leadTime: "Next-morning delivery",
    chartColor: "#16a34a",
    priceHistory: [
      { month: "January", price: 14600 },
      { month: "February", price: 14100 },
      { month: "March", price: 13500 },
      { month: "April", price: 13900 },
      { month: "May", price: 13100 },
      { month: "June", price: 12500 },
      { month: "July", price: 12200 },
      { month: "August", price: 12100 },
      { month: "September", price: 10900 },
      { month: "October", price: 11800 },
      { month: "November", price: 11200 },
      { month: "December", price: 11900 },
    ],
    sellers: [
      {
        id: 601,
        name: "Bandung Highland Growers",
        location: "Bandung",
        warehouse: "Bogor Produce Hub",
        delivery: "Arrives tomorrow morning",
        rating: 4.8,
        price: 11400,
        stockLabel: "Very high stock",
        busyLevel: "Low",
        activeOrders: 9,
        handlingTime: "Handled within 2 hours",
      },
      {
        id: 602,
        name: "Lembang Greens",
        location: "Lembang",
        warehouse: "Depok Produce Hub",
        delivery: "Arrives tomorrow",
        rating: 4.7,
        price: 11900,
        stockLabel: "Field fresh",
        busyLevel: "Moderate",
        activeOrders: 24,
        handlingTime: "Handled within 5 hours",
      },
      {
        id: 603,
        name: "Sayur Nusantara",
        location: "Garut",
        warehouse: "East Jakarta Produce Hub",
        delivery: "2 day delivery",
        rating: 4.5,
        price: 12200,
        stockLabel: "Medium stock",
        busyLevel: "High",
        activeOrders: 33,
        handlingTime: "Handled within 7 hours",
      },
    ],
  },
  {
    id: 7,
    name: "Garlic",
    slug: "garlic",
    icon: "GA",
    category: "Spice",
    unit: "per kg",
    description: "Essential aromatic with stable restaurant and household demand.",
    marketStatus: "Stable with short harvest spikes",
    averagePrice: 33800,
    priceChange: 2.9,
    yearlyHigh: 35600,
    yearlyLow: 30900,
    leadTime: "Next-morning delivery",
    chartColor: "#f59e0b",
    priceHistory: [
      { month: "January", price: 30900 },
      { month: "February", price: 31700 },
      { month: "March", price: 32100 },
      { month: "April", price: 32900 },
      { month: "May", price: 33400 },
      { month: "June", price: 33100 },
      { month: "July", price: 33600 },
      { month: "August", price: 34200 },
      { month: "September", price: 34800 },
      { month: "October", price: 35600 },
      { month: "November", price: 34400 },
      { month: "December", price: 33800 },
    ],
    sellers: [
      {
        id: 701,
        name: "Tegal Bumbu Sentra",
        location: "Tegal",
        warehouse: "North Jakarta Spice Hub",
        delivery: "Arrives tomorrow morning",
        rating: 4.8,
        price: 33400,
        stockLabel: "High stock",
        busyLevel: "Moderate",
        activeOrders: 23,
        handlingTime: "Handled within 4 hours",
      },
      {
        id: 702,
        name: "Brebes Garlic Union",
        location: "Brebes",
        warehouse: "Bekasi Spice Depot",
        delivery: "Arrives tomorrow",
        rating: 4.7,
        price: 34100,
        stockLabel: "Bulk-ready stock",
        busyLevel: "Low",
        activeOrders: 12,
        handlingTime: "Handled within 3 hours",
      },
      {
        id: 703,
        name: "Bawang Putih Nusantara",
        location: "Cirebon",
        warehouse: "South Jakarta Dry Hub",
        delivery: "2 day delivery",
        rating: 4.6,
        price: 34700,
        stockLabel: "Medium stock",
        busyLevel: "High",
        activeOrders: 38,
        handlingTime: "Handled within 6 hours",
      },
    ],
  },
  {
    id: 8,
    name: "Fresh Eggs",
    slug: "fresh-eggs",
    icon: "EG",
    category: "Protein",
    unit: "per tray of 30",
    description: "High-turnover protein staple for breakfast menus and mixed dishes.",
    marketStatus: "Stable with mild weekend fluctuations",
    averagePrice: 58800,
    priceChange: 1.7,
    yearlyHigh: 61200,
    yearlyLow: 55400,
    leadTime: "Same-day metro delivery",
    chartColor: "#f97316",
    priceHistory: [
      { month: "January", price: 55400 },
      { month: "February", price: 56100 },
      { month: "March", price: 56800 },
      { month: "April", price: 57900 },
      { month: "May", price: 57400 },
      { month: "June", price: 58300 },
      { month: "July", price: 59100 },
      { month: "August", price: 59800 },
      { month: "September", price: 61200 },
      { month: "October", price: 60300 },
      { month: "November", price: 59600 },
      { month: "December", price: 58800 },
    ],
    sellers: [
      {
        id: 801,
        name: "Cianjur Egg Farm",
        location: "Cianjur",
        warehouse: "South Jakarta Fresh Hub",
        delivery: "Same-day delivery",
        rating: 4.9,
        price: 58100,
        stockLabel: "High stock",
        busyLevel: "Low",
        activeOrders: 15,
        handlingTime: "Handled within 2 hours",
      },
      {
        id: 802,
        name: "Sukabumi Layer Coop",
        location: "Sukabumi",
        warehouse: "Depok Fresh Hub",
        delivery: "Arrives tonight",
        rating: 4.8,
        price: 58900,
        stockLabel: "Ready for weekly orders",
        busyLevel: "Moderate",
        activeOrders: 26,
        handlingTime: "Handled within 4 hours",
      },
      {
        id: 803,
        name: "Bandung Telur Jaya",
        location: "Bandung",
        warehouse: "Bekasi Fresh Hub",
        delivery: "Arrives tomorrow",
        rating: 4.6,
        price: 59700,
        stockLabel: "Medium stock",
        busyLevel: "High",
        activeOrders: 40,
        handlingTime: "Handled within 6 hours",
      },
    ],
  },
  {
    id: 9,
    name: "Tomatoes",
    slug: "tomatoes",
    icon: "TM",
    category: "Vegetable",
    unit: "per kg",
    description: "Flexible produce input for sambal, soup, and stir-fry menus.",
    marketStatus: "Softening after prior demand spike",
    averagePrice: 16200,
    priceChange: -4.2,
    yearlyHigh: 19400,
    yearlyLow: 15100,
    leadTime: "Next-morning delivery",
    chartColor: "#ef4444",
    priceHistory: [
      { month: "January", price: 19400 },
      { month: "February", price: 18800 },
      { month: "March", price: 18200 },
      { month: "April", price: 17900 },
      { month: "May", price: 17100 },
      { month: "June", price: 16600 },
      { month: "July", price: 16300 },
      { month: "August", price: 15900 },
      { month: "September", price: 15100 },
      { month: "October", price: 15600 },
      { month: "November", price: 16400 },
      { month: "December", price: 16200 },
    ],
    sellers: [
      {
        id: 901,
        name: "Lembang Tomato House",
        location: "Lembang",
        warehouse: "Bogor Produce Hub",
        delivery: "Arrives tomorrow morning",
        rating: 4.8,
        price: 15800,
        stockLabel: "Field fresh",
        busyLevel: "Low",
        activeOrders: 10,
        handlingTime: "Handled within 2 hours",
      },
      {
        id: 902,
        name: "Garut Farm Network",
        location: "Garut",
        warehouse: "East Jakarta Produce Hub",
        delivery: "Arrives tomorrow",
        rating: 4.7,
        price: 16300,
        stockLabel: "High stock",
        busyLevel: "Moderate",
        activeOrders: 22,
        handlingTime: "Handled within 5 hours",
      },
      {
        id: 903,
        name: "Bandung Fresh Basket",
        location: "Bandung",
        warehouse: "Depok Produce Hub",
        delivery: "2 day delivery",
        rating: 4.6,
        price: 16700,
        stockLabel: "Medium stock",
        busyLevel: "High",
        activeOrders: 31,
        handlingTime: "Handled within 7 hours",
      },
    ],
  },
  {
    id: 10,
    name: "Firm Tofu",
    slug: "firm-tofu",
    icon: "TF",
    category: "Protein",
    unit: "per 10-piece slab pack",
    description: "Budget protein favorite for home kitchens, warungs, and catering prep.",
    marketStatus: "Steady with low volatility",
    averagePrice: 22800,
    priceChange: 0.8,
    yearlyHigh: 23700,
    yearlyLow: 21400,
    leadTime: "Same-day metro delivery",
    chartColor: "#84cc16",
    priceHistory: [
      { month: "January", price: 21400 },
      { month: "February", price: 21900 },
      { month: "March", price: 22100 },
      { month: "April", price: 22400 },
      { month: "May", price: 22700 },
      { month: "June", price: 22900 },
      { month: "July", price: 23200 },
      { month: "August", price: 23400 },
      { month: "September", price: 23700 },
      { month: "October", price: 23100 },
      { month: "November", price: 22600 },
      { month: "December", price: 22800 },
    ],
    sellers: [
      {
        id: 1001,
        name: "Tahu Cianjur Collective",
        location: "Cianjur",
        warehouse: "South Jakarta Fresh Hub",
        delivery: "Same-day delivery",
        rating: 4.8,
        price: 22400,
        stockLabel: "Fresh batch every morning",
        busyLevel: "Moderate",
        activeOrders: 20,
        handlingTime: "Handled within 3 hours",
      },
      {
        id: 1002,
        name: "Bandung Soy Kitchen",
        location: "Bandung",
        warehouse: "North Jakarta Fresh Hub",
        delivery: "Arrives tonight",
        rating: 4.7,
        price: 22900,
        stockLabel: "High stock",
        busyLevel: "Low",
        activeOrders: 13,
        handlingTime: "Handled within 2 hours",
      },
      {
        id: 1003,
        name: "Depok Tofu Mart",
        location: "Depok",
        warehouse: "Depok City Hub",
        delivery: "Same-day delivery",
        rating: 4.6,
        price: 23300,
        stockLabel: "Medium stock",
        busyLevel: "High",
        activeOrders: 35,
        handlingTime: "Handled within 5 hours",
      },
    ],
  },
  {
    id: 11,
    name: "Tempeh",
    slug: "tempeh",
    icon: "TP",
    category: "Protein",
    unit: "per 10-piece pack",
    description: "Daily Indonesian protein staple with strong value-driven demand.",
    marketStatus: "Stable, slightly climbing",
    averagePrice: 24600,
    priceChange: 3.4,
    yearlyHigh: 25900,
    yearlyLow: 22500,
    leadTime: "Same-day metro delivery",
    chartColor: "#a16207",
    priceHistory: [
      { month: "January", price: 22500 },
      { month: "February", price: 22900 },
      { month: "March", price: 23200 },
      { month: "April", price: 23800 },
      { month: "May", price: 24100 },
      { month: "June", price: 24300 },
      { month: "July", price: 24700 },
      { month: "August", price: 25100 },
      { month: "September", price: 25900 },
      { month: "October", price: 25400 },
      { month: "November", price: 24900 },
      { month: "December", price: 24600 },
    ],
    sellers: [
      {
        id: 1101,
        name: "Tempe Bandung Raya",
        location: "Bandung",
        warehouse: "Bekasi Fresh Hub",
        delivery: "Arrives tonight",
        rating: 4.8,
        price: 24200,
        stockLabel: "High stock",
        busyLevel: "Low",
        activeOrders: 17,
        handlingTime: "Handled within 2 hours",
      },
      {
        id: 1102,
        name: "Sukabumi Ferment House",
        location: "Sukabumi",
        warehouse: "South Jakarta Fresh Hub",
        delivery: "Same-day delivery",
        rating: 4.7,
        price: 24700,
        stockLabel: "Fresh daily production",
        busyLevel: "Moderate",
        activeOrders: 24,
        handlingTime: "Handled within 4 hours",
      },
      {
        id: 1103,
        name: "Depok Protein Pantry",
        location: "Depok",
        warehouse: "Depok City Hub",
        delivery: "Same-day delivery",
        rating: 4.6,
        price: 25100,
        stockLabel: "Medium stock",
        busyLevel: "High",
        activeOrders: 36,
        handlingTime: "Handled within 5 hours",
      },
    ],
  },
]

export const priceHistoryRangeLabels: Record<PriceHistoryRange, string> = {
  "1y": "1 year",
  "6m": "6 months",
  "1m": "1 month",
  "1w": "1 week",
  "24h": "24 hours",
}

const monthShortLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function clampPrice(value: number) {
  return Math.max(1_000, Math.round(value / 100) * 100)
}

function clampCount(value: number, minimum = 1) {
  return Math.max(minimum, Math.round(value))
}

function buildLastSixMonthHistory(history: PriceHistoryPoint[]) {
  return history.slice(-6)
}

function buildOneMonthHistory(product: BaseProduct, history: PriceHistoryPoint[]) {
  const latestPrice = history[history.length - 1]?.price ?? product.averagePrice
  const startPrice = history[history.length - 2]?.price ?? latestPrice
  const dailyStep = (latestPrice - startPrice) / 29

  return Array.from({ length: 30 }, (_, index) => {
    const wave = Math.sin((index / 29) * Math.PI * 2) * (latestPrice * 0.018)
    const bias = product.priceChange >= 0 ? index * 18 : -index * 14
    const price = clampPrice(startPrice + dailyStep * index + wave + bias)

    return {
      month: `${weekdayLabels[index % weekdayLabels.length]} ${index + 1}`,
      price,
    }
  })
}

function buildOneWeekHistory(product: BaseProduct, history: PriceHistoryPoint[]) {
  const monthlyHistory = buildOneMonthHistory(product, history)

  return monthlyHistory.slice(-7)
}

function buildTwentyFourHourHistory(product: BaseProduct, history: PriceHistoryPoint[]) {
  const latestPrice = history[history.length - 1]?.price ?? product.averagePrice
  const baseline = history[history.length - 2]?.price ?? latestPrice
  const slope = (latestPrice - baseline) / 23

  return Array.from({ length: 24 }, (_, index) => {
    const hour = String(index).padStart(2, "0")
    const pulse = Math.cos((index / 23) * Math.PI * 3) * (latestPrice * 0.006)
    const demandShift = index >= 17 ? latestPrice * 0.004 : index <= 6 ? -latestPrice * 0.003 : 0
    const price = clampPrice(baseline + slope * index + pulse + demandShift)

    return {
      month: `${hour}:00`,
      price,
    }
  })
}

function buildPriceHistoryByRange(product: BaseProduct): Record<PriceHistoryRange, PriceHistoryPoint[]> {
  const yearlyHistory = product.priceHistory.map((point, index) => ({
    month: monthShortLabels[index] ?? point.month,
    price: point.price,
  }))

  return {
    "1y": yearlyHistory,
    "6m": buildLastSixMonthHistory(yearlyHistory),
    "1m": buildOneMonthHistory(product, yearlyHistory),
    "1w": buildOneWeekHistory(product, yearlyHistory),
    "24h": buildTwentyFourHourHistory(product, yearlyHistory),
  }
}

const categorySalesBaseline: Record<Product["category"], number> = {
  Staple: 640,
  Protein: 420,
  Vegetable: 520,
  Spice: 310,
  Pantry: 560,
}

const rangeVolumeScale: Record<PriceHistoryRange, number> = {
  "1y": 1,
  "6m": 1,
  "1m": 0.18,
  "1w": 0.16,
  "24h": 0.035,
}

function buildProductSalesHistoryForRange(
  product: BaseProduct,
  history: PriceHistoryPoint[],
  range: PriceHistoryRange
): SalesHistoryPoint[] {
  const baselineUnits = categorySalesBaseline[product.category] * rangeVolumeScale[range]
  const markup = 1.014 + (product.id % 4) * 0.0035
  const orderDivisor =
    product.category === "Staple"
      ? 5.4
      : product.category === "Pantry"
        ? 6.1
        : product.category === "Spice"
          ? 4.2
          : 4.8

  return history.map((point, index) => {
    const seasonalWave = Math.sin(index * 0.92 + product.id * 0.55) * baselineUnits * 0.12
    const pricePressure = ((product.averagePrice - point.price) / Math.max(product.averagePrice, 1)) * baselineUnits * 0.32
    const demandPulse = Math.cos(index * 0.58 + product.priceChange * 0.12) * baselineUnits * 0.06
    const unitsSold = clampCount(baselineUnits + seasonalWave + pricePressure + demandPulse, 3)
    const orders = clampCount(unitsSold / orderDivisor + Math.sin(index * 0.41 + product.id) * 3, 1)
    const salePrice = clampPrice(point.price * markup)

    return {
      orders,
      period: point.month,
      revenue: salePrice * unitsSold,
      salePrice,
      unitsSold,
    }
  })
}

function buildProductSalesHistoryByRange(
  product: BaseProduct,
  priceHistoryByRange: Record<PriceHistoryRange, PriceHistoryPoint[]>
): Record<PriceHistoryRange, SalesHistoryPoint[]> {
  return {
    "1y": buildProductSalesHistoryForRange(product, priceHistoryByRange["1y"], "1y"),
    "6m": buildProductSalesHistoryForRange(product, priceHistoryByRange["6m"], "6m"),
    "1m": buildProductSalesHistoryForRange(product, priceHistoryByRange["1m"], "1m"),
    "1w": buildProductSalesHistoryForRange(product, priceHistoryByRange["1w"], "1w"),
    "24h": buildProductSalesHistoryForRange(product, priceHistoryByRange["24h"], "24h"),
  }
}

export function summarizeSalesHistory(history: SalesHistoryPoint[]): SalesHistorySummary {
  if (!history.length) {
    return {
      averageSalePrice: 0,
      latestSalePrice: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalUnitsSold: 0,
    }
  }

  const totalOrders = history.reduce((sum, point) => sum + point.orders, 0)
  const totalRevenue = history.reduce((sum, point) => sum + point.revenue, 0)
  const totalUnitsSold = history.reduce((sum, point) => sum + point.unitsSold, 0)
  const latestSalePrice = history[history.length - 1]?.salePrice ?? 0

  return {
    averageSalePrice: Math.round(history.reduce((sum, point) => sum + point.salePrice, 0) / history.length),
    latestSalePrice,
    totalOrders,
    totalRevenue,
    totalUnitsSold,
  }
}

function buildSellerUnitsSold(product: BaseProduct, totalUnitsSold: number) {
  if (!product.sellers.length) {
    return []
  }

  const weights = product.sellers.map((seller, index) => {
    const priceAdvantage = Math.max(0.8, 1 + ((product.averagePrice - seller.price) / Math.max(product.averagePrice, 1)) * 1.8)
    const ratingBoost = seller.rating / 5
    const loadAdjustment =
      seller.busyLevel === "Low" ? 1.08 : seller.busyLevel === "Moderate" ? 1 : 0.92
    const positionBias = 1 + (product.sellers.length - index) * 0.06

    return Math.max(0.1, priceAdvantage * ratingBoost * loadAdjustment * positionBias)
  })

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let remainingUnits = totalUnitsSold

  return product.sellers.map((seller, index) => {
    const isLast = index === product.sellers.length - 1
    const allocatedUnits = isLast
      ? remainingUnits
      : clampCount((totalUnitsSold * weights[index]) / Math.max(totalWeight, 1), 1)

    remainingUnits = Math.max(0, remainingUnits - allocatedUnits)

    return {
      ...seller,
      unitsSold: allocatedUnits,
    }
  })
}

export const products: Product[] = baseProducts.map((product) => {
  const priceHistoryByRange = buildPriceHistoryByRange(product)
  const productSalesHistoryByRange = buildProductSalesHistoryByRange(product, priceHistoryByRange)
  const productSalesHistory = productSalesHistoryByRange["1y"]
  const productSalesSummary = summarizeSalesHistory(productSalesHistory)

  return {
    ...product,
    priceHistoryByRange,
    productSalesHistory,
    productSalesHistoryByRange,
    sellers: buildSellerUnitsSold(product, productSalesSummary.totalUnitsSold),
  }
})

export const defaultUserLocationId: UserLocationId = "jakarta-selatan"

export const userLocationOptions: UserLocationOption[] = [
  {
    id: "jakarta-selatan",
    area: "Jakarta Selatan",
    city: "Jakarta",
    province: "DKI Jakarta",
    zone: "Jabodetabek demand corridor",
  },
  {
    id: "beji-depok",
    area: "Beji",
    city: "Depok",
    province: "Jawa Barat",
    zone: "South-side peri-urban corridor",
  },
  {
    id: "bekasi-barat",
    area: "Bekasi Barat",
    city: "Bekasi",
    province: "Jawa Barat",
    zone: "East-side industrial delivery corridor",
  },
  {
    id: "coblong-bandung",
    area: "Coblong",
    city: "Bandung",
    province: "Jawa Barat",
    zone: "Bandung urban supply corridor",
  },
]

export const searchBundles: SearchBundle[] = [
  {
    id: "nasi-goreng-batch",
    name: "Nasi Goreng Batch",
    type: "Dish",
    aliases: ["nasi goreng", "fried rice", "nasi goreng kampung", "warung fried rice"],
    description: "Bulk fried-rice sourcing blueprint for home kitchens, stalls, and small restaurants.",
    servings: "20 portions",
    outputLabel: "Fast wok-ready basket",
    ingredients: [
      { productSlug: "premium-rice", quantity: "10 kg", role: "core staple" },
      { productSlug: "chicken-fillet", quantity: "5 kg", role: "protein topping" },
      { productSlug: "red-chili", quantity: "2 kg", role: "heat profile" },
      { productSlug: "shallots", quantity: "2 kg", role: "aromatic base" },
      { productSlug: "cooking-oil", quantity: "8 pouches", role: "pantry support" },
      { productSlug: "cabbage", quantity: "10 heads", role: "vegetable add-on" },
    ],
  },
  {
    id: "soto-ayam-service",
    name: "Soto Ayam Service Plan",
    type: "Dish",
    aliases: ["soto ayam", "chicken soup", "soto", "plan a soto ayam menu"],
    description: "Ingredient mix optimized for a chicken soup service with rice and supporting aromatics.",
    servings: "25 bowls",
    outputLabel: "Comfort-food service pack",
    ingredients: [
      { productSlug: "chicken-fillet", quantity: "7 kg", role: "main broth protein" },
      { productSlug: "premium-rice", quantity: "8 kg", role: "rice accompaniment" },
      { productSlug: "shallots", quantity: "2.5 kg", role: "fried garnish base" },
      { productSlug: "red-chili", quantity: "1 kg", role: "sambal support" },
      { productSlug: "cabbage", quantity: "12 heads", role: "fresh garnish" },
      { productSlug: "cooking-oil", quantity: "6 pouches", role: "frying stock" },
    ],
  },
  {
    id: "ayam-geprek-lineup",
    name: "Ayam Geprek Lineup",
    type: "Dish",
    aliases: ["ayam geprek", "geprek", "show ingredients for ayam geprek"],
    description: "Procurement plan for fried chicken rice meals with sambal-heavy demand.",
    servings: "30 portions",
    outputLabel: "High-spice meal set",
    ingredients: [
      { productSlug: "chicken-fillet", quantity: "8 kg", role: "fried chicken base" },
      { productSlug: "premium-rice", quantity: "10 kg", role: "plate staple" },
      { productSlug: "red-chili", quantity: "3 kg", role: "sambal core" },
      { productSlug: "shallots", quantity: "2 kg", role: "aromatic booster" },
      { productSlug: "cooking-oil", quantity: "10 pouches", role: "deep-fry stock" },
      { productSlug: "cabbage", quantity: "14 heads", role: "fresh side vegetable" },
    ],
  },
  {
    id: "warung-stir-fry-kit",
    name: "Warung Stir-Fry Supply Kit",
    type: "Supply kit",
    aliases: ["restaurant supplies", "warung supplies", "stir fry supply", "kitchen supply kit"],
    description: "Multi-ingredient pantry and produce kit for small Indonesian kitchens serving daily stir-fry menus.",
    servings: "1 week operational stock",
    outputLabel: "Kitchen restock bundle",
    ingredients: [
      { productSlug: "premium-rice", quantity: "15 kg", role: "daily staple reserve" },
      { productSlug: "red-chili", quantity: "4 kg", role: "shared spice stock" },
      { productSlug: "shallots", quantity: "4 kg", role: "aromatic stock" },
      { productSlug: "cooking-oil", quantity: "12 pouches", role: "pantry reserve" },
      { productSlug: "cabbage", quantity: "16 heads", role: "high-turnover vegetable" },
      { productSlug: "chicken-fillet", quantity: "10 kg", role: "protein reserve" },
    ],
  },
  {
    id: "mie-goreng-night-batch",
    name: "Mie Goreng Night Batch",
    type: "Dish",
    aliases: ["mie goreng", "fried noodles", "street noodle batch", "plan mie goreng service"],
    description: "Scripted sourcing mix for noodle stalls and night-market fried noodle menus.",
    servings: "24 portions",
    outputLabel: "Fast-turn wok basket",
    ingredients: [
      { productSlug: "fresh-eggs", quantity: "3 trays", role: "egg topping and binder" },
      { productSlug: "red-chili", quantity: "2 kg", role: "heat profile" },
      { productSlug: "shallots", quantity: "2 kg", role: "aromatic base" },
      { productSlug: "garlic", quantity: "1.5 kg", role: "savory base" },
      { productSlug: "cabbage", quantity: "14 heads", role: "vegetable bulk" },
      { productSlug: "cooking-oil", quantity: "8 pouches", role: "pantry support" },
    ],
  },
  {
    id: "capcay-catering-tray",
    name: "Capcay Catering Tray",
    type: "Dish",
    aliases: ["capcay", "vegetable stir fry", "cap cay", "plan capcay catering"],
    description: "Vegetable-forward catering plan for mixed stir-fry trays and side dishes.",
    servings: "18 trays",
    outputLabel: "Vegetable-forward catering set",
    ingredients: [
      { productSlug: "cabbage", quantity: "18 heads", role: "main vegetable bulk" },
      { productSlug: "tomatoes", quantity: "5 kg", role: "fresh sauce body" },
      { productSlug: "garlic", quantity: "2 kg", role: "savory aromatic" },
      { productSlug: "shallots", quantity: "2 kg", role: "sweet aromatic" },
      { productSlug: "firm-tofu", quantity: "10 packs", role: "protein filler" },
      { productSlug: "cooking-oil", quantity: "10 pouches", role: "pantry support" },
    ],
  },
  {
    id: "gorengan-snack-kit",
    name: "Gorengan Snack Kit",
    type: "Supply kit",
    aliases: ["gorengan supplies", "fried snack kit", "snack stall stock", "tahu tempe goreng"],
    description: "Procurement set for Indonesian fried snacks built around tofu, tempeh, aromatics, and frying oil.",
    servings: "3 day snack stall stock",
    outputLabel: "Frying-line starter bundle",
    ingredients: [
      { productSlug: "firm-tofu", quantity: "16 packs", role: "fried tofu base" },
      { productSlug: "tempeh", quantity: "16 packs", role: "fried tempeh base" },
      { productSlug: "garlic", quantity: "2 kg", role: "marinade and batter seasoning" },
      { productSlug: "shallots", quantity: "2 kg", role: "aromatic seasoning" },
      { productSlug: "red-chili", quantity: "2 kg", role: "condiment support" },
      { productSlug: "cooking-oil", quantity: "14 pouches", role: "deep-fry stock" },
    ],
  },
]

export const searchPrompts = [
  "I want to cook nasi goreng for 20 portions",
  "Show ingredients for ayam geprek",
  "Plan a Soto Ayam menu",
  "Build a warung stir-fry supply kit",
  "Plan mie goreng service for 24 portions",
  "Prepare a capcay catering tray",
  "Build a gorengan snack stall stock",
]

export const recentAiSearches = [
  "I want to cook nasi goreng for 20 portions",
  "Show ingredients for ayam geprek",
  "Plan a Soto Ayam menu",
  "Build a warung stir-fry supply kit",
  "Prepare a soto ayam lunch service for 25 bowls",
  "Plan mie goreng service for 24 portions",
  "Prepare a capcay catering tray for dinner",
  "Build a gorengan snack stall stock",
]

export const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
