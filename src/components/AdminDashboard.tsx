import React, { useState, useEffect } from "react";
import {
  Lock,
  LineChart,
  CalendarCheck,
  MenuSquare,
  Image,
  FileEdit,
  LogOut,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Check,
  X,
  FileDown,
  Globe,
  Upload,
  Layers,
  Sparkles,
  HelpCircle,
  Utensils,
  Database
} from "lucide-react";
import { Dish, Booking, GalleryItem, WebsiteContent, AnalyticsStats, DishCategory } from "../types";
import DatabaseExplorer from "./DatabaseExplorer";

interface AdminDashboardProps {
  onLogout: () => void;
  token: string | null;
  setToken: (token: string | null) => void;
  initialContent: WebsiteContent;
  initialMenu: Dish[];
  initialGallery: GalleryItem[];
}

export default function AdminDashboard({
  onLogout,
  token,
  setToken,
  initialContent,
  initialMenu,
  initialGallery,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "bookings" | "database" | "menu" | "gallery" | "content">("analytics");
  
  // Auth states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Core database states edited via APIs
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [menuItems, setMenuItems] = useState<Dish[]>(initialMenu);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialGallery);
  const [content, setContent] = useState<WebsiteContent>(initialContent);
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);

  // Editing utilities
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [dishName, setDishName] = useState("");
  const [dishDesc, setDishDesc] = useState("");
  const [dishCat, setDishCat] = useState<DishCategory>("Starters");
  const [dishPrice, setDishPrice] = useState("");
  const [dishImg, setDishImg] = useState("");
  const [dishAvail, setDishAvail] = useState(true);

  // Gallery addition
  const [galUrl, setGalUrl] = useState("");
  const [galTitle, setGalTitle] = useState("");
  const [galCat, setGalCat] = useState<"Garden Seating" | "Family Area" | "Outdoor Dining" | "Evening Lighting" | "Relaxation Zone">("Garden Seating");

  // Content edits
  const [editContent, setEditContent] = useState<WebsiteContent>(initialContent);
  const [contentSaveSuccess, setContentSaveSuccess] = useState(false);

  // Trigger content refreshes when auth token changes
  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token, activeTab]);

  const fetchAdminData = async () => {
    try {
      const headers = { "ef-auth-token": token || "" };
      
      if (activeTab === "analytics") {
        const res = await fetch("/api/admin/analytics", { headers });
        if (res.ok) setAnalytics(await res.json());
      }
      
      if (activeTab === "bookings" || activeTab === "database") {
        const res = await fetch("/api/admin/bookings", { headers });
        if (res.ok) setBookings(await res.json());
      }
    } catch (err) {
      console.error("Error retrieving admin datasets:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data;
      const contentType = resp.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await resp.json();
      }

      if (resp.ok && data && data.token) {
        setToken(data.token);
        localStorage.setItem("vrindavan_token", data.token);
      } else {
        setLoginError(data && data.error ? data.error : `Authentication failed (Server returned status ${resp.status}).`);
      }
    } catch (err: any) {
      console.error("Login verification failed:", err);
      setLoginError(`Failed to contact credentials vault: ${err.message || err}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const updateBookingStatus = async (id: string, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ef-auth-token": token || "",
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        fetchAdminData(); // Refresh analytics metrics
      }
    } catch (err) {
      alert("Error updating reservation status.");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this reservation log?")) return;
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
        headers: { "ef-auth-token": token || "" },
      });

      if (res.ok) {
        setBookings(prev => prev.filter(b => b.id !== id));
        fetchAdminData();
      }
    } catch (err) {
      alert("Error dropping booking log.");
    }
  };

  // Dish addition
  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName || !dishPrice) return;

    try {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ef-auth-token": token || "",
        },
        body: JSON.stringify({
          name: dishName,
          description: dishDesc,
          category: dishCat,
          price: parseFloat(dishPrice),
          image: dishImg,
          available: dishAvail,
        }),
      });

      if (res.ok) {
        const bodyData = await res.json();
        setMenuItems(bodyData.menu);
        setIsAddDishOpen(false);
        // Clear
        setDishName("");
        setDishDesc("");
        setDishPrice("");
        setDishImg("");
        setDishAvail(true);
      }
    } catch (err) {
      alert("Error adding menu dish.");
    }
  };

  // Dish update
  const handleUpdateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish) return;

    if (isNaN(editingDish.price) || editingDish.price <= 0) {
      alert("Please specify a valid price larger than zero.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/menu/${editingDish.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "ef-auth-token": token || "",
        },
        body: JSON.stringify(editingDish),
      });

      if (res.ok) {
        const bodyData = await res.json();
        setMenuItems(bodyData.menu);
        setEditingDish(null);
      }
    } catch (err) {
      alert("Error updating recipe specs.");
    }
  };

  const deleteDish = async (id: string) => {
    if (!window.confirm("Are you sure you want to strip this item from the food menu?")) return;
    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: "DELETE",
        headers: { "ef-auth-token": token || "" },
      });

      if (res.ok) {
        const data = await res.json();
        setMenuItems(data.menu);
      }
    } catch (err) {
      alert("Error deleting menu recipe.");
    }
  };

  // Update website content
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setContentSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "ef-auth-token": token || "",
        },
        body: JSON.stringify(editContent),
      });

      if (res.ok) {
        setContentSaveSuccess(true);
        const data = await res.json();
        setContent(data.websiteContent);
        setTimeout(() => setContentSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert("Error saving homepage adjustments.");
    }
  };

  // Gallery manipulation
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galUrl || !galTitle) return;

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ef-auth-token": token || "",
        },
        body: JSON.stringify({ url: galUrl, title: galTitle, category: galCat }),
      });

      if (res.ok) {
        const data = await res.json();
        setGalleryItems(data.gallery);
        setGalUrl("");
        setGalTitle("");
      }
    } catch (err) {
      alert("Error saving gallery photo.");
    }
  };

  const deletePhoto = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
        headers: { "ef-auth-token": token || "" },
      });

      if (res.ok) {
        const data = await res.json();
        setGalleryItems(data.gallery);
      }
    } catch (err) {
      alert("Error wiping photo.");
    }
  };

  // Export Bookings Database as clean CSV file
  const exportBookingsToCSV = () => {
    if (bookings.length === 0) {
      alert("No table reservations registered to export.");
      return;
    }

    const headers = ["Booking ID", "Guest Name", "Mobile Number", "Date", "Preferred Time", "Guest Count", "Special Requests", "Approval Status", "Registration Time"];
    const rows = bookings.map(b => [
      b.id,
      b.name,
      b.mobile,
      b.date,
      b.time,
      b.persons,
      b.specialRequest || "None",
      b.status,
      b.createdAt,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vrindavan_reservations_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Log Out Sequence
  const handleLogoff = () => {
    localStorage.removeItem("vrindavan_token");
    setToken(null);
    onLogout();
  };

  // --- RENDERING ROUTER BLOCK ---

  if (!token) {
    return (
      <section className="min-h-screen bg-matte-black flex items-center justify-center py-20 px-4">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 filter blur" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800')` }} />
        <div className="max-w-md w-full bg-charcoal-card border-2 border-gold rounded-lg p-8 shadow-2xl relative z-10 animate-fade-in">
          <div className="text-center mb-8">
            <div className="p-3 bg-dark-walnut/60 border border-gold/45 text-gold inline-flex rounded-full mb-3">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Owner Control Vault</h2>
            <p className="text-xs text-warm-cream/60 mt-1">
              Authorized personnel secure access panel for Vrindavan Hotel.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-gold tracking-widest uppercase mb-1.5 font-bold">
                LOGIN USERNAME
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="Database username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-matte-black border border-oak-brown/40 rounded px-3.5 py-2.5 text-sm text-cream focus:outline-none focus:border-gold font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gold tracking-widest uppercase mb-1.5 font-bold">
                SECURITY PASSWORD
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="•••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-matte-black border border-oak-brown/40 rounded px-3.5 py-2.5 text-sm text-cream focus:outline-none focus:border-gold font-sans"
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-400 font-mono">⚠️ {loginError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-gradient-to-r from-oak-brown to-dark-walnut text-warm-cream hover:text-white font-mono text-xs tracking-widest uppercase font-bold border border-gold/50 rounded hover:border-gold cursor-pointer transition-colors"
            >
              {isLoggingIn ? "DECRYPTING..." : "ENTER DASHBOARD"}
            </button>
          </form>

          <div className="mt-5 p-3.5 bg-matte-black/60 border border-gold/25 rounded text-xs leading-relaxed space-y-1">
            <p className="text-gold font-mono uppercase tracking-wider font-bold">Default Credentials:</p>
            <div className="font-mono text-[11px] text-warm-cream/90">
              <span className="text-zinc-500">Username:</span> <span className="text-white select-all font-bold">vrindavanmalik</span>
              <br />
              <span className="text-zinc-500">Password:</span> <span className="text-white select-all font-bold">sanketgod1234</span>
            </div>
          </div>

          <p className="mt-6 text-[10px] text-warm-cream/40 text-center uppercase tracking-wider">
            Protected by secure JWT token hashes • Vrindavan Hotel Co.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-matte-black min-h-screen text-warm-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dashboard Headings */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-oak-brown/30 pb-6 mb-8 gap-4">
          <div>
            <p className="text-xs font-mono text-gold tracking-widest uppercase font-bold">
              OWNER PORTAL SECURITY ACTIVE
            </p>
            <h2 className="text-3xl font-bold text-white tracking-wide">
              Management Command Board
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogoff}
              className="px-4 py-2 border border-rose-500/40 text-rose-400 rounded text-xs font-mono flex items-center space-x-1.5 hover:bg-rose-500/10 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Off Session</span>
            </button>
          </div>
        </div>

        {/* Modular Navigation Panel Tabs */}
        <div className="flex flex-wrap border-b border-zinc-900 mb-8 gap-1.5">
          {[
            { id: "analytics", label: "Analytics Overview", icon: LineChart },
            { id: "bookings", label: "Table Reservations", icon: CalendarCheck },
            { id: "database", label: "Firestore DB Explorer", icon: Database },
            { id: "menu", label: "Menu Catalogue Manager", icon: MenuSquare },
            { id: "gallery", label: "Garden Photos", icon: Image },
            { id: "content", label: "Homepage Editor", icon: FileEdit },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-mono uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-gold text-gold font-bold bg-zinc-900/40"
                  : "border-transparent text-warm-cream/60 hover:text-gold hover:border-gold/30"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* --- PANEL SELECTORS --- */}

        {/* TAB 1: ANALYTICS OVERVIEW */}
        {activeTab === "analytics" && (
          <div className="space-y-8 animate-fade-in">
            {/* Stat Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: "Total Recieved Bookings", val: analytics?.totalBookings ?? bookings.length, color: "text-gold" },
                { label: "Bookings Arrived Today", val: analytics?.todayBookings ?? 0, color: "text-emerald-400" },
                { label: "Weekly Capacity Reserved", val: analytics?.weeklyBookings ?? 0, color: "text-sky-400" },
                { label: "Page Visitor Counter", val: analytics?.visitorCountEstimate ?? 1542, color: "text-purple-400" },
              ].map((stat, idx) => (
                <div key={idx} className="p-5 bg-charcoal-card border border-oak-brown/30 rounded-lg">
                  <p className="text-[10px] font-mono uppercase text-warm-cream/50 tracking-wider">
                    {stat.label}
                  </p>
                  <p className={`text-2xl sm:text-4xl font-bold mt-2 font-mono ${stat.color}`}>
                    {stat.val}
                  </p>
                </div>
              ))}
            </div>

            {/* Simulated Chart visual container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category charts representational SVG wrapper */}
              <div className="bg-charcoal-card border border-oak-brown/30 rounded-lg p-6">
                <h3 className="text-base font-bold text-white mb-6">Menu Recipe Densities by Category</h3>
                
                <div className="space-y-4">
                  {[
                    { label: "Paneer Specials", count: menuItems.filter(d => d.category === "Paneer Specials").length, color: "bg-gold" },
                    { label: "Starters & Kababs", count: menuItems.filter(d => d.category === "Starters").length, color: "bg-orange-400" },
                    { label: "Chinese & Mains", count: menuItems.filter(d => d.category === "Chinese" || d.category === "Main Course").length, color: "bg-lime-400" },
                    { label: "Breads & Rice varieties", count: menuItems.filter(d => d.category === "Breads" || d.category === "Rice").length, color: "bg-sky-450" },
                  ].map((item, id) => {
                    const ratio = menuItems.length > 0 ? Math.min(100, Math.max(15, (item.count / menuItems.length) * 100)) : 15;
                    return (
                      <div key={id} className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between text-warm-cream/80">
                          <span>{item.label}</span>
                          <span>{item.count} Items</span>
                        </div>
                        <div className="w-full bg-matte-black h-3 rounded overflow-hidden border border-zinc-900">
                          <div className={`h-full ${item.color} rounded`} style={{ width: `${ratio}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Guidance card */}
              <div className="bg-gradient-to-br from-dark-walnut/40 to-matte-black border border-gold/30 rounded-lg p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-cream">Owner Operation Instructions</h3>
                  <p className="text-sm text-warm-cream/85 leading-relaxed mt-3">
                    Welcome, Administrator. This custom control room gives you ultimate authority over Vrindavan Hotel. You can review table booking requests submitted over smartphones, approve them to trigger staff notifications, manipulate the dynamic recipe price listings, and change landing page texts immediately.
                  </p>
                </div>
                <div className="pt-6 border-t border-zinc-900/80 font-mono text-xs text-gold flex items-center justify-between">
                  <span>SYSTEM ONLINE</span>
                  <span>v2.8.1-PROD</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TABLE RESERVATIONS BOARD */}
        {activeTab === "bookings" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-gold rounded-full" />
                <span>Active Table Booking Requests</span>
              </h3>

              <button
                onClick={exportBookingsToCSV}
                className="px-4 py-2 border border-gold/45 text-gold rounded text-xs font-mono font-semibold hover:bg-gold hover:text-matte-black transition-all flex items-center space-x-2 cursor-pointer"
              >
                <FileDown className="h-4 w-4" />
                <span>Export Bookings CSV</span>
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="p-12 border border-dashed border-oak-brown/30 text-center rounded bg-charcoal-card text-warm-cream/60 font-mono">
                No bookings registered in the ledger database yet.
              </div>
            ) : (
              <div className="overflow-x-auto border border-oak-brown/20 rounded-lg bg-charcoal-card">
                <table className="w-full text-left border-collapse font-sans text-sm">
                  <thead>
                    <tr className="bg-matte-black border-b border-oak-brown/30 font-mono text-xs text-gold uppercase tracking-wider">
                      <th className="p-4">Customer</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Details</th>
                      <th className="p-4">Special Requests</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Executive Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-warm-cream/90">
                    {bookings.map((book) => (
                      <tr key={book.id} className="hover:bg-zinc-900/45 transition-colors">
                        <td className="p-4 font-bold text-cream">
                          {book.name}
                        </td>
                        <td className="p-4 font-mono">
                          +{book.mobile}
                        </td>
                        <td className="p-4 space-y-1">
                          <span className="block text-gold text-xs font-mono font-semibold">{book.date}</span>
                          <span className="block text-emerald-400 text-xs font-mono">{book.time}</span>
                          <span className="block text-zinc-400 text-[11px]">{book.persons} Persons</span>
                        </td>
                        <td className="p-4 max-w-xs text-xs text-warm-cream/70 italic leading-relaxed">
                          {book.specialRequest || "None specfied."}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2.5 py-1 text-[10px] font-mono uppercase rounded-full font-bold border ${
                              book.status === "Approved"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : book.status === "Rejected"
                                ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                                : "bg-gold/10 text-gold border-gold/30"
                            }`}
                          >
                            {book.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center space-x-2">
                            {book.status === "Pending" && (
                              <>
                                <button
                                  onClick={() => updateBookingStatus(book.id, "Approved")}
                                  className="p-1.5 bg-emerald-500/10 border border-emerald-500/40 rounded text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
                                  title="Approve Table Spot"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => updateBookingStatus(book.id, "Rejected")}
                                  className="p-1.5 bg-rose-500/10 border border-rose-500/40 rounded text-rose-450 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                                  title="Reject Reservation"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => deleteBooking(book.id)}
                              className="p-1.5 bg-zinc-900 border border-rose-500/30 rounded text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: LIVE FIRESTORE DATABASE EXPLORER */}
        {activeTab === "database" && (
          <DatabaseExplorer
            bookings={bookings}
            updateBookingStatus={async (id, status) => {
              await updateBookingStatus(id, status);
            }}
            deleteBooking={async (id) => {
              await deleteBooking(id);
            }}
            fetchAdminData={async () => {
              await fetchAdminData();
            }}
          />
        )}

        {/* TAB 3: MENU CATALOG MANAGER */}
        {activeTab === "menu" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Utensils className="h-5 w-5 text-gold" />
                <span>Dynamic Menu CRUD Manager</span>
              </h3>

              {!isAddDishOpen && !editingDish && (
                <button
                  onClick={() => setIsAddDishOpen(true)}
                  className="px-4 py-2.5 bg-gold text-matte-black font-mono text-xs font-bold uppercase rounded flex items-center space-x-1.5 hover:bg-gold-hover cursor-pointer shadow-lg shadow-gold/10"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Recipe</span>
                </button>
              )}
            </div>

            {/* ADD RECIPE FORM DRAWER */}
            {isAddDishOpen && (
              <form onSubmit={handleAddDish} className="p-6 bg-charcoal-card border-2 border-gold rounded-lg space-y-4 max-w-3xl mx-auto">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                  <h4 className="text-base font-bold text-gold">Add New Culinary Dish</h4>
                  <button type="button" onClick={() => setIsAddDishOpen(false)} className="text-warm-cream/40 hover:text-warm-cream cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gold mb-1">DISH RECIPE NAME *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Paneer Handi Special"
                      value={dishName}
                      onChange={(e) => setDishName(e.target.value)}
                      className="w-full bg-matte-black border border-oak-brown/30 rounded px-3 py-2 text-xs text-cream focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gold mb-1">PRICE IN RUPEES (₹) *</label>
                    <input
                      type="number"
                      required
                      min={5}
                      placeholder="e.g., 260"
                      value={dishPrice}
                      onChange={(e) => setDishPrice(e.target.value)}
                      className="w-full bg-matte-black border border-oak-brown/30 rounded px-3 py-2 text-xs text-cream focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gold mb-1">MENU CATEGORY *</label>
                    <select
                      value={dishCat}
                      onChange={(e) => setDishCat(e.target.value as any)}
                      className="w-full bg-matte-black border border-oak-brown/30 rounded px-3 py-2 text-xs text-cream focus:outline-none"
                    >
                      <option value="Starters">Starters</option>
                      <option value="Soups">Soups</option>
                      <option value="Vegetarian Dishes">Vegetarian Dishes</option>
                      <option value="Paneer Specials">Paneer Specials</option>
                      <option value="South Indian">South Indian</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Breads">Breads</option>
                      <option value="Rice">Rice</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gold mb-1">IMAGE CDN NETWORK FILE URL</label>
                    <input
                      type="text"
                      placeholder="Unsplash high-resolution photo URL"
                      value={dishImg}
                      onChange={(e) => setDishImg(e.target.value)}
                      className="w-full bg-matte-black border border-oak-brown/30 rounded px-3 py-2 text-xs text-cream focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gold mb-1">DISH INGREDIENTS / DESCRIPTION</label>
                  <textarea
                    rows={2}
                    placeholder="Describe recipe presentation, spices, or allergens..."
                    value={dishDesc}
                    onChange={(e) => setDishDesc(e.target.value)}
                    className="w-full bg-matte-black border border-oak-brown/30 rounded px-3 py-2 text-xs text-cream focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="dish_avail_cb"
                    checked={dishAvail}
                    onChange={(e) => setDishAvail(e.target.checked)}
                    className="rounded bg-matte-black border-oak-brown text-gold focus:ring-gold"
                  />
                  <label htmlFor="dish_avail_cb" className="text-xs text-warm-cream/80">Recipe Stock Available</label>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button type="submit" className="px-5 py-2 bg-gold text-matte-black text-xs font-mono font-bold rounded cursor-pointer">
                    SAVE RECIPE
                  </button>
                  <button type="button" onClick={() => setIsAddDishOpen(false)} className="px-4 py-2 border border-zinc-700 text-xs font-mono rounded cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* EDIT RECIPE MODAL ACTIVE */}
            {editingDish && (
              <form onSubmit={handleUpdateDish} className="p-6 bg-charcoal-card border-2 border-gold rounded-lg space-y-4 max-w-3xl mx-auto">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                  <h4 className="text-base font-bold text-gold">Edit Recipe specifications: "{editingDish.name}"</h4>
                  <button type="button" onClick={() => setEditingDish(null)} className="text-warm-cream/40 hover:text-warm-cream cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gold mb-1">RECIPE BRAND NAME</label>
                    <input
                      type="text"
                      required
                      value={editingDish.name}
                      onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                      className="w-full bg-matte-black border border-oak-brown/30 rounded px-3 py-2 text-xs text-cream focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gold mb-1">PRICE (₹)</label>
                    <input
                      type="number"
                      required
                      value={isNaN(editingDish.price) ? "" : editingDish.price}
                      onChange={(e) => setEditingDish({ ...editingDish, price: parseFloat(e.target.value) })}
                      className="w-full bg-matte-black border border-oak-brown/30 rounded px-3 py-2 text-xs text-cream focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gold mb-1">RECIPE CATEGORY</label>
                    <select
                      value={editingDish.category}
                      onChange={(e) => setEditingDish({ ...editingDish, category: e.target.value as any })}
                      className="w-full bg-matte-black border border-oak-brown/30 rounded px-3 py-2 text-xs text-cream focus:outline-none"
                    >
                      <option value="Starters">Starters</option>
                      <option value="Soups">Soups</option>
                      <option value="Vegetarian Dishes">Vegetarian Dishes</option>
                      <option value="Paneer Specials">Paneer Specials</option>
                      <option value="South Indian">South Indian</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Breads">Breads</option>
                      <option value="Rice">Rice</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gold mb-1">RECIPE IMAGE CDN</label>
                    <input
                      type="text"
                      value={editingDish.image}
                      onChange={(e) => setEditingDish({ ...editingDish, image: e.target.value })}
                      className="w-full bg-matte-black border border-oak-brown/30 rounded px-3 py-2 text-xs text-cream focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gold mb-1">RECIPE DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={editingDish.description}
                    onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                    className="w-full bg-matte-black border border-oak-brown/30 rounded px-3 py-2 text-xs text-cream focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_dish_avail"
                    checked={editingDish.available}
                    onChange={(e) => setEditingDish({ ...editingDish, available: e.target.checked })}
                    className="rounded bg-matte-black border-oak-brown text-gold focus:ring-gold"
                  />
                  <label htmlFor="edit_dish_avail" className="text-xs text-warm-cream/80">Recipe Stock Available</label>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button type="submit" className="px-5 py-2 bg-gold text-matte-black text-xs font-mono font-bold rounded cursor-pointer">
                    APPLY CHANGES
                  </button>
                  <button type="button" onClick={() => setEditingDish(null)} className="px-4 py-2 border border-zinc-700 text-xs font-mono rounded cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* List with Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((dish) => (
                <div key={dish.id} className="p-4 bg-charcoal-card border border-oak-brown/30 rounded flex justify-between gap-3 hover:border-gold/45 transition-colors">
                  <div className="flex items-start gap-3">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-16 h-16 object-cover rounded border border-zinc-900"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="text-[10px] font-mono text-gold tracking-widest block uppercase">
                        {dish.category}
                      </span>
                      <h4 className="text-sm font-bold text-cream line-clamp-1">{dish.name}</h4>
                      <p className="text-xs font-mono text-emerald-400 mt-1">₹{dish.price}</p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      dish.available ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" : "bg-rose-500/10 text-rose-500 border-rose-500/25"
                    }`}>
                      {dish.available ? "STOCK" : "OOS"}
                    </span>

                    <div className="flex space-x-1 mt-2">
                      <button
                        onClick={() => setEditingDish(dish)}
                        className="p-1 border border-gold/30 rounded text-gold bg-matte-black hover:bg-gold hover:text-matte-black transition-colors cursor-pointer"
                        title="Edit Specs"
                      >
                        <FileEdit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteDish(dish.id)}
                        className="p-1 border border-rose-500/30 rounded text-rose-400 bg-matte-black hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                        title="Delete Recipe"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GARDEN PHOTO SHOWCASE MODS */}
        {activeTab === "gallery" && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Image className="h-5 w-5 text-gold" />
              <span>Garden Showcase Media Catalog</span>
            </h3>

            {/* Addition form card */}
            <form onSubmit={handleAddPhoto} className="p-5 bg-charcoal-card border border-oak-brown/30 rounded-lg max-w-4xl space-y-4">
              <h4 className="text-sm font-mono text-gold tracking-widest uppercase font-bold">ADD NEW OUTDOOR PHOTO</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-warm-cream/60 mb-1">IMAGE FILE URL</label>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={galUrl}
                    onChange={(e) => setGalUrl(e.target.value)}
                    className="w-full bg-matte-black border border-oak-brown/30 rounded px-3 py-2 text-xs text-cream focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-warm-cream/60 mb-1">ALBUM HEADING TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Cozy Evening Fireside Dining"
                    value={galTitle}
                    onChange={(e) => setGalTitle(e.target.value)}
                    className="w-full bg-matte-black border border-oak-brown/30 rounded px-3 py-2 text-xs text-cream focus:outline-none font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-warm-cream/60 mb-1">ALBUM ZONE CATEGORY</label>
                  <select
                    value={galCat}
                    onChange={(e) => setGalCat(e.target.value as any)}
                    className="w-full bg-matte-black border border-oak-brown/30 rounded px-3 py-2 text-xs text-cream focus:outline-none"
                  >
                    <option value="Garden Seating">Garden Seating</option>
                    <option value="Family Area">Family Area</option>
                    <option value="Outdoor Dining">Outdoor Dining</option>
                    <option value="Evening Lighting">Evening Lighting</option>
                    <option value="Relaxation Zone">Relaxation Zone</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-gold text-matte-black font-mono text-xs font-bold uppercase rounded cursor-pointer hover:bg-gold-hover transition-colors"
              >
                SAVE ASSET PHOTO
              </button>
            </form>

            {/* List current photos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryItems.map((photo) => (
                <div key={photo.id} className="relative group rounded border border-zinc-900 bg-charcoal-card overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-32 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <p className="text-[10px] text-gold font-mono uppercase">{photo.category}</p>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="p-1 px-2 border border-rose-500 text-rose-500 bg-black text-[10px] font-mono rounded hover:bg-rose-500 hover:text-white transition-colors cursor-pointer self-end"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 5: WEBSITE CONTENT MANAGEMENT */}
        {activeTab === "content" && (
          <form onSubmit={handleSaveContent} className="space-y-6 animate-fade-in max-w-4xl bg-charcoal-card border border-oak-brown/30 rounded-lg p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileEdit className="h-5 w-5 text-gold" />
              <span>Homepage Content Adjustments</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gold mb-1.5 uppercase font-bold">LANDING HERO TAGLINE TITLE</label>
                <input
                  type="text"
                  required
                  value={editContent.heroTitle}
                  onChange={(e) => setEditContent({ ...editContent, heroTitle: e.target.value })}
                  className="w-full bg-matte-black border border-oak-brown/35 rounded px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gold mb-1.5 uppercase font-bold">LANDING HERO SUBTITLE DETAILED COPY</label>
                <textarea
                  rows={3}
                  required
                  value={editContent.heroSubtitle}
                  onChange={(e) => setEditContent({ ...editContent, heroSubtitle: e.target.value })}
                  className="w-full bg-matte-black border border-oak-brown/35 rounded px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gold mb-1.5 uppercase font-bold">OUR STORY BRIEF</label>
                <textarea
                  rows={4}
                  required
                  value={editContent.aboutStory}
                  onChange={(e) => setEditContent({ ...editContent, aboutStory: e.target.value })}
                  className="w-full bg-matte-black border border-oak-brown/35 rounded px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gold mb-1.5 uppercase font-bold">RESERVATION PHONE</label>
                  <input
                    type="text"
                    required
                    value={editContent.contactPhone}
                    onChange={(e) => setEditContent({ ...editContent, contactPhone: e.target.value })}
                    className="w-full bg-matte-black border border-oak-brown/35 rounded px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gold mb-1.5 uppercase font-bold">OPERATING OFFICE HOURS TIME</label>
                  <input
                    type="text"
                    required
                    value={editContent.openingHours}
                    onChange={(e) => setEditContent({ ...editContent, openingHours: e.target.value })}
                    className="w-full bg-matte-black border border-oak-brown/35 rounded px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gold mb-1.5 uppercase font-bold">REST AUTOCLEAN ADDRESS</label>
                <input
                  type="text"
                  required
                  value={editContent.contactAddress}
                  onChange={(e) => setEditContent({ ...editContent, contactAddress: e.target.value })}
                  className="w-full bg-matte-black border border-oak-brown/35 rounded px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold"
                />
              </div>

            </div>

            {contentSaveSuccess && (
              <p className="text-xs text-emerald-400 font-mono font-bold">🎉 Homepage updates applied and saved to disk successfully.</p>
            )}

            <button
              type="submit"
              className="px-6 py-3 bg-gold hover:bg-gold-hover text-matte-black font-mono text-xs font-bold tracking-widest uppercase rounded cursor-pointer transition-colors shadow"
            >
              SAVE CORE ADJUSTMENTS
            </button>
          </form>
        )}

      </div>
    </section>
  );
}
