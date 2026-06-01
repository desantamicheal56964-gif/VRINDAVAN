import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

// Define __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and initialize Firebase Config safely
let firebaseApp: any = null;
let firestoreDb: any = null;
let useFirebase = false;

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    firebaseApp = initializeApp(firebaseConfig);
    firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    useFirebase = true;
    console.log("[DATABASE] Firebase Firestore initialized successfully.");
  } else {
    console.warn("[DATABASE] firebase-applet-config.json not found. Falling back to local db.json store.");
  }
} catch (err: any) {
  console.error("[DATABASE] Error initializing Firebase. Falling back to local db.json store:", err.message || err);
}

// Initial Seed Data definitions directly inside server to avoid bundle path issues
const INITIAL_WEBSITE_CONTENT = {
  heroTitle: "Experience Elegant Taste & Peaceful Garden Dining",
  heroSubtitle: "Welcome to VRINDAVAN HOTEL, Chalisgaon's premier destination for high-quality food, pristine hygiene standards, and relaxing open-air dining.",
  aboutStory: "At VRINDAVAN HOTEL, we believe that dining is not just about food, but about creating memorable experiences. Established on Hirapur Rd, Thakur Wadi, we have grown to become the trust-mark of fine Indian hospitality in Chalisgaon. Under the culinary leadership of our seasoned chefs, we blend traditional Maharastrian and diverse Indian recipes with modern dining sophistication. Our open-air garden rest area provides an oasis of peace, perfect for rich family celebrations, gatherings, and calm dinners.",
  contactPhone: "+91 94227 86543",
  contactAddress: "Hirapur Rd, near Pragati Furniture, Thakur Wadi, Indraprastha Nagar, Chalisgaon, Maharashtra 424101, India",
  openingHours: "Monday - Sunday: 11:00 AM - 11:30 PM"
};

const INITIAL_CHEFS = [
  {
    id: "chef-1",
    name: "Chef Rajendra Patil",
    role: "Executive Head Chef",
    experience: "18+ Years",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=400",
    description: "Specializes in authentic Indian cuisines and North Indian Paneer delicacies with signature spice blend profiles."
  },
  {
    id: "chef-2",
    name: "Chef Amit Kulkarni",
    role: "Master Indian Bread & Tandoor Specialist",
    experience: "12+ Years",
    image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&q=80&w=400",
    description: "Expert in traditional tandoori artistry, perfecting hand-stretched butter naan and clay-oven roasted delicacies."
  }
];

const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    name: "Sachin Marathe",
    rating: 5,
    text: "The best family dining experience in Chalisgaon! The garden seating is extremely peaceful, and the hygiene is top-notch. Highly recommend the Paneer Tikka Masala and Garlic Naan.",
    date: "2026-05-15"
  },
  {
    id: "rev-2",
    name: "Priyanka Deshmukh",
    rating: 5,
    text: "VRINDAVAN HOTEL has amazing food. The service is incredibly fast and the staff is highly trained. The open-air setup in the evening with beautiful lighting makes it look so premium.",
    date: "2026-05-24"
  },
  {
    id: "rev-3",
    name: "Rahul Sonawane",
    rating: 5,
    text: "Extremely clean, delicious vegetarian food, and excellent parking space. The chefs really know their craft. We hold all our family parties here now.",
    date: "2026-05-29"
  }
];

const INITIAL_GALLERY = [
  {
    id: "gal-1",
    url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=600",
    title: "Happy Guests Sharing Elegant Feast",
    category: "Garden Seating"
  },
  {
    id: "gal-2",
    url: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&q=80&w=600",
    title: "Vrindavan Family Dining Lounge",
    category: "Family Area"
  },
  {
    id: "gal-3",
    url: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80&w=600",
    title: "Scenic Open-Air Wooden Deck",
    category: "Outdoor Dining"
  },
  {
    id: "gal-4",
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600",
    title: "Ambient Evening Garden Lighting",
    category: "Evening Lighting"
  },
  {
    id: "gal-5",
    url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=600",
    title: "Beautiful Rest & Relaxation Zone",
    category: "Relaxation Zone"
  }
];

