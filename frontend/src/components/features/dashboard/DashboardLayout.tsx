"use client";

import Link from "next/link";

import { Sidebar } from "./Sidebar";
import { Search, Bell, MessageSquare, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { employerDashboardData, seekerDashboardData, dashboardNav } from "@/data/mockData";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  unread: boolean;
  createdAt: string;
}

interface DashboardUser {
  initials: string;
  name: string;
  role: string;
}

interface DashboardData {
  user: DashboardUser;
  notifications: Notification[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "employer" | "seeker";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const dashboardData = role === "employer" ? employerDashboardData : seekerDashboardData;
  const userData = dashboardData.user;
  const unreadCount = notifications.filter((n) => n.unread).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, unread: false }),
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
      // Rollback? Maybe not worth it for unread status
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <div className="flex items-center gap-4 relative">
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`text-foreground hover:bg-secondary border-2 transition-colors relative p-2 ${
                    isNotificationsOpen ? "border-foreground bg-secondary" : "border-transparent hover:border-border"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary"></span>
                  )}
                </button>

                {/* Notification Popover */}
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b-2 border-border bg-secondary/30 flex justify-between items-center">
                        <h3 className="font-black text-xs uppercase tracking-widest">Notifications</h3>
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5">
                          {unreadCount} New
                        </span>
                      </div>
                      <div className="max-h-96 overflow-y-auto divide-y-2 divide-border">
                        {isLoading ? (
                          <div className="p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent animate-spin mb-2"></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Syncing...</span>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No new updates</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => n.unread && markAsRead(n.id)}
                              className={`p-4 hover:bg-secondary/20 transition-colors cursor-pointer group ${n.unread ? "bg-primary/5" : ""}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className={`font-black text-[10px] uppercase tracking-widest ${
                                  n.type === "SUCCESS" ? "text-emerald-500" : 
                                  n.type === "WARNING" ? "text-amber-500" : 
                                  n.type === "ERROR" ? "text-rose-500" : "text-primary"
                                }`}>
                                  {n.title}
                                </span>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase">{formatTime(n.createdAt)}</span>
                              </div>
                              <p className="text-xs font-bold text-foreground leading-tight">{n.message}</p>
                              {n.unread && (
                                <div className="mt-2 flex justify-end">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      <button className="w-full p-3 bg-secondary/50 border-t-2 border-border font-black text-[10px] uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors">
                        View All Activity
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
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
