import { MapPin, Phone, Clock, Compass, ExternalLink } from "lucide-react";
import { WebsiteContent } from "../types";

interface LocationSectionProps {
  content: WebsiteContent;
}

export default function LocationSection({ content }: LocationSectionProps) {
  const mapQuery = encodeURIComponent(content.contactAddress);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

  // Premium embed link pointing to Chalisgaon region
  const embedIframeUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14977.838382025287!2d75.00318991285093!3d20.450379963842187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd96f5b9d37536b%3A0x8673a55eb7dfa4bf!2sChalisgaon%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1717232000200!5m2!1sen!2sin";

  return (
    <section id="location" className="py-24 bg-matte-black text-warm-cream border-b border-oak-brown/20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-sans tracking-[0.3em] uppercase text-gold font-medium">
            COME DINE WITH US
          </p>
          <h2 className="mt-2 text-4xl sm:text-5xl font-medium tracking-tight text-white font-serif">
            Our Location & Contacts
          </h2>
          <div className="w-16 h-[1px] bg-gold mx-auto mt-4" />
        </div>

        {/* Info Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Column 1: Info Blocks & Details */}
          <div className="lg:col-span-12 xl:col-span-5 flex flex-col justify-between space-y-6">
            
            <div className="bg-charcoal-card border border-oak-brown/30 rounded-none p-6 sm:p-8 space-y-6 flex-grow flex flex-col justify-center">
              
              {/* Address card */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-oak-brown/40 flex items-center justify-center text-gold bg-matte-black shrink-0 rounded-none">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[10px] font-sans tracking-[0.2em] text-gold uppercase font-semibold">
                    RESTAURANT ADDRESS
                  </h4>
                  <p className="mt-1.5 text-base text-cream leading-relaxed font-sans font-light">
                    {content.contactAddress}
                  </p>
                </div>
              </div>

              {/* Phone card */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-oak-brown/40 flex items-center justify-center text-gold bg-matte-black shrink-0 rounded-none">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[10px] font-sans tracking-[0.2em] text-gold uppercase font-semibold">
                    RESERVATION TELEPHONE
                  </h4>
                  <a
                    href={`tel:${content.contactPhone}`}
                    className="mt-1.5 block text-xl font-bold text-cream hover:text-gold transition-colors font-mono"
                  >
                    {content.contactPhone}
                  </a>
                  <p className="text-xs text-warm-cream/50 italic mt-1 font-sans">
                    Call for bulk garden bookings or celebration slots.
                  </p>
                </div>
              </div>

              {/* Operating hours */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-oak-brown/40 flex items-center justify-center text-gold bg-matte-black shrink-0 rounded-none">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[10px] font-sans tracking-[0.2em] text-gold uppercase font-semibold">
                    OPENING HOURS
                  </h4>
                  <p className="mt-1.5 text-base text-cream font-medium font-sans font-light">
                    {content.openingHours}
                  </p>
                </div>
              </div>

            </div>

            {/* Quick Map Action panel triggers - Sharp rectangular boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="py-4 bg-oak-brown hover:bg-dark-walnut border border-gold/50 text-[#F5E8D0] hover:text-white text-xs font-sans tracking-widest uppercase rounded-none flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Compass className="h-4 w-4 text-gold" />
                <span>Open in Google Maps</span>
              </a>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="py-4 bg-matte-black border border-gold/25 hover:border-gold text-[#F5E8D0] hover:text-gold text-xs font-sans tracking-widest uppercase rounded-none flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5 text-gold" />
                <span>Get Directions</span>
              </a>
            </div>

          </div>

          {/* Column 2: Maps iFrame Canvas */}
          <div className="lg:col-span-12 xl:col-span-7 h-96 xl:h-auto rounded-none border border-gold/40 relative bg-charcoal-card p-1.5">
            <div className="w-full h-full border border-oak-brown/30 relative">
              <iframe
                title="Vrindavan Hotel Maps Direction Frame"
                src={embedIframeUrl}
                className="w-full h-full border-none filter grayscale brightness-[0.70] contrast-[1.15] hover:grayscale-0 transition-all duration-700"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