const INITIAL_MENU = [
  {
    id: "dish-starters-1",
    name: "Paneer Tikka Achari",
    description: "Soft cottage cheese chunks marinated in tangy pickle spices, skewered with onions and bell peppers, and roasted in our clay tandoor oven.",
    category: "Starters",
    price: 240,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-starters-2",
    name: "Hara Bhara Kabab",
    description: "Crispy spinach, green pea, and potato patties seasoned with authentic spices and pan-fried with dynamic herbs.",
    category: "Starters",
    price: 180,
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-soups-1",
    name: "Hot & Sour Veg Soup",
    description: "Classic Chinese soup packed with shredded premium vegetables, ginger, garlic, and tangy spice broths.",
    category: "Soups",
    price: 115,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-soups-2",
    name: "Cream of Tomato Soup",
    description: "Vibrant ripe red tomatoes pureed with fresh cream, served with crispy hand-buttered croutons.",
    category: "Soups",
    price: 110,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-veg-1",
    name: "Veg Kadhai Premium",
    description: "A combination of daily picked fresh garden vegetables cooked in a spicy kadhai gravy with capsicum and fresh coriander.",
    category: "Vegetarian Dishes",
    price: 210,
    image: "https://images.unsplash.com/photo-1588644525999-f15318353b3c?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-veg-2",
    name: "Kaju Curry Peshawari",
    description: "Whole roasted cashew nuts simmered in a rich, buttery, sweet and creamy brown gravy topped with fresh cream.",
    category: "Vegetarian Dishes",
    price: 280,
    image: "https://images.unsplash.com/photo-1588644525999-f15318353b3c?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-paneer-1",
    name: "Vrindavan Special Paneer Masala",
    description: "Our signature preparation consisting of hand-pressed paneer cubes cooked in a spiced rich cashew-onion-tomato double-gravy.",
    category: "Paneer Specials",
    price: 270,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-paneer-2",
    name: "Paneer Butter Masala",
    description: "Succulent cottage cheese cubes simmered in a luscious sweet tomato curry enriched with butter, honey, and dried fenugreek leaves.",
    category: "Paneer Specials",
    price: 250,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-south-1",
    name: "Butter Masala Dosa",
    description: "Crispy fermented rice-lentil crepe smeared with fresh butter, spiced potato mash, served with rich sambar and coconut chutneys.",
    category: "South Indian",
    price: 130,
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-chinese-1",
    name: "Veg Manchurian Dry",
    description: "Crispy fried vegetable balls tossed in dynamic garlic, soy sauce, and spring onion seasoning.",
    category: "Chinese",
    price: 175,
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-chinese-2",
    name: "Schezwan Veg Hakka Noodles",
    description: "Spicy wok-tossed long wheat noodles cooked with freshly sliced bell peppers, cabbage, carrots, and house-made Schezwan paste.",
    category: "Chinese",
    price: 190,
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-main-1",
    name: "Double Tadka Yellow Dal",
    description: "Classic yellow lentils tempered twice with lots of aromatic garlic, cumin, mustard seeds, and pure desi ghee.",
    category: "Main Course",
    price: 160,
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-main-2",
    name: "Veg Kofta Mughlai",
    description: "Rich vegetable-paneer balls cooked in a rich, mildly spiced creamy golden gravy.",
    category: "Main Course",
    price: 220,
    image: "https://images.unsplash.com/photo-1588644525999-f15318353b3c?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-breads-1",
    name: "Garlic Butter Naan",
    description: "Tandoored leavened refined wheat bread seasoned with lots of minced premium garlic and brushed with fresh butter.",
    category: "Breads",
    price: 60,
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-breads-2",
    name: "Tandoori Butter Roti",
    description: "Whole wheat bread baked perfectly inside our traditional clay tandoor oven, finished with smooth desi butter.",
    category: "Breads",
    price: 25,
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-rice-1",
    name: "Special Dum Veg Biryani",
    description: "Long grain Basmati rice dum-cooked slowly with aromatic spices, fresh vegetables, mint leaves, and pure saffron water, served with dahi raita.",
    category: "Rice",
    price: 240,
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-rice-2",
    name: "Jeera Rice Basmati",
    description: "Fragrant boiled Basmati rice seasoned expertly with butter and lightly cracked cumin seeds.",
    category: "Rice",
    price: 130,
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-dessert-1",
    name: "Gulab Jamun with Ice Cream",
    description: "Two golden milk-solid dumplings soaked in sugary cardamom syrup, served warm with a scoop of premium vanilla bean ice cream.",
    category: "Desserts",
    price: 110,
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=400",
    available: true
  },
  {
    id: "dish-bev-1",
    name: "Royal Mango Punjabi Lassi",
    description: "Thick, churned yogurt sweet beverage infused with delicious Alphonso mango pulp, served ice-cold in a traditional earthen clay glass.",
    category: "Beverages",
    price: 90,
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=400",
    available: true
  }
];

