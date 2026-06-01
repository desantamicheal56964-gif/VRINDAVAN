import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight, MessageSquareCode, PlusCircle, Quote } from "lucide-react";
import { Review } from "../types";

interface CustomerReviewsProps {
  reviews: Review[];
  onSubmitReview: (reviewData: { name: string; rating: number; text: string }) => Promise<boolean>;
}

export default function CustomerReviews({ reviews, onSubmitReview }: CustomerReviewsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [revName, setRevName] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revText, setRevText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!revName.trim()) {
      setSubmitError("Please enter your name.");
      return;
    }
    if (!revText.trim() || revText.trim().length < 8) {
      setSubmitError("Comments should be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await onSubmitReview({ name: revName, rating: revRating, text: revText });
      if (ok) {
        setSubmitSuccess("Thank you! Your verified restaurant review was submitted successfully.");
        setRevName("");
        setRevRating(5);
        setRevText("");
        setTimeout(() => {
          setShowAddForm(false);
          setSubmitSuccess("");
        }, 3000);
      } else {
        setSubmitError("Failed to register review. Please try again.");
      }
    } catch (err) {
      setSubmitError("Network connectivity issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-24 bg-matte-black border-b border-oak-brown/20 text-warm-cream">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Title Container */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-sans tracking-[0.3em] uppercase text-gold font-medium">
            GUEST VOICE & REVIEWS
          </p>
          <h2 className="mt-2 text-4xl sm:text-5xl font-medium tracking-tight text-white flex items-center justify-center gap-3 font-serif">
            <span>Customer Testimonials</span>
          </h2>
          <div className="w-16 h-[1px] bg-gold mx-auto mt-4" />
        </div>

        {/* Core Review Carousel block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch max-w-5xl mx-auto">
          
          {/* Left panel: Carousel display */}
          <div className="lg:col-span-7 bg-charcoal-card border border-oak-brown/30 rounded-none p-8 sm:p-10 relative flex flex-col justify-between min-h-[340px]">
            <div className="absolute top-6 right-8 text-gold/10">
              <Quote className="h-20 w-20 fill-current" />
            </div>

            <div>
              {/* Star highlights */}
              <div className="flex items-center space-x-1.5 mb-6">
                {Array.from({ length: reviews[activeIndex]?.rating || 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-gold fill-gold" />
                ))}
              </div>

              {/* Review Statement body */}
              <p className="text-lg sm:text-xl text-white tracking-wide italic font-serif font-light leading-relaxed">
                "{reviews[activeIndex]?.text || "No reviews added yet."}"
              </p>
            </div>

            {/* Guest Name tag */}
            <div className="mt-8 pt-6 border-t border-zinc-900/60 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-serif font-medium text-gold uppercase tracking-wider">
                  {reviews[activeIndex]?.name}
                </h4>
                <p className="text-[10px] text-warm-cream/50 uppercase tracking-widest font-sans mt-0.5">
                  Verified Guest • {reviews[activeIndex]?.date}
                </p>
              </div>

              {/* Carousel navigation buttons - Sharp Corners */}
              <div className="flex space-x-2">
                <button
                  onClick={handlePrev}
                  className="w-9 h-9 border border-oak-brown/35 bg-matte-black hover:bg-gold hover:text-matte-black hover:border-gold text-gold transition-colors flex items-center justify-center cursor-pointer rounded-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-9 h-9 border border-oak-brown/35 bg-matte-black hover:bg-gold hover:text-matte-black hover:border-gold text-gold transition-colors flex items-center justify-center cursor-pointer rounded-none"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Leave a Review Action banner */}
          <div className="lg:col-span-5 bg-charcoal-card border border-gold/45 rounded-none p-8 flex flex-col justify-between min-h-[340px]">
            <div>
              <span className="text-[10px] font-sans text-gold tracking-widest uppercase font-medium">
                DINED WITH US?
              </span>
              <h3 className="text-3xl font-serif text-white uppercase tracking-wide mt-1">
                Share Your Dining Experience
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-warm-cream/70 leading-relaxed font-sans font-light">
                We read every single piece of feedback with intense humility. Share your review about our garden vibe, service hygiene, or recipe taste.
              </p>
            </div>

            <div className="mt-8">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-4 bg-oak-brown hover:bg-dark-walnut border border-gold/50 text-white font-sans text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 cursor-pointer rounded-none"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>WRITE A DINING REVIEW</span>
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in bg-matte-black/90 rounded-none p-5 border border-oak-brown/25">
                  <div>
                    <label className="block text-[9px] font-sans tracking-[0.2em] text-gold uppercase mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Rajesh Patil"
                      value={revName}
                      onChange={(e) => setRevName(e.target.value)}
                      className="w-full bg-[#0F0F0F] border border-oak-brown/30 rounded-none px-3 py-2.5 text-xs text-cream focus:outline-none focus:border-gold font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-sans tracking-[0.2em] text-gold uppercase mb-1.5">
                      Rating Stars
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRevRating(star)}
                          className="focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`h-4.5 w-4.5 ${
                              star <= revRating ? "text-gold fill-gold" : "text-zinc-700"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-sans tracking-[0.2em] text-gold uppercase mb-1.5">
                      Comments
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Write your beautiful feedback..."
                      value={revText}
                      onChange={(e) => setRevText(e.target.value)}
                      className="w-full bg-[#0F0F0F] border border-oak-brown/30 rounded-none px-3 py-2 text-xs text-cream focus:outline-none focus:border-gold resize-none font-sans"
                    />
                  </div>

                  {submitError && (
                    <p className="text-xs text-rose-400 font-sans font-light">⚠️ {submitError}</p>
                  )}
                  {submitSuccess && (
                    <p className="text-xs text-emerald-400 font-sans font-light">🎉 {submitSuccess}</p>
                  )}

                  <div className="flex space-x-2 pt-1.5">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-grow py-3 bg-gold text-matte-black text-xs font-sans tracking-widest uppercase rounded-none hover:bg-gold-hover transition-colors font-medium cursor-pointer"
                    >
                      {isSubmitting ? "POSTING..." : "SUBMIT REVIEW"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-3 border border-zinc-700 text-warm-cream/60 hover:text-warm-cream text-xs font-sans uppercase tracking-widest rounded-none cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
