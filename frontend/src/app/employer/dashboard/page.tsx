"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Download, Briefcase, Users, Timer,
  TrendingUp, TrendingDown, Filter, MoreVertical, ArrowRight, PlusCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  stats: { activeListings: number; totalApplicants: number; shortlisted: number };
  activeJobs: { id: string; title: string; company: string; type: string; location: string; date: string; applicants: number; status: string }[];
}

export default function EmployerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/employer")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const stats = data
    ? [
        { title: "Active Listings", value: String(data.stats.activeListings), icon: "work", trend: "", trendUp: true },
        { title: "Total Applicants", value: String(data.stats.totalApplicants), icon: "group", trend: "", trendUp: true },
        { title: "Shortlisted", value: String(data.stats.shortlisted), icon: "timer", trend: "", trendUp: true },
      ]
    : [];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "work": return <Briefcase className="w-6 h-6" />;
      case "group": return <Users className="w-6 h-6" />;
      default: return <Timer className="w-6 h-6" />;
    }
  };

  return (
    <DashboardLayout role="employer">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter">Overview</h2>
            <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs mt-2">
              {isLoading ? "Loading your hiring pipeline..." : "Here's what's happening with your hiring pipeline today."}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/employer/post-job">
              <Button className="rounded-none border-2 border-transparent hover:border-foreground font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                <PlusCircle className="w-4 h-4" /> Post Job
              </Button>
            </Link>
            <Button variant="outline" className="rounded-none border-2 border-border font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-secondary">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading
            ? [0, 1, 2].map((i) => (
                <div key={i} className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] animate-pulse h-36" />
              ))
            : stats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-primary flex items-center justify-center text-primary-foreground border-2 border-border">
                      {getIcon(stat.icon)}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 border-2 border-border bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      <TrendingUp className="w-3 h-3" /> Live
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{stat.title}</p>
                  <h3 className="text-4xl font-black tracking-tighter text-foreground">{stat.value}</h3>
                </motion.div>
              ))}
        </div>

        {/* Active Postings Table */}
        <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
          <div className="px-6 py-5 border-b-2 border-border flex justify-between items-center bg-secondary/50">
            <h3 className="text-xl font-bold uppercase tracking-wider text-foreground">Active Job Postings</h3>
            <div className="flex gap-2">
              <button className="p-2 text-muted-foreground hover:text-foreground border-2 border-transparent hover:border-border transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : !data?.activeJobs?.length ? (
            <div className="p-12 text-center space-y-4">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="font-bold text-muted-foreground uppercase tracking-widest text-sm">No jobs posted yet.</p>
              <Link href="/employer/post-job">
                <Button className="rounded-none font-bold uppercase tracking-widest text-xs">Post Your First Job</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-muted border-b-2 border-border">
                    <th className="px-6 py-4 text-xs font-bold text-foreground uppercase tracking-widest border-r-2 border-border">Job Title</th>
                    <th className="px-6 py-4 text-xs font-bold text-foreground uppercase tracking-widest border-r-2 border-border">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-foreground uppercase tracking-widest border-r-2 border-border">Posted</th>
                    <th className="px-6 py-4 text-xs font-bold text-foreground uppercase tracking-widest text-center border-r-2 border-border">Applicants</th>
                    <th className="px-6 py-4 text-xs font-bold text-foreground uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-border bg-card">
                  {data.activeJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-secondary/50 transition-colors group">
                      <td className="px-6 py-4 border-r-2 border-border">
                        <div className="font-bold text-foreground">{job.title}</div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{job.location}</div>
                      </td>
                      <td className="px-6 py-4 border-r-2 border-border">
                        <span className="inline-flex items-center px-3 py-1 font-bold text-xs uppercase tracking-widest bg-secondary border-2 border-border text-foreground">{job.type}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-muted-foreground border-r-2 border-border">{job.date}</td>
                      <td className="px-6 py-4 text-center border-r-2 border-border">
                        <span className="font-bold text-lg text-foreground">{job.applicants}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/employer/pipeline?jobId=${job.id}`}
                          className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-xs text-primary hover:text-foreground transition-colors group-hover:underline decoration-2 underline-offset-4">
                          View Pipeline <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
