import { Compass, UtensilsCrossed } from "lucide-react";
import { WebsiteContent } from "../types";

interface HeroProps {
  content: WebsiteContent;
  onExploreMenu: () => void;
  onBookTable: () => void;
}

export default function Hero({ content, onExploreMenu, onBookTable }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col lg:flex-row bg-[#0F0F0F] text-[#F5E8D0] overflow-hidden pt-24 border-b border-oak-brown/20 animate-fade-in"
    >
      {/* Left Column: Core Brand & Descriptions */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center lg:border-r border-oak-brown/30 relative z-10">
        
        {/* Est tag */}
        <div className="mb-6 inline-block self-start py-1 px-3 border border-gold text-gold text-[10px] uppercase tracking-[0.3em] font-sans font-medium">
          ESTABLISHED 2012 • CHALISGAON
        </div>

        {/* Display Headings with Elegant Serif */}
        <h1 className="text-5xl sm:text-7xl leading-[0.95] font-medium mb-6 font-serif tracking-tight text-white uppercase">
          Exceptional <br/>
          <span className="italic text-gold font-light lowercase">taste</span>, <br/>
          purely peaceful.
        </h1>

        {/* Dynamic description from content parameters */}
        <p className="text-warm-cream/70 text-base sm:text-lg max-w-md leading-relaxed mb-8 font-sans font-light">
          {content.heroSubtitle || "Experience the perfect harmony of traditional hospitality and premium garden dining at Vrindavan Hotel. Where every meal is a celebration of flavor and hygiene."}
        </p>

        {/* Interactive CTA button rows */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button
            onClick={onBookTable}
            className="px-6 py-3.5 bg-oak-brown text-white font-sans text-xs uppercase tracking-widest font-medium border border-gold/50 rounded-none transition-all duration-300 hover:bg-dark-walnut cursor-pointer flex items-center justify-center space-x-2"
          >
            <Compass className="h-4 w-4 text-gold" />
            <span>RESERVE A TABLE</span>
          </button>
          
          <button
            onClick={onExploreMenu}
            className="px-6 py-3.5 bg-matte-black text-gold font-sans text-xs uppercase tracking-widest font-medium border border-gold/30 hover:border-gold rounded-none transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2"
          >
            <UtensilsCrossed className="h-4 w-4 text-gold" />
            <span>EXPLORE MENU</span>
          </button>
        </div>

        {/* Bottom Feature Numbers */}
        <div className="flex gap-8 sm:gap-12 pt-6 border-t border-oak-brown/20 font-sans">
          <div className="flex flex-col">
            <span className="text-gold text-2xl font-bold font-serif">15+</span>
            <span className="text-[10px] uppercase tracking-widest opacity-60">Expert Chefs</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gold text-2xl font-bold font-serif">100%</span>
            <span className="text-[10px] uppercase tracking-widest opacity-60">Fresh Pure Veg</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gold text-2xl font-bold font-serif">A+</span>
            <span className="text-[10px] uppercase tracking-widest opacity-60">Hygiene Score</span>
          </div>
        </div>
      </div>

      {/* Right Column: Geometric Balance image collage */}
      <div className="w-full lg:w-1/2 grid grid-cols-2 grid-rows-2 gap-4 p-6 sm:p-8 bg-[#161616] relative z-0 min-h-[480px] lg:min-h-auto">
        
        {/* Box 1: Garden Seating */}
        <div className="relative overflow-hidden border border-oak-brown/40 flex items-center justify-center group h-full">
           <div 
             className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-700"
             style={{ referrerPolicy: "no-referrer" } as any}
           />
           <div className="relative z-10 p-3 text-center bg-matte-black/85 w-full border-y border-gold/20 py-2.5">
              <span className="text-xs uppercase tracking-widest font-sans font-medium text-gold">Garden Seating</span>
           </div>
        </div>

        {/* Box 2: Warm Wood Dining */}
        <div className="relative overflow-hidden border border-gold/25 flex items-end group h-full">
           <div 
             className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700"
             style={{ referrerPolicy: "no-referrer" } as any}
           />
           <div className="relative z-10 p-4 w-full bg-gradient-to-t from-black via-black/85 to-transparent">
              <span className="text-xs uppercase tracking-widest font-sans text-[#F5E8D0] font-light">Elegant Wood Dining</span>
           </div>
        </div>

        {/* Box 3: Span both columns for Signature Dishes */}
        <div className="col-span-2 relative overflow-hidden border border-oak-brown/40 group h-full">
           <div 
             className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-45 group-hover:scale-105 transition-transform duration-1000"
             style={{ referrerPolicy: "no-referrer" } as any}
           />
           <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-10 bg-matte-black/35">
              <h3 className="text-3xl sm:text-4xl italic mb-1.5 font-serif font-light text-white">Signature Indian Thalis</h3>
              <p className="text-[10px] tracking-widest uppercase font-sans text-gold font-medium">Available Daily 11:00 AM — 11:30 PM</p>
              <div className="mt-3.5 w-16 h-[1px] bg-gold/70" />
           </div>
        </div>

      </div>
    </section>
  );
}
