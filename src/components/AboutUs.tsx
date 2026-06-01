import { Sparkles, Trees, Utensils, Award, Users, Leaf, ArrowRight } from "lucide-react";
import { WebsiteContent } from "../types";

interface AboutUsProps {
  content: WebsiteContent;
  onBookClick: () => void;
}

export default function AboutUs({ content, onBookClick }: AboutUsProps) {
  const features = [
    {
      icon: Sparkles,
      title: "Best Quality Food",
      description: "Carefully mastered aromatic spice profiles that deliver standard-setting sensory dining in every single plate."
    },
    {
      icon: Trees,
      title: "Peaceful Garden Seating",
      description: "Unwind under green canopies in a cool ambient breeze far away from city noise, illuminated by warm fairytale lights."
    },
    {
      icon: Award,
      title: "Hygienic Kitchen",
      description: "Spot-free daily sanitization processes and chemical-free washing schedules that meet global gold hospitality standards."
    },
    {
      icon: Utensils,
      title: "Experienced Chefs",
      description: "Wielding decades of traditional hotel culinary art to curate authentic Maharashtrian, North Indian, and Chinese dishes."
    },
    {
      icon: Users,
      title: "Family Dining Area",
      description: "Thoughtfully allocated private spaces supporting comfortable group tables and relaxed seating layouts."
    },
    {
      icon: Leaf,
      title: "Fresh Ingredients",
      description: "Supporting local Chalisgaon organic farms to bring crisp, premium vegetables and whole spices to our pantry."
    }
  ];

  return (
    <section id="about" className="py-24 bg-matte-black border-b border-oak-brown/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header - Meticulous Geometric Balance */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-sans tracking-[0.3em] uppercase text-gold font-medium">
            ESTABLISHED HOSPITALITY SINCE 2012
          </p>
          <h2 className="mt-2 text-4xl sm:text-5xl font-medium tracking-tight text-white font-serif">
            Our Story & Commitment
          </h2>
          <div className="w-16 h-[1px] bg-gold mx-auto mt-4" />
        </div>

        {/* Story Intro Split Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-5 relative">
            <div className="relative overflow-hidden rounded-none border border-gold bg-charcoal-card p-2">
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=600"
                alt="Professional chef preparing delicious pure veg food"
                className="w-full h-[380px] object-cover transition-all duration-750"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-2 border border-gold/30 pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-matte-black/95 border border-oak-brown/40 rounded-none text-center">
                <p className="text-gold font-medium text-xs font-sans tracking-widest uppercase">
                  VRINDAVAN HOTEL
                </p>
                <p className="text-warm-cream/60 text-[11px] mt-1 font-sans">
                  Chalisgaon's premier peaceful retreat kitchen.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center lg:pl-4">
            <h3 className="text-3xl font-serif italic font-light text-gold flex items-center gap-2">
              <span>✦ Dedicated to Premium Gastronomy</span>
            </h3>
            <p className="mt-4 text-warm-cream/80 text-base leading-relaxed font-sans font-light">
              {content.aboutStory}
            </p>
            <p className="mt-4 text-warm-cream/60 text-sm italic font-serif leading-relaxed pl-4 border-l border-gold/50">
              "We take intense care in washing raw organic vegetables thoroughly, processing spices under strict supervision, and ensuring our kitchen environment is sparkling clean every hour."
            </p>

            <div className="mt-8">
              <button
                onClick={onBookClick}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-oak-brown text-white font-sans text-xs uppercase tracking-widest font-medium border border-gold/50 rounded-none hover:bg-dark-walnut transition-all cursor-pointer"
              >
                <span>Reserve An Elegant Table</span>
                <ArrowRight className="h-4 w-4 text-gold" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid with Sharp Borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="group relative p-8 bg-charcoal-card border border-oak-brown/30 rounded-none hover:border-gold transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 border border-oak-brown/40 flex items-center justify-center bg-matte-black mb-6 group-hover:border-gold transition-colors">
                    <Icon className="h-5 w-5 text-gold" />
                  </div>
                  <h4 className="text-lg font-serif font-medium text-white group-hover:text-gold transition-colors uppercase tracking-wider">
                    {feat.title}
                  </h4>
                  <p className="mt-2 text-warm-cream/70 text-xs sm:text-sm leading-relaxed font-sans font-light">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-900/60 flex items-center justify-between text-[10px] font-mono tracking-widest text-gold opacity-50 group-hover:opacity-100 transition-opacity">
                  <span>PREMIUM BENCHMARK</span>
                  <span>✓</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