const INITIAL_BOOKINGS: any[] = [];

// Database File Path
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Active Sessions Store
const ACTIVE_SESSIONS = new Map<string, { username: string; expiresAt: number }>();

// -- FORWARD COMPATIBILITY STUBS FOR OLD CODE AND EMERGENCIES --
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    }
  } catch (e) {}
  return {
    websiteContent: INITIAL_WEBSITE_CONTENT,
    menu: INITIAL_MENU,
    bookings: INITIAL_BOOKINGS,
    chefs: INITIAL_CHEFS,
    gallery: INITIAL_GALLERY,
    reviews: INITIAL_REVIEWS,
    visitorCount: 1556
  };
}
function saveDb(data: any) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("[DATABASE] Error saving local db.json:", e);
  }
}

// --- FIRESTORE PERSISTENCE LAYER ---

// Generic Fetch to load an entire Firestore collection
async function getCollectionDocs(collectionName: string) {
  if (!useFirebase) {
    const db = loadDb();
    if (collectionName === "menu_items") return db.menu || [];
    if (collectionName === "chefs") return db.chefs || [];
    if (collectionName === "gallery_items") return db.gallery || [];
    if (collectionName === "reviews") return db.reviews || [];
    if (collectionName === "bookings") return db.bookings || [];
    return [];
  }
  try {
    const qSnap = await getDocs(collection(firestoreDb, collectionName));
    const items: any[] = [];
    qSnap.forEach((doc) => {
      items.push(doc.data());
    });
    return items;
  } catch (err) {
    console.error(`Error loading Firestore collection ${collectionName}:`, err);
    return [];
  }
}

