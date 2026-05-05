"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { seekerDashboardData } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Send, Calendar, Eye, Plus, ArrowRight, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function SeekerDashboardPage() {
  const { user, stats, recentActivity } = seekerDashboardData;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "send": return <Send className="w-6 h-6" />;
      case "calendar_month": return <Calendar className="w-6 h-6" />;
      case "visibility": return <Eye className="w-6 h-6" />;
      default: return <Send className="w-6 h-6" />;
    }
  };

  const getStatusColor = (color: string) => {
    switch (color) {
      case "emerald": return "bg-green-500";
      case "amber": return "bg-amber-500";
      case "rose": return "bg-rose-500";
      case "slate": return "bg-slate-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <DashboardLayout role="seeker">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter">
              Welcome back, {user.name}
            </h2>
            <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs mt-2">
              Here is what&apos;s happening with your job search today.
            </p>
          </div>
          <Button className="rounded-none border-2 border-transparent hover:border-foreground font-bold uppercase tracking-widest text-xs flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Application
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-card border-2 border-border p-6 relative overflow-hidden group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] transition-all"
            >
              <div className="absolute right-0 top-0 w-24 h-24 bg-primary/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-300 pointer-events-none"></div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{stat.title}</p>
                  <h3 className="text-4xl font-black tracking-tighter text-foreground">{stat.value}</h3>
                </div>
                <div className="w-12 h-12 bg-secondary flex items-center justify-center text-foreground border-2 border-border">
                  {getIcon(stat.icon)}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider relative z-10">
                <span className={`inline-flex items-center px-2 py-1 border-2 border-border ${stat.trendUp ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-card text-foreground"}`}>
                  {stat.trend}
                </span>
                <span className="text-muted-foreground">{stat.trendText}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity Table Section */}
        <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
          <div className="px-6 py-5 border-b-2 border-border flex justify-between items-center bg-secondary/50">
            <h3 className="text-xl font-bold uppercase tracking-wider text-foreground">Recent Activity</h3>
            <button className="text-primary font-bold uppercase tracking-widest text-xs hover:text-foreground transition-colors flex items-center gap-1 hover:underline decoration-2 underline-offset-4">
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-muted border-b-2 border-border">
                  <th className="px-6 py-4 text-xs font-bold text-foreground uppercase tracking-widest border-r-2 border-border">Company</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground uppercase tracking-widest border-r-2 border-border">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground uppercase tracking-widest border-r-2 border-border">Date Applied</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground uppercase tracking-widest border-r-2 border-border">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-foreground uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-border bg-card">
                {recentActivity.map((activity, idx) => (
                  <tr key={idx} className="hover:bg-secondary/50 transition-colors group">
                    <td className="px-6 py-4 border-r-2 border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-secondary flex items-center justify-center border-2 border-border text-foreground font-black text-sm">
                          {activity.initial}
                        </div>
                        <span className="font-bold text-foreground uppercase tracking-wide">{activity.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-muted-foreground border-r-2 border-border">
                      {activity.role}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-muted-foreground border-r-2 border-border">
                      {activity.date}
                    </td>
                    <td className="px-6 py-4 border-r-2 border-border">
                      <span className="inline-flex items-center gap-2 px-3 py-1 font-bold text-xs uppercase tracking-widest bg-secondary border-2 border-border text-foreground">
                        <span className={`w-2 h-2 border border-black dark:border-white ${getStatusColor(activity.statusColor)}`}></span>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-muted-foreground hover:text-primary transition-colors p-1 border-2 border-transparent hover:border-border hover:bg-secondary opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
