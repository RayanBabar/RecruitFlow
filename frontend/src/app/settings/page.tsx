"use client";

import { motion } from "framer-motion";
import { Settings as SettingsIcon, Bell, Shield, User, Key, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState("system");
  
  const role = (session?.user as any)?.role;
  const backLink = role === "EMPLOYER" 
    ? "/employer/dashboard" 
    : role === "ADMIN" 
    ? "/admin/employers" 
    : "/seeker/dashboard";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b-2 border-border bg-card px-6 py-5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-transparent">
            <SettingsIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground uppercase tracking-tighter">Settings</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account Preferences</p>
          </div>
        </div>
        <Link 
          href={backLink}
          className="px-4 py-2 border-2 border-border hover:border-foreground hover:bg-secondary transition-colors font-bold text-xs uppercase tracking-widest text-foreground"
        >
          Back to Dashboard
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Profile Section */}
          <section className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-border pb-4">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-black uppercase tracking-tight">Profile Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                <div className="p-3 border-2 border-border bg-secondary/50 font-medium">{session?.user?.name || "Loading..."}</div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                <div className="p-3 border-2 border-border bg-secondary/50 font-medium">{session?.user?.email || "Loading..."}</div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Account Role</label>
                <div className="p-3 border-2 border-border bg-secondary/50 font-medium">{role || "Loading..."}</div>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-border pb-4">
              <Monitor className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-black uppercase tracking-tight">Appearance</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Choose your preferred theme for the RecruitFlow interface.</p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-2 px-6 py-3 border-2 font-bold text-sm uppercase tracking-widest transition-colors ${theme === "light" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-foreground"}`}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button 
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-2 px-6 py-3 border-2 font-bold text-sm uppercase tracking-widest transition-colors ${theme === "dark" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-foreground"}`}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
                <button 
                  onClick={() => setTheme("system")}
                  className={`flex items-center gap-2 px-6 py-3 border-2 font-bold text-sm uppercase tracking-widest transition-colors ${theme === "system" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-foreground"}`}
                >
                  <Monitor className="w-4 h-4" /> System
                </button>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-border pb-4">
              <Bell className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-black uppercase tracking-tight">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { title: "Email Notifications", desc: "Receive daily summaries of your activity" },
                { title: "Push Notifications", desc: "Get real-time alerts in your browser" },
                { title: "Marketing Emails", desc: "Receive tips and tricks from the RecruitFlow team" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-2 border-border">
                  <div>
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-secondary border-2 border-border cursor-pointer">
                    <div className="absolute left-1 top-1 w-3 h-3 rounded-full bg-muted-foreground transition-transform"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Security Section */}
          <section className="bg-card border-2 border-destructive/50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-destructive/20 pb-4">
              <Shield className="w-6 h-6 text-destructive" />
              <h2 className="text-xl font-black uppercase tracking-tight text-destructive">Security & Danger Zone</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-2 border-border bg-secondary/20">
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2"><Key className="w-4 h-4" /> Change Password</h3>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
                <Button variant="outline" className="border-2 rounded-none uppercase font-bold tracking-widest text-xs">
                  Update
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-2 border-destructive/20 bg-destructive/5">
                <div>
                  <h3 className="font-bold text-destructive">Delete Account</h3>
                  <p className="text-sm text-destructive/80">Permanently remove your account and all data</p>
                </div>
                <Button variant="destructive" className="border-2 rounded-none uppercase font-bold tracking-widest text-xs">
                  Delete
                </Button>
              </div>
            </div>
          </section>

        </motion.div>
      </main>
    </div>
  );
}
