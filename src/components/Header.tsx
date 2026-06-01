import { useState, useEffect } from "react";
import { Menu, X, ShieldAlert, Utensils, CalendarDays, Compass, HelpCircle } from "lucide-react";

interface HeaderProps {
  onNavClick: (sectionId: string) => void;
  onAdminClick: () => void;
  isAdminMode: boolean;
}

export default function Header({ onNavClick, onAdminClick, isAdminMode }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", id: "hero", icon: Compass },
    { label: "About Us", id: "about", icon: HelpCircle },
    { label: "Garden Showcase", id: "gallery", icon: Compass },
    { label: "Our Chefs", id: "chefs", icon: Utensils },
    { label: "Menu", id: "menu", icon: Utensils },
    { label: "Hygiene", id: "hygiene", icon: ShieldAlert },
    { label: "Reviews", id: "reviews", icon: HelpCircle },
    { label: "Find Us", id: "location", icon: Compass },
  ];

  return (
    <header
      id="app-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-matte-black/98 border-b border-oak-brown/30 shadow-lg py-4"
          : "bg-matte-black/90 border-b border-oak-brown/20 py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* elegant logo - Geometric Balance style */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => onNavClick("hero")}
        >
          <div className="w-10 h-10 border border-gold flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-300">
            <span className="text-gold text-2xl font-serif font-bold">V</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-medium tracking-[0.15em] text-gold font-display uppercase">
              VRINDAVAN <span className="text-warm-cream font-light ml-1">HOTEL</span>
            </h1>
            <p className="text-[9px] tracking-[0.25em] text-warm-cream/60 font-sans -mt-1 font-medium uppercase">
              GARDEN & REST AREA
            </p>
          </div>
        </div>

        {/* desktop navbar links - crisp serif/sans blend */}
        <nav className="hidden lg:flex items-center space-x-7">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavClick(item.id)}
              className="text-xs font-sans uppercase tracking-[0.2em] text-warm-cream/80 hover:text-gold transition-colors duration-200 cursor-pointer relative py-1"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Button cluster - sharp geometric buttons */}
        <div className="hidden sm:flex items-center space-x-4">
          <button
            onClick={onAdminClick}
            className={`px-4 py-2.5 text-[11px] font-mono tracking-widest uppercase rounded-none border transition-all cursor-pointer ${
              isAdminMode
                ? "bg-gold text-matte-black border-gold font-bold"
                : "bg-matte-black text-gold border-gold/40 hover:bg-gold/10 hover:border-gold"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 inline mr-1.5" />
            <span>{isAdminMode ? "Exit Panel" : "Owner Panel"}</span>
          </button>

          <button
            onClick={() => onNavClick("booking")}
            className="px-6 py-2.5 text-xs font-sans uppercase tracking-widest bg-oak-brown text-white hover:bg-dark-walnut border border-gold/50 rounded-none transition-all duration-300 cursor-pointer"
          >
            Reserve A Table
          </button>
        </div>

        {/* Mobile menu triggers */}
        <div className="flex items-center space-x-2 lg:hidden">
          <button
            onClick={onAdminClick}
            className={`p-1.5 rounded border ${
              isAdminMode
                ? "bg-gold text-matte-black border-gold"
                : "text-gold border-gold/45"
            }`}
            title="Owner Portal"
          >
            <ShieldAlert className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-warm-cream hover:text-gold border border-warm-cream/20 rounded cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden animate-fade-in bg-matte-black border-b border-oak-brown/40 px-4 pt-3 pb-6 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavClick(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 p-2.5 rounded-none bg-zinc-900/60 border border-warm-cream/5 text-xs font-sans uppercase tracking-widest text-[#F5E8D0] hover:text-gold hover:bg-zinc-900 transition-all text-left"
              >
                <item.icon className="h-4 w-4 text-gold/75" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-oak-brown/25 flex flex-col gap-2">
            <button
              onClick={() => {
                onNavClick("booking");
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-xs font-semibold uppercase tracking-wider bg-gold text-matte-black rounded-none block cursor-pointer transition-all hover:bg-gold-hover"
            >
              Reserve A Table
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
