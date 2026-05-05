"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { postJobData } from "@/data/mockData";
import { Sparkles, Bold, Italic, List, Link2, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function PostJobPage() {
  const { departments, jobTypes, workModes, exampleSkills } = postJobData;
  const router = useRouter();
  const [selectedWorkMode, setSelectedWorkMode] = useState("Remote");
  const [selectedJobType, setSelectedJobType] = useState("Full-time");
  const [selectedSkills, setSelectedSkills] = useState(["React", "TypeScript"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const salaryMinRef = useRef<HTMLInputElement>(null);
  const salaryMaxRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const requirementsRef = useRef<HTMLTextAreaElement>(null);

  const handlePublish = async () => {
    setError("");
    const title = titleRef.current?.value?.trim();
    const company = companyRef.current?.value?.trim();
    const location = locationRef.current?.value?.trim();
    const description = descriptionRef.current?.value?.trim();

    if (!title || !company || !location || !description) {
      setError("Please fill in all required fields: Title, Company, Location, and Description.");
      return;
    }

    const salaryMin = salaryMinRef.current?.value?.trim();
    const salaryMax = salaryMaxRef.current?.value?.trim();
    const salary = salaryMin && salaryMax ? `${salaryMin} - ${salaryMax}` : salaryMin || salaryMax || null;

    setIsLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          company,
          location,
          type: selectedJobType,
          salary,
          description,
          requirements: requirementsRef.current?.value?.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to post job");
      }

      setSuccess(true);
      setTimeout(() => router.push("/employer/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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

        {error && (
          <div className="p-4 border-2 border-destructive bg-destructive/10 text-destructive font-bold text-sm uppercase tracking-wider">
            {error}
          </div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 border-2 border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" /> Job posted successfully! Redirecting...
          </motion.div>
        )}

        {/* Step 1: Basic Information */}
        <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
          <div className="p-6 border-b-2 border-border bg-secondary/50 flex items-center gap-3">
            <span className="w-7 h-7 bg-primary text-primary-foreground flex items-center justify-center font-black text-sm border-2 border-transparent">1</span>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">Basic Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Job Title *</label>
              <Input ref={titleRef} placeholder="e.g. Senior Software Engineer" className="border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors font-bold text-sm" />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Company *</label>
              <Input ref={companyRef} placeholder="e.g. Acme Corp" className="border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors font-bold text-sm" />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Location *</label>
              <Input ref={locationRef} placeholder="e.g. Remote or New York, NY" className="border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors font-bold text-sm" />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Job Type</label>
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="w-full px-4 py-2 border-2 border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:border-foreground transition-colors rounded-none"
              >
                {jobTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Salary Range</label>
              <div className="flex gap-2">
                <Input ref={salaryMinRef} placeholder="$80,000" className="border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground font-bold text-sm" />
                <span className="flex items-center font-black text-muted-foreground">—</span>
                <Input ref={salaryMaxRef} placeholder="$120,000" className="border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground font-bold text-sm" />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Work Mode</label>
              <div className="flex gap-3 flex-wrap">
                {workModes.map((mode) => (
                  <button key={mode} type="button" onClick={() => setSelectedWorkMode(mode)}
                    className={`px-5 py-2 border-2 font-bold text-xs uppercase tracking-widest transition-all ${selectedWorkMode === mode ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground bg-background text-foreground"}`}
                  >{mode}</button>
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
            <label className="font-bold text-xs text-foreground uppercase tracking-widest block mb-3">Job Description *</label>
            <div className="border-2 border-border overflow-hidden">
              <div className="bg-secondary/50 border-b-2 border-border p-2 flex gap-1">
                {[Bold, Italic, List, Link2].map((Icon, i) => (
                  <button key={i} type="button" className="p-2 hover:bg-secondary border-2 border-transparent hover:border-border transition-colors text-muted-foreground hover:text-foreground">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <textarea
                ref={descriptionRef}
                rows={8}
                className="w-full p-4 outline-none resize-none font-medium text-sm text-foreground bg-background border-none placeholder:text-muted-foreground"
                placeholder="Describe the responsibilities, requirements, and benefits of this role..."
              />
            </div>
          </div>
        </div>

        {/* Step 3: AI Screening */}
        <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden relative">
          <div className="absolute top-6 right-6 text-primary/30"><Sparkles className="w-8 h-8" /></div>
          <div className="p-6 border-b-2 border-border bg-primary/5 flex items-center gap-3">
            <span className="w-7 h-7 bg-secondary text-foreground flex items-center justify-center font-black text-sm border-2 border-border">3</span>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">AI Screening Criteria</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
              Define mandatory skills. Our AI will automatically pre-screen applicants against these criteria.
            </p>
            <textarea
              ref={requirementsRef}
              rows={3}
              className="w-full p-4 border-2 border-border outline-none font-medium text-sm bg-background text-foreground focus:border-foreground transition-colors rounded-none resize-none placeholder:text-muted-foreground"
              placeholder="e.g. 5+ years of React experience, strong knowledge of Node.js, experience with AWS..."
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSkills.map((skill) => (
                <span key={skill} className="bg-secondary border-2 border-border text-foreground px-3 py-1 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  {skill}
                  <button type="button" onClick={() => setSelectedSkills((prev) => prev.filter((s) => s !== skill))} className="hover:text-rose-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {exampleSkills.filter((s) => !selectedSkills.includes(s)).slice(0, 3).map((skill) => (
                <button key={skill} type="button" onClick={() => setSelectedSkills((prev) => [...prev, skill])}
                  className="border-2 border-dashed border-border text-muted-foreground hover:border-foreground hover:text-foreground px-3 py-1 font-bold text-xs uppercase tracking-widest transition-colors">
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-card border-t-2 border-border p-5 flex justify-end gap-4 z-50 shadow-lg">
          <Button type="button" variant="outline" onClick={() => router.push("/employer/dashboard")}
            className="border-2 border-border rounded-none font-bold uppercase tracking-widest text-sm hover:bg-secondary px-6">
            Cancel
          </Button>
          <Button type="button" onClick={handlePublish} disabled={isLoading || success}
            className="border-2 border-transparent hover:border-foreground rounded-none font-bold uppercase tracking-widest text-sm px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
            {isLoading ? "Publishing..." : "Publish Job"}
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
