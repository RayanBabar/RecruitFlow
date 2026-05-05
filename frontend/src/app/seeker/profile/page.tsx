"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { profileData } from "@/data/mockData";
import { Edit2, UploadCloud, Sparkles, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, skills, experience } = profileData;

  return (
    <DashboardLayout role="seeker">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 max-w-5xl mx-auto">
        
        {/* Profile Header Card */}
        <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-primary/5"></div>
            <div className="absolute top-0 left-0 h-full w-2 bg-primary"></div>
          </div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-primary border-2 border-foreground flex items-center justify-center font-black text-primary-foreground text-3xl shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
              {user.initials}
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tighter">{user.name}</h1>
              <p className="font-bold text-sm text-muted-foreground uppercase tracking-widest mt-1">{user.title}</p>
              <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-xs uppercase tracking-widest mt-2">
                <MapPin className="w-3 h-3" />
                {user.location}
              </div>
            </div>
          </div>
          <Button variant="outline" className="border-2 border-border rounded-none font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-secondary relative z-10">
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>

        {/* Resume Upload Zone */}
        <div className="border-2 border-dashed border-border hover:border-foreground transition-colors p-12 flex flex-col items-center justify-center gap-4 bg-secondary/20 cursor-pointer group">
          <div className="w-16 h-16 border-2 border-border bg-card group-hover:bg-secondary flex items-center justify-center transition-colors group-hover:scale-110 duration-200">
            <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Upload New Resume</h3>
            <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-2">
              Drag and drop your PDF or DOCX here, or click to browse files.
            </p>
          </div>
        </div>

        {/* Parsed Data Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skills */}
          <div className="col-span-1 bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Verified Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill.name} className={`px-3 py-1.5 border-2 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 ${skill.aiVerified ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary text-foreground border-border"}`}>
                  {skill.aiVerified && <Sparkles className="w-3 h-3" />}
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          {/* Experience Timeline */}
          <div className="col-span-1 md:col-span-2 bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter mb-8 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Experience Timeline
            </h3>
            <div className="relative pl-6 border-l-2 border-border flex flex-col gap-10">
              {experience.map((exp, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-[27px] top-1 w-4 h-4 border-2 border-card ${idx === 0 ? "bg-primary" : "bg-muted-foreground"}`}></div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-lg font-black text-foreground tracking-tighter">{exp.title}</h4>
                    <p className="font-bold text-xs uppercase tracking-widest">
                      <span className="text-primary">{exp.company}</span>
                      <span className="text-muted-foreground ml-2">• {exp.period}</span>
                    </p>
                    <p className="font-medium text-sm text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </motion.div>
    </DashboardLayout>
  );
}
