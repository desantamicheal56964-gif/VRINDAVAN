import { Award, ShieldCheck, HeartPulse } from "lucide-react";
import { ChefInfo } from "../types";

interface ChefExperienceProps {
  chefs: ChefInfo[];
}

export default function ChefExperience({ chefs }: ChefExperienceProps) {
  return (
    <section id="chefs" className="py-24 bg-matte-black border-b border-oak-brown/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-sans tracking-[0.3em] uppercase text-gold font-medium">
            MASTER CULINARY ARCHITECTS
          </p>
          <h2 className="mt-2 text-4xl sm:text-5xl font-medium tracking-tight text-cream font-serif">
            Our Experienced Culinary Team
          </h2>
          <div className="w-16 h-[1px] bg-gold mx-auto mt-4" />
          <p className="mt-4 text-warm-cream/70 text-sm leading-relaxed font-sans font-light">
            Meet the professional hands that orchestrate pure kitchen magic, merging fresh local ingredients with rigorous cooking standards.
          </p>
        </div>

        {/* Chef Cards Grid - Perfectly geometric split grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {chefs.map((chef) => (
            <div
              key={chef.id}
              className="group bg-charcoal-card border border-oak-brown/30 rounded-none overflow-hidden transition-all duration-300 hover:border-gold"
            >
              <div className="md:flex h-full">
                {/* Photo frame */}
                <div className="md:flex-shrink-0 relative overflow-hidden md:w-48 h-64 md:h-auto border-b md:border-b-0 md:border-r border-oak-brown/20 bg-[#161616]">
                  <img
                    src={chef.image}
                    alt={chef.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  {/* Badge */}
                  <div className="absolute top-4 left-4 inline-flex items-center space-x-1 px-2.5 py-1 bg-[#0F0F0F] border border-gold text-[10px] font-mono font-bold text-gold rounded-none">
                    <Award className="h-3 w-3" />
                    <span>{chef.experience}</span>
                  </div>
                </div>

                {/* Info Text */}
                <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[10px] font-mono text-gold tracking-widest uppercase font-semibold">
                      {chef.role}
                    </span>
                    <h3 className="text-2xl font-serif font-medium text-white mt-1">
                      {chef.name}
                    </h3>
                    <p className="mt-3 text-warm-cream/70 text-xs sm:text-sm leading-relaxed font-sans font-light">
                      {chef.description}
                    </p>
                  </div>

                  {/* Trust Stamps */}
                  <div className="mt-6 pt-4 border-t border-zinc-900/60 grid grid-cols-2 gap-2 text-[10px] font-sans tracking-wide uppercase text-gold/80">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Certified Chef</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <HeartPulse className="h-3.5 w-3.5 text-orange-400" />
                      <span>Safe Kitchen</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
