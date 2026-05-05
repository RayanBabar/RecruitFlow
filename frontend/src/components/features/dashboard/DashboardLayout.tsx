"use client";

import Link from "next/link";

import { Sidebar } from "./Sidebar";
import { Search, Bell, MessageSquare, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { employerDashboardData, seekerDashboardData, dashboardNav } from "@/data/mockData";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "employer" | "seeker";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const userData = role === "employer" ? employerDashboardData.user : seekerDashboardData.user;

  return (
    <div className="min-h-screen bg-background font-body text-foreground flex">
      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main Content Wrapper */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
        {/* Brutalist noise texture overlay for main content area */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" 
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
        />

        {/* Top Header */}
        <header className="bg-card sticky top-0 z-40 w-full border-b-2 border-border">
          <div className="flex justify-between items-center px-6 h-16 w-full relative z-10">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-muted-foreground w-4 h-4" />
                </div>
                <Input
                  type="text"
                  placeholder="Search jobs, candidates..."
                  className="pl-10 border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors bg-background font-bold text-xs uppercase tracking-wider"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button className="text-foreground hover:bg-secondary border-2 border-transparent hover:border-border p-2 transition-colors relative">
                <Bell className="w-5 h-5" />
                {role === "seeker" && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary"></span>
                )}
              </button>
              <button className="text-foreground hover:bg-secondary border-2 border-transparent hover:border-border p-2 transition-colors hidden sm:block">
                <MessageSquare className="w-5 h-5" />
              </button>
              
              {role === "employer" && (
                <Button asChild className="hidden md:flex rounded-none font-bold uppercase tracking-widest text-xs border-2 border-transparent hover:border-foreground">
                  <Link href={dashboardNav.quickActions.employer.href}>Post Job</Link>
                </Button>
              )}

              <div className="w-10 h-10 bg-secondary border-2 border-border flex items-center justify-center font-bold text-lg cursor-pointer hover:border-foreground transition-colors">
                {userData.initials}
              </div>
              
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border-2 border-transparent hover:border-red-500/20 p-2 transition-colors ml-2"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="flex-1 p-6 lg:p-8 bg-background relative z-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
