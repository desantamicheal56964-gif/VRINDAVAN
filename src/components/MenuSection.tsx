import { useState, useMemo } from "react";
import { Search, Flame, AlertCircle } from "lucide-react";
import { Dish } from "../types";

interface MenuSectionProps {
  menu: Dish[];
}

export default function MenuSection({ menu }: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const categories: string[] = [
    "All",
    "Starters",
    "Soups",
    "Vegetarian Dishes",
    "Paneer Specials",
    "South Indian",
    "Chinese",
    "Main Course",
    "Breads",
    "Rice",
    "Desserts",
    "Beverages",
  ];

  const filteredDishes = useMemo(() => {
    return menu.filter((dish) => {
      const matchCategory = selectedCategory === "All" || dish.category === selectedCategory;
      const matchSearch =
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAvailability = !availableOnly || dish.available;

      return matchCategory && matchSearch && matchAvailability;
    });
  }, [menu, selectedCategory, searchQuery, availableOnly]);

  return (
    <section id="menu" className="py-24 bg-matte-black border-b border-oak-brown/20 text-warm-cream">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-sans tracking-[0.3em] uppercase text-gold font-medium">
            EXPERIENCE EXCEPTIONAL TASTE
          </p>
          <h2 className="mt-2 text-4xl sm:text-5xl font-medium tracking-tight text-white font-serif">
            Our Complete Menu Catalog
          </h2>
          <div className="w-16 h-[1px] bg-gold mx-auto mt-4" />
          <p className="mt-4 text-warm-cream/70 text-sm leading-relaxed font-sans font-light">
            Fresh ingredients, hygienic culinary preparation, and recipes passed across generations. Pure vegetarian bliss in Chalisgaon.
          </p>
        </div>

        {/* Filter controls panel - Meticulously Angular */}
        <div className="bg-charcoal-card border border-oak-brown/30 rounded-none p-5 mb-10 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            
            {/* Search Input bar */}
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gold/60" />
              </span>
              <input
                type="text"
                placeholder="Search premium recipe list (e.g., Paneer, Masala, Soup)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0F0F0F] border border-oak-brown/35 rounded-none py-2.5 pl-10 pr-4 text-sm text-warm-cream placeholder-warm-cream/45 focus:outline-none focus:border-gold font-sans"
              />
            </div>

            {/* Quick check selectors */}
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center space-x-2.5 cursor-pointer text-xs uppercase tracking-wider text-warm-cream/80">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="rounded-none bg-[#0F0F0F] border-oak-brown text-gold focus:ring-0"
                />
                <span>Available Now Only</span>
              </label>

              <div className="text-[10px] font-mono bg-[#0F0F0F] border border-oak-brown/20 px-3 py-1.5 text-gold rounded-none uppercase">
                Listings: {filteredDishes.length}
              </div>
            </div>

          </div>
        </div>

        {/* Categories Bar - Sharp block tags */}
        <div className="flex overflow-x-auto pb-4 mb-12 scrollbar-thin gap-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 text-[10px] font-sans uppercase tracking-[0.2em] border transition-all cursor-pointer rounded-none ${
                selectedCategory === cat
                  ? "bg-gold text-matte-black border-gold font-bold"
                  : "bg-matte-black/60 text-warm-cream border-oak-brown/30 hover:border-gold/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dishes Matrix Grid */}
        {filteredDishes.length === 0 ? (
          <div className="text-center py-20 bg-charcoal-card border border-dashed border-oak-brown/25 max-w-2xl mx-auto rounded-none">
            <AlertCircle className="h-10 w-10 text-gold/60 mx-auto mb-3" />
            <h3 className="text-lg font-serif italic text-white font-light">No culinary selections found</h3>
            <p className="text-xs text-warm-cream/50 mt-1 uppercase tracking-widest font-sans">
              Adjust your search keywords or filter queries above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className={`group flex flex-col justify-between bg-charcoal-card border overflow-hidden transition-all duration-300 rounded-none ${
                  dish.available
                    ? "border-oak-brown/30 hover:border-gold/60"
                    : "border-zinc-800/40 opacity-60"
                }`}
              >
                
                {/* Photo Display */}
                <div className="relative h-48 overflow-hidden bg-[#0F0F0F]">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Category Accent Badge */}
                  <div className="absolute top-4 left-4 bg-[#0F0F0F] border border-gold/50 text-gold text-[9px] font-sans tracking-widest px-2.5 py-1 uppercase rounded-none font-medium">
                    {dish.category}
                  </div>

                  {/* Hot tag or sold out overlay */}
                  <div className="absolute top-4 right-4 z-10">
                    {dish.available ? (
                      <span className="flex items-center space-x-1 px-2.5 py-1 bg-[#0F0F0F] border border-emerald-500 text-emerald-400 font-mono text-[9px] font-bold rounded-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 shrink-0" />
                        AVAILABLE
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-[#0F0F0F] border border-rose-500 text-rose-500 font-mono text-[9px] font-bold rounded-none">
                        SOLD OUT
                      </span>
                    )}
                  </div>
                </div>

                {/* Info block */}
                <div className="p-6 flex-grow flex flex-col justify-between relative">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-xl font-serif font-medium text-white group-hover:text-gold transition-colors line-clamp-1">
                        {dish.name}
                      </h3>
                      <span className="text-base font-serif text-gold whitespace-nowrap">
                        ₹{dish.price}
                      </span>
                    </div>
                    <p className="mt-3 text-warm-cream/70 text-xs sm:text-sm leading-relaxed font-sans font-light line-clamp-3">
                      {dish.description}
                    </p>
                  </div>

                  {/* Footer status markers */}
                  <div className="mt-6 pt-4 border-t border-zinc-900/60 flex items-center justify-between text-[10px] font-sans text-warm-cream/50 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-orange-400" />
                      Pure Veg
                    </span>
                    <span className="text-gold/80 font-medium">Certified Hygiene</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
