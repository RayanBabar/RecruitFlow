"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Send, CalendarDays, Eye, TrendingUp, ArrowRight, CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  user: { name: string; email: string } | null;
  stats: { total: number; shortlisted: number; interviewing: number };
  recentActivity: { id: string; company: string; role: string; date: string; status: string; matchScore: number | null }[];
}

const STATUS_STYLES: Record<string, string> = {
  SHORTLISTED: "text-green-600 bg-green-50 border-green-300 dark:bg-green-900/20 dark:text-green-400",
  INTERVIEWING: "text-blue-600 bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400",
  APPLIED: "text-foreground bg-secondary border-border",
  REJECTED: "text-rose-600 bg-rose-50 border-rose-300 dark:bg-rose-900/20 dark:text-rose-400",
  OFFER: "text-emerald-600 bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-400",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "SHORTLISTED" || status === "OFFER") return <CheckCircle2 className="w-4 h-4" />;
  if (status === "REJECTED") return <XCircle className="w-4 h-4" />;
  if (status === "INTERVIEWING") return <Clock className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
};

export default function SeekerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/seeker")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const firstName = data?.user?.name?.split(" ")[0] ?? "there";

  const stats = data
    ? [
        { title: "Total Applications", value: data.stats.total, icon: <Send className="w-6 h-6" /> },
        { title: "Shortlisted", value: data.stats.shortlisted, icon: <CheckCircle2 className="w-6 h-6" /> },
        { title: "Interviewing", value: data.stats.interviewing, icon: <CalendarDays className="w-6 h-6" /> },
      ]
    : [];

  return (
    <DashboardLayout role="seeker">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter">
              {isLoading ? "Dashboard" : `Welcome, ${firstName}`}
            </h2>
            <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs mt-2">
              Track your applications and career progress.
            </p>
          </div>
          <Link href="/seeker/find-jobs">
            <Button className="rounded-none font-bold uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] border-2 border-transparent hover:border-foreground">
              Browse Jobs <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading
            ? [0, 1, 2].map((i) => (
                <div key={i} className="bg-card border-2 border-border p-6 animate-pulse h-36 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
              ))
            : stats.map((stat, i) => (
                <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <div className="w-12 h-12 bg-primary flex items-center justify-center text-primary-foreground border-2 border-border mb-4">
                    {stat.icon}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{stat.title}</p>
                  <h3 className="text-4xl font-black tracking-tighter text-foreground">{stat.value}</h3>
                </motion.div>
              ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
          <div className="px-6 py-5 border-b-2 border-border flex justify-between items-center bg-secondary/50">
            <h3 className="text-xl font-bold uppercase tracking-wider text-foreground">Recent Applications</h3>
            <Link href="/seeker/applications" className="font-bold uppercase tracking-widest text-xs text-primary hover:underline decoration-2 underline-offset-4 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : !data?.recentActivity?.length ? (
            <div className="p-12 text-center space-y-4">
              <Send className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="font-bold text-muted-foreground uppercase tracking-widest text-sm">No applications yet.</p>
              <Link href="/seeker/find-jobs">
                <Button className="rounded-none font-bold uppercase tracking-widest text-xs">Find Jobs to Apply</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y-2 divide-border">
              {data.recentActivity.map((app) => (
                <div key={app.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary border-2 border-border flex items-center justify-center font-black text-sm shrink-0">{app.company[0]}</div>
                    <div>
                      <p className="font-black text-sm text-foreground">{app.role}</p>
                      <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-0.5">{app.company} · {app.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {app.matchScore !== null && (
                      <span className="font-black text-sm text-primary">{Math.round(app.matchScore)}% match</span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 font-bold text-xs uppercase tracking-widest ${STATUS_STYLES[app.status] || STATUS_STYLES["APPLIED"]}`}>
                      <StatusIcon status={app.status} /> {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link href="/seeker/profile">
            <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group">
              <Eye className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-black text-lg uppercase tracking-tighter">Update Profile</h3>
              <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-2">Upload your resume and update your skills</p>
            </div>
          </Link>
          <Link href="/seeker/interview">
            <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group">
              <TrendingUp className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-black text-lg uppercase tracking-tighter">Practice Interview</h3>
              <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-2">Train with our AI HR & Technical agents</p>
            </div>
          </Link>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