// Checks if Firestore has metadata config; seeds standard datasets on first initialize
async function seedFirestoreIfNeeded() {
  if (!useFirebase) {
    console.log("[DATABASE] Firebase not active. Skipping Firestore seeding and using local system.");
    return;
  }
  const configDocRef = doc(firestoreDb, "site_content", "config");
  try {
    const configSnap = await getDoc(configDocRef);
    if (!configSnap.exists()) {
      console.log("Firestore empty. Seeding initial data from local db.json / defaults...");
      
      // websiteContent
      await setDoc(configDocRef, {
        heroTitle: INITIAL_WEBSITE_CONTENT.heroTitle,
        heroSubtitle: INITIAL_WEBSITE_CONTENT.heroSubtitle,
        aboutStory: INITIAL_WEBSITE_CONTENT.aboutStory,
        contactPhone: INITIAL_WEBSITE_CONTENT.contactPhone,
        contactAddress: INITIAL_WEBSITE_CONTENT.contactAddress,
        openingHours: INITIAL_WEBSITE_CONTENT.openingHours,
        visitorCount: 1556
      });

      // chefs
      for (const chef of INITIAL_CHEFS) {
        await setDoc(doc(firestoreDb, "chefs", chef.id), chef);
      }

      // gallery
      for (const item of INITIAL_GALLERY) {
        await setDoc(doc(firestoreDb, "gallery_items", item.id), item);
      }

      // menu
      for (const dish of INITIAL_MENU) {
        await setDoc(doc(firestoreDb, "menu_items", dish.id), dish);
      }

      // reviews
      for (const r of INITIAL_REVIEWS) {
        await setDoc(doc(firestoreDb, "reviews", r.id), r);
      }

      console.log("Firestore seeding completed successfully!");
    } else {
      console.log("Firestore connection verified. Collections active.");
    }
  } catch (err) {
    console.error("Error checking or seeding Firestore:", err);
  }
}

async function getWebsiteContent() {
  if (!useFirebase) {
    const db = loadDb();
    return db.websiteContent || INITIAL_WEBSITE_CONTENT;
  }
  try {
    const snap = await getDoc(doc(firestoreDb, "site_content", "config"));
    if (snap.exists()) {
      const data = snap.data();
      const { visitorCount, ...content } = data;
      return content;
    }
  } catch (err) {
    console.error("Error loading web content:", err);
  }
  return INITIAL_WEBSITE_CONTENT;
}

async function updateWebsiteContent(fields: any) {
  if (!useFirebase) {
    const db = loadDb();
    db.websiteContent = { ...db.websiteContent, ...fields };
    saveDb(db);
    return;
  }
  try {
    const ref = doc(firestoreDb, "site_content", "config");
    await setDoc(ref, fields, { merge: true });
  } catch (err) {
    console.error("Error updating web content:", err);
  }
}

async function getVisitorCount() {
  if (!useFirebase) {
    const db = loadDb();
    return db.visitorCount || 1556;
  }
  try {
    const snap = await getDoc(doc(firestoreDb, "site_content", "config"));
    if (snap.exists()) {
      return snap.data().visitorCount || 1556;
    }
  } catch (err) {
    console.error("Error loading visitor count:", err);
  }
  return 1556;
}

async function incrementVisitorCount() {
  if (!useFirebase) {
    const db = loadDb();
    const current = db.visitorCount || 1556;
    db.visitorCount = current + 1;
    saveDb(db);
    return;
  }
  try {
    const ref = doc(firestoreDb, "site_content", "config");
    const snap = await getDoc(ref);
    const current = snap.exists() ? (snap.data().visitorCount || 1556) : 1556;
    await setDoc(ref, { visitorCount: current + 1 }, { merge: true });
  } catch (err) {
    console.error("Error incrementing visitor count:", err);
  }
}

const app = express();
app.use(express.json({ limit: "10mb" }));

// Middleware to authenticate admin token
const authenticateAdminToken = (req: any, res: any, next: any) => {
  const token = req.headers["ef-auth-token"] || req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access Denied: No token provided" });
  }

  const session = ACTIVE_SESSIONS.get(token);
  if (!session) {
    return res.status(401).json({ error: "Access Denied: Invalid or expired session token" });
  }

  if (Date.now() > session.expiresAt) {
    ACTIVE_SESSIONS.delete(token);
    return res.status(401).json({ error: "Access Denied: Session expired" });
  }

  req.user = session;
  next();
};

