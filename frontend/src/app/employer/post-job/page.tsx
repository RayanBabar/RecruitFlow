"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { postJobData } from "@/data/mockData";
import { Sparkles, Bold, Italic, List, Link2, X, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
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
  const [companyName, setCompanyName] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | null>(null);
  const [adminNote, setAdminNote] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const titleRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const salaryMinRef = useRef<HTMLInputElement>(null);
  const salaryMaxRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const requirementsRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/employer/profile")
      .then((r) => r.json())
      .then((p) => {
        setVerificationStatus(p?.verificationStatus ?? "PENDING");
        setAdminNote(p?.adminNote ?? null);
        if (p?.companyName) {
          setCompanyName(p.companyName);
        }
      })
      .catch(() => setVerificationStatus("PENDING"))
      .finally(() => setProfileLoading(false));
  }, []);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = descriptionRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    textarea.value = `${before}${prefix}${selected}${suffix}${after}`;
    
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
  };

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

    const reqText = requirementsRef.current?.value?.trim() || "";
    const skillsText = selectedSkills.length > 0 ? `Required Skills: ${selectedSkills.join(", ")}` : "";
    const finalRequirements = [reqText, skillsText].filter(Boolean).join("\n\n") || null;

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
          requirements: finalRequirements,
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
      {profileLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : verificationStatus === "PENDING" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mt-16 space-y-6"
        >
          <div className="flex items-start gap-4 p-6 border-2 border-amber-500 bg-amber-500/10">
            <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400 shrink-0 mt-1" />
            <div>
              <h1 className="text-2xl font-black text-foreground uppercase tracking-tighter">Verification Required</h1>
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mt-2">
                Your employer account is awaiting admin approval.
              </p>
              <p className="text-sm font-medium text-muted-foreground mt-3">
                You cannot post jobs until an administrator has verified your company details. This usually takes 1–2 business days.
              </p>
              <Button
                onClick={() => router.push("/employer/dashboard")}
                className="mt-4 rounded-none border-2 border-transparent hover:border-foreground font-bold uppercase tracking-widest text-xs"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </motion.div>
      ) : verificationStatus === "REJECTED" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mt-16 space-y-6"
        >
          <div className="flex items-start gap-4 p-6 border-2 border-destructive bg-destructive/10">
            <XCircle className="w-8 h-8 text-destructive shrink-0 mt-1" />
            <div>
              <h1 className="text-2xl font-black text-foreground uppercase tracking-tighter">Verification Rejected</h1>
              {adminNote && (
                <div className="mt-3 p-3 border-2 border-destructive/40 bg-background">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Admin Note</p>
                  <p className="text-sm font-medium text-foreground">{adminNote}</p>
                </div>
              )}
              <p className="text-sm font-medium text-muted-foreground mt-3">
                Please contact support or update your company profile and request re-verification.
              </p>
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => router.push("/employer/dashboard")}
                  variant="outline"
                  className="rounded-none border-2 border-border font-bold uppercase tracking-widest text-xs"
                >
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
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
              <Input ref={titleRef} placeholder="e.g. Senior Software Engineer" className="h-10 border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors font-bold text-sm" />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Company *</label>
              <Input 
                ref={companyRef} 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp" 
                className="h-10 border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors font-bold text-sm" 
              />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Location *</label>
              <Input ref={locationRef} placeholder="e.g. Remote or New York, NY" className="h-10 border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors font-bold text-sm" />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Job Type</label>
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="h-10 w-full px-4 border-2 border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:border-foreground transition-colors rounded-none"
              >
                {jobTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Salary Range</label>
              <div className="flex gap-2">
                <Input ref={salaryMinRef} placeholder="$80,000" className="h-10 border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground font-bold text-sm" />
                <span className="flex items-center font-black text-muted-foreground">—</span>
                <Input ref={salaryMaxRef} placeholder="$120,000" className="h-10 border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground font-bold text-sm" />
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
                <button type="button" onClick={() => insertFormatting('**', '**')} className="p-2 hover:bg-secondary border-2 border-transparent hover:border-border transition-colors text-muted-foreground hover:text-foreground">
                  <Bold className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => insertFormatting('*', '*')} className="p-2 hover:bg-secondary border-2 border-transparent hover:border-border transition-colors text-muted-foreground hover:text-foreground">
                  <Italic className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => insertFormatting('- ')} className="p-2 hover:bg-secondary border-2 border-transparent hover:border-border transition-colors text-muted-foreground hover:text-foreground">
                  <List className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => insertFormatting('[', '](url)')} className="p-2 hover:bg-secondary border-2 border-transparent hover:border-border transition-colors text-muted-foreground hover:text-foreground">
                  <Link2 className="w-4 h-4" />
                </button>
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
            <div className="flex flex-col gap-2 mt-4">
              <label className="font-bold text-xs text-foreground uppercase tracking-widest block">Add Required Skills</label>
              <div className="flex flex-wrap gap-2 items-center p-2 border-2 border-border bg-background focus-within:border-foreground transition-colors min-h-[48px]">
                {selectedSkills.map((skill) => (
                  <span key={skill} className="bg-secondary border-2 border-border text-foreground px-3 py-1 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    {skill}
                    <button type="button" onClick={() => setSelectedSkills((prev) => prev.filter((s) => s !== skill))} className="hover:text-rose-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Type a skill and press Enter or comma..."
                  className="flex-1 bg-transparent border-none outline-none font-medium text-sm min-w-[200px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim().replace(/,+$/, '');
                      if (val && !selectedSkills.includes(val)) {
                        setSelectedSkills([...selectedSkills, val]);
                      }
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2 items-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Suggestions:</span>
                {exampleSkills.filter((s) => !selectedSkills.includes(s)).slice(0, 5).map((skill) => (
                  <button key={skill} type="button" onClick={() => setSelectedSkills((prev) => [...prev, skill])}
                    className="border-2 border-dashed border-border text-muted-foreground hover:border-foreground hover:text-foreground px-2 py-0.5 font-bold text-[10px] uppercase tracking-widest transition-colors">
                    + {skill}
                  </button>
                ))}
              </div>
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
      )}
    </DashboardLayout>
  );
}
