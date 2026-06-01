import React, { useState, useMemo } from "react";
import {
  Database,
  ExternalLink,
  Search,
  RefreshCw,
  Trash2,
  Check,
  X,
  Code,
  ArrowUpDown,
  FileDown,
  Info,
  Layers,
  Sparkles,
  SearchCode
} from "lucide-react";
import { Booking, BookingStatus } from "../types";

interface DatabaseExplorerProps {
  bookings: Booking[];
  updateBookingStatus: (id: string, status: "Approved" | "Rejected") => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  fetchAdminData: () => Promise<void>;
}

export default function DatabaseExplorer({
  bookings,
  updateBookingStatus,
  deleteBooking,
  fetchAdminData,
}: DatabaseExplorerProps) {
  // Query States
  const [globalSearch, setGlobalSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Booking>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paxFilter, setPaxFilter] = useState<string>("ALL");
  
  // Column Specific Filters
  const [colNameFilter, setColNameFilter] = useState("");
  const [colMobileFilter, setColMobileFilter] = useState("");
  const [colDateFilter, setColDateFilter] = useState("");

  // UI Interactive States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedJsonBooking, setSelectedJsonBooking] = useState<Booking | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [SYSTEM] Handshake approved. Connected to cloud-run socket ingress.`,
    `[${new Date().toLocaleTimeString()}] [FIRESTORE] Connection verified to project gen-lang-client-0118079849.`,
    `[${new Date().toLocaleTimeString()}] [COLLECTION] Path "/bookings" mapped with schema validator.`,
  ]);

  // Logging utility helper
  const addLog = (msg: string) => {
    setConsoleLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 19), // Keep last 20 logs
    ]);
  };

  // Direct Firestore Console URLs
  const firestoreConsoleUrl = "https://console.firebase.google.com/project/gen-lang-client-0118079849/firestore/databases/ai-studio-bbb485b0-cd1f-4ace-ab58-683e76c5/data";
  const enterpriseConsoleUrl = "https://console.firebase.google.com/project/gen-lang-client-0118079849/firestore/databases/ai-studio-bbb485b0-cd1f-4ace-ab58-683e76c0a3e1/data?openUpgradeDialog=true";

  // Trigger Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    addLog("[API] Sending asynchronous pull request to server `/api/admin/bookings`...");
    try {
      await fetchAdminData();
      addLog(`[FIRESTORE] Query success. Slipped ${bookings.length} document models onto clientside spreadsheet virtual buffer.`);
    } catch {
      addLog("[ERROR] Failed to compile server endpoint dataset.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Sorting columns toggler
  const handleSort = (field: keyof Booking) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
      addLog(`[QUERY] Swapped sort order of field "${field}" to ${!sortAsc ? "ascending" : "descending"}.`);
    } else {
      setSortField(field);
      setSortAsc(false);
      addLog(`[QUERY] Query index sorting mapped to Firestore field "${field}".`);
    }
  };

  // Process rows - filters and sorts
  const processedBookings = useMemo(() => {
    let result = [...bookings];

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Guest Count filter
    if (paxFilter !== "ALL") {
      const minPax = parseInt(paxFilter, 10);
      result = result.filter((b) => b.persons >= minPax);
    }

    // Column Filters
    if (colNameFilter) {
      result = result.filter((b) => b.name.toLowerCase().includes(colNameFilter.toLowerCase()));
    }
    if (colMobileFilter) {
      result = result.filter((b) => b.mobile.includes(colMobileFilter));
    }
    if (colDateFilter) {
      result = result.filter((b) => b.date.includes(colDateFilter));
    }

    // Global Search
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      result = result.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.name.toLowerCase().includes(q) ||
          b.mobile.includes(q) ||
          b.date.includes(q) ||
          (b.specialRequest && b.specialRequest.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }

      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();

      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [bookings, globalSearch, sortField, sortAsc, statusFilter, paxFilter, colNameFilter, colMobileFilter, colDateFilter]);

  // Handle inline status adjustments
  const handleUpdateStatus = async (id: string, newStatus: "Approved" | "Rejected") => {
    addLog(`[WRITE] Attempting setDoc merge { status: "${newStatus}" } on doc path "/bookings/${id}"`);
    try {
      await updateBookingStatus(id, newStatus);
      addLog(`[WRITE SUCCESS] Transaction committed to Firestore db. Row "${id}" status set to ${newStatus}.`);
    } catch (err) {
      addLog(`[WRITE ERROR] Permission denied or connection reset writing to bookings doc.`);
    }
  };

  // Handle delete
  const handleDeleteRow = async (id: string) => {
    addLog(`[DELETE] Requesting atomic doc removal for bookings identifier "${id}"`);
    try {
      await deleteBooking(id);
      addLog(`[DELETE SUCCESS] Document with ID "${id}" purged from Cloud Firestore index.`);
      if (selectedJsonBooking?.id === id) {
        setSelectedJsonBooking(null);
      }
    } catch {
      addLog(`[DELETE ERROR] ABAC restriction blocked wipe operation.`);
    }
  };

  // Export Bookings CSV Utility
  const downloadCSV = () => {
    if (processedBookings.length === 0) return;
    const headers = ["ID", "Name", "Mobile", "Date", "Time", "Persons", "Special Requests", "Status", "CreatedAt"];
    const rows = processedBookings.map((b) => [
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
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `firestore_bookings_grid_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog(`[DOWNLOAD] Saved clientside CSV snapshot of ${processedBookings.length} database entries to computer.`);
  };

  return (
    <div className="space-y-6 text-warm-cream animate-fade-in font-sans">
      
      {/* SECTION HEADER: DATABASE CONSOLE STATS */}
      <div className="bg-charcoal-card border-l-4 border-gold bg-gradient-to-r from-charcoal-card to-dark-walnut/20 rounded-r-lg p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-gold">
            <Database className="h-5 w-5" />
            <h4 className="font-mono text-sm uppercase tracking-widest font-bold">Vrindavan Firestore Server Console</h4>
          </div>
          <p className="text-xs text-warm-cream/70 leading-relaxed font-sans max-w-2xl">
            Connected to Cloud Firestore instances. You have ultimate relational authority over the reservations ledger table schemas. Direct connection links sync clientside grid components synchronously.
          </p>
        </div>

        {/* Action button triggers for custom server view */}
        <div className="flex flex-wrap gap-2.5">
          <a
            href={enterpriseConsoleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-matte-black border border-gold/40 text-gold hover:text-white rounded text-xs font-mono flex items-center space-x-1.5 transition-all hover:border-gold"
          >
            <span>Firebase Console Link</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* METADATA SCHEMAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-charcoal-card border border-oak-brown/25 rounded-lg space-y-1">
          <span className="text-[10px] font-mono uppercase text-gold/60">PROJECT PROVIDER ID</span>
          <p className="text-sm font-mono text-cream font-bold">gen-lang-client-0118079849</p>
        </div>
        <div className="p-4 bg-charcoal-card border border-oak-brown/25 rounded-lg space-y-1">
          <span className="text-[10px] font-mono uppercase text-gold/60">FIRESTORE DATABASE INSTANCE</span>
          <p className="text-sm font-mono text-cream truncate" title="ai-studio-bbb485b0-cd1f-4ace-ab58-683e76c0a3e1">
            ai-studio-bbb485b0-cd1f-4ace-ab58-683e76c0a3e1
          </p>
        </div>
        <div className="p-4 bg-charcoal-card border border-oak-brown/25 rounded-lg space-y-1">
          <span className="text-[10px] font-mono uppercase text-gold/60">COLLECTION DOCUMENT SCHEMA</span>
          <p className="text-sm font-mono text-emerald-400 font-bold">/bookings (JSON Array Rows)</p>
        </div>
      </div>

      {/* ADVANCED CONTROL BUTTONS HEADER */}
      <div className="bg-charcoal-card border border-oak-brown/30 rounded-lg p-4 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Global search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-warm-cream/40" />
              <input
                type="text"
                placeholder="Database Global Search..."
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  addLog(`[FILTER] Global input: "${e.target.value}"`);
                }}
                className="w-full bg-matte-black border border-oak-brown/35 rounded pl-9 pr-3 py-2 text-xs text-cream focus:outline-none focus:border-gold"
              />
            </div>

            {/* Quick status filter select */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                addLog(`[FILTER] Set status filter = "${e.target.value}"`);
              }}
              className="bg-matte-black border border-oak-brown/35 rounded text-xs px-3 py-2 text-warm-cream focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="ALL">Status: All Records</option>
              <option value="Pending">Status: Pending</option>
              <option value="Approved">Status: Approved</option>
              <option value="Rejected">Status: Rejected</option>
            </select>

            {/* Guest count count filter */}
            <select
              value={paxFilter}
              onChange={(e) => {
                setPaxFilter(e.target.value);
                addLog(`[FILTER] Set capacity constraint = "${e.target.value}+ Pax"`);
              }}
              className="bg-matte-black border border-oak-brown/35 rounded text-xs px-3 py-2 text-warm-cream focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="ALL">Capacity: All sizes</option>
              <option value="1">At least 1 Guest</option>
              <option value="3">At least 3 Guests</option>
              <option value="5">At least 5 Guests</option>
              <option value="10">Large Parties (10+)</option>
              <option value="20">Events (20+)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-2 bg-matte-black border border-oak-brown/40 hover:border-gold rounded text-xs font-mono flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-gold" : ""}`} />
              <span>{isRefreshing ? "SYNCING..." : "LIVE RECONTILE PULL"}</span>
            </button>
            <button
              onClick={downloadCSV}
              className="px-3 py-2 bg-gradient-to-br from-oak-brown to-dark-walnut text-warm-cream border border-gold/30 hover:border-gold rounded text-xs font-mono flex items-center space-x-1.5 cursor-pointer"
            >
              <FileDown className="h-3.5 w-3.5 text-gold" />
              <span>SNAPSHOT CSV</span>
            </button>
          </div>
        </div>

        {/* Dynamic metrics readout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-zinc-900/50 pt-2.5 text-xs font-mono">
          <div>
            <span className="text-warm-cream/50">ROWS LISTED:</span>{" "}
            <span className="text-gold font-bold">{processedBookings.length}</span> / <span className="text-zinc-600">{bookings.length}</span>
          </div>
          <div>
            <span className="text-warm-cream/50">PENDING QUEUE:</span>{" "}
            <span className="text-orange-400 font-bold">{bookings.filter((b) => b.status === "Pending").length}</span>
          </div>
          <div>
            <span className="text-warm-cream/50">APPROVED:</span>{" "}
            <span className="text-emerald-400 font-bold">{bookings.filter((b) => b.status === "Approved").length}</span>
          </div>
          <div>
            <span className="text-warm-cream/50">REJECTED LOGS:</span>{" "}
            <span className="text-rose-500 font-bold">{bookings.filter((b) => b.status === "Rejected").length}</span>
          </div>
        </div>
      </div>

      {/* SPREADSHEET TABLE GRID VIEW */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        <div className="xl:col-span-3 bg-charcoal-card border border-oak-brown/20 rounded-lg overflow-hidden shadow-2xl">
          
          {/* Table container with horizontal scrolling */}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse table-fixed text-xs font-mono">
              <thead>
                {/* Primary header names */}
                <tr className="bg-matte-black/90 border-b border-oak-brown/30 text-gold uppercase tracking-wider h-11">
                  <th className="p-3 w-32 font-bold font-mono text-center border-r border-zinc-900/50">
                    <button onClick={() => handleSort("id")} className="flex items-center space-x-1 hover:text-white mx-auto">
                      <span>DOC ID</span>
                      <ArrowUpDown className="h-3 w-3 opacity-70" />
                    </button>
                  </th>
                  <th className="p-3 w-44 font-bold border-r border-zinc-900/50">
                    <button onClick={() => handleSort("name")} className="flex items-center space-x-1 hover:text-white">
                      <span>CUSTOMER_NAME</span>
                      <ArrowUpDown className="h-3 w-3 opacity-70" />
                    </button>
                  </th>
                  <th className="p-3 w-36 font-bold border-r border-zinc-900/50">
                    <button onClick={() => handleSort("mobile")} className="flex items-center space-x-1 hover:text-white">
                      <span>CONTACT_PHONE</span>
                      <ArrowUpDown className="h-3 w-3 opacity-70" />
                    </button>
                  </th>
                  <th className="p-3 w-28 font-bold border-r border-zinc-900/50 text-center">
                    <button onClick={() => handleSort("date")} className="flex items-center space-x-1 hover:text-white mx-auto">
                      <span>DATE</span>
                      <ArrowUpDown className="h-3 w-3 opacity-70" />
                    </button>
                  </th>
                  <th className="p-3 w-24 font-bold border-r border-zinc-900/50 text-center">
                    <button onClick={() => handleSort("time")} className="flex items-center space-x-1 hover:text-white mx-auto">
                      <span>TIME</span>
                      <ArrowUpDown className="h-3 w-3 opacity-70" />
                    </button>
                  </th>
                  <th className="p-3 w-20 font-bold border-r border-zinc-900/50 text-center">
                    <button onClick={() => handleSort("persons")} className="flex items-center space-x-1 hover:text-white mx-auto">
                      <span>PAX</span>
                      <ArrowUpDown className="h-3 w-3 opacity-70" />
                    </button>
                  </th>
                  <th className="p-3 w-40 font-bold border-r border-zinc-900/50">SPECIAL_NOTES</th>
                  <th className="p-3 w-32 font-bold border-r border-zinc-900/50 text-center">STATUS</th>
                  <th className="p-3 w-36 font-bold text-center">ACTIONS</th>
                </tr>

                {/* Sub-header row for inline cell column searches */}
                <tr className="bg-matte-black/40 border-b border-zinc-900/90 h-9">
                  <td className="p-1 px-2 border-r border-zinc-900/50 text-center text-[10px] text-zinc-500">
                    Auto Generated
                  </td>
                  <td className="p-1 px-2 border-r border-zinc-900/50">
                    <input
                      type="text"
                      placeholder="Search name..."
                      value={colNameFilter}
                      onChange={(e) => {
                        setColNameFilter(e.target.value);
                        addLog(`[COL FILTER] Search name = "${e.target.value}"`);
                      }}
                      className="w-full bg-[#0c0c0d] border border-zinc-800 rounded px-2 py-0.5 text-[10px] text-cream placeholder-zinc-650 focus:outline-none"
                    />
                  </td>
                  <td className="p-1 px-2 border-r border-zinc-900/50">
                    <input
                      type="text"
                      placeholder="Search mobile..."
                      value={colMobileFilter}
                      onChange={(e) => {
                        setColMobileFilter(e.target.value);
                        addLog(`[COL FILTER] Search phone = "${e.target.value}"`);
                      }}
                      className="w-full bg-[#0c0c0d] border border-zinc-800 rounded px-2 py-0.5 text-[10px] text-cream placeholder-zinc-650 focus:outline-none"
                    />
                  </td>
                  <td className="p-1 px-2 border-r border-zinc-900/50">
                    <input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={colDateFilter}
                      onChange={(e) => {
                        setColDateFilter(e.target.value);
                        addLog(`[COL FILTER] Filter date = "${e.target.value}"`);
                      }}
                      className="w-full bg-[#0c0c0d] border border-zinc-800 rounded px-2 py-0.5 text-[10px] text-cream placeholder-zinc-650 focus:outline-none text-center"
                    />
                  </td>
                  <td className="p-1 px-2 border-r border-zinc-900/50" colSpan={5}>
                    <span className="text-[10px] text-zinc-600 px-2 italic">Standard indexing applied</span>
                  </td>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#17171a]">
                {processedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-warm-cream/40 italic text-xs">
                      No records matched the current query constraints. Check filters or query string.
                    </td>
                  </tr>
                ) : (
                  processedBookings.map((b) => (
                    <tr
                      key={b.id}
                      className={`hover:bg-zinc-900/35 transition-colors cursor-pointer ${
                        selectedJsonBooking?.id === b.id ? "bg-dark-walnut/15" : ""
                      }`}
                      onClick={() => {
                        setSelectedJsonBooking(b);
                        addLog(`[DESELECT/SELECT] Inspected JSON details for document ID "${b.id}".`);
                      }}
                    >
                      {/* DOC ID cell with Copy capability */}
                      <td className="p-3 text-center border-r border-zinc-900/50 text-[10px] truncate max-w-[120px] text-gold/80 hover:text-gold font-bold">
                        <span
                          title="Click to select JSON"
                          className="cursor-pointer font-semibold underline decoration-dotted decoration-gold/40"
                        >
                          {b.id}
                        </span>
                      </td>

                      {/* GUEST NAME */}
                      <td className="p-3 border-r border-zinc-900/50 truncate font-semibold text-white">
                        {b.name}
                      </td>

                      {/* PHONE CARD */}
                      <td className="p-3 border-r border-zinc-900/50 font-mono text-warm-cream/90 text-[11px]">
                        +{b.mobile}
                      </td>

                      {/* BOOKING DATE */}
                      <td className="p-3 border-r border-zinc-900/50 text-center font-mono text-[#bf9c60] text-[11px]">
                        {b.date}
                      </td>

                      {/* PREFERRED TIME */}
                      <td className="p-3 border-r border-zinc-900/50 text-center text-emerald-400 font-bold">
                        {b.time}
                      </td>

                      {/* GUESTS COUNTER PAX */}
                      <td className="p-3 border-r border-zinc-900/50 text-center font-bold text-sky-400 text-sm">
                        {b.persons}
                      </td>

                      {/* SPECIAL REQUESTS */}
                      <td className="p-3 border-r border-zinc-900/50 truncate max-w-[160px] text-warm-cream/60 italic" title={b.specialRequest || ""}>
                        {b.specialRequest || "—"}
                      </td>

                      {/* INTERACTIVE COLUMN STATUS DIRECT TRANSITION */}
                      <td className="p-3 border-r border-zinc-900/50 text-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateStatus(b.id, e.target.value as any)}
                          className={`text-[10px] uppercase font-bold text-center border rounded px-1.5 py-0.5 focus:outline-none cursor-pointer ${
                            b.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : b.status === "Rejected"
                              ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                              : "bg-gold/10 text-gold border-gold/30"
                          }`}
                        >
                          <option value="Pending" className="bg-matte-black text-gold">PENDING</option>
                          <option value="Approved" className="bg-matte-black text-emerald-400">APPROVED</option>
                          <option value="Rejected" className="bg-matte-black text-rose-500">REJECTED</option>
                        </select>
                      </td>

                      {/* ROW ATOMIC ACTIONS */}
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedJsonBooking(b);
                            }}
                            className="p-1 bg-zinc-900 hover:bg-gold/10 border border-gold/35 rounded text-gold cursor-pointer"
                            title="Inspect RAW document schema"
                          >
                            <Code className="h-3 w-3" />
                          </button>
                          
                          {b.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(b.id, "Approved")}
                                className="p-1 bg-[#122b1c] border border-emerald-700 hover:bg-emerald-600 rounded text-emerald-400 hover:text-white transition-colors cursor-pointer"
                                title="Approve Reservation"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(b.id, "Rejected")}
                                className="p-1 bg-[#2d1418] border border-rose-900 hover:bg-rose-800 rounded text-rose-400 hover:text-white transition-colors cursor-pointer"
                                title="Reject Spot"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDeleteRow(b.id)}
                            className="p-1 bg-[#1c0d10] border border-rose-900/60 hover:bg-rose-500 rounded text-rose-500 hover:text-white transition-all cursor-pointer"
                            title="Purge Document Row"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
        </div>

        {/* DETAILS SIDE PANEL: METADATA & REAL-TIME LOGS CONSOLE */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* JSON DOCUMENT SCHEMATIC INSPECTION */}
          <div className="bg-charcoal-card border border-oak-brown/25 rounded-l rounded-r-lg p-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
              <span className="text-xs uppercase font-mono tracking-widest text-gold flex items-center gap-1.5 font-bold">
                <SearchCode className="h-4 w-4" />
                <span>JSON Document Inspector</span>
              </span>
              {selectedJsonBooking && (
                <button
                  onClick={() => setSelectedJsonBooking(null)}
                  className="text-xs text-warm-cream/40 hover:text-white font-mono cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {selectedJsonBooking ? (
              <div className="space-y-3 font-mono">
                <div className="text-[10px] text-zinc-400">
                  Document ID: <span className="text-gold font-bold">{selectedJsonBooking.id}</span>
                </div>
                
                {/* Preformatted highlight representation */}
                <div className="bg-[#0b0b0c] border border-zinc-900 rounded p-3 text-[10px] leading-relaxed max-h-56 overflow-y-auto text-emerald-400 font-mono">
                  <span className="text-zinc-500">{"{"}</span>
                  <div className="pl-4">
                    <span className="text-zinc-400">"id":</span> <span className="text-gold">"{selectedJsonBooking.id}"</span>,<br />
                    <span className="text-zinc-400">"name":</span> <span className="text-white">"{selectedJsonBooking.name}"</span>,<br />
                    <span className="text-zinc-400">"mobile":</span> <span className="text-white">"{selectedJsonBooking.mobile}"</span>,<br />
                    <span className="text-zinc-400">"date":</span> <span className="text-sky-300">"{selectedJsonBooking.date}"</span>,<br />
                    <span className="text-zinc-400">"time":</span> <span className="text-sky-300">"{selectedJsonBooking.time}"</span>,<br />
                    <span className="text-zinc-400">"persons":</span> <span className="text-purple-400 font-bold">{selectedJsonBooking.persons}</span>,<br />
                    <span className="text-zinc-400">"specialRequest":</span> <span className="text-zinc-300">"{selectedJsonBooking.specialRequest || ""}"</span>,<br />
                    <span className="text-zinc-400">"status":</span> <span className="text-orange-400">"{selectedJsonBooking.status}"</span>,<br />
                    <span className="text-zinc-400">"createdAt":</span> <span className="text-zinc-400">"{selectedJsonBooking.createdAt}"</span>
                  </div>
                  <span className="text-zinc-500">{"}"}</span>
                </div>

                <div className="text-[9px] text-warm-cream/40 italic leading-snug">
                  * Live schema document bindings linked asynchronously using the Firestore SDK.
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-warm-cream/40 italic font-mono bg-[#0c0c0d] border border-zinc-950 rounded">
                Click a Document ID or inspect icon row to analyze raw database JSON structure.
              </div>
            )}
          </div>

          {/* DYNAMIC FIRESTORE TERMINAL CONSOLE LOGS */}
          <div className="bg-charcoal-card border border-oak-brown/25 rounded-lg p-4 font-mono text-[10px]">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
              <span className="uppercase text-gold flex items-center gap-1.5 font-bold tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sync Stream Console</span>
              </span>
              <button
                onClick={() => {
                  setConsoleLogs([]);
                  addLog("[SYSTEM] Terminal buffer reset.");
                }}
                className="text-[9px] text-zinc-500 hover:text-white"
              >
                Clear Logs
              </button>
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto bg-matte-black border border-zinc-900 rounded p-2.5 leading-snug text-zinc-400-scrolling select-none">
              {consoleLogs.map((log, index) => {
                let color = "text-zinc-400";
                if (log.includes("[ERROR]")) color = "text-rose-400";
                else if (log.includes("[WRITE SUCCESS]")) color = "text-emerald-400";
                else if (log.includes("[WRITE]")) color = "text-yellow-400";
                else if (log.includes("[DELETE]")) color = "text-rose-500";
                else if (log.includes("[FIRESTORE]")) color = "text-sky-300";
                else if (log.includes("[SYSTEM]")) color = "text-gold";

                return (
                  <div key={index} className={`font-mono text-[9px] leading-relaxed break-all ${color}`}>
                    {log}
                  </div>
                );
              })}
            </div>

            <p className="mt-3 text-[9px] text-zinc-600 italic">
              Terminal auto-refreshes on every single query filter or database action executed.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
