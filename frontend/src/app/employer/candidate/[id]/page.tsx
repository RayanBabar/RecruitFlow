"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import {
  ArrowLeft, X, Calendar, CheckCircle, Sparkles,
  CheckCircle2, XCircle, FileText, Download, Loader2, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  status: string;
  matchScore: number | null;
  aiFeedback: string | null;
  createdAt: string;
  seeker: {
    id: string;
    name: string;
    email: string;
    profile?: {
      skills?: string;
      experience?: string;
      resumeUrl?: string;
    } | null;
  };
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    requirements?: string | null;
  };
}

const MATCH_COLOR = (score: number) => {
  if (score >= 75) return "bg-green-100 text-green-800 border-green-800 dark:bg-green-900 dark:text-green-100 dark:border-green-100";
  if (score >= 50) return "bg-amber-100 text-amber-800 border-amber-800 dark:bg-amber-900 dark:text-amber-100";
  return "bg-rose-100 text-rose-800 border-rose-800 dark:bg-rose-900 dark:text-rose-100";
};

export default function CandidateAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetch(`/api/applications/${id}`)
      .then((r) => r.json())
      .then(setApplication)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setApplication((prev) => prev ? { ...prev, status: newStatus } : prev);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const skills: string[] = application?.seeker.profile?.skills
    ? application.seeker.profile.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const experience: any[] = (() => {
    try {
      return application?.seeker.profile?.experience
        ? JSON.parse(application.seeker.profile.experience)
        : [];
    } catch { return []; }
  })();

  const initials = application?.seeker.name
    ? application.seeker.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  // Parse job requirements into bullet points
  const requirements = application?.job.requirements
    ? application.job.requirements.split(/[,\n]/).map((r) => r.trim()).filter(Boolean)
    : [];

  if (isLoading) {
    return (
      <DashboardLayout role="employer">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout role="employer">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <p className="font-bold text-muted-foreground uppercase tracking-widest">Application not found.</p>
          <Button onClick={() => router.back()} variant="outline" className="rounded-none border-2 border-border font-bold uppercase tracking-widest text-xs">
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="employer">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col h-[calc(100vh-6rem)]"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 border-2 border-transparent hover:border-border hover:bg-secondary">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">{application.seeker.name}</h2>
              <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest">
                Applied for: {application.job.title} at {application.job.company}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {application.status !== "REJECTED" && (
              <Button
                variant="outline"
                disabled={updatingStatus}
                onClick={() => updateStatus("REJECTED")}
                className="border-2 border-border rounded-none font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-secondary text-rose-600 hover:text-rose-700"
              >
                <X className="w-4 h-4" /> Reject
              </Button>
            )}
            {application.status !== "INTERVIEWING" && application.status !== "OFFER" && (
              <Button
                variant="outline"
                disabled={updatingStatus}
                onClick={() => updateStatus("INTERVIEWING")}
                className="border-2 border-border rounded-none font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-secondary"
              >
                <MessageSquare className="w-4 h-4" /> Interview
              </Button>
            )}
            {application.status !== "SHORTLISTED" && application.status !== "OFFER" && application.status !== "REJECTED" && (
              <Button
                disabled={updatingStatus}
                onClick={() => updateStatus("SHORTLISTED")}
                className="border-2 border-transparent hover:border-foreground rounded-none font-bold uppercase tracking-widest text-xs flex items-center gap-2 bg-primary text-primary-foreground"
              >
                <CheckCircle className="w-4 h-4" /> Shortlist
              </Button>
            )}
            {application.status === "INTERVIEWING" && (
              <Button
                disabled={updatingStatus}
                onClick={() => updateStatus("OFFER")}
                className="border-2 border-transparent hover:border-foreground rounded-none font-bold uppercase tracking-widest text-xs flex items-center gap-2 bg-emerald-600 text-white"
              >
                <CheckCircle className="w-4 h-4" /> Make Offer
              </Button>
            )}
          </div>
        </div>

        {/* Split View */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">

          {/* Left Column: AI Analysis */}
          <div className="w-full lg:w-5/12 flex flex-col gap-6 overflow-y-auto pr-1 pb-6">

            {/* Profile Header */}
            <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary border-2 border-border flex items-center justify-center font-black text-primary-foreground text-2xl">{initials}</div>
                  <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tighter">{application.seeker.name}</h1>
                    <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-1">{application.seeker.email}</p>
                    <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-1">
                      Applied {new Date(application.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                {application.matchScore !== null && (
                  <div className={`px-3 py-1.5 border-2 font-black text-lg ${MATCH_COLOR(application.matchScore)}`}>
                    {Math.round(application.matchScore)}% Match
                  </div>
                )}
              </div>

              {/* Current status badge */}
              <div className="pt-4 border-t-2 border-border">
                <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Current Status</p>
                <span className="inline-block px-3 py-1 border-2 border-border bg-secondary font-bold text-xs uppercase tracking-widest">
                  {updatingStatus ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
                  {application.status}
                </span>
              </div>
            </div>

            {/* AI Feedback */}
            {application.aiFeedback ? (
              <div className="bg-primary/5 border-2 border-primary p-6 relative shadow-[4px_4px_0px_0px_rgba(79,70,229,0.3)]">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-primary w-5 h-5" />
                  <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">AI Match Summary</h3>
                </div>
                <p className="font-medium text-sm text-foreground leading-relaxed whitespace-pre-wrap">{application.aiFeedback}</p>
              </div>
            ) : (
              <div className="bg-secondary/30 border-2 border-dashed border-border p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-muted-foreground w-5 h-5" />
                  <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">No AI Analysis</h3>
                </div>
                <p className="font-medium text-xs text-muted-foreground">This candidate applied without uploading a resume for AI analysis.</p>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Extracted Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="bg-primary/10 text-primary border-2 border-primary/30 px-3 py-1 font-bold text-xs uppercase tracking-widest">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-6">Experience</h3>
                <div className="relative pl-6 border-l-2 border-border flex flex-col gap-8">
                  {experience.map((exp: any, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[27px] top-1 w-4 h-4 border-2 border-card ${idx === 0 ? "bg-primary" : "bg-muted-foreground"}`} />
                      <h4 className="font-black text-base text-foreground tracking-tighter">{exp.role ?? exp.title}</h4>
                      <p className="font-bold text-xs uppercase tracking-widest mt-0.5">
                        <span className="text-primary">{exp.company}</span>
                        {(exp.duration ?? exp.period) && <span className="text-muted-foreground ml-2">• {exp.duration ?? exp.period}</span>}
                      </p>
                      {exp.description && <p className="font-medium text-xs text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements vs Skills checklist */}
            {requirements.length > 0 && skills.length > 0 && (
              <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-6">Requirements Check</h3>
                <ul className="space-y-3">
                  {requirements.map((req, i) => {
                    const matched = skills.some((s) => req.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(req.toLowerCase().split(" ")[0]));
                    return (
                      <li key={i} className="flex items-start gap-3">
                        {matched
                          ? <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          : <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />}
                        <p className="font-bold text-sm text-foreground">{req}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Resume / Info Viewer */}
          <div className="w-full lg:w-7/12 bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] flex flex-col h-full min-h-[500px] overflow-hidden">
            <div className="bg-secondary/50 border-b-2 border-border p-3 flex justify-between items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="text-muted-foreground w-5 h-5" />
                <span className="font-bold text-xs text-foreground uppercase tracking-widest">
                  {application.seeker.profile?.resumeUrl ?? "No Resume File"}
                </span>
              </div>
              {application.seeker.profile?.resumeUrl && (
                <button className="p-1.5 text-muted-foreground hover:text-foreground border-2 border-transparent hover:border-border transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-background">
              {skills.length > 0 || experience.length > 0 ? (
                <div className="bg-white text-black w-full max-w-[800px] shadow-lg border border-gray-200 p-8 md:p-12">
                  <div className="border-b-4 border-black pb-6 mb-8">
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">{application.seeker.name}</h1>
                    <p className="text-gray-600 font-bold text-sm tracking-widest">{application.seeker.email}</p>
                  </div>

                  {skills.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-lg font-black uppercase tracking-widest mb-4 border-l-4 border-black pl-3">Skills</h2>
                      <p className="font-medium text-sm text-gray-700">{skills.join(" • ")}</p>
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-widest mb-4 border-l-4 border-black pl-3">Experience</h2>
                      {experience.map((exp: any, i: number) => (
                        <div key={i} className="mb-6">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-black uppercase tracking-wide">{exp.role ?? exp.title}</h3>
                            {(exp.duration ?? exp.period) && <span className="font-bold text-sm text-gray-500">{exp.duration ?? exp.period}</span>}
                          </div>
                          <p className="font-bold text-sm text-indigo-600 mb-2 uppercase tracking-widest">{exp.company}</p>
                          {exp.description && <p className="font-medium text-sm text-gray-700 leading-relaxed">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground" />
                  <p className="font-bold text-muted-foreground uppercase tracking-widest text-sm max-w-xs">
                    This candidate hasn't uploaded a resume or their profile data is unavailable.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
