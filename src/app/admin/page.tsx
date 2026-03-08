"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  Users,
  CalendarCheck,
  Building2,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  BarChart3,
  Trash2,
  Shield,
  ShieldCheck,
  Star,
  FileText,
  ChevronDown,
  MapPin,
  Waves,
  Sparkles,
  Fish,
  Store,
  KeyRound,
  Package,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { providers as hardcodedProviders, services } from "@/lib/data";

interface Stats {
  totalUsers: number;
  customers: number;
  partners: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalAuctions: number;
  pendingRegistrations: number;
  totalReviews: number;
}

interface User {
  id: number;
  name: string;
  phone: string;
  role: string;
  businessName: string;
  categories: string;
  createdAt: string;
}

interface Booking {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  providerId: string;
  providerName: string;
  serviceName: string;
  preferredDate: string;
  notes: string;
  status: string;
  rejectionReason: string;
  createdAt: string;
}

interface Registration {
  id: number;
  businessName: string;
  ownerName: string;
  phone: string;
  category: string;
  governorate: string;
  description: string;
  status: string;
  createdAt: string;
}

interface ProviderProduct {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  price: string;
  image: string;
  createdAt: string;
}

interface ProviderBooking {
  id: number;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  preferredDate: string;
  status: string;
  notes: string;
  createdAt: string;
}

interface DbProvider {
  id: number;
  name: string;
  phone: string;
  businessName: string;
  categories: string;
  description: string;
  governorate: string;
  location: string;
  whatsappNumber: string;
  basePrice: number;
  image: string;
  isVerified: number;
  createdAt: string;
  products: ProviderProduct[];
  bookings: ProviderBooking[];
}

