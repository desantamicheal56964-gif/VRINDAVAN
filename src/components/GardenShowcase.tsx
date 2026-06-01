import React, { useState } from "react";
import { Grid, Eye, Search, X, ChevronLeft, ChevronRight, Trees } from "lucide-react";
import { GalleryItem } from "../types";

interface GardenShowcaseProps {
  galleryItems: GalleryItem[];
}

export default function GardenShowcase({ galleryItems }: GardenShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = ["All", "Garden Seating", "Family Area", "Outdoor Dining", "Evening Lighting", "Relaxation Zone"];

  const filteredItems = selectedCategory === "All"
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedCategory);

  const openLightbox = (id: string) => {
    const index = galleryItems.findIndex(item => item.id === id);
    if (index !== -1) {
      setLightboxIndex(index);
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % galleryItems.length);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + galleryItems.length) % galleryItems.length);
    }
  };

  return (
    <section id="gallery" className="py-24 bg-matte-black border-b border-oak-brown/20 text-warm-cream">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Headings */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-sans tracking-[0.3em] uppercase text-gold font-medium">
            UNWIND IN NATURE
          </p>
          <h2 className="mt-2 text-4xl sm:text-5xl font-medium tracking-tight text-white flex items-center justify-center gap-3 font-serif">
            <span>Open Garden Rest Area</span>
          </h2>
          <div className="w-16 h-[1px] bg-gold mx-auto mt-4" />
          <p className="mt-4 text-warm-cream/70 text-sm leading-relaxed font-sans font-light">
            Breathe fresh air and explore our peaceful green sanctuary designed to keep children and families relaxed during rich dining sessions.
          </p>
        </div>

        {/* Category Filter Tabs - Sharp Corners */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-[11px] font-sans uppercase tracking-[0.2em] border transition-all cursor-pointer rounded-none ${
                selectedCategory === cat
                  ? "bg-gold text-matte-black border-gold font-bold"
                  : "bg-matte-black text-warm-cream border-oak-brown/30 hover:border-gold/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dynamic Photo Container */}
        {filteredItems.length === 0 ? (
          <div className="p-12 border border-dashed border-oak-brown/30 text-center text-warm-cream/60 font-sans text-xs uppercase tracking-widest">
            No media files uploaded yet in this catalog category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => openLightbox(item.id)}
                className="group relative h-72 rounded-none overflow-hidden border border-oak-brown/30 bg-matte-black cursor-pointer transition-all duration-300"
              >
                {/* Image element with required referrerPolicy */}
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750"
                  referrerPolicy="no-referrer"
                />
                
                {/* Dark Elegant Gradient Overlays */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/85 to-transparent z-10" />

                {/* Info Text inside Geometric overlay layout */}
                <div className="absolute inset-x-0 bottom-0 p-5 transform z-20 group-hover:translate-y-[-2px] transition-transform">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] font-sans tracking-widest text-gold font-medium uppercase">
                        {item.category}
                      </p>
                      <h4 className="text-base font-serif font-medium text-white mt-1 group-hover:text-gold transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <div className="w-8 h-8 border border-gold bg-matte-black flex items-center justify-center text-gold rounded-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Elegant border lining indicator */}
                <div className="absolute inset-4 border border-gold/0 group-hover:border-gold/30 rounded-none pointer-events-none transition-all duration-300 z-10" />
              </div>
            ))}
          </div>
        )}

        {/* Lightbox / Slideshow Modal */}
        {lightboxIndex !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 animate-fade-in"
            onClick={closeLightbox}
          >
            {/* Close trigger - square corners */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-2 bg-matte-black hover:bg-gold hover:text-matte-black border border-gold/30 text-warm-cream transition-all cursor-pointer rounded-none"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Left Button - square corners */}
            <button
              onClick={prevImage}
              className="absolute left-4 p-3 bg-matte-black hover:bg-gold hover:text-matte-black border border-gold/30 text-warm-cream transition-all cursor-pointer rounded-none"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Visual Display Center */}
            <div
              className="max-w-4xl max-h-[80vh] px-4 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border border-gold/40 bg-charcoal-card p-1.5 rounded-none shadow-2xl">
                <img
                  src={galleryItems[lightboxIndex].url}
                  alt={galleryItems[lightboxIndex].title}
                  className="max-h-[65vh] object-contain rounded-none border border-oak-brown/30"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs font-sans text-gold tracking-[0.2em] uppercase font-medium">
                  {galleryItems[lightboxIndex].category}
                </p>
                <h3 className="text-2xl font-serif text-white mt-1.5">
                  {galleryItems[lightboxIndex].title}
                </h3>
              </div>
            </div>

            {/* Right Button - square corners */}
            <button
              onClick={nextImage}
              className="absolute right-4 p-3 bg-matte-black hover:bg-gold hover:text-matte-black border border-gold/30 text-warm-cream transition-all cursor-pointer rounded-none"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
