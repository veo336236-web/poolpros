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
} from "lucide-react";

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

type Tab = "stats" | "users" | "bookings" | "registrations";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("stats");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [roleDropdown, setRoleDropdown] = useState<number | null>(null);

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

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "stats", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
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
                        {/* Role dropdown */}
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
                          onClick={() => {
                            if (confirm(`Delete user "${u.name}"? This will remove all their data.`)) {
                              adminAction("deleteUser", u.id, "");
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
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
          </>
        )}
      </div>
    </div>
  );
}
