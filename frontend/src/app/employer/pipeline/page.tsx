"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import {
  ChevronRight, TrendingUp, Sparkles,
  Search, ArrowRight, Loader2, Users, CheckCircle2, MessageSquare, X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CommunicationModal } from "@/components/features/applications/CommunicationModal";

interface Application {
  id: string;
  status: string;
  matchScore: number | null;
  aiFeedback: string | null;
  createdAt: string;
  seeker: {
    id: string;
    name: string;
    email: string;
    profile?: { skills?: string; experience?: string } | null;
  };
  job: { id: string; title: string; company: string; location: string; type: string };
}

interface JobInfo {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: string;
  createdAt: string;
  _count: { applications: number };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bar: string }> = {
  APPLIED:      { label: "Applied",      color: "bg-secondary text-foreground border-border",                                                   bar: "bg-muted-foreground" },
  SHORTLISTED:  { label: "Shortlisted",  color: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400",        bar: "bg-green-500" },
  INTERVIEWING: { label: "Interviewing", color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400",            bar: "bg-blue-500" },
  OFFER:        { label: "Offer",        color: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-400", bar: "bg-emerald-500" },
  REJECTED:     { label: "Rejected",     color: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/20 dark:text-rose-400",             bar: "bg-rose-400" },
};

const ALL_STATUSES = ["All", "APPLIED", "SHORTLISTED", "INTERVIEWING", "OFFER", "REJECTED"];

const MATCH_BAR_COLOR = (score: number) => {
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-rose-400";
};

function PipelineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("jobId");

  const [applications, setApplications] = useState<Application[]>([]);
  const [job, setJob] = useState<JobInfo | null>(null);
  const [allJobs, setAllJobs] = useState<JobInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("AI Match");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isCommsOpen, setIsCommsOpen] = useState(false);

  // Load all employer jobs for the job selector
  useEffect(() => {
    fetch("/api/jobs?employerId=me")
      .then((r) => r.json())
      .then((jobs: JobInfo[]) => setAllJobs(Array.isArray(jobs) ? jobs : []))
      .catch(console.error);
  }, []);

  // Load applications for selected job (or all if none selected)
  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = jobId ? `/api/applications?jobId=${jobId}` : "/api/applications";
      const data = await fetch(url).then((r) => r.json());
      setApplications(Array.isArray(data) ? data : []);

      if (jobId) {
        const jobData = await fetch(`/api/jobs/${jobId}`).then((r) => r.json());
        setJob(jobData);
      } else {
        setJob(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    Promise.resolve().then(() => loadApplications());
  }, [loadApplications]);

  const updateStatus = async (applicationId: string, newStatus: string) => {
    setUpdatingId(applicationId);
    try {
      await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      // Optimistic update
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter + sort
  const filtered = applications
    .filter((a) => {
      if (statusFilter !== "All" && a.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return a.seeker.name.toLowerCase().includes(q) || a.seeker.email.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "AI Match") return (b.matchScore ?? -1) - (a.matchScore ?? -1);
      if (sortBy === "Newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "Name") return a.seeker.name.localeCompare(b.seeker.name);
      return 0;
    });

  const stats = {
    total: applications.length,
    shortlisted: applications.filter((a) => a.status === "SHORTLISTED").length,
    interviewing: applications.filter((a) => a.status === "INTERVIEWING").length,
    avgMatch:
      applications.filter((a) => a.matchScore !== null).length > 0
        ? Math.round(
            applications.filter((a) => a.matchScore !== null).reduce((s, a) => s + (a.matchScore ?? 0), 0) /
              applications.filter((a) => a.matchScore !== null).length
          )
        : null,
  };

  return (
    <DashboardLayout role="employer">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-6xl mx-auto space-y-8 pb-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">
              <Link href="/employer/dashboard" className="hover:text-primary transition-colors">Jobs</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">{job?.title ?? "All Applications"}</span>
            </div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter flex items-center gap-3">
              {job?.title ?? "Applicant Pipeline"}
              {job && (
                <span className="px-2.5 py-0.5 border-2 border-border bg-secondary text-foreground text-[10px] uppercase tracking-widest font-bold">
                  {job.status}
                </span>
              )}
            </h1>
            {job && (
              <p className="text-muted-foreground mt-1 font-bold text-xs uppercase tracking-widest">
                {job.location} • {job.type}
              </p>
            )}
          </div>

          {/* Job selector dropdown */}
          {allJobs.length > 0 && (
            <div className="flex gap-3 items-center">
              <select
                value={jobId ?? ""}
                onChange={(e) => router.push(e.target.value ? `/employer/pipeline?jobId=${e.target.value}` : "/employer/pipeline")}
                className="border-2 border-border bg-background text-foreground font-bold text-xs uppercase tracking-widest px-4 py-2 focus:outline-none focus:border-foreground rounded-none"
              >
                <option value="">All Jobs</option>
                {allJobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Applicants", value: isLoading ? "—" : String(stats.total), sub: null, accent: false },
            { label: "Shortlisted", value: isLoading ? "—" : String(stats.shortlisted), sub: stats.total > 0 ? `${Math.round((stats.shortlisted / stats.total) * 100)}% rate` : null, accent: false },
            { label: "Interviewing", value: isLoading ? "—" : String(stats.interviewing), sub: null, accent: false },
            { label: "AI Match Avg", value: isLoading ? "—" : stats.avgMatch !== null ? `${stats.avgMatch}%` : "N/A", sub: "Based on resume scores", accent: true },
          ].map((stat) => (
            <div key={stat.label} className={`border-2 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] relative overflow-hidden group ${stat.accent ? "bg-primary text-primary-foreground border-foreground" : "bg-card border-border"}`}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              <span className={`font-bold text-xs uppercase tracking-widest mb-2 block ${stat.accent ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{stat.label}</span>
              <span className="text-4xl font-black tracking-tighter">{stat.value}</span>
              {stat.sub && (
                <div className={`mt-2 font-bold text-xs uppercase tracking-widest flex items-center gap-1 ${stat.accent ? "text-primary-foreground" : "text-muted-foreground"}`}>
                  {stat.accent ? <Sparkles className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />} {stat.sub}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b-2 border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-secondary/50">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 bg-background border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground text-xs font-bold uppercase tracking-widest"
                placeholder="Search candidates..."
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-2 border-border bg-background text-foreground font-bold text-xs uppercase tracking-widest px-3 py-2 focus:outline-none focus:border-foreground rounded-none"
              >
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : STATUS_CONFIG[s]?.label ?? s}</option>)}
              </select>
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-2 border-border bg-background text-foreground font-bold text-xs uppercase tracking-widest px-3 py-2 focus:outline-none focus:border-foreground rounded-none"
              >
                {["AI Match", "Newest", "Name"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="p-16 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : !filtered.length ? (
            <div className="p-16 text-center space-y-4">
              <Users className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="font-bold text-muted-foreground uppercase tracking-widest text-sm">
                {applications.length === 0 ? "No applicants yet." : "No candidates match your filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b-2 border-border bg-muted">
                    <th className="py-4 px-6 font-bold text-xs text-foreground uppercase tracking-widest w-1/3 border-r-2 border-border">Candidate</th>
                    <th className="py-4 px-6 font-bold text-xs text-foreground uppercase tracking-widest border-r-2 border-border">Applied</th>
                    <th className="py-4 px-6 font-bold text-xs text-foreground uppercase tracking-widest w-1/4 border-r-2 border-border">AI Match</th>
                    <th className="py-4 px-6 font-bold text-xs text-foreground uppercase tracking-widest border-r-2 border-border">Status</th>
                    <th className="py-4 px-6 font-bold text-xs text-foreground uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-border">
                  <AnimatePresence initial={false}>
                    {filtered.map((app, idx) => {
                      const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG["APPLIED"];
                      const isUpdating = updatingId === app.id;
                      const initials = app.seeker.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                      const skills: string[] = app.seeker.profile?.skills
                        ? app.seeker.profile.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3)
                        : [];

                      return (
                        <motion.tr
                          key={app.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className={`hover:bg-secondary/50 transition-colors group ${app.status === "REJECTED" ? "opacity-60" : ""}`}
                        >
                          <td className="py-4 px-6 border-r-2 border-border">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 border-2 border-border bg-secondary flex items-center justify-center font-black text-foreground shrink-0 text-sm">{initials}</div>
                              <div>
                                <p className={`font-bold text-foreground ${app.status === "REJECTED" ? "line-through decoration-muted-foreground" : ""}`}>
                                  {app.seeker.name}
                                </p>
                                <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-0.5">{app.seeker.email}</p>
                                {skills.length > 0 && (
                                  <div className="flex gap-1 mt-1.5 flex-wrap">
                                    {skills.map((s) => (
                                      <span key={s} className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 font-bold text-[9px] uppercase tracking-widest">{s}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-bold text-sm text-muted-foreground border-r-2 border-border">
                            {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="py-4 px-6 border-r-2 border-border">
                            {app.matchScore !== null ? (
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-3 bg-secondary border-2 border-border overflow-hidden">
                                  <div className={`h-full border-r-2 border-border transition-all ${MATCH_BAR_COLOR(app.matchScore)}`} style={{ width: `${app.matchScore}%` }} />
                                </div>
                                <span className="font-black text-sm text-foreground w-10 text-right">{Math.round(app.matchScore)}%</span>
                              </div>
                            ) : (
                              <span className="font-bold text-xs text-muted-foreground uppercase tracking-widest">No score</span>
                            )}
                          </td>
                          <td className="py-4 px-6 border-r-2 border-border">
                            <span className={`inline-flex items-center px-3 py-1 border-2 font-bold text-xs uppercase tracking-widest ${cfg.color}`}>
                              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {app.status !== "SHORTLISTED" && app.status !== "REJECTED" && app.status !== "OFFER" && (
                                <button
                                  onClick={() => updateStatus(app.id, "SHORTLISTED")}
                                  disabled={isUpdating}
                                  title="Shortlist"
                                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 border-2 border-transparent hover:border-green-300 transition-colors"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              {app.status !== "INTERVIEWING" && app.status !== "REJECTED" && app.status !== "OFFER" && (
                                <button
                                  onClick={() => updateStatus(app.id, "INTERVIEWING")}
                                  disabled={isUpdating}
                                  title="Move to Interview"
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-transparent hover:border-blue-300 transition-colors"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedApp(app);
                                  setIsCommsOpen(true);
                                }}
                                title="Communication Hub"
                                className="p-1.5 text-foreground hover:bg-secondary border-2 border-transparent hover:border-border transition-colors"
                              >
                                <MessageSquare className="w-4 h-4 text-primary" />
                              </button>
                              {app.status !== "REJECTED" && (
                                <button
                                  onClick={() => updateStatus(app.id, "REJECTED")}
                                  disabled={isUpdating}
                                  title="Reject"
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 border-2 border-transparent hover:border-rose-300 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              <Link
                                href={`/employer/candidate/${app.id}`}
                                className="ml-1 p-1.5 text-muted-foreground hover:text-foreground border-2 border-transparent hover:border-border transition-colors"
                                title="View Full Profile"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {!isLoading && filtered.length > 0 && (
            <div className="p-4 border-t-2 border-border flex items-center justify-between bg-secondary/50">
              <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
                Showing {filtered.length} of {applications.length} candidates
              </span>
            </div>
          )}
        </div>

        {selectedApp && (
          <CommunicationModal 
            isOpen={isCommsOpen}
            onClose={() => setIsCommsOpen(false)}
            applicationId={selectedApp.id}
            seekerName={selectedApp.seeker.name}
            jobTitle={selectedApp.job.title}
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
}

export default function PipelinePage() {
  return (
    <Suspense fallback={
      <DashboardLayout role="employer">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    }>
      <PipelineContent />
    </Suspense>
  );
}
