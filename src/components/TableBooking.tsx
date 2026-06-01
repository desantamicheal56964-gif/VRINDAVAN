import React, { useState } from "react";
import { Calendar, User, Phone, Users, FileText, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { Booking } from "../types";

interface TableBookingProps {
  onAddBooking: (bookingData: {
    name: string;
    mobile: string;
    date: string;
    time: string;
    persons: number;
    specialRequest: string;
  }) => Promise<{ success: boolean; message?: string; booking?: Booking }>;
}

export default function TableBooking({ onAddBooking }: TableBookingProps) {
  const [bName, setBName] = useState("");
  const [bMobile, setBMobile] = useState("");
  const [bDate, setBDate] = useState("");
  const [bTime, setBTime] = useState("");
  const [bPersons, setBPersons] = useState(2);
  const [bSpecial, setBSpecial] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [successReceipt, setSuccessReceipt] = useState<Booking | null>(null);

  const getMinDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMessage("");

    if (!bName.trim()) {
      setErrMessage("Please enter your full name.");
      return;
    }

    const cleanMobile = bMobile.replace(/[\s-()]/g, "");
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!cleanMobile || !mobileRegex.test(cleanMobile)) {
      setErrMessage("Please submit a valid 10-digit mobile number starting with 6, 7, 8 or 9.");
      return;
    }

    if (!bDate) {
      setErrMessage("Please select a valid reservation date.");
      return;
    }

    const bookingTs = new Date(`${bDate}T23:59:59`).getTime();
    const todayTs = new Date().setHours(0, 0, 0, 0);
    if (bookingTs < todayTs) {
      setErrMessage("Booking date must be today or a future date.");
      return;
    }

    if (!bTime) {
      setErrMessage("Please select a preferred table dining time slot.");
      return;
    }

    if (isNaN(bPersons) || bPersons < 1 || bPersons > 50) {
      setErrMessage("Guest reservation count must be between 1 and 50 persons.");
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await onAddBooking({
        name: bName.trim(),
        mobile: cleanMobile,
        date: bDate,
        time: bTime,
        persons: bPersons,
        specialRequest: bSpecial.trim(),
      });

      if (resp.success && resp.booking) {
        setSuccessReceipt(resp.booking);
        setBName("");
        setBMobile("");
        setBDate("");
        setBTime("");
        setBPersons(2);
        setBSpecial("");
      } else {
        setErrMessage(resp.message || "Something went wrong while booking. Please try again.");
      }
    } catch (err) {
      setErrMessage("Network failure. Please confirm the server status and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successReceipt) {
    return (
      <section id="booking" className="py-24 bg-matte-black text-warm-cream">
        <div className="max-w-xl mx-auto px-6">
          <div className="bg-charcoal-card border border-gold p-8 text-center shadow-2xl relative overflow-hidden animate-fade-in">
            
            <div className="w-12 h-12 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto mb-6 bg-matte-black rounded-none">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <h2 className="text-3xl font-serif text-white uppercase tracking-wide">
              Table Reservation Requested
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-warm-cream/70 max-w-md mx-auto font-sans font-light">
              Your table reservation request has been successfully submitted to Vrindavan Hotel.
            </p>

            {/* Receipt Box - Completely hardbordered */}
            <div className="mt-8 bg-[#0F0F0F] border border-oak-brown/30 rounded-none p-6 text-left font-mono text-xs space-y-3">
              <p className="text-[10px] text-gold tracking-widest uppercase font-bold border-b border-zinc-900 pb-2 flex justify-between">
                <span>RESERVATION SUMMARY</span>
                <span>STATUS: PENDING</span>
              </p>
              
              <div className="flex justify-between">
                <span className="text-warm-cream/50">Booking ID:</span>
                <span className="text-white font-bold">{successReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-cream/50">Guest Name:</span>
                <span className="text-white">{successReceipt.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-cream/50">Contact Mobile:</span>
                <span className="text-white">+{successReceipt.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-cream/50">Dining Date:</span>
                <span className="text-gold tracking-wider">{successReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-cream/50">Time Slot:</span>
                <span className="text-gold tracking-wider">{successReceipt.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-cream/50">Total Guests:</span>
                <span className="text-white">{successReceipt.persons} Persons</span>
              </div>
              {successReceipt.specialRequest && (
                <div className="border-t border-zinc-900 pt-2">
                  <span className="text-warm-cream/50 block mb-1">Special Instructions:</span>
                  <p className="text-warm-cream/80 italic font-sans text-xs">{successReceipt.specialRequest}</p>
                </div>
              )}
            </div>

            <p className="mt-6 text-[11px] text-warm-cream/50 italic leading-relaxed font-sans font-light">
              Our reservation supervisors will review this request and call your mobile number to confirm spacing within the next 15-20 minutes.
            </p>

            <button
              onClick={() => setSuccessReceipt(null)}
              className="mt-8 w-full py-4 bg-gold text-matte-black text-xs font-sans tracking-widest uppercase rounded-none font-bold hover:bg-gold-hover transition-colors cursor-pointer"
            >
              BOOK ANOTHER TABLE
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-24 bg-matte-black border-b border-oak-brown/20 text-warm-cream">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Column 1: Info & Guidelines */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <span className="text-[10px] font-sans text-gold tracking-widest uppercase font-medium">
              PEACEFUL GARDEN GETAWAYS
            </span>
            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-white mt-1 font-serif">
              Table Reservation Engine
            </h2>
            <div className="w-16 h-[1px] bg-gold mt-4 mb-6" />
            
            <p className="text-xs sm:text-sm text-warm-cream/70 leading-relaxed font-sans font-light">
              Experience the premium hospitality of VRINDAVAN HOTEL. Whether planning a serene wedding anniversary in our quiet candlelit garden zone, a corporate meeting, or a hearty pure veg lunch with your family, book your slots online quickly.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-4">
                <span className="w-6 h-6 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shrink-0 font-sans text-xs">✓</span>
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Zero Booking Fees</h4>
                  <p className="text-xs text-warm-cream/60 font-sans font-light mt-0.5">We charge absolutely nothing online. All food payments are settled at the counter.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="w-6 h-6 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shrink-0 font-sans text-xs">✓</span>
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Speedy Staff Callbacks</h4>
                  <p className="text-xs text-warm-cream/60 font-sans font-light mt-0.5">Staff coordinates allocations dynamically and keeps your preferred spot ready.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Booking Form Card */}
          <div className="lg:col-span-7 bg-charcoal-card border border-oak-brown/30 rounded-none p-6 sm:p-8 relative">
            <h3 className="text-2xl font-serif text-white uppercase tracking-wider mb-6 flex items-center space-x-2">
              <span className="inline-block w-2.5 h-2.5 bg-gold shrink-0" />
              <span>Fill Reservation Details</span>
            </h3>

            <form onSubmit={handleReservation} className="space-y-5 relative z-10">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Full name */}
                <div>
                  <label className="block text-[9px] font-sans text-gold uppercase tracking-[0.2em] mb-1.5 font-bold">
                    Full Name *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gold/60">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Rajesh Patil"
                      value={bName}
                      onChange={(e) => setBName(e.target.value)}
                      className="w-full bg-[#0F0F0F] border border-oak-brown/35 rounded-none py-2.5 pl-10 pr-4 text-sm text-cream focus:outline-none focus:border-gold font-sans font-light"
                    />
                  </div>
                </div>

                {/* Mobile number */}
                <div>
                  <label className="block text-[9px] font-sans text-gold uppercase tracking-[0.2em] mb-1.5 font-bold">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gold/60">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="e.g., 9422011223"
                      value={bMobile}
                      onChange={(e) => setBMobile(e.target.value)}
                      className="w-full bg-[#0F0F0F] border border-oak-brown/35 rounded-none py-2.5 pl-10 pr-4 text-sm text-cream focus:outline-none focus:border-gold font-sans font-light font-mono"
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[9px] font-sans text-gold uppercase tracking-[0.2em] mb-1.5 font-bold">
                    Dining Date *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gold/60">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <input
                      type="date"
                      required
                      min={getMinDateString()}
                      value={bDate}
                      onChange={(e) => setBDate(e.target.value)}
                      className="w-full bg-[#0F0F0F] border border-oak-brown/35 rounded-none py-2.5 pl-10 pr-4 text-sm text-cream focus:outline-none focus:border-gold font-sans font-light"
                    />
                  </div>
                </div>

                {/* Preferred slot */}
                <div>
                  <label className="block text-[9px] font-sans text-gold uppercase tracking-[0.2em] mb-1.5 font-bold">
                    Preferred Time *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gold/60">
                      <Clock className="h-4 w-4" />
                    </span>
                    <select
                      required
                      value={bTime}
                      onChange={(e) => setBTime(e.target.value)}
                      className="w-full bg-[#0F0F0F] border border-oak-brown/35 rounded-none py-2.5 pl-10 pr-4 text-sm text-cream focus:outline-none focus:border-gold font-sans font-light"
                    >
                      <option value="" disabled>Select Slot</option>
                      <option value="11:30">11:30 AM (Lunch)</option>
                      <option value="12:30">12:30 PM (Lunch)</option>
                      <option value="13:30">1:30 PM (Lunch)</option>
                      <option value="14:30">2:30 PM (Lunch)</option>
                      <option value="19:00">7:00 PM (Dinner)</option>
                      <option value="19:30">7:30 PM (Dinner)</option>
                      <option value="20:00">8:00 PM (Dinner)</option>
                      <option value="20:30">8:30 PM (Dinner)</option>
                      <option value="21:00">9:00 PM (Dinner)</option>
                      <option value="21:30">9:30 PM (Dinner)</option>
                      <option value="22:00">10:00 PM (Dinner)</option>
                      <option value="22:30">10:30 PM (Dinner)</option>
                    </select>
                  </div>
                </div>

                {/* Persons count */}
                <div>
                  <label className="block text-[9px] font-sans text-gold uppercase tracking-[0.2em] mb-1.5 font-bold">
                    Number of Guests *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gold/60">
                      <Users className="h-4 w-4" />
                    </span>
                    <input
                      type="number"
                      required
                      min={1}
                      max={50}
                      value={isNaN(bPersons) ? "" : bPersons}
                      onChange={(e) => {
                        const parsed = parseInt(e.target.value, 10);
                        setBPersons(parsed);
                      }}
                      className="w-full bg-[#0F0F0F] border border-oak-brown/35 rounded-none py-2.5 pl-10 pr-4 text-sm text-cream focus:outline-none focus:border-gold font-mono"
                    />
                  </div>
                </div>

                {/* Symmetrical helper */}
                <div className="hidden sm:block pt-5">
                  <div className="p-3 bg-[#0F0F0F] border border-oak-brown/15 text-[10px] uppercase font-sans tracking-widest text-gold flex items-center justify-between h-full">
                    <span>100% Secure Slot</span>
                    <span>✓</span>
                  </div>
                </div>

              </div>

              {/* Special instructions */}
              <div>
                <label className="block text-[9px] font-sans tracking-[0.2em] text-gold uppercase mb-1.5">
                  Special Requests (Optional)
                </label>
                <div className="relative">
                  <span className="absolute top-3 left-3 text-gold/60">
                    <FileText className="h-4 w-4" />
                  </span>
                  <textarea
                    rows={3}
                    placeholder="E.g., Need quiet garden deck corner, high chair for kids..."
                    value={bSpecial}
                    onChange={(e) => setBSpecial(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-oak-brown/35 rounded-none py-2.5 pl-10 pr-4 text-sm text-cream focus:outline-none focus:border-gold resize-none font-sans font-light"
                  />
                </div>
              </div>

              {errMessage && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-sans text-xs">
                  ⚠️ {errMessage}
                </div>
              )}

              {/* Submit trigger */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-oak-brown hover:bg-dark-walnut border border-gold/50 text-white font-sans text-xs uppercase tracking-widest font-semibold rounded-none transition-colors duration-300 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{isSubmitting ? "PROCESSING SLOT..." : "CONFIRM RESERVATION REQUEST"}</span>
                  <ChevronRight className="h-4 w-4 text-gold" />
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </section>
  );
}