async function startServer() {
  // Ensure database collections exist and are loaded in Firestore
  await seedFirestoreIfNeeded();

  const PORT = 3000;

  // --- PUBLIC API ENDPOINTS ---

  // Get all content for landing page (menu, content, chefs, gallery, reviews)
  app.get("/api/public/content", async (req, res) => {
    try {
      // Parallel loading for high-speed responsiveness
      const [websiteContent, menu, chefs, gallery, reviews] = await Promise.all([
        getWebsiteContent(),
        getCollectionDocs("menu_items"),
        getCollectionDocs("chefs"),
        getCollectionDocs("gallery_items"),
        getCollectionDocs("reviews")
      ]);

      // Count visitors asynchronously
      await incrementVisitorCount();

      // Ensure neat sorted return sets
      reviews.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.json({
        websiteContent,
        menu,
        chefs,
        gallery,
        reviews
      });
    } catch (err) {
      console.error("Error loading server dataset:", err);
      res.status(500).json({ error: "Failed to retrieve hotel datasets from Firestore database." });
    }
  });

  // Booking endpoint with strict validation
  app.post("/api/public/booking", async (req, res) => {
    const { name, mobile, date, time, persons, specialRequest } = req.body;

    // Standard field presence check
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "Please enter a valid full name." });
    }

    // Indian Mobile number format validation (10 digits)
    const cleanMobile = mobile ? String(mobile).replace(/[\s-()]/g, "") : "";
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!cleanMobile || !mobileRegex.test(cleanMobile)) {
      return res.status(400).json({ error: "Please enter a valid 10-digit mobile number (e.g., 9876543210)." });
    }

    // Future Date check
    if (!date) {
      return res.status(400).json({ error: "Please specify a booking date." });
    }

    const bookingDate = new Date(`${date}T23:59:59`); // set to end of target day
    const today = new Date();
    today.setHours(0, 0, 0, 0); // clear time for direct date-level comparison

    if (bookingDate < today) {
      return res.status(400).json({ error: "Booking date must be today or in the future." });
    }

    // Time validation
    if (!time) {
      return res.status(400).json({ error: "Please select a preferred dining time." });
    }

    // Guest range validations
    const guestCount = parseInt(persons, 10);
    if (isNaN(guestCount) || guestCount <= 0 || guestCount > 50) {
      return res.status(400).json({ error: "Guest count must be between 1 and 50 guests." });
    }

    const bookingId = "book-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    const newBooking = {
      id: bookingId,
      name: name.trim(),
      mobile: cleanMobile,
      date,
      time,
      persons: guestCount,
      specialRequest: specialRequest ? specialRequest.trim() : "",
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    try {
      if (!useFirebase) {
        const db = loadDb();
        if (!db.bookings) db.bookings = [];
        db.bookings.push(newBooking);
        saveDb(db);
      } else {
        await setDoc(doc(firestoreDb, "bookings", bookingId), newBooking);
      }
      res.json({
        success: true,
        message: "Your table reservation request has been successfully submitted.",
        booking: newBooking
      });
    } catch (err) {
      console.error("Error creating booking:", err);
      res.status(500).json({ error: "Failed to create booking." });
    }
  });

  // Submit review endpoint
  app.post("/api/public/review", async (req, res) => {
    const { name, rating, text } = req.body;
    if (!name || !rating || !text) {
      return res.status(400).json({ error: "All review fields (Name, Rating, and Comments) are required." });
    }
    const stars = parseInt(rating, 10);
    if (isNaN(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }

    const reviewId = "rev-" + Date.now();
    const newReview = {
      id: reviewId,
      name: name.trim(),
      rating: stars,
      text: text.trim(),
      date: new Date().toISOString().split("T")[0]
    };

    try {
      if (!useFirebase) {
        const db = loadDb();
        if (!db.reviews) db.reviews = [];
        db.reviews.push(newReview);
        saveDb(db);
      } else {
        await setDoc(doc(firestoreDb, "reviews", reviewId), newReview);
      }
      res.json({ success: true, review: newReview });
    } catch (err) {
      console.error("Error saving review to Database:", err);
      res.status(500).json({ error: "Failed to persist review." });
    }
  });

  // --- ADMIN AUTHENTICATION API ---
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;

    const envUsername = process.env.ADMIN_USERNAME || "vrindavanmalik";
    const envPassword = process.env.ADMIN_PASSWORD || "sanketgod1234";

    if (username === envUsername && password === envPassword) {
      const token = crypto.randomBytes(32).toString("hex");
      // Set session expiration to 24 hours
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      ACTIVE_SESSIONS.set(token, { username, expiresAt });

      return res.json({ token, username, success: true });
    }

    return res.status(401).json({ error: "Invalid username or password" });
  });

  app.post("/api/auth/logout", (req, res) => {
    const rawToken = req.headers["ef-auth-token"] || req.headers["authorization"]?.split(" ")[1];
    const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
    if (token) {
      ACTIVE_SESSIONS.delete(token);
    }
    res.json({ success: true });
  });

  app.get("/api/admin/check", authenticateAdminToken, (req, res) => {
    res.json({ success: true, username: (req as any).user.username });
  });

  // --- ADMIN BOOKINGS MANAGEMENT ---
  app.get("/api/admin/bookings", authenticateAdminToken, async (req, res) => {
    try {
      const bookings = await getCollectionDocs("bookings");
      // Pre-sort bookings chronologically by creation timestamp
      bookings.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ error: "Firestore booking reading aborted." });
    }
  });

  app.post("/api/admin/bookings/:id/status", authenticateAdminToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== "Approved" && status !== "Rejected" && status !== "Pending") {
      return res.status(400).json({ error: "Invalid reservation status value." });
    }

    try {
      if (!useFirebase) {
        const db = loadDb();
        if (!db.bookings) db.bookings = [];
        const index = db.bookings.findIndex((b: any) => b.id === id);
        if (index === -1) {
          return res.status(404).json({ error: "Booking reservation session not found." });
        }
        db.bookings[index].status = status;
        saveDb(db);
      } else {
        const bookingRef = doc(firestoreDb, "bookings", id);
        const bookingSnap = await getDoc(bookingRef);
        if (!bookingSnap.exists()) {
          return res.status(404).json({ error: "Booking reservation session not found." });
        }
        await setDoc(bookingRef, { status }, { merge: true });
      }
      const bookings = await getCollectionDocs("bookings");
      bookings.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      res.json({ success: true, bookings });
    } catch (err) {
      res.status(500).json({ error: "Error updating booking status." });
    }
  });

  app.delete("/api/admin/bookings/:id", authenticateAdminToken, async (req, res) => {
    const { id } = req.params;

    try {
      if (!useFirebase) {
        const db = loadDb();
        if (!db.bookings) db.bookings = [];
        const initialLen = db.bookings.length;
        db.bookings = db.bookings.filter((b: any) => b.id !== id);
        if (db.bookings.length === initialLen) {
          return res.status(404).json({ error: "Booking session not found to be deleted." });
        }
        saveDb(db);
      } else {
        const bookingRef = doc(firestoreDb, "bookings", id);
        const bookingSnap = await getDoc(bookingRef);
        if (!bookingSnap.exists()) {
          return res.status(404).json({ error: "Booking session not found to be deleted." });
        }
        await deleteDoc(bookingRef);
      }
      const bookings = await getCollectionDocs("bookings");
      bookings.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      res.json({ success: true, bookings });
    } catch (err) {
      res.status(500).json({ error: "Error removing booking doc." });
    }
  });

  // --- ADMIN MENU MANAGEMENT ---
  app.post("/api/admin/menu", authenticateAdminToken, async (req, res) => {
    const { name, description, category, price, image, available } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ error: "Dish Name, Category, and Price are required fields." });
    }

    const itemPrice = parseFloat(price);
    if (isNaN(itemPrice) || itemPrice <= 0) {
      return res.status(400).json({ error: "Please apply a positive numeric price value." });
    }

    const dishId = "dish-" + Date.now();
    const newDish = {
      id: dishId,
      name: name.trim(),
      description: description ? description.trim() : "",
      category,
      price: itemPrice,
      image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
      available: available !== undefined ? !!available : true
    };

    try {
      if (!useFirebase) {
        const db = loadDb();
        if (!db.menu) db.menu = [];
        db.menu.push(newDish);
        saveDb(db);
      } else {
        await setDoc(doc(firestoreDb, "menu_items", dishId), newDish);
      }
      const menu = await getCollectionDocs("menu_items");
      res.json({ success: true, menu });
    } catch (err) {
      res.status(500).json({ error: "Error creating specific recipe item." });
    }
  });

  app.put("/api/admin/menu/:id", authenticateAdminToken, async (req, res) => {
    const { id } = req.params;
    const { name, description, category, price, image, available } = req.body;

    try {
      const updatedFields: any = {};
      if (name) updatedFields.name = name.trim();
      if (description !== undefined) updatedFields.description = description.trim();
      if (category) updatedFields.category = category;
      if (price !== undefined) {
        const itemPrice = parseFloat(price);
        if (!isNaN(itemPrice) && itemPrice > 0) updatedFields.price = itemPrice;
      }
      if (image) updatedFields.image = image;
      if (available !== undefined) updatedFields.available = !!available;

      if (!useFirebase) {
        const db = loadDb();
        if (!db.menu) db.menu = [];
        const index = db.menu.findIndex((m: any) => m.id === id);
        if (index === -1) {
          return res.status(404).json({ error: "Dish menu item not found for updates." });
        }
        db.menu[index] = { ...db.menu[index], ...updatedFields };
        saveDb(db);
      } else {
        const dishRef = doc(firestoreDb, "menu_items", id);
        const dishSnap = await getDoc(dishRef);
        if (!dishSnap.exists()) {
          return res.status(404).json({ error: "Dish menu item not found for updates." });
        }
        await setDoc(dishRef, updatedFields, { merge: true });
      }
      const menu = await getCollectionDocs("menu_items");
      res.json({ success: true, menu });
    } catch (err) {
      res.status(500).json({ error: "Error updating recipe item." });
    }
  });

  app.delete("/api/admin/menu/:id", authenticateAdminToken, async (req, res) => {
    const { id } = req.params;

    try {
      if (!useFirebase) {
        const db = loadDb();
        if (!db.menu) db.menu = [];
        const initialLen = db.menu.length;
        db.menu = db.menu.filter((m: any) => m.id !== id);
        if (db.menu.length === initialLen) {
          return res.status(404).json({ error: "Dish menu item not found." });
        }
        saveDb(db);
      } else {
        const dishRef = doc(firestoreDb, "menu_items", id);
        const dishSnap = await getDoc(dishRef);
        if (!dishSnap.exists()) {
          return res.status(404).json({ error: "Dish menu item not found." });
        }
        await deleteDoc(dishRef);
      }
      const menu = await getCollectionDocs("menu_items");
      res.json({ success: true, menu });
    } catch (err) {
      res.status(500).json({ error: "Error deleting recipe item." });
    }
  });

  // --- ADMIN CONTENT MANAGEMENT ---
  app.put("/api/admin/content", authenticateAdminToken, async (req, res) => {
    const { heroTitle, heroSubtitle, aboutStory, contactPhone, contactAddress, openingHours } = req.body;

    try {
      const updatedFields: any = {};
      if (heroTitle) updatedFields.heroTitle = heroTitle;
      if (heroSubtitle) updatedFields.heroSubtitle = heroSubtitle;
      if (aboutStory) updatedFields.aboutStory = aboutStory;
      if (contactPhone) updatedFields.contactPhone = contactPhone;
      if (contactAddress) updatedFields.contactAddress = contactAddress;
      if (openingHours) updatedFields.openingHours = openingHours;

      await updateWebsiteContent(updatedFields);
      const websiteContent = await getWebsiteContent();
      res.json({ success: true, websiteContent });
    } catch (err) {
      res.status(500).json({ error: "Error updating hotel global text configurations." });
    }
  });

  // --- ADMIN GALLERY MANAGEMENT ---
  app.post("/api/admin/gallery", authenticateAdminToken, async (req, res) => {
    const { url, title, category } = req.body;

    if (!url || !title || !category) {
      return res.status(400).json({ error: "Image URL, Title, and Category are required." });
    }

    const galleryId = "gal-" + Date.now();
    const newPhoto = {
      id: galleryId,
      url: url.trim(),
      title: title.trim(),
      category
    };

    try {
      if (!useFirebase) {
        const db = loadDb();
        if (!db.gallery) db.gallery = [];
        db.gallery.push(newPhoto);
        saveDb(db);
      } else {
        await setDoc(doc(firestoreDb, "gallery_items", galleryId), newPhoto);
      }
      const gallery = await getCollectionDocs("gallery_items");
      res.json({ success: true, gallery });
    } catch (err) {
      res.status(500).json({ error: "Error saving visual photo asset." });
    }
  });

  app.delete("/api/admin/gallery/:id", authenticateAdminToken, async (req, res) => {
    const { id } = req.params;

    try {
      if (!useFirebase) {
        const db = loadDb();
        if (!db.gallery) db.gallery = [];
        const initialLen = db.gallery.length;
        db.gallery = db.gallery.filter((g: any) => g.id !== id);
        if (db.gallery.length === initialLen) {
          return res.status(404).json({ error: "Photo asset not found." });
        }
        saveDb(db);
      } else {
        const photoRef = doc(firestoreDb, "gallery_items", id);
        const photoSnap = await getDoc(photoRef);
        if (photoSnap.exists()) {
          await deleteDoc(photoRef);
        }
      }
      const gallery = await getCollectionDocs("gallery_items");
      res.json({ success: true, gallery });
    } catch (err) {
      res.status(500).json({ error: "Error deleting photo asset." });
    }
  });

  // --- ADMIN ANALYTICS ---
  app.get("/api/admin/analytics", authenticateAdminToken, async (req, res) => {
    try {
      const [bookings, menu, visitorCountEstimate] = await Promise.all([
        getCollectionDocs("bookings"),
        getCollectionDocs("menu_items"),
        getVisitorCount()
      ]);

      const totalCount = bookings.length;
      const todayStr = new Date().toISOString().split("T")[0];
      const todayCount = bookings.filter((b: any) => b.date === todayStr).length;

      // Weekly/Monthly filters
      const nowTs = Date.now();
      const sevenDaysTs = nowTs - 7 * 24 * 60 * 60 * 1000;
      const thirtyDaysTs = nowTs - 30 * 24 * 60 * 60 * 1000;

      const weeklyCount = bookings.filter((b: any) => {
        const bTs = new Date(b.date).getTime();
        return bTs >= sevenDaysTs;
      }).length;

      const monthlyCount = bookings.filter((b: any) => {
        const bTs = new Date(b.date).getTime();
        return bTs >= thirtyDaysTs;
      }).length;

      // Top categories in dishes
      const catFreq: { [key: string]: number } = {};
      menu.forEach((d: any) => {
        catFreq[d.category] = (catFreq[d.category] || 0) + 1;
      });

      res.json({
        totalBookings: totalCount,
        todayBookings: todayCount,
        weeklyBookings: weeklyCount,
        monthlyBookings: monthlyCount,
        popularDishesCount: menu.length,
        visitorCountEstimate,
        categoryChartData: Object.keys(catFreq).map(cat => ({ name: cat, value: catFreq[cat] }))
      });
    } catch (err) {
      console.error("Error building analytics datasets:", err);
      res.status(500).json({ error: "Failed to assemble analytics metrics." });
    }
  });

  // Vite routing setup for React App serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Premium Fullstack Server running at http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
