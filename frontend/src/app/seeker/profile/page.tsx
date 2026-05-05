"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { Edit2, UploadCloud, Sparkles, MapPin, Briefcase, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { ResumeAPI } from "@/lib/api";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  profile?: {
    skills?: string;
    experience?: string;
    resumeUrl?: string;
  };
}

interface ParsedResume {
  skills: string[];
  experience: { role: string; company: string; duration: string; description: string }[];
  match_score: number;
  feedback: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfileData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      setErrorMsg("Please upload a PDF file.");
      setUploadStatus("error");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMsg("");

    try {
      // Call FastAPI resume parser with a placeholder JD
      const result: ParsedResume = await ResumeAPI.parseResume(
        file,
        "Software engineering role requiring strong technical skills"
      );

      setParsed(result);

      // Save the parsed skills and experience to the profile
      const skillsStr = result.skills.join(", ");
      const experienceStr = JSON.stringify(result.experience);

      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: skillsStr,
          experience: experienceStr,
          resumeUrl: `/uploads/${file.name}`,
        }),
      });

      setUploadStatus("success");

      // Refresh profile
      const updated = await fetch("/api/profile").then((r) => r.json());
      setProfileData(updated);
    } catch (err: any) {
      console.error("Resume upload error:", err);
      setErrorMsg("Could not parse resume. Make sure the AI service is running.");
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const parsedSkills: string[] = (() => {
    if (parsed?.skills) return parsed.skills;
    if (profileData?.profile?.skills) return profileData.profile.skills.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  })();

  const parsedExperience: any[] = (() => {
    if (parsed?.experience) return parsed.experience;
    try {
      if (profileData?.profile?.experience) return JSON.parse(profileData.profile.experience);
    } catch {}
    return [];
  })();

  const initials = profileData?.name
    ? profileData.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <DashboardLayout role="seeker">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 max-w-5xl mx-auto">

        {/* Profile Header */}
        <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-primary/5" />
            <div className="absolute top-0 left-0 h-full w-2 bg-primary" />
          </div>
          <div className="flex items-center gap-6 relative z-10">
            {isLoading ? (
              <div className="w-20 h-20 bg-secondary border-2 border-border animate-pulse" />
            ) : (
              <div className="w-20 h-20 bg-primary border-2 border-foreground flex items-center justify-center font-black text-primary-foreground text-3xl shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {initials}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tighter">
                {isLoading ? <span className="block w-40 h-8 bg-secondary animate-pulse" /> : profileData?.name ?? "Unknown"}
              </h1>
              <p className="font-bold text-sm text-muted-foreground uppercase tracking-widest mt-1">
                {profileData?.email ?? ""}
              </p>
              {profileData?.profile?.resumeUrl && (
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold text-xs uppercase tracking-widest mt-2">
                  <CheckCircle className="w-3 h-3" /> Resume Uploaded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resume Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed transition-colors p-12 flex flex-col items-center justify-center gap-4 cursor-pointer group ${
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-foreground bg-secondary/20"
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }} />
          <div className={`w-16 h-16 border-2 border-border flex items-center justify-center transition-all ${isUploading ? "bg-primary" : "bg-card group-hover:bg-secondary group-hover:scale-110 duration-200"}`}>
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            ) : uploadStatus === "success" ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <UploadCloud className={`w-8 h-8 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
            )}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">
              {isUploading ? "Analyzing with AI..." : uploadStatus === "success" ? "Resume Analyzed!" : "Upload Resume"}
            </h3>
            <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-2">
              {isUploading
                ? "Our AI is parsing your skills and experience..."
                : uploadStatus === "success"
                ? "Skills and experience extracted successfully."
                : "Drag & drop a PDF or click to browse"}
            </p>
            {uploadStatus === "error" && (
              <p className="font-bold text-xs text-rose-500 uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errorMsg}
              </p>
            )}
          </div>
        </div>

        {/* Parsed Data Bento Grid */}
        {(parsedSkills.length > 0 || parsedExperience.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Skills */}
            {parsedSkills.length > 0 && (
              <div className="col-span-1 bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> AI-Extracted Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {parsedSkills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 border-2 font-bold text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-primary/30 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Timeline */}
            {parsedExperience.length > 0 && (
              <div className={`bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] ${parsedSkills.length > 0 ? "col-span-1 md:col-span-2" : "col-span-1 md:col-span-3"}`}>
                <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-8 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" /> Experience Timeline
                </h3>
                <div className="relative pl-6 border-l-2 border-border flex flex-col gap-10">
                  {parsedExperience.map((exp: any, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[27px] top-1 w-4 h-4 border-2 border-card ${idx === 0 ? "bg-primary" : "bg-muted-foreground"}`} />
                      <div className="flex flex-col gap-1">
                        <h4 className="text-lg font-black text-foreground tracking-tighter">{exp.role || exp.title}</h4>
                        <p className="font-bold text-xs uppercase tracking-widest">
                          <span className="text-primary">{exp.company}</span>
                          {exp.duration && <span className="text-muted-foreground ml-2">• {exp.duration}</span>}
                          {exp.period && <span className="text-muted-foreground ml-2">• {exp.period}</span>}
                        </p>
                        {exp.description && <p className="font-medium text-sm text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Feedback Block (after upload) */}
        {parsed?.feedback && (
          <div className="bg-card border-2 border-primary/30 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> AI Feedback
            </h3>
            <p className="font-medium text-sm text-muted-foreground leading-relaxed">{parsed.feedback}</p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/30">
              <span className="font-black text-2xl text-primary">{Math.round(parsed.match_score)}%</span>
              <span className="font-bold text-xs text-muted-foreground uppercase tracking-widest">General Match Score</span>
            </div>
          </div>
        )}

        {/* Empty state if no profile data */}
        {!isLoading && parsedSkills.length === 0 && parsedExperience.length === 0 && (
          <div className="bg-secondary/20 border-2 border-dashed border-border p-12 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-bold text-muted-foreground uppercase tracking-widest text-sm">
              Upload your resume above to auto-populate your profile with AI-extracted skills and experience.
            </p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
