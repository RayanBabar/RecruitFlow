"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { TrendingUp, Users, Clock, Target } from "lucide-react";

const stats = [
  { label: "Total Views", value: "12,847", trend: "+18%", trendUp: true, icon: TrendingUp },
  { label: "Applications", value: "1,482", trend: "+8%", trendUp: true, icon: Users },
  { label: "Avg Time-to-Hire", value: "18 Days", trend: "−3 days", trendUp: true, icon: Clock },
  { label: "Offer Accept Rate", value: "84%", trend: "+5%", trendUp: true, icon: Target },
];

const topJobs = [
  { title: "Senior Frontend Engineer", applicants: 124, views: 3240, conversion: "3.8%" },
  { title: "Product Design Lead", applicants: 86, views: 2100, conversion: "4.1%" },
  { title: "Marketing Manager", applicants: 215, views: 4800, conversion: "4.5%" },
  { title: "Data Scientist", applicants: 42, views: 1200, conversion: "3.5%" },
];

export default function AnalyticsPage() {
  return (
    <DashboardLayout role="employer">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
        <div className="pb-6 border-b-2 border-border">
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Analytics</h1>
          <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-2">Performance overview for the last 30 days</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
              <div className="flex justify-between items-start mb-4">
                <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <stat.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-4xl font-black text-foreground tracking-tighter">{stat.value}</p>
              <p className={`font-bold text-xs uppercase tracking-widest mt-2 ${stat.trendUp ? "text-green-600 dark:text-green-400" : "text-rose-600"}`}>
                {stat.trend} vs last month
              </p>
            </motion.div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <h2 className="text-xl font-black text-foreground uppercase tracking-tighter mb-6">Application Volume (30 Days)</h2>
          <div className="h-48 flex items-end gap-2">
            {[40, 60, 45, 80, 55, 90, 70, 85, 65, 95, 75, 100, 60, 80, 55, 70, 85, 90, 65, 75, 88, 72, 94, 80, 68, 78, 92, 85, 70, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/20 hover:bg-primary transition-colors relative group" style={{ height: `${h}%` }}>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-foreground text-background text-[10px] font-black px-1 py-0.5 whitespace-nowrap">
                  {h}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Oct 1</span>
            <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Oct 30</span>
          </div>
        </div>

        {/* Top Jobs Table */}
        <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
          <div className="p-6 border-b-2 border-border bg-secondary/50">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">Top Performing Jobs</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border">
                {["Job Title", "Applicants", "Views", "Conversion"].map(h => (
                  <th key={h} className="text-left p-4 font-black text-xs uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topJobs.map((job, idx) => (
                <tr key={idx} className="border-b-2 border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4 font-black text-sm text-foreground">{job.title}</td>
                  <td className="p-4 font-bold text-sm text-foreground">{job.applicants}</td>
                  <td className="p-4 font-bold text-sm text-foreground">{job.views.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-2 border-green-300 px-3 py-1 font-bold text-xs uppercase tracking-widest">
                      {job.conversion}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