type Tab = "stats" | "users" | "bookings" | "registrations" | "providers";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("stats");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [dbProviders, setDbProviders] = useState<DbProvider[]>([]);
  const [roleDropdown, setRoleDropdown] = useState<number | null>(null);
  const [passwordModal, setPasswordModal] = useState<{ id: number; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [editProvider, setEditProvider] = useState<DbProvider | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<number | null>(null);
  const [editProviderProduct, setEditProviderProduct] = useState<ProviderProduct | null>(null);
  const [addProductModal, setAddProductModal] = useState<{ userId: number; businessName: string } | null>(null);
  const [newProduct, setNewProduct] = useState({ title: "", description: "", category: "pool", price: "" });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchData = async (section: Tab) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?section=${section}`);
      if (!res.ok) return;
      const data = await res.json();
      if (section === "stats") setStats(data);
      else if (section === "users") setUsers(data);
      else if (section === "bookings") setBookings(data);
      else if (section === "registrations") setRegistrations(data);
      else if (section === "providers") setDbProviders(data);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData(tab);
    }
  }, [tab, user]);

  const adminAction = async (action: string, id: number, value: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id, value }),
      });
      if (res.ok) {
        fetchData(tab);
      }
    } catch (err) {
      console.error("Admin action error:", err);
    }
  };

  const adminActionObj = async (body: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchData(tab);
      }
    } catch (err) {
      console.error("Admin action error:", err);
    }
  };

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "stats", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { key: "providers", label: "Providers", icon: <Store className="w-4 h-4" /> },
    { key: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
    { key: "bookings", label: "Bookings", icon: <CalendarCheck className="w-4 h-4" /> },
    { key: "registrations", label: "Registrations", icon: <Building2 className="w-4 h-4" /> },
  ];

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700",
      confirmed: "bg-blue-50 text-blue-700",
      completed: "bg-green-50 text-green-700",
      rejected: "bg-red-50 text-red-700",
      cancelled: "bg-gray-100 text-gray-600",
      approved: "bg-green-50 text-green-700",
      open: "bg-cyan-50 text-cyan-700",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  const roleBadge = (role: string) => {
    if (role === "admin") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700"><ShieldCheck className="w-3 h-3" />Admin</span>;
    if (role === "partner") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700"><Building2 className="w-3 h-3" />Partner</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"><Users className="w-3 h-3" />Customer</span>;
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return d; }
  };

  const catIcon = (cat: string) => {
    if (cat === "pool") return <Waves className="w-4 h-4" />;
    if (cat === "fountain") return <Sparkles className="w-4 h-4" />;
    return <Fish className="w-4 h-4" />;
  };

  const catLabel = (cat: string) => {
    if (cat === "pool") return "Pools";
    if (cat === "fountain") return "Fountains";
    return "Fish Pools";
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="ltr">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your platform</p>
              </div>
            </div>
            <button
              onClick={() => fetchData(tab)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  tab === t.key
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Tab */}
            {tab === "stats" && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Total Users", value: stats.totalUsers, icon: <Users className="w-5 h-5 text-cyan-600" />, bg: "bg-cyan-50" },
                    { label: "Customers", value: stats.customers, icon: <Users className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50" },
                    { label: "Partners", value: stats.partners, icon: <Building2 className="w-5 h-5 text-teal-600" />, bg: "bg-teal-50" },
                    { label: "Reviews", value: stats.totalReviews, icon: <Star className="w-5 h-5 text-amber-600" />, bg: "bg-amber-50" },
                    { label: "Auctions", value: stats.totalAuctions, icon: <FileText className="w-5 h-5 text-indigo-600" />, bg: "bg-indigo-50" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>{s.icon}</div>
                      <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mt-6">Bookings Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total", value: stats.totalBookings, color: "text-gray-900" },
                    { label: "Pending", value: stats.pendingBookings, color: "text-amber-600" },
                    { label: "Confirmed", value: stats.confirmedBookings, color: "text-blue-600" },
                    { label: "Completed", value: stats.completedBookings, color: "text-green-600" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                      <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {stats.pendingRegistrations > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">
                        {stats.pendingRegistrations} pending business registration(s)
                      </span>
                    </div>
                    <button
                      onClick={() => setTab("registrations")}
                      className="text-sm font-medium text-amber-700 hover:text-amber-900 underline"
                    >
                      Review now
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {tab === "users" && (
              <div className="space-y-4">
                <div className="text-sm text-gray-500 mb-2">{users.length} users total</div>
                {users.map((u) => (
                  <div key={u.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-gray-900 truncate">{u.name}</h3>
                          {roleBadge(u.role)}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{u.phone}</span>
                          {u.businessName && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{u.businessName}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(u.createdAt)}</span>
                        </div>
                        {u.categories && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {u.categories.split(",").map((cat: string) => (
                              <span key={cat} className="px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-50 text-cyan-700">
                                {cat === "pool" ? "Pools" : cat === "fountain" ? "Fountains" : cat === "fish" ? "Fish Pools" : cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="relative">
                          <button
                            onClick={() => setRoleDropdown(roleDropdown === u.id ? null : u.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                          >
                            Change Role
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          {roleDropdown === u.id && (
                            <div className="absolute end-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                              {["customer", "partner", "admin"].map((r) => (
                                <button
                                  key={r}
                                  onClick={() => { adminAction("updateRole", u.id, r); setRoleDropdown(null); }}
                                  className={`block w-full text-start px-4 py-2 text-sm hover:bg-gray-50 ${u.role === r ? "text-purple-600 font-medium" : "text-gray-700"}`}
                                >
                                  {r.charAt(0).toUpperCase() + r.slice(1)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => { setPasswordModal({ id: u.id, name: u.name }); setNewPassword(""); }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-xl hover:bg-amber-100 transition-all"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete user "${u.name}"? This will remove all their data.`)) {
                              adminAction("deleteUser", u.id, "");
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <p className="text-gray-500">No users found.</p>
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {tab === "bookings" && (
              <div className="space-y-4">
                <div className="text-sm text-gray-500 mb-2">{bookings.length} bookings total</div>
                {bookings.map((b) => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-gray-400">#{b.id}</span>
                          {statusBadge(b.status)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-gray-400">Customer:</span> <span className="font-medium text-gray-900">{b.customerName}</span></div>
                          <div><span className="text-gray-400">Phone:</span> <span className="text-gray-700">{b.customerPhone}</span></div>
                          <div><span className="text-gray-400">Service:</span> <span className="font-medium text-gray-900">{b.serviceName}</span></div>
                          <div><span className="text-gray-400">Date:</span> <span className="text-gray-700">{b.preferredDate || "Not set"}</span></div>
                          {b.providerName && <div><span className="text-gray-400">Provider:</span> <span className="text-gray-700">{b.providerName}</span></div>}
                          <div><span className="text-gray-400">Created:</span> <span className="text-gray-500">{formatDate(b.createdAt)}</span></div>
                        </div>
                        {b.notes && <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">{b.notes}</p>}
                        {b.rejectionReason && <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg p-2">Reason: {b.rejectionReason}</p>}
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {b.status !== "confirmed" && (
                          <button onClick={() => adminAction("updateBookingStatus", b.id, "confirmed")} className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">
                            <CheckCircle2 className="w-3.5 h-3.5 inline -mt-0.5 me-1" />Confirm
                          </button>
                        )}
                        {b.status !== "completed" && (
                          <button onClick={() => adminAction("updateBookingStatus", b.id, "completed")} className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100">
                            <CheckCircle2 className="w-3.5 h-3.5 inline -mt-0.5 me-1" />Complete
                          </button>
                        )}
                        {b.status !== "rejected" && (
                          <button onClick={() => adminAction("updateBookingStatus", b.id, "rejected")} className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100">
                            <XCircle className="w-3.5 h-3.5 inline -mt-0.5 me-1" />Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <p className="text-gray-500">No bookings found.</p>
                  </div>
                )}
              </div>
            )}

            {/* Providers Tab — Database Partners + Hardcoded */}
            {tab === "providers" && (
              <div className="space-y-6">
                {/* Database Partners (editable) */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-600" />
                    Registered Partners ({dbProviders.length})
                  </h3>
                  {dbProviders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                      <Store className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No registered partners yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dbProviders.map((p) => {
                        const isExpanded = expandedProvider === p.id;
                        const provProducts = p.products || [];
                        const provBookings = p.bookings || [];
                        return (
                        <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                          <div className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shrink-0">
                              <span className="text-white font-bold text-lg">
                                {(p.businessName || p.name).split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="text-base font-bold text-gray-900">{p.businessName || p.name}</h3>
                                {p.isVerified ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                    Not Verified
                                  </span>
                                )}
                                {p.categories && p.categories.split(",").map((cat: string) => (
                                  <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700">
                                    {catIcon(cat)} {catLabel(cat)}
                                  </span>
                                ))}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{p.name}</span>
                                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{p.phone}</span>
                                {p.governorate && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{p.governorate}</span>}
                                {p.whatsappNumber && <span className="flex items-center gap-1">WA: {p.whatsappNumber}</span>}
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(p.createdAt)}</span>
                              </div>
                              {p.description && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{p.description}</p>}
                              <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                {p.basePrice > 0 && <span>Base price: {p.basePrice} KWD</span>}
                                <span className="font-medium text-cyan-600">{provProducts.length} products</span>
                                <span className="font-medium text-purple-600">{provBookings.length} bookings</span>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => setExpandedProvider(isExpanded ? null : p.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-all ${isExpanded ? "text-cyan-700 bg-cyan-50" : "text-gray-600 bg-gray-50 hover:bg-gray-100"}`}
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                {isExpanded ? "Close" : "Details"}
                              </button>
                              <button
                                onClick={() => setEditProvider({ ...p })}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all"
                              >
                                <Pencil className="w-4 h-4" /> Edit
                              </button>
                            </div>
                          </div>
                          </div>

                          {/* Expanded: Products & Bookings */}
                          {isExpanded && (
                            <div className="border-t border-gray-100 bg-gray-50/50">
                              {/* Products Section */}
                              <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-cyan-600" />
                                    Products ({provProducts.length})
                                  </h4>
                                  <button
                                    onClick={() => { setAddProductModal({ userId: p.id, businessName: p.businessName || p.name }); setNewProduct({ title: "", description: "", category: p.categories?.split(",")[0] || "pool", price: "" }); }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-all"
                                  >
                                    + Add Product
                                  </button>
                                </div>
                                {provProducts.length === 0 ? (
                                  <p className="text-xs text-gray-400 italic">No products added yet.</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {provProducts.map((prod) => (
                                      <div key={prod.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-start gap-3">
                                        {prod.image ? (
                                          <img src={prod.image} alt={prod.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                                        ) : (
                                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                            <Package className="w-5 h-5 text-gray-400" />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <h5 className="text-sm font-semibold text-gray-900 truncate">{prod.title}</h5>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded-full">{prod.category}</span>
                                            {prod.price && <span className="text-xs font-medium text-gray-600">{prod.price} KWD</span>}
                                          </div>
                                          {prod.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{prod.description}</p>}
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                          <button onClick={() => setEditProviderProduct({ ...prod })}
                                            className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-all" title="Edit">
                                            <Pencil className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => {
                                            if (confirm(`Delete "${prod.title}"?`)) adminAction("deleteProduct", prod.id, "");
                                          }}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Bookings Section */}
                              <div className="p-5 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                  <CalendarCheck className="w-4 h-4 text-purple-600" />
                                  Bookings ({provBookings.length})
                                </h4>
                                {provBookings.length === 0 ? (
                                  <p className="text-xs text-gray-400 italic">No bookings yet.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {provBookings.map((bk) => (
                                      <div key={bk.id} className="bg-white rounded-xl border border-gray-100 p-3">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-gray-400">#{bk.id}</span>
                                            {statusBadge(bk.status)}
                                            <span className="text-sm font-medium text-gray-900">{bk.serviceName}</span>
                                          </div>
                                          <div className="flex gap-1.5">
                                            {bk.status !== "confirmed" && (
                                              <button onClick={() => adminAction("updateBookingStatus", bk.id, "confirmed")} className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">Confirm</button>
                                            )}
                                            {bk.status !== "completed" && (
                                              <button onClick={() => adminAction("updateBookingStatus", bk.id, "completed")} className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100">Complete</button>
                                            )}
                                            {bk.status !== "rejected" && (
                                              <button onClick={() => adminAction("updateBookingStatus", bk.id, "rejected")} className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100">Reject</button>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                                          <span><Users className="w-3 h-3 inline -mt-0.5 me-0.5" />{bk.customerName}</span>
                                          <span><Phone className="w-3 h-3 inline -mt-0.5 me-0.5" />{bk.customerPhone}</span>
                                          {bk.preferredDate && <span><Clock className="w-3 h-3 inline -mt-0.5 me-0.5" />{bk.preferredDate}</span>}
                                        </div>
                                        {bk.notes && <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded-lg p-2">{bk.notes}</p>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Hardcoded Providers (read-only) */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Store className="w-5 h-5 text-teal-600" />
                    Demo Providers ({hardcodedProviders.length})
                    <span className="text-xs font-normal text-gray-400 ml-1">(hardcoded - read only)</span>
                  </h3>
                  <div className="space-y-4">
                    {hardcodedProviders.map((p) => {
                      const providerServices = services.filter((s) => s.providerId === p.id);
                      return (
                        <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shrink-0">
                              <span className="text-white font-bold text-lg">
                                {p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="text-base font-bold text-gray-900">{p.name}</h3>
                                {p.isVerified && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700">
                                  {catIcon(p.category)} {catLabel(p.category)}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{p.location}</span>
                                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" />{p.rating} ({p.reviewCount} reviews)</span>
                                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{p.whatsappNumber}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description}</p>
                              <div className="border-t border-gray-100 pt-3">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Services ({providerServices.length})</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {providerServices.map((svc) => (
                                    <div key={svc.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                      <span className="text-sm text-gray-700 truncate">{svc.name}</span>
                                      <span className="text-xs font-medium text-cyan-700 shrink-0 ms-2">{svc.priceDisplay}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
                                <span>{p.yearsInBusiness} years in business</span>
                                <span>{p.completedJobs} jobs completed</span>
                                <span>Base price: {p.basePrice} KWD</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Registrations Tab */}
            {tab === "registrations" && (
              <div className="space-y-4">
                <div className="text-sm text-gray-500 mb-2">{registrations.length} registrations total</div>
                {registrations.map((reg) => (
                  <div key={reg.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-bold text-gray-900">{reg.businessName}</h3>
                          {statusBadge(reg.status)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{reg.ownerName}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{reg.phone}</span>
                          <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{reg.governorate}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <span className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-medium">{reg.category}</span>
                          <span><Clock className="w-3 h-3 inline -mt-0.5 me-1" />{formatDate(reg.createdAt)}</span>
                        </div>
                        {reg.description && <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">{reg.description}</p>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {reg.status !== "approved" && (
                          <button onClick={() => adminAction("updateRegistration", reg.id, "approved")} className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100">
                            <CheckCircle2 className="w-3.5 h-3.5 inline -mt-0.5 me-1" />Approve
                          </button>
                        )}
                        {reg.status !== "rejected" && (
                          <button onClick={() => adminAction("updateRegistration", reg.id, "rejected")} className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100">
                            <XCircle className="w-3.5 h-3.5 inline -mt-0.5 me-1" />Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {registrations.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <p className="text-gray-500">No registrations found.</p>
                  </div>
                )}
              </div>
            )}

            {/* Products tab removed — products are now shown under each provider */}
          </>
        )}
      </div>

      {/* Password Reset Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Reset Password</h3>
            <p className="text-sm text-gray-500 mb-4">Set new password for <strong>{passwordModal.name}</strong></p>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (newPassword.length < 6) { alert("Password must be at least 6 characters"); return; }
                  await adminAction("resetPassword", passwordModal.id, newPassword);
                  setPasswordModal(null);
                  alert("Password reset successfully!");
                }}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all"
              >
                Reset Password
              </button>
              <button
                onClick={() => setPasswordModal(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Provider Modal */}
      {editProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Provider</h3>
              <button onClick={() => setEditProvider(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Business Name</label>
                <input type="text" value={editProvider.businessName} onChange={(e) => setEditProvider({ ...editProvider, businessName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea value={editProvider.description} onChange={(e) => setEditProvider({ ...editProvider, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {["pool", "fountain", "fish"].map((cat) => {
                      const selected = (editProvider.categories || "").split(",").includes(cat);
                      return (
                        <button key={cat} type="button" onClick={() => {
                          const cats = (editProvider.categories || "").split(",").filter(Boolean);
                          const newCats = selected ? cats.filter(c => c !== cat) : [...cats, cat];
                          setEditProvider({ ...editProvider, categories: newCats.join(",") });
                        }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${selected ? "bg-cyan-50 border-cyan-300 text-cyan-700" : "bg-white border-gray-200 text-gray-500"}`}>
                          {catLabel(cat)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Governorate</label>
                  <select value={editProvider.governorate} onChange={(e) => setEditProvider({ ...editProvider, governorate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
                    <option value="">Select...</option>
                    {["Hawalli", "Capital", "Farwaniya", "Ahmadi", "Jahra", "Mubarak Al-Kabeer"].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                  <input type="text" value={editProvider.location} onChange={(e) => setEditProvider({ ...editProvider, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Salmiya, Hawalli" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">WhatsApp Number</label>
                  <input type="text" value={editProvider.whatsappNumber} onChange={(e) => setEditProvider({ ...editProvider, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="96512345678" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Base Price (KWD)</label>
                  <input type="number" value={editProvider.basePrice} onChange={(e) => setEditProvider({ ...editProvider, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!editProvider.isVerified} onChange={(e) => setEditProvider({ ...editProvider, isVerified: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <span className="text-sm font-medium text-gray-700">Verified</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  await adminActionObj({
                    action: "updateProvider",
                    id: editProvider.id,
                    businessName: editProvider.businessName,
                    description: editProvider.description,
                    categories: editProvider.categories,
                    governorate: editProvider.governorate,
                    location: editProvider.location,
                    whatsappNumber: editProvider.whatsappNumber,
                    basePrice: editProvider.basePrice,
                    isVerified: !!editProvider.isVerified,
                  });
                  setEditProvider(null);
                  alert("Provider updated!");
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
              <button onClick={() => setEditProvider(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Provider Product Modal (from providers tab) */}
      {editProviderProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Product</h3>
              <button onClick={() => setEditProviderProduct(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                <input type="text" value={editProviderProduct.title} onChange={(e) => setEditProviderProduct({ ...editProviderProduct, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea value={editProviderProduct.description} onChange={(e) => setEditProviderProduct({ ...editProviderProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <select value={editProviderProduct.category} onChange={(e) => setEditProviderProduct({ ...editProviderProduct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
                    <option value="pool">Pools</option>
                    <option value="fountain">Fountains</option>
                    <option value="fish">Fish Pools</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price (KWD)</label>
                  <input type="text" value={editProviderProduct.price} onChange={(e) => setEditProviderProduct({ ...editProviderProduct, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  await adminActionObj({
                    action: "updateProduct",
                    id: editProviderProduct.id,
                    title: editProviderProduct.title,
                    description: editProviderProduct.description,
                    category: editProviderProduct.category,
                    price: editProviderProduct.price,
                  });
                  setEditProviderProduct(null);
                  alert("Product updated!");
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all"
              >
                <Save className="w-4 h-4" /> Save
              </button>
              <button onClick={() => setEditProviderProduct(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {addProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Product</h3>
                <p className="text-xs text-gray-500">For: {addProductModal.businessName}</p>
              </div>
              <button onClick={() => setAddProductModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Title *</label>
                <input type="text" value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Product name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" rows={3}
                  placeholder="Product description" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category *</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
                    <option value="pool">Pools</option>
                    <option value="fountain">Fountains</option>
                    <option value="fish">Fish Pools</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price (KWD)</label>
                  <input type="text" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 50" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  if (!newProduct.title.trim()) { alert("Title is required"); return; }
                  await adminActionObj({
                    action: "addProduct",
                    id: addProductModal.userId,
                    title: newProduct.title,
                    description: newProduct.description,
                    category: newProduct.category,
                    price: newProduct.price,
                  });
                  setAddProductModal(null);
                  alert("Product added!");
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 transition-all"
              >
                <Package className="w-4 h-4" /> Add Product
              </button>
              <button onClick={() => setAddProductModal(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
