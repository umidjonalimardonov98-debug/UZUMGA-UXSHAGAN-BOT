export type Category = {
  id: string;
  name: string;
  emoji: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  emoji: string;
  image?: string;
  rating: number;
  sold: number;
  isNew?: boolean;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  description: string;
};

/** Faqat kiyim do'koni — kategoriyalar */
export const categories: Category[] = [
  { id: "erkaklar", name: "Erkaklar", emoji: "👔" },
  { id: "ayollar", name: "Ayollar", emoji: "👗" },
  { id: "bolalar", name: "Bolalar", emoji: "🧒" },
  { id: "ustki", name: "Ustki kiyim", emoji: "🧥" },
  { id: "sport", name: "Sport", emoji: "🥋" },
  { id: "aksessuar", name: "Aksessuar", emoji: "🧢" },
];

export const defaultSizes = ["XS", "S", "M", "L", "XL", "XXL"];

/** Boshlang'ich namunaviy mahsulotlar (admin panelidan tahrirlanadi) */
export const seedProducts: Product[] = [
  {
    id: "c1",
    name: "Klassik oq ko'ylak, erkaklar uchun",
    category: "erkaklar",
    price: 189000,
    oldPrice: 320000,
    emoji: "👔",
    rating: 4.8,
    sold: 214,
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Oq", "Ko'k"],
    stock: 24,
    description: "100% paxta, nafas oluvchi mato. Ish va bayram uchun mos klassik qirqim.",
  },
  {
    id: "c2",
    name: "Ayollar uchun yozgi ko'ylak, gulli",
    category: "ayollar",
    price: 245000,
    oldPrice: 420000,
    emoji: "👗",
    rating: 4.9,
    sold: 331,
    sizes: ["S", "M", "L"],
    colors: ["Qizil", "Bej"],
    stock: 15,
    description: "Yengil viskoza mato, yozgi mavsum uchun qulay va shinam ko'ylak.",
  },
  {
    id: "c3",
    name: "Oversize futbolka, unisex",
    category: "erkaklar",
    price: 119000,
    oldPrice: 179000,
    emoji: "👕",
    rating: 4.6,
    sold: 540,
    sizes: defaultSizes,
    colors: ["Qora", "Oq", "Bej"],
    stock: 60,
    description: "Zich paxta, oversize qirqim. Kundalik kiyim uchun ideal.",
  },
  {
    id: "c4",
    name: "Kuzgi jinsi kurtka",
    category: "ustki",
    price: 429000,
    oldPrice: 690000,
    emoji: "🧥",
    rating: 4.7,
    sold: 128,
    isNew: true,
    sizes: ["M", "L", "XL"],
    colors: ["Ko'k", "Qora"],
    stock: 12,
    description: "Qalin jinsi mato, ichki astarli. Kuz-bahor mavsumi uchun.",
  },
  {
    id: "c5",
    name: "Bolalar uchun sport kostyum",
    category: "bolalar",
    price: 199000,
    oldPrice: 279000,
    emoji: "🧒",
    rating: 4.5,
    sold: 176,
    sizes: ["104", "110", "116", "122", "128"],
    colors: ["Kulrang", "Ko'k"],
    stock: 30,
    description: "Yumshoq futer mato, cho'ziluvchan bel. Maktab va sport uchun.",
  },
  {
    id: "c6",
    name: "Sport shim jogger",
    category: "sport",
    price: 165000,
    emoji: "👖",
    rating: 4.4,
    sold: 289,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Qora", "Kulrang"],
    stock: 40,
    description: "Cho'ziluvchan mato, cho'ntaklari zamokli, mashg'ulot uchun qulay.",
  },
  {
    id: "c7",
    name: "Trikotaj sviter, ayollar",
    category: "ayollar",
    price: 235000,
    oldPrice: 340000,
    emoji: "🧶",
    rating: 4.6,
    sold: 92,
    sizes: ["S", "M", "L"],
    colors: ["Sut rang", "Pushti"],
    stock: 18,
    description: "Yumshoq trikotaj, issiq saqlaydi, tanani qismaydi.",
  },
  {
    id: "c8",
    name: "Beysbolka, klassik",
    category: "aksessuar",
    price: 79000,
    emoji: "🧢",
    rating: 4.3,
    sold: 410,
    sizes: ["Universal"],
    colors: ["Qora", "Bej", "Oq"],
    stock: 80,
    description: "Sozlanuvchi tasma, paxtali mato, quyoshdan himoya.",
  },
];

export const formatPrice = (v: number) => `${v.toLocaleString("ru-RU")} so'm`;
