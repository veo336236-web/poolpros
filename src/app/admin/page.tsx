"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Waves,
  Sparkles,
  Fish,
  RefreshCw,
} from "lucide-react";

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

export default function AdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/register");
      const data = await res.json();
      setRegistrations(data);
    } catch {
      console.error("Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/register", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const filtered =
    filter === "all"
      ? registrations
      : registrations.filter((r) => r.status === filter);

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case "pool":
        return <Waves className="w-4 h-4" />;
      case "fountain":
        return <Sparkles className="w-4 h-4" />;
      case "fish":
        return <Fish className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const categoryLabel = (cat: string) => {
    switch (cat) {
      case "pool":
        return "Swimming Pools";
      case "fountain":
        return "Fountains";
      case "fish":
        return "Fish Pools";
      default:
        return cat;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  const counts = {
    all: registrations.length,
    pending: registrations.filter((r) => r.status === "pending").length,
    approved: registrations.filter((r) => r.status === "approved").length,
    rejected: registrations.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="ltr">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage business registration requests
              </p>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {(
            [
              { key: "all", label: "Total", color: "bg-cyan-50 text-cyan-700" },
              { key: "pending", label: "Pending", color: "bg-amber-50 text-amber-700" },
              { key: "approved", label: "Approved", color: "bg-green-50 text-green-700" },
              { key: "rejected", label: "Rejected", color: "bg-red-50 text-red-700" },
            ] as const
          ).map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`rounded-2xl border p-4 text-center transition-all ${
                filter === s.key
                  ? "border-cyan-300 bg-white shadow-sm"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className="text-2xl font-extrabold text-gray-900">
                {counts[s.key]}
              </div>
              <div className={`text-xs font-medium mt-1 ${s.color} inline-flex px-2 py-0.5 rounded-full`}>
                {s.label}
              </div>
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500">No registrations found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((reg) => (
              <div
                key={reg.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {reg.businessName}
                      </h3>
                      {statusBadge(reg.status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {reg.ownerName}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {reg.phone}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {reg.governorate}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700">
                        {categoryIcon(reg.category)}
                        {categoryLabel(reg.category)}
                      </span>
                      <span className="text-xs text-gray-400">
                        <Clock className="w-3 h-3 inline -mt-0.5 me-1" />
                        {new Date(reg.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {reg.description && (
                      <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                        {reg.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    {reg.status !== "approved" && (
                      <button
                        onClick={() => updateStatus(reg.id, "approved")}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-xl hover:bg-green-100 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </button>
                    )}
                    {reg.status !== "rejected" && (
                      <button
                        onClick={() => updateStatus(reg.id, "rejected")}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    )}
                    {reg.status !== "pending" && (
                      <button
                        onClick={() => updateStatus(reg.id, "pending")}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 transition-all"
                      >
                        <Clock className="w-4 h-4" />
                        Pending
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
