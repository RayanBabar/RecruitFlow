"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { pipelineData } from "@/data/mockData";
import { ChevronRight, Edit2, TrendingUp, Sparkles, Filter, ListFilter, MoreVertical, Search, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function PipelinePage() {
  const { job, stats, candidates } = pipelineData;

  return (
    <DashboardLayout role="employer">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        {/* Breadcrumb and Job Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">
              <span className="hover:text-primary transition-colors cursor-pointer">Jobs</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">{job.department}</span>
            </div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter flex items-center gap-3">
              {job.title}
              <span className="px-2.5 py-0.5 border-2 border-border bg-secondary text-foreground text-[10px] uppercase tracking-widest font-bold">
                {job.status}
              </span>
            </h1>
            <p className="text-muted-foreground mt-1 font-bold text-xs uppercase tracking-widest">
              {job.location} • Posted {job.posted}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-2 border-border rounded-none font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-secondary">
              <Edit2 className="w-4 h-4" />
              Edit Job
            </Button>
          </div>
        </div>

        {/* Pipeline Stats Bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest mb-2 block">Total Applicants</span>
            <span className="text-4xl font-black text-foreground tracking-tighter">{stats.totalApplicants}</span>
            <div className="mt-2 flex items-center gap-1 font-bold text-xs text-green-600 dark:text-green-400 uppercase tracking-widest">
              <TrendingUp className="w-3 h-3" />
              <span>{stats.trend}</span>
            </div>
          </div>

          <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest mb-2 block">Shortlisted</span>
            <span className="text-4xl font-black text-foreground tracking-tighter">{stats.shortlisted}</span>
            <div className="mt-2 text-muted-foreground font-bold text-xs uppercase tracking-widest">
              {stats.conversion}
            </div>
          </div>

          <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest mb-2 block">Interviewing</span>
            <span className="text-4xl font-black text-foreground tracking-tighter">{stats.interviewing}</span>
            <div className="mt-2 text-muted-foreground font-bold text-xs uppercase tracking-widest">
              {stats.offers}
            </div>
          </div>

          <div className="bg-primary text-primary-foreground border-2 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
            <span className="text-primary-foreground/80 font-bold text-xs uppercase tracking-widest mb-2 block">AI Match Average</span>
            <span className="text-4xl font-black tracking-tighter">{stats.aiMatchAverage}</span>
            <div className="mt-2 flex items-center gap-1 font-bold text-xs text-primary-foreground uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              <span>High quality pool</span>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b-2 border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-secondary/50">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                className="pl-9 bg-background border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground text-xs font-bold uppercase tracking-widest"
                placeholder="Filter candidates..."
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="border-2 border-border rounded-none font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-secondary">
                <Filter className="w-4 h-4" />
                Status: All
              </Button>
              <Button variant="outline" className="border-2 border-border rounded-none font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-secondary">
                <ListFilter className="w-4 h-4" />
                Sort: AI Match
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-border bg-muted">
                  <th className="py-4 px-6 font-bold text-xs text-foreground uppercase tracking-widest w-1/3 border-r-2 border-border">Candidate</th>
                  <th className="py-4 px-6 font-bold text-xs text-foreground uppercase tracking-widest border-r-2 border-border">Applied Date</th>
                  <th className="py-4 px-6 font-bold text-xs text-foreground uppercase tracking-widest w-1/4 border-r-2 border-border">AI Match Score</th>
                  <th className="py-4 px-6 font-bold text-xs text-foreground uppercase tracking-widest border-r-2 border-border">Status</th>
                  <th className="py-4 px-6 font-bold text-xs text-foreground uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-border">
                {candidates.map((candidate, idx) => (
                  <tr key={idx} className={`hover:bg-secondary/50 transition-colors group ${candidate.status === 'Rejected' ? 'opacity-75' : ''}`}>
                    <td className="py-4 px-6 border-r-2 border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-border bg-secondary flex items-center justify-center font-black text-foreground shrink-0">
                          {candidate.initials}
                        </div>
                        <div>
                          <p className={`font-bold text-foreground ${candidate.status === 'Rejected' ? 'line-through decoration-muted-foreground' : ''}`}>
                            {candidate.name}
                          </p>
                          <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-1">
                            {candidate.role}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-sm text-muted-foreground border-r-2 border-border">
                      {candidate.applied}
                    </td>
                    <td className="py-4 px-6 border-r-2 border-border">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-secondary border-2 border-border overflow-hidden">
                          <div 
                            className={`h-full border-r-2 border-border ${candidate.color}`} 
                            style={{ width: `${candidate.match}%` }}
                          />
                        </div>
                        <span className="font-black text-sm text-foreground w-10 text-right">{candidate.match}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 border-r-2 border-border">
                      <span className="inline-flex items-center px-3 py-1 bg-secondary border-2 border-border text-foreground font-bold text-xs uppercase tracking-widest">
                        {candidate.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-2 text-muted-foreground hover:text-foreground border-2 border-transparent hover:border-border transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t-2 border-border flex items-center justify-between bg-secondary/50">
            <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Showing 1 to 4 of 124 candidates</span>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="w-8 h-8 rounded-none border-2 border-border" disabled>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button variant="default" className="w-8 h-8 rounded-none border-2 border-transparent font-black">1</Button>
              <Button variant="outline" className="w-8 h-8 rounded-none border-2 border-border font-black hover:bg-secondary">2</Button>
              <Button variant="outline" className="w-8 h-8 rounded-none border-2 border-border font-black hover:bg-secondary">3</Button>
              <span className="w-8 h-8 flex items-center justify-center font-black">...</span>
              <Button variant="outline" size="icon" className="w-8 h-8 rounded-none border-2 border-border hover:bg-secondary">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
