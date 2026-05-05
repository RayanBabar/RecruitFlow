"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { findJobsData } from "@/data/mockData";
import { DollarSign, Clock, Bookmark, Flame, ThumbsUp, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function FindJobsPage() {
  const { jobs } = findJobsData;
  const [sortBy, setSortBy] = useState("Best Match");

  const getMatchStyle = (level: string) => {
    if (level === "high") return { badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-300", icon: <Flame className="w-3 h-3" /> };
    return { badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 border-amber-300", icon: <ThumbsUp className="w-3 h-3" /> };
  };

  return (
    <DashboardLayout role="seeker">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-60 shrink-0">
          <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6 space-y-8 sticky top-24">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <h3 className="font-black text-xs uppercase tracking-widest">Filters</h3>
            </div>
            {[{ label: "Job Type", opts: ["Full-time", "Contract", "Part-time"], checked: [0] }, { label: "Work Mode", opts: ["Remote", "Hybrid", "On-site"], checked: [0, 1] }].map(group => (
              <div key={group.label}>
                <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest mb-3">{group.label}</p>
                <div className="space-y-3">
                  {group.opts.map((opt, i) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-4 h-4 border-2 border-border group-hover:border-foreground flex items-center justify-center transition-colors shrink-0">
                        {group.checked.includes(i) && <div className="w-2 h-2 bg-primary" />}
                      </div>
                      <span className="font-bold text-xs text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wider">{opt}</span>
                    </label>
                  ))}
                </div>
                <div className="border-t-2 border-border mt-6" />
              </div>
            ))}
            <div>
              <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Salary Range</p>
              <input type="range" min={50} max={250} defaultValue={120} className="w-full accent-primary h-1 bg-border cursor-pointer" />
              <div className="flex justify-between mt-2">
                <span className="font-bold text-[10px] text-muted-foreground">$50k</span>
                <span className="font-bold text-xs text-foreground">$120k</span>
                <span className="font-bold text-[10px] text-muted-foreground">$250k+</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Recommended Jobs</h1>
              <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-2">Based on your profile and search history.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Sort by:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent border-none font-bold text-sm text-foreground focus:ring-0 cursor-pointer pr-8 py-1 outline-none">
                {["Best Match", "Newest", "Highest Salary"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {jobs.map((job, index) => {
              const ms = getMatchStyle(job.matchLevel);
              return (
                <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.08 }}
                  className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] group hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] transition-all relative">
                  <div className="absolute top-5 right-5 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 font-bold text-xs uppercase tracking-widest ${ms.badge}`}>
                      {ms.icon}{job.match}% Match
                    </span>
                    <button className="text-muted-foreground hover:text-primary transition-colors p-1 border-2 border-transparent hover:border-border hover:bg-secondary">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-secondary border-2 border-border flex items-center justify-center font-black text-lg text-foreground shrink-0">{job.companyInitials}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black text-foreground tracking-tighter pr-40">{job.title}</h3>
                      <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-1 mb-4">{job.company} • {job.location}</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {job.skills.map(s => <span key={s} className="bg-secondary border-2 border-border text-foreground px-3 py-1 font-bold text-[10px] uppercase tracking-widest">{s}</span>)}
                      </div>
                      <div className="flex items-center justify-between pt-5 border-t-2 border-border">
                        <div className="flex items-center gap-5">
                          <div className="flex items-center font-bold text-sm gap-1.5"><DollarSign className="w-4 h-4 text-muted-foreground" />{job.salary}</div>
                          <div className="flex items-center text-muted-foreground font-bold text-xs uppercase tracking-widest gap-1.5"><Clock className="w-4 h-4" />{job.posted}</div>
                        </div>
                        <button className="bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest px-5 py-2 border-2 border-transparent hover:border-foreground transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
