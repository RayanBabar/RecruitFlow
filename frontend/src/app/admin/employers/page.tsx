"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Clock, CheckCircle2, XCircle, RefreshCw, Users, LogOut } from "lucide-react";
import { EmployerVerificationCard } from "@/components/features/admin/EmployerVerificationCard";
import { signOut } from "next-auth/react";

interface EmployerProfile {
  id: string;
  companyName: string;
  companyWebsite: string | null;
  companyPhone: string | null;
  companyDescription: string | null;
  registrationNumber: string | null;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  adminNote: string | null;
  createdAt: string;
}

interface Employer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  employerProfile: EmployerProfile | null;
}

type Tab = "PENDING" | "APPROVED" | "REJECTED";

const TAB_CONFIG: { id: Tab; label: string; icon: React.ElementType; accent: string }[] = [
  { id: "PENDING", label: "Pending", icon: Clock, accent: "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10" },
  { id: "APPROVED", label: "Approved", icon: CheckCircle2, accent: "border-green-500 text-green-600 dark:text-green-400 bg-green-500/10" },
  { id: "REJECTED", label: "Rejected", icon: XCircle, accent: "border-destructive text-destructive bg-destructive/10" },
];

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("PENDING");

  const fetchEmployers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/employers");
      const data = await res.json();
      setEmployers(Array.isArray(data) ? data : []);
    } catch {
      setEmployers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployers();
  }, [fetchEmployers]);

  const handleAction = async (userId: string, status: "APPROVED" | "REJECTED", note?: string) => {
    await fetch(`/api/admin/employers/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationStatus: status, adminNote: note }),
    });
    await fetchEmployers();
  };

  const filteredEmployers = employers.filter(
    (e) => (e.employerProfile?.verificationStatus ?? "PENDING") === activeTab
  );

  const counts: Record<Tab, number> = {
    PENDING: employers.filter((e) => (e.employerProfile?.verificationStatus ?? "PENDING") === "PENDING").length,
    APPROVED: employers.filter((e) => e.employerProfile?.verificationStatus === "APPROVED").length,
    REJECTED: employers.filter((e) => e.employerProfile?.verificationStatus === "REJECTED").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b-2 border-border bg-card px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-transparent">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground uppercase tracking-tighter">Admin Panel</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">RecruitFlow — Employer Verification</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchEmployers}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border-2 border-border hover:border-foreground hover:bg-secondary transition-colors font-bold text-xs uppercase tracking-widest text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-4 py-2 border-2 border-destructive bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {TAB_CONFIG.map(({ id, label, icon: Icon, accent }) => (
            <div key={id} className="bg-card border-2 border-border p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
              </div>
              <p className="text-4xl font-black text-foreground tracking-tighter">{counts[id]}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-border">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3 font-bold text-xs uppercase tracking-widest border-b-4 transition-colors ${
                activeTab === id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {counts[id] > 0 && (
                <span className={`px-1.5 py-0.5 text-[10px] font-black border-2 ${
                  id === "PENDING" ? "border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-500/20" :
                  id === "APPROVED" ? "border-green-500 text-green-700 dark:text-green-400 bg-green-500/20" :
                  "border-destructive text-destructive bg-destructive/10"
                }`}>
                  {counts[id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredEmployers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 space-y-3"
          >
            <Users className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="font-bold text-muted-foreground uppercase tracking-widest text-sm">
              No {activeTab.toLowerCase()} employers
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {filteredEmployers.map((employer) => (
                <EmployerVerificationCard
                  key={employer.id}
                  employer={employer}
                  onAction={handleAction}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
