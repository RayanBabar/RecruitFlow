"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import {
  BarChart3, TrendingUp, Eye, Send, Clock, Target,
  Sparkles, ArrowRight, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

interface AnalyticsData {
  stats: {
    totalViews: number;
    totalApplications: number;
    avgTimeToHire: number | null;
    offerAcceptRate: number;
  };
  topJobs: {
    id: string;
    title: string;
    applicants: number;
    views: number;
    avgMatch: number | null;
    status: string;
  }[];
}

const STAT_CARDS = (data: AnalyticsData["stats"]) => [
  {
    title: "Total Job Views",
    value: data.totalViews.toLocaleString(),
    icon: <Eye className="w-6 h-6" />,
    sub: "Across all active listings",
    accent: false,
  },
  {
    title: "Total Applications",
    value: data.totalApplications.toLocaleString(),
    icon: <Send className="w-6 h-6" />,
    sub: "All time submissions",
    accent: false,
  },
  {
    title: "Avg. Time to Hire",
    value: data.avgTimeToHire !== null ? `${data.avgTimeToHire}d` : "N/A",
    icon: <Clock className="w-6 h-6" />,
    sub: data.avgTimeToHire !== null ? "From posting to offer" : "No offers yet",
    accent: false,
  },
  {
    title: "Offer Accept Rate",
    value: `${data.offerAcceptRate}%`,
    icon: <Target className="w-6 h-6" />,
    sub: "Offers made vs applications",
    accent: true,
  },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/employer")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <DashboardLayout role="employer">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-10"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Analytics</h1>
          <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs mt-2">
            {isLoading ? "Crunching your recruitment data..." : "Live performance overview across all your job listings."}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? [0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-card border-2 border-border p-6 animate-pulse h-36 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
              ))
            : data && STAT_CARDS(data.stats).map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`border-2 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
                    card.accent
                      ? "bg-primary text-primary-foreground border-foreground"
                      : "bg-card text-foreground border-border"
                  }`}
                >
                  <div className={`mb-4 ${card.accent ? "text-primary-foreground/80" : "text-primary"}`}>
                    {card.icon}
                  </div>
                  <p className={`font-bold text-xs uppercase tracking-widest mb-1 ${card.accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {card.title}
                  </p>
                  <h3 className="text-4xl font-black tracking-tighter">{card.value}</h3>
                  <p className={`mt-2 font-bold text-[10px] uppercase tracking-widest ${card.accent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {card.sub}
                  </p>
                </motion.div>
              ))}
        </div>

        {/* Application Funnel */}
        {!isLoading && data && data.stats.totalApplications > 0 && (
          <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tighter mb-8">Application Funnel</h2>
            <div className="space-y-5">
              {[
                { label: "Applications Received", pct: 100, count: data.stats.totalApplications, color: "bg-foreground" },
                { label: "Offer Conversion", pct: data.stats.offerAcceptRate, count: Math.round(data.stats.totalApplications * (data.stats.offerAcceptRate / 100)), color: "bg-primary" },
              ].map((stage) => (
                <div key={stage.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-xs uppercase tracking-widest text-muted-foreground">{stage.label}</span>
                    <span className="font-black text-sm text-foreground">{stage.count}</span>
                  </div>
                  <div className="h-5 bg-secondary border-2 border-border overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full ${stage.color} border-r-2 border-border`}
                    />
                  </div>
                  <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest mt-1 block">{stage.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Performing Jobs */}
        <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
          <div className="px-6 py-5 border-b-2 border-border bg-secondary/50 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">Job Performance</h2>
          </div>

          {isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !data?.topJobs?.length ? (
            <div className="p-12 text-center space-y-4">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="font-bold text-muted-foreground uppercase tracking-widest text-sm">No jobs posted yet.</p>
              <Link href="/employer/post-job" className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-primary hover:underline">
                Post your first job <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted border-b-2 border-border">
                    <th className="text-left p-4 font-black text-xs uppercase tracking-widest text-foreground border-r-2 border-border">Job Title</th>
                    <th className="text-center p-4 font-black text-xs uppercase tracking-widest text-foreground border-r-2 border-border">Applicants</th>
                    <th className="text-center p-4 font-black text-xs uppercase tracking-widest text-foreground border-r-2 border-border">AI Match Avg</th>
                    <th className="text-center p-4 font-black text-xs uppercase tracking-widest text-foreground border-r-2 border-border">Status</th>
                    <th className="text-right p-4 font-black text-xs uppercase tracking-widest text-foreground">Pipeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-border">
                  {data.topJobs.map((job, idx) => (
                    <motion.tr
                      key={job.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="hover:bg-secondary/40 transition-colors group"
                    >
                      <td className="p-4 border-r-2 border-border">
                        <p className="font-black text-sm text-foreground">{job.title}</p>
                      </td>
                      <td className="p-4 text-center border-r-2 border-border">
                        <span className="font-black text-lg text-foreground">{job.applicants}</span>
                      </td>
                      <td className="p-4 text-center border-r-2 border-border">
                        {job.avgMatch !== null ? (
                          <div className="flex items-center gap-2 justify-center">
                            <Sparkles className="w-3 h-3 text-primary" />
                            <span className="font-black text-sm text-primary">{job.avgMatch}%</span>
                          </div>
                        ) : (
                          <span className="font-bold text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center border-r-2 border-border">
                        <span className={`inline-block px-3 py-1 border-2 font-bold text-xs uppercase tracking-widest ${
                          job.status === "OPEN"
                            ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-secondary text-muted-foreground border-border"
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/employer/pipeline?jobId=${job.id}`}
                          className="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-widest text-primary hover:underline decoration-2 underline-offset-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Empty state for zero activity */}
        {!isLoading && data && data.stats.totalApplications === 0 && (
          <div className="bg-secondary/20 border-2 border-dashed border-border p-12 text-center space-y-4">
            <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto" />
            <p className="font-black text-xl text-foreground uppercase tracking-tighter">No Data Yet</p>
            <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs max-w-md mx-auto">
              Your analytics will populate once you have active jobs with applicants. Post a job to get started.
            </p>
            <Link href="/employer/post-job">
              <div className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-primary mt-4 hover:underline">
                Post a Job <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
