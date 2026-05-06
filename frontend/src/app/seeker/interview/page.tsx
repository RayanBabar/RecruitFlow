"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { PhoneOff, Mic, Paperclip, Send, Sparkles, Wifi, WifiOff, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useInterviewWebSocket } from "@/lib/hooks/useInterviewWebSocket";
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const SPEAKER_COLORS: Record<string, string> = {
  HR: "bg-primary text-primary-foreground",
  Technical: "bg-secondary text-foreground border-2 border-border",
  User: "bg-primary text-primary-foreground",
  System: "bg-secondary text-muted-foreground",
};

const SPEAKER_LABELS: Record<string, string> = {
  HR: "HR",
  Technical: "TECH",
  User: "YOU",
  System: "SYS",
};

interface Application {
  id: string;
  status: string;
  job: { id: string; title: string; company: string; location: string; type: string };
}

function JobSelectionView() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then(setApplications)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const interviewingJobs = applications.filter(a => a.status === "INTERVIEWING");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-6 max-w-4xl mx-auto">
      <div className="pb-6 border-b-2 border-border">
        <h1 className="text-3xl font-black uppercase tracking-tight">Select an Interview</h1>
        <p className="text-muted-foreground font-medium mt-2">Choose an application to start your AI mock interview session.</p>
      </div>

      {interviewingJobs.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-border bg-card">
          <p className="font-bold text-muted-foreground uppercase tracking-widest text-sm">No Active Interviews</p>
          <p className="text-muted-foreground mt-2 text-sm">You do not have any applications currently in the interviewing stage.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {interviewingJobs.map((app) => (
            <div key={app.id} className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl uppercase tracking-tight">{app.job.title}</h3>
                <p className="text-muted-foreground font-medium mt-1">{app.job.company} • {app.job.location}</p>
              </div>
              <Button
                onClick={() => window.location.href = `/seeker/interview?jobId=${app.job.id}`}
                className="h-12 px-6 border-2 border-transparent hover:border-foreground rounded-none bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] transition-all"
              >
                Start Interview
              </Button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function InterviewContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const userId = (session?.user as any)?.id ?? "guest";
  
  // Use a stable session/job ID combo — in a real flow, pick the jobId from route param
  const sessionId = `${userId}-interview`;
  const jobId = searchParams.get("jobId");

  const [jobData, setJobData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (jobId === "general") {
      setIsInitializing(false);
      return;
    }
    
    Promise.all([
      fetch(`/api/jobs/${jobId}`).then(res => res.json()),
      fetch("/api/profile").then(res => res.json())
    ]).then(([jobRes, profileRes]) => {
      if (jobRes?.job) setJobData(jobRes.job);
      if (profileRes?.profile) setProfileData(profileRes.profile);
      setIsInitializing(false);
    }).catch((e) => {
      console.error("Failed to load interview context:", e);
      setIsInitializing(false);
    });
  }, [jobId]);

  const { messages, isConnected, error, sendMessage, evaluation } = useInterviewWebSocket(
    sessionId, 
    jobId || "general",
    isInitializing ? null : { jobData, profileData }
  );
  const [input, setInput] = useState("");
  const [isEnded, setIsEnded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || !isConnected || isEnded) return;
    sendMessage(text);
    setInput("");
    inputRef.current?.focus();
  }, [input, isConnected, isEnded, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEnd = () => {
    setIsEnded(true);
  };

  // Determine if the AI is "typing" (last message was from user)
  const lastMsg = messages[messages.length - 1];
  const isAiTyping = isConnected && !isEnded && lastMsg?.speaker === "User";

  return (
    <DashboardLayout role="seeker">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col h-[calc(100vh-6rem)] relative border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] bg-card"
      >
        {/* Chat Header */}
        <header className="h-20 flex-shrink-0 bg-secondary/50 border-b-2 border-border px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-primary border-2 border-border flex items-center justify-center font-black text-primary-foreground text-xl">
                HR
              </div>
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-black dark:border-white ${isConnected ? "bg-green-500" : "bg-rose-500"}`} />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tighter uppercase">AI Interview Agents</h2>
              <p className={`font-bold text-xs uppercase tracking-widest flex items-center gap-1 mt-1 ${isConnected ? "text-green-600 dark:text-green-400" : "text-rose-500"}`}>
                {isConnected ? (
                  <><Wifi className="w-3 h-3" /> Live — Connected</>
                ) : isEnded ? (
                  <><WifiOff className="w-3 h-3" /> Session Ended</>
                ) : (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Connecting...</>
                )}
              </p>
            </div>
          </div>
          {!isEnded ? (
            <Button onClick={handleEnd} variant="outline"
              className="border-2 border-border rounded-none font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-rose-500 hover:text-white transition-colors text-rose-600">
              <PhoneOff className="w-4 h-4" />
              <span className="hidden sm:inline">End Interview</span>
            </Button>
          ) : (
            <span className="font-bold text-xs text-muted-foreground uppercase tracking-widest border-2 border-border px-4 py-2">Session Ended</span>
          )}
        </header>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 px-6 py-3 bg-rose-50 dark:bg-rose-900/20 border-b-2 border-rose-300 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-widest">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-background relative custom-scrollbar">
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none z-0 mix-blend-overlay"
            style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />

          <div className="flex items-center justify-center w-full my-2 relative z-10">
            <span className="bg-secondary border-2 border-border text-foreground font-bold text-[10px] uppercase tracking-widest px-4 py-1">
              {isConnected ? "AI Interview Session Active" : "Connecting to AI Agents..."}
            </span>
          </div>

          {messages.length === 0 && !isConnected && (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 opacity-50 mt-12">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Connecting to AI Interview Agents...</p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isUser = msg.speaker === "User";
              const isSystem = msg.speaker === "System";

              if (isSystem) {
                return (
                  <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center relative z-10">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-1 bg-secondary border border-border">{msg.text}</span>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-4 max-w-[85%] md:max-w-[70%] relative z-10 ${isUser ? "self-end flex-row-reverse" : "self-start"}`}
                >
                  <div className={`w-10 h-10 border-2 border-border flex items-center justify-center font-black text-xs shrink-0 hidden md:flex ${isUser ? "bg-primary text-primary-foreground" : SPEAKER_COLORS[msg.speaker] || "bg-secondary"}`}>
                    {SPEAKER_LABELS[msg.speaker] ?? msg.speaker.slice(0, 3).toUpperCase()}
                  </div>
                  <div className={`p-5 border-2 border-border max-w-full ${isUser ? "bg-primary text-primary-foreground shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[-4px_4px_0px_0px_rgba(255,255,255,0.1)]" : "bg-card text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"}`}>
                    {!isUser && (
                      <p className="font-black text-[10px] uppercase tracking-widest mb-2 opacity-60">{msg.speaker} Agent</p>
                    )}
                    <p className="font-medium text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          {isAiTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4 self-start max-w-[85%] md:max-w-[70%] mt-2 relative z-10">
              <div className="w-10 h-10 border-2 border-border bg-primary text-primary-foreground flex items-center justify-center font-black text-xs shrink-0 hidden md:flex">HR</div>
              <div className="bg-card p-4 border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-2 items-center h-12 w-20 justify-center">
                <div className="w-2 h-2 bg-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Evaluation Scorecard */}
        {evaluation && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-card border-t-2 border-border z-10">
            <div className="max-w-4xl mx-auto border-2 border-border bg-background p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
              <h2 className="text-2xl font-black uppercase tracking-tight text-center mb-6">Interview Evaluation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-primary/10 border-2 border-primary p-6 text-center">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">HR & Cultural Fit</p>
                  <p className="text-5xl font-black text-primary">{evaluation.hr_score}<span className="text-2xl text-muted-foreground">/100</span></p>
                </div>
                <div className="bg-secondary border-2 border-foreground p-6 text-center">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Technical Assessment</p>
                  <p className="text-5xl font-black text-foreground">{evaluation.technical_score}<span className="text-2xl text-muted-foreground">/100</span></p>
                </div>
              </div>

              <div className="bg-card border-2 border-border p-6">
                <h3 className="font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> 
                  Areas for Improvement
                </h3>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{evaluation.improvement_areas}</p>
              </div>

              <div className="mt-8 text-center">
                <Button onClick={() => window.location.href = '/seeker/applications'} className="h-12 px-8 border-2 border-transparent hover:border-foreground rounded-none bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] transition-all">
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat Input Area */}
        {!evaluation && (
          <div className="bg-secondary/50 border-t-2 border-border p-6 flex-shrink-0 z-10">
          {isEnded ? (
            <div className="text-center">
              <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Interview session ended. Refresh to start a new session.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto flex items-center gap-4">
              <div className="flex-1 bg-background border-2 border-border flex items-center px-4 py-2 focus-within:border-foreground transition-colors">
                <button aria-label="Use Microphone" className="text-muted-foreground hover:text-foreground p-2 rounded transition-colors flex-shrink-0 hover:bg-secondary">
                  <Mic className="w-5 h-5" />
                </button>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!isConnected || isEnded}
                  className="flex-1 border-none focus-visible:ring-0 px-4 font-bold text-sm tracking-wider uppercase bg-transparent"
                  placeholder={isConnected ? "Type your response..." : "Connecting..."}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!isConnected || !input.trim() || isEnded}
                className="h-[52px] w-[52px] border-2 border-transparent hover:border-foreground rounded-none bg-primary text-primary-foreground flex items-center justify-center transition-colors flex-shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
              >
                <Send className="w-6 h-6 ml-1" />
              </Button>
            </div>
          )}
          <div className="text-center mt-4">
            <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
              {isConnected ? "Connected to AI HR & Technical Agents via WebSocket" : "Establishing secure connection..."}
            </p>
          </div>
        </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

function InterviewContainer() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return (
      <DashboardLayout role="seeker">
        <JobSelectionView />
      </DashboardLayout>
    );
  }

  return <InterviewContent />;
}

export default function MockInterviewPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>}>
      <InterviewContainer />
    </Suspense>
  );
}
