"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { DollarSign, Clock, Bookmark, Flame, ThumbsUp, SlidersHorizontal, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ResumeAPI } from "@/lib/api";
import ReactMarkdown from "react-markdown";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: string;
  description: string;
  requirements?: string;
  createdAt: string;
  _count: { applications: number };
  employer: { name: string };
}

export default function FindJobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("Newest");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [isCheckingScore, setIsCheckingScore] = useState<string | null>(null);
  const [scores, setScores] = useState<{ [key: string]: { match_score: number; feedback: string; requirement_checks?: any[] } }>({});
  const [viewedJobs, setViewedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then(setJobs)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const timeAgo = (dateStr: string) => {
    const ms = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(ms / 3600000);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleApply = async (job: Job) => {
    if (applyingId || appliedIds.has(job.id)) return;
    setApplyingId(job.id);

    try {
      const scoreData = scores[job.id];
      const payload = {
        jobId: job.id,
        matchScore: scoreData?.match_score,
        aiFeedback: scoreData?.feedback,
        requirementChecks: scoreData?.requirement_checks,
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Could not apply. Have you already applied?");
        return;
      }

      setAppliedIds((prev) => new Set([...prev, job.id]));
    } catch (err) {
      console.error(err);
    } finally {
      setApplyingId(null);
    }
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === "Newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  });

  const handleCheckScore = async (jobId: string) => {
    if (isCheckingScore) return;
    setIsCheckingScore(jobId);

    try {
      const res = await fetch(`/api/jobs/${jobId}/score`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Failed to check score. Have you uploaded your resume?");
        return;
      }

      const data = await res.json();
      setScores((prev) => ({
        ...prev,
        [jobId]: { match_score: data.match_score, feedback: data.feedback, requirement_checks: data.requirement_checks },
      }));
    } catch (err) {
      console.error(err);
      alert("An error occurred while checking your score.");
    } finally {
      setIsCheckingScore(null);
    }
  };

  const handleToggleDetails = async (jobId: string) => {
    const isExpanding = expandedJobId !== jobId;
    setExpandedJobId(isExpanding ? jobId : null);

    // Track view if expanding and we haven't tracked this job in this session
    if (isExpanding && !viewedJobs.has(jobId)) {
      try {
        await fetch(`/api/jobs/${jobId}/view`, { method: "POST" });
        setViewedJobs((prev) => new Set([...prev, jobId]));
      } catch (e) {
        // Silently fail view tracking to not interrupt UX
        console.error("Failed to track view", e);
      }
    }
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
            {[{ label: "Job Type", opts: ["Full-time", "Contract", "Part-time"], checked: [0] }, { label: "Work Mode", opts: ["Remote", "Hybrid", "On-site"], checked: [0, 1] }].map((group) => (
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
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Open Positions</h1>
              <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-2">
                {isLoading ? "Loading jobs..." : `${jobs.length} position${jobs.length !== 1 ? "s" : ""} available`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Sort by:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none font-bold text-sm text-foreground focus:ring-0 cursor-pointer pr-8 py-1 outline-none">
                {["Newest", "Oldest"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-card border-2 border-border p-6 animate-pulse h-40 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
              ))}
            </div>
          ) : !sortedJobs.length ? (
            <div className="bg-card border-2 border-border p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-bold text-muted-foreground uppercase tracking-widest">No open positions right now. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedJobs.map((job, index) => {
                const isApplied = appliedIds.has(job.id);
                const isApplying = applyingId === job.id;

                return (
                  <motion.div key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] group hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] transition-all relative"
                  >
                    <div className="absolute top-5 right-5 flex items-center gap-2">
                      <button className="text-muted-foreground hover:text-primary transition-colors p-1 border-2 border-transparent hover:border-border hover:bg-secondary">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 bg-secondary border-2 border-border flex items-center justify-center font-black text-lg text-foreground shrink-0">
                        {job.company[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-black text-foreground tracking-tighter pr-12">{job.title}</h3>
                        <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-1 mb-4">
                          {job.company} • {job.location}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-5">
                          <span className="bg-secondary border-2 border-border text-foreground px-3 py-1 font-bold text-[10px] uppercase tracking-widest">{job.type}</span>
                          {job._count.applications > 0 && (
                            <span className="bg-secondary border-2 border-border text-muted-foreground px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                              {job._count.applications} applicant{job._count.applications !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-5 border-t-2 border-border">
                          <div className="flex items-center gap-5">
                            {job.salary && (
                              <div className="flex items-center font-bold text-sm gap-1.5">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />{job.salary}
                              </div>
                            )}
                            <div className="flex items-center text-muted-foreground font-bold text-xs uppercase tracking-widest gap-1.5">
                              <Clock className="w-4 h-4" />{timeAgo(job.createdAt)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleDetails(job.id)}
                            className="font-bold text-xs uppercase tracking-widest px-5 py-2 border-2 border-border text-foreground hover:bg-secondary transition-all"
                          >
                            {expandedJobId === job.id ? "Hide Details" : "View Details"}
                          </button>
                        </div>

                        {/* Expanded Details Section */}
                        {expandedJobId === job.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: "auto" }} 
                            className="mt-6 pt-6 border-t-2 border-border space-y-6"
                          >
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-black text-sm uppercase tracking-widest text-foreground mb-2">Job Description</h4>
                                <div className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown
                                    components={{
                                      strong: ({node, ...props}) => <span className="font-bold text-foreground" {...props} />,
                                      p: ({node, ...props}) => <p className="mb-3 leading-relaxed last:mb-0" {...props} />,
                                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                                      li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                                      a: ({node, ...props}) => <a className="text-primary hover:underline font-bold" target="_blank" rel="noopener noreferrer" {...props} />
                                    }}
                                  >
                                    {job.description}
                                  </ReactMarkdown>
                                </div>
                              </div>
                              {job.requirements && (
                                <div>
                                  <h4 className="font-black text-sm uppercase tracking-widest text-foreground mb-2 flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-primary" /> AI Screening Criteria
                                  </h4>
                                  <div className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown
                                      components={{
                                        strong: ({node, ...props}) => <span className="font-bold text-foreground" {...props} />,
                                        p: ({node, ...props}) => <p className="mb-3 leading-relaxed last:mb-0" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                                        li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                                      }}
                                    >
                                      {job.requirements}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="bg-secondary/30 border-2 border-border p-5 flex flex-col items-center justify-center gap-4">
                              {scores[job.id] ? (
                                <div className="w-full space-y-4">
                                  <div className="flex flex-col md:flex-row items-start gap-6 bg-background border-2 border-primary/30 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                    <div className="flex flex-col items-center shrink-0 w-full md:w-auto">
                                      <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center font-black text-3xl text-primary mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
                                        {Math.round(scores[job.id].match_score)}
                                      </div>
                                      <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-center">Match Score</span>
                                    </div>
                                    <div className="flex-1 w-full min-w-0">
                                      <h4 className="font-black text-sm uppercase tracking-widest mb-3 border-b-2 border-border pb-2 text-foreground">AI Match Analysis</h4>
                                      <div className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown
                                          components={{
                                            strong: ({node, ...props}) => <span className="font-bold text-foreground" {...props} />,
                                            p: ({node, ...props}) => <p className="mb-3 leading-relaxed last:mb-0" {...props} />,
                                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                                            li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                                          }}
                                        >
                                          {scores[job.id].feedback}
                                        </ReactMarkdown>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex justify-end pt-2">
                                    <button
                                      onClick={() => handleApply(job)}
                                      disabled={isApplied || isApplying}
                                      className={`px-8 font-black text-xs uppercase tracking-widest py-3 border-2 transition-all ${
                                        isApplied
                                          ? "bg-green-500 text-white border-green-500 cursor-default"
                                          : isApplying
                                          ? "bg-primary/50 text-primary-foreground border-transparent cursor-not-allowed"
                                          : "bg-primary text-primary-foreground border-transparent hover:border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:translate-y-1 active:shadow-none"
                                      }`}
                                    >
                                      {isApplied ? "✓ Application Submitted" : isApplying ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Submit Application with Score"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest text-center">
                                    Check how well your profile matches this role before applying.
                                  </p>
                                  <button
                                    onClick={() => handleCheckScore(job.id)}
                                    disabled={isCheckingScore === job.id}
                                    className="bg-background text-foreground border-2 border-border hover:border-primary font-bold text-xs uppercase tracking-widest px-6 py-3 flex items-center gap-2 transition-all"
                                  >
                                    {isCheckingScore === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-primary" />}
                                    {isCheckingScore === job.id ? "Analyzing Match..." : "Check Match Score"}
                                  </button>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
