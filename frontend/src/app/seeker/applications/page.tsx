"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { CommunicationModal } from "@/components/features/applications/CommunicationModal";

interface Application {
  id: string;
  status: string;
  matchScore: number | null;
  createdAt: string;
  job: { id: string; title: string; company: string; location: string; type: string };
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  APPLIED: { color: "text-foreground bg-secondary border-border", label: "Applied" },
  SHORTLISTED: { color: "text-green-600 bg-green-50 border-green-300 dark:bg-green-900/20 dark:text-green-400", label: "Shortlisted" },
  REJECTED: { color: "text-rose-600 bg-rose-50 border-rose-300 dark:bg-rose-900/20 dark:text-rose-400", label: "Rejected" },
  INTERVIEWING: { color: "text-blue-600 bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400", label: "Interviewing" },
  OFFER: { color: "text-emerald-600 bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-400", label: "Offer" },
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "SHORTLISTED" || status === "OFFER") return <CheckCircle2 className="w-4 h-4" />;
  if (status === "REJECTED") return <XCircle className="w-4 h-4" />;
  if (status === "INTERVIEWING") return <Clock className="w-4 h-4" />;
  return <FileText className="w-4 h-4 text-muted-foreground" />;
};

const FILTERS = ["All", "APPLIED", "SHORTLISTED", "INTERVIEWING", "REJECTED", "OFFER"];
const FILTER_LABELS: Record<string, string> = {
  "All": "All",
  "APPLIED": "Applied",
  "SHORTLISTED": "Shortlisted",
  "INTERVIEWING": "Interviewing",
  "REJECTED": "Rejected",
  "OFFER": "Offer",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isCommsOpen, setIsCommsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then(setApplications)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = filter === "All" ? applications : applications.filter((a) => a.status === filter);

  return (
    <DashboardLayout role="seeker">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-6 border-b-2 border-border gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">My Applications</h1>
            <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-2">
              {isLoading ? "Loading..." : `${applications.length} total application${applications.length !== 1 ? "s" : ""} tracked`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 border-2 font-bold text-xs uppercase tracking-widest transition-colors ${
                  filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground hover:bg-secondary"
                }`}>
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !filtered.length ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-bold text-muted-foreground uppercase tracking-widest text-sm">
                {filter === "All" ? "No applications yet. Browse jobs and apply!" : `No ${FILTER_LABELS[filter].toLowerCase()} applications.`}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50 border-b-2 border-border">
                  <th className="text-left p-4 font-black text-xs uppercase tracking-widest text-muted-foreground">Company</th>
                  <th className="text-left p-4 font-black text-xs uppercase tracking-widest text-muted-foreground">Role</th>
                  <th className="text-left p-4 font-black text-xs uppercase tracking-widest text-muted-foreground hidden md:table-cell">Date Applied</th>
                  <th className="text-left p-4 font-black text-xs uppercase tracking-widest text-muted-foreground hidden lg:table-cell">AI Score</th>
                  <th className="text-left p-4 font-black text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app, idx) => {
                  const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG["APPLIED"];
                  return (
                    <motion.tr key={app.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.3 }}
                      className="border-b-2 border-border last:border-b-0 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-secondary border-2 border-border flex items-center justify-center font-black text-sm shrink-0">
                            {app.job.company[0]}
                          </div>
                          <span className="font-black text-sm text-foreground">{app.job.company}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-sm text-foreground">{app.job.title}</td>
                      <td className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-widest hidden md:table-cell">
                        {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {app.matchScore !== null ? (
                          <span className="font-black text-sm text-primary">{Math.round(app.matchScore)}%</span>
                        ) : (
                          <span className="font-bold text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 font-bold text-xs uppercase tracking-widest ${cfg.color}`}>
                              <StatusIcon status={app.status} /> {cfg.label}
                            </span>
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedApp(app);
                                setIsCommsOpen(true);
                              }}
                              className="rounded-none border-2 border-border hover:border-foreground h-8 w-8 p-0"
                            >
                              <MessageSquare className="w-4 h-4 text-primary" />
                            </Button>
                          </div>
                          {app.status === "INTERVIEWING" && (
                            <Button 
                              onClick={() => window.location.href = `/seeker/interview?jobId=${app.job.id}`}
                              className="bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest h-8 px-4 rounded-none border-2 border-transparent hover:border-foreground"
                            >
                              Start Interview
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {selectedApp && (
          <CommunicationModal 
            isOpen={isCommsOpen}
            onClose={() => setIsCommsOpen(false)}
            applicationId={selectedApp.id}
            seekerName={selectedApp.job.company} // For seeker, show company name
            jobTitle={selectedApp.job.title}
            userRole="SEEKER"
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
}
