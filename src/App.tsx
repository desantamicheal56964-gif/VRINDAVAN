import { useState, useEffect } from "react";
import {
  Compass,
  Phone,
  Clock,
  MapPin,
  UtensilsCrossed,
  Trees,
  CheckCircle,
  HelpCircle,
  Instagram,
  Facebook,
  ShieldCheck,
  Award
} from "lucide-react";

// Types
import { Dish, Booking, GalleryItem, WebsiteContent, Review, ChefInfo } from "./types";

// Static Seed Data fallbacks if the server takes time to boot or responds with error
import {
  INITIAL_WEBSITE_CONTENT,
  INITIAL_MENU,
  INITIAL_CHEFS,
  INITIAL_GALLERY,
  INITIAL_REVIEWS
} from "./data";

// Sub-components
import Header from "./components/Header";
import Hero from "./components/Hero";
import AboutUs from "./components/AboutUs";
import GardenShowcase from "./components/GardenShowcase";
import ChefExperience from "./components/ChefExperience";
import MenuSection from "./components/MenuSection";
import HygieneQuality from "./components/HygieneQuality";
import CustomerReviews from "./components/CustomerReviews";
import LocationSection from "./components/LocationSection";
import TableBooking from "./components/TableBooking";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem("vrindavan_token"));

  // Domain states
  const [content, setContent] = useState<WebsiteContent>(INITIAL_WEBSITE_CONTENT);
  const [menu, setMenu] = useState<Dish[]>(INITIAL_MENU);
  const [chefs, setChefs] = useState<ChefInfo[]>(INITIAL_CHEFS);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  // Load all public website content from the Express database backend
  const loadPublicContent = async () => {
    try {
      const res = await fetch("/api/public/content");
      if (res.ok) {
        const data = await res.json();
        if (data.websiteContent) setContent(data.websiteContent);
        if (data.menu) setMenu(data.menu);
        if (data.chefs) setChefs(data.chefs);
        if (data.gallery) setGallery(data.gallery);
        if (data.reviews) setReviews(data.reviews);
      }
    } catch (err) {
      console.warn("Public content service currently using local offline state seed.", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPublicContent();
    
    // Auto validate session on startup
    if (token) {
      fetch("/api/admin/check", { headers: { "ef-auth-token": token } })
        .then((res) => {
          if (!res.ok) {
            setToken(null);
            localStorage.removeItem("vrindavan_token");
          }
        })
        .catch(() => {
          // Keep state offline-tolerant
        });
    }
  }, [token]);

  // Handle smooth scrolls with offsets to accommodate sticky top headers
  const handleNavClick = (sectionId: string) => {
    setIsAdminMode(false);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerDecorationHeight = 84; 
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerDecorationHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 120);
  };

  // REST callback: submit a table booking
  const handleAddBooking = async (bookingData: {
    name: string;
    mobile: string;
    date: string;
    time: string;
    persons: number;
    specialRequest: string;
  }) => {
    try {
      const res = await fetch("/api/public/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const parsed = await res.json();
      if (res.ok && parsed.success) {
        return { success: true, booking: parsed.booking };
      } else {
        return { success: false, message: parsed.error };
      }
    } catch (err) {
      return { success: false, message: "Network connection was dropped. Please try again." };
    }
  };

  // REST callback: post a customer feedback review
  const handleSubmitReview = async (reviewData: { name: string; rating: number; text: string }) => {
    try {
      const res = await fetch("/api/public/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData)
      });

      if (res.ok) {
        const data = await res.json();
        // Append new review on screen
        if (data.review) {
          setReviews((prev) => [data.review, ...prev]);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-matte-black flex flex-col items-center justify-center font-mono text-gold text-xs gap-4">
        <UtensilsCrossed className="h-8 w-8 animate-spin text-gold" />
        <p className="tracking-[0.2em] uppercase">DECRYPTING HOTEL DATABASE...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matte-black text-warm-cream">
      
      {/* Dynamic Navigation Sticky Bar */}
      <Header
        onNavClick={handleNavClick}
        onAdminClick={() => {
          setIsAdminMode(!isAdminMode);
          window.scrollTo(0, 0);
        }}
        isAdminMode={isAdminMode}
      />

      {/* RENDER MODE ROUTER */}
      {isAdminMode ? (
        <AdminDashboard
          token={token}
          setToken={setToken}
          initialContent={content}
          initialMenu={menu}
          initialGallery={gallery}
          onLogout={() => {
            setIsAdminMode(false);
            window.scrollTo(0, 0);
          }}
        />
      ) : (
        <main className="animate-fade-in">
          {/* Section 1: Hero Banner */}
          <Hero
            content={content}
            onExploreMenu={() => handleNavClick("menu")}
            onBookTable={() => handleNavClick("booking")}
          />

          {/* Section 2: Story and Feature Cards */}
          <AboutUs
            content={content}
            onBookClick={() => handleNavClick("booking")}
          />

          {/* Section 3: Open Air Garden Rest Area media albums */}
          <GardenShowcase
            galleryItems={gallery}
          />

          {/* Section 4: Professional Culinary team showcase */}
          <ChefExperience
            chefs={chefs}
          />

          {/* Section 5: Menu categories, search, tags, prices */}
          <MenuSection
            menu={menu}
          />

          {/* Section 6: Daily cleanliness indicators and safety rules */}
          <HygieneQuality />

          {/* Section 7: Rotating Testimonials Carousel & Add form */}
          <CustomerReviews
            reviews={reviews}
            onSubmitReview={handleSubmitReview}
          />

          {/* Section 8: Interactive Map and coordinates display */}
          <LocationSection
            content={content}
          />

          {/* Section 9: Validation table reservation forms */}
          <TableBooking
            onAddBooking={handleAddBooking}
          />
        </main>
      )}

      {/* --- PREMIUM FOOTER: BLACK & OAK WOOD CONTOUR --- */}
      <footer className="bg-matte-black border-t-2 border-oak-brown relative overflow-hidden py-16 text-warm-cream font-sans">
        {/* subtle oak grain background texture accent */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-dark-walnut/10 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-zinc-900 pb-12">
          
          {/* Logo Brand Statement */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-1 border border-gold bg-oak-brown rounded-md">
                <Compass className="h-4 w-4 text-gold" />
              </div>
              <h4 className="text-xl font-bold tracking-tight text-white uppercase flex items-center">
                VRINDAVAN <span className="text-gold font-light ml-1.5">HOTEL</span>
              </h4>
            </div>
            <p className="text-xs text-warm-cream/65 leading-relaxed">
              Experience authentic Indian recipes, peaceful garden dining vibes, and strict kitchen hygiene standards. Proudly hosting family sessions on Hirapur Rd in Chalisgaon.
            </p>
            
            <div className="flex space-x-3.5 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-zinc-900 border border-warm-cream/15 rounded text-warm-cream/60 hover:text-gold hover:border-gold transition-colors cursor-pointer"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-zinc-900 border border-warm-cream/15 rounded text-warm-cream/60 hover:text-gold hover:border-gold transition-colors cursor-pointer"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links navigation helper */}
          <div>
            <h4 className="text-xs font-mono tracking-widest text-gold uppercase font-bold border-b border-zinc-900 pb-2 mb-4">
              QUICK SECTIONS
            </h4>
            <ul className="space-y-2 text-xs text-warm-cream/70">
              {["About Story", "Garden Gallery", "Special Chefs", "Dishes Menu", "Hygiene Standards", "Table Booking"].map((item, idx) => {
                const ids = ["about", "gallery", "chefs", "menu", "hygiene", "booking"];
                return (
                  <li key={idx}>
                    <button
                      onClick={() => handleNavClick(ids[idx])}
                      className="hover:text-gold cursor-pointer transition-colors"
                    >
                      ✦ {item}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick contact and coordinate text */}
          <div>
            <h4 className="text-xs font-mono tracking-widest text-gold uppercase font-bold border-b border-zinc-900 pb-2 mb-4">
              VISIT RETREAT
            </h4>
            <ul className="space-y-4 text-xs text-warm-cream/70">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{content.contactAddress}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold flex-shrink-0" />
                <a href={`tel:${content.contactPhone}`} className="font-mono hover:text-gold">{content.contactPhone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold flex-shrink-0" />
                <span>{content.openingHours}</span>
              </li>
            </ul>
          </div>

          {/* Certifications and credentials stamps */}
          <div>
            <h4 className="text-xs font-mono tracking-widest text-gold uppercase font-bold border-b border-zinc-900 pb-2 mb-4">
              TRUST CERTIFICATIONS
            </h4>
            <div className="space-y-3 font-mono text-[10px] text-warm-cream/60">
              <div className="flex items-center space-x-2 bg-zinc-900/40 p-2 border border-zinc-900 rounded">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>100% PURE VEGETARIAN HOUSE</span>
              </div>
              <div className="flex items-center space-x-2 bg-zinc-900/40 p-2 border border-zinc-900 rounded">
                <Award className="h-4 w-4 text-gold" />
                <span>CERTIFIED HYGIENIC KITCHEN RATING</span>
              </div>
            </div>
          </div>

        </div>

        {/* Outer credit lines */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 flex flex-col sm:flex-row items-center justify-between text-xs text-warm-cream/40 font-mono gap-4">
          <p>© 2026 VRINDAVAN HOTEL. All Rights Reserved. Chalisgaon, Maharashtra.</p>
          <div className="flex items-center space-x-4">
            <span>FSSAI License: 21522045000021</span>
            <span>✦</span>
            <span>Crafted with Premium Luxury Theme</span>
          </div>
        </div>

      </footer>

    </div>
  );
}
