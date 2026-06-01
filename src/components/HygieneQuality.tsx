import { ShieldAlert, Sparkles, HeartPulse, ShieldCheck, ClipboardCheck, Brush } from "lucide-react";

export default function HygieneQuality() {
  const standards = [
    {
      icon: Brush,
      title: "Daily Kitchen Cleaning",
      desc: "Our kitchens undergo professional grade deep cleaning in three distinct shifts every single day to ensure hygienic safety."
    },
    {
      icon: Sparkles,
      title: "Fresh Farm Ingredients",
      desc: "No stale cold-storage items. Raw fresh ingredients and greens are sourced daily and processed in double filtered washwater."
    },
    {
      icon: ShieldCheck,
      title: "Food Safety Standards",
      desc: "We operate fully in accordance with top-safety compliance rules. Zero artificial synthetic additives, zero MSG."
    },
    {
      icon: ClipboardCheck,
      title: "Sanitized Environment",
      desc: "Every dining table, garden chair seat, menu card, and hand-station is thoroughly sanitized before and after every customer session."
    },
    {
      icon: HeartPulse,
      title: "Trained Culinary Staff",
      desc: "All supervisors and serving executives are fully trained in extreme safety protocols, kitchen masks, and sanitation wear."
    }
  ];

  return (
    <section id="hygiene" className="py-24 bg-matte-black border-b border-oak-brown/20 text-warm-cream">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-sans tracking-[0.3em] uppercase text-gold font-medium">
            ZERO-COMPROMISE STANDARDS
          </p>
          <h2 className="mt-2 text-4xl sm:text-5xl font-medium tracking-tight text-white flex items-center justify-center gap-3 font-serif">
            <span>Hygiene & Food Safety Standards</span>
          </h2>
          <div className="w-16 h-[1px] bg-gold mx-auto mt-4" />
          <p className="mt-4 text-warm-cream/70 text-sm leading-relaxed font-sans font-light">
            We hold dining hygiene as a core spiritual hospitality value. Experience pristine Chalisgaon garden dining safely under our watch.
          </p>
        </div>

        {/* Double Column Grid split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Informational Column banner */}
          <div className="lg:col-span-4 bg-charcoal-card border border-gold/40 p-8 relative overflow-hidden flex flex-col justify-center rounded-none">
            <p className="text-[10px] font-sans tracking-[0.25em] text-gold uppercase font-semibold mb-2">
              OUR PURE PROMISE
            </p>
            <h3 className="text-3xl font-serif text-white uppercase tracking-wide leading-tight">
              100% Certified <br/>
              Pure Vegetarian
            </h3>
            <p className="mt-4 text-xs sm:text-sm text-warm-cream/70 leading-relaxed font-sans font-light">
              We take deep, conscious measures to segregate all procurement batches, oil pots, cutting surfaces, and cooking vessels exclusively for pure vegetarian ingredients, establishing total trust for your traditional family expectations.
            </p>

            <div className="mt-6 space-y-3 font-mono text-[11px] text-gold/90">
              <div className="flex items-center space-x-2">
                <span className="text-gold">✦</span>
                <span>Zero food preservatives added</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gold">✦</span>
                <span>Filtered drinking mineral water only</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gold">✦</span>
                <span>Spotless regular cleanliness reviews</span>
              </div>
            </div>
          </div>

          {/* Core Cards block */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {standards.map((stand, idx) => (
              <div
                key={idx}
                className="p-6 bg-charcoal-card border border-oak-brown/25 rounded-none hover:border-gold transition-all flex items-start gap-4"
              >
                <div className="w-10 h-10 border border-oak-brown/30 flex items-center justify-center text-gold flex-shrink-0 bg-matte-black">
                  <stand.icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-lg font-serif font-medium text-white transition-colors group-hover:text-gold uppercase tracking-wider">
                    {stand.title}
                  </h4>
                  <p className="mt-2 text-warm-cream/70 text-xs sm:text-sm leading-relaxed font-sans font-light">
                    {stand.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
