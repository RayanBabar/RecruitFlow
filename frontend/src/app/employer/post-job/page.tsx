"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { postJobData } from "@/data/mockData";
import { Sparkles, Bold, Italic, List, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";

export default function PostJobPage() {
  const { departments, jobTypes, workModes, exampleSkills } = postJobData;
  const [selectedWorkMode, setSelectedWorkMode] = useState("Remote");
  const [selectedSkills, setSelectedSkills] = useState(["React", "TypeScript"]);

  return (
    <DashboardLayout role="employer">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto space-y-8 pb-24"
      >
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Post a New Job</h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-2">
            Complete the details below to publish a new open position to your career portal.
          </p>
        </div>

        {/* Step 1: Basic Information */}
        <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
          <div className="p-6 border-b-2 border-border bg-secondary/50 flex items-center gap-3">
            <span className="w-7 h-7 bg-primary text-primary-foreground flex items-center justify-center font-black text-sm border-2 border-transparent">1</span>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">Basic Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Job Title</label>
              <Input
                placeholder="e.g. Senior Software Engineer"
                className="border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Department</label>
              <select className="w-full px-4 py-2 border-2 border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:border-foreground transition-colors rounded-none">
                {departments.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Job Type</label>
              <select className="w-full px-4 py-2 border-2 border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:border-foreground transition-colors rounded-none">
                {jobTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Salary Range</label>
              <div className="flex gap-2">
                <Input placeholder="$80,000" className="border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground font-bold text-sm" />
                <span className="flex items-center font-black text-muted-foreground">—</span>
                <Input placeholder="$120,000" className="border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground font-bold text-sm" />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Work Mode</label>
              <div className="flex gap-3 flex-wrap">
                {workModes.map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSelectedWorkMode(mode)}
                    className={`px-5 py-2 border-2 font-bold text-xs uppercase tracking-widest transition-all ${selectedWorkMode === mode ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground bg-background text-foreground"}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Job Details */}
        <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
          <div className="p-6 border-b-2 border-border bg-secondary/50 flex items-center gap-3">
            <span className="w-7 h-7 bg-secondary text-foreground flex items-center justify-center font-black text-sm border-2 border-border">2</span>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">Job Details</h2>
          </div>
          <div className="p-6">
            <label className="font-bold text-xs text-foreground uppercase tracking-widest block mb-3">Job Description</label>
            <div className="border-2 border-border overflow-hidden">
              {/* Toolbar */}
              <div className="bg-secondary/50 border-b-2 border-border p-2 flex gap-1">
                {[Bold, Italic, List, Link2].map((Icon, i) => (
                  <button key={i} className="p-2 hover:bg-secondary border-2 border-transparent hover:border-border transition-colors text-muted-foreground hover:text-foreground">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <textarea
                rows={8}
                className="w-full p-4 outline-none resize-none font-medium text-sm text-foreground bg-background border-none placeholder:text-muted-foreground"
                placeholder="Describe the responsibilities, requirements, and benefits of this role..."
              />
            </div>
          </div>
        </div>

        {/* Step 3: AI Screening */}
        <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden relative">
          <div className="absolute top-6 right-6 text-primary/30">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="p-6 border-b-2 border-border bg-primary/5 flex items-center gap-3">
            <span className="w-7 h-7 bg-secondary text-foreground flex items-center justify-center font-black text-sm border-2 border-border">3</span>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">AI Screening Criteria</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
              Define mandatory skills. Our AI will automatically pre-screen applicants against these criteria.
            </p>
            <textarea
              rows={3}
              className="w-full p-4 border-2 border-border outline-none font-medium text-sm bg-background text-foreground focus:border-foreground transition-colors rounded-none resize-none placeholder:text-muted-foreground"
              placeholder="e.g. 5+ years of React experience, strong knowledge of Node.js, experience with AWS..."
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSkills.map(skill => (
                <span key={skill} className="bg-secondary border-2 border-border text-foreground px-3 py-1 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  {skill}
                  <button onClick={() => setSelectedSkills(prev => prev.filter(s => s !== skill))} className="hover:text-rose-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {exampleSkills.filter(s => !selectedSkills.includes(s)).slice(0, 3).map(skill => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkills(prev => [...prev, skill])}
                  className="border-2 border-dashed border-border text-muted-foreground hover:border-foreground hover:text-foreground px-3 py-1 font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-card border-t-2 border-border p-5 flex justify-end gap-4 z-50 shadow-lg">
          <Button variant="outline" className="border-2 border-border rounded-none font-bold uppercase tracking-widest text-sm hover:bg-secondary px-6">
            Save as Draft
          </Button>
          <Button className="border-2 border-transparent hover:border-foreground rounded-none font-bold uppercase tracking-widest text-sm px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
            Publish Job
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
