const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Query = require('./models/Query');

dotenv.config();

const initialProducts = [
  // Mens
  {
    name: "Hugo Boss Stainless Steel Champion Analog Watch",
    brand: "Hugo Boss",
    category: "mens",
    price: 5000,
    description: "Champion Analog Black Dial Men's Watch with stainless steel strap",
    imageUrl: "https://www.maximawatches.com/cdn/shop/files/V194MSSI71233.jpg?v=1727073219",
    rating: 4.8,
    inStock: true
  },
  {
    name: "Fastrack Casual Analog Black Dial",
    brand: "Fastrack",
    category: "mens",
    price: 1500,
    description: "Trendy everyday wrist watch for men with sporty finish",
    imageUrl: "https://m.media-amazon.com/images/I/61VMO4oqi0L._AC_UL480_FMwebp_QL65_.jpg",
    rating: 4.4,
    inStock: true
  },
  {
    name: "Titan Neo Classic Brown Leather Watch",
    brand: "Titan",
    category: "mens",
    price: 3495,
    description: "Classic analog watch with genuine leather strap and mineral glass",
    imageUrl: "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dw382a5ace/images/Titan/Catalog/90165AP02_1.jpg?sw=360&sh=360",
    rating: 4.7,
    inStock: true
  },
  {
    name: "Sonata Volt Sporty Quartz Watch",
    brand: "Sonata",
    category: "mens",
    price: 1199,
    description: "High durability water-resistant quartz watch for daily wear",
    imageUrl: "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dw0e3a6bc8/images/Titan/Catalog/26026PP02W_1.jpg?sw=360&sh=360",
    rating: 4.3,
    inStock: true
  },
  // Womens
  {
    name: "Titan Raga Viva Rose Gold Analog",
    brand: "Titan",
    category: "womens",
    price: 4995,
    description: "Elegant rose gold plated watch with mother-of-pearl dial",
    imageUrl: "https://www.titancompany.in/sites/default/files/raga-may24-desktop-v2.jpg",
    rating: 4.9,
    inStock: true
  },
  {
    name: "Fastrack Glam Chic Silver Watch",
    brand: "Fastrack",
    category: "womens",
    price: 2250,
    description: "Modern metallic mesh strap analog watch for stylish women",
    imageUrl: "https://th.bing.com/th/id/OIP.rLkG9TWgOQ-nQrHx_2CoKAHaHa?rs=1&pid=ImgDetMain",
    rating: 4.6,
    inStock: true
  },
  // Smart Watches
  {
    name: "Noise Explorer Kids Smartwatch GPS",
    brand: "Noise",
    category: "kids",
    price: 2999,
    description: "Interactive smart watch with GPS tracking and two-way voice calling",
    imageUrl: "https://images.fonearena.com/blog/wp-content/uploads/2023/09/Noise-Explorer-Kids-Smartwatch-1024x421.png",
    rating: 4.5,
    inStock: true
  },
  {
    name: "Maxima Max Pro Ultra Smartwatch 1.96-inch",
    brand: "Maxima",
    category: "smart",
    price: 2499,
    description: "HD Bluetooth Calling, 120+ Sports modes, Heart Rate & SpO2 Monitor",
    imageUrl: "https://www.maximawatches.com/cdn/shop/files/3200x1200px.jpg?v=1720011469",
    rating: 4.7,
    inStock: true
  },
  {
    name: "Titan Talk S AMOLED Smartwatch",
    brand: "Titan",
    category: "smart",
    price: 4999,
    description: "Premium metal body AMOLED display with advanced fitness tracking",
    imageUrl: "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dw4cd88d38/images/Fastrack/Catalog/38140NM01_1.jpg?sw=360&sh=360",
    rating: 4.8,
    inStock: true
  },
  // Analog & Accessories
  {
    name: "Maxima Heritage Analog Couple Watch Set",
    brand: "Maxima",
    category: "analog",
    price: 3999,
    description: "Pair of matching timeless analog watches with gold accents",
    imageUrl: "https://www.maximawatches.com/cdn/shop/files/Artboard_1_abac6fce-0b4a-4a33-9761-5a79a87e8a29.jpg?v=1720011796",
    rating: 4.6,
    inStock: true
  },
  {
    name: "Stainless Steel Premium Mesh Watch Strap (22mm)",
    brand: "Wrist Wonders",
    category: "accessories",
    price: 799,
    description: "Universal quick-release magnetic Milanese loop strap",
    imageUrl: "https://m.media-amazon.com/images/I/511nTkPHdJL._AC_UL480_FMwebp_QL65_.jpg",
    rating: 4.5,
    inStock: true
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wrist_wonders');
    console.log('[MongoDB Connected for Seeding]');

    // Clear existing products and seed fresh ones
    await Product.deleteMany();
    await Product.insertMany(initialProducts);
    console.log(`[Seeded ${initialProducts.length} Products Successfully]`);

    // Create default admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@wristwonders.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@wristwonders.com',
        password: 'adminPassword123',
        role: 'admin'
      });
      console.log('[Admin Account Created]: admin@wristwonders.com / adminPassword123');
    }

    // Create a demo customer user
    const customerExists = await User.findOne({ email: 'john@example.com' });
    if (!customerExists) {
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user'
      });
      console.log('[Demo Customer Created]: john@example.com / password123');
    }

    // Add a sample query
    const queryCount = await Query.countDocuments();
    if (queryCount === 0) {
      await Query.create({
        name: 'Priya Sharma',
        email: 'priya@example.com',
        message: 'Do you offer warranty on smart watches bought during sale?'
      });
      console.log('[Sample Query Added]');
    }

    console.log('[Database Seeding Complete!]');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeding Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();
