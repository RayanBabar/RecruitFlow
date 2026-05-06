"use client";

import { motion } from "framer-motion";
import { Settings as SettingsIcon, Bell, Shield, User, Key, Moon, Sun, Monitor, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NotificationSettings {
  emailAlerts: boolean;
  pushAlerts: boolean;
  marketingEmails: boolean;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Notification State
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailAlerts: true,
    pushAlerts: true,
    marketingEmails: false,
  });
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete Account Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/user/settings");
      if (res.ok) {
        const data = await res.json();
        setNotifications({
          emailAlerts: data.emailAlerts,
          pushAlerts: data.pushAlerts,
          marketingEmails: data.marketingEmails,
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  useEffect(() => {
    // Wrap in a microtask to avoid synchronous cascading render warning
    Promise.resolve().then(() => {
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (mounted) {
      Promise.resolve().then(() => {
        fetchSettings();
      });
    }
  }, [mounted]);

  const toggleNotification = async (key: keyof NotificationSettings) => {
    const newSettings = { ...notifications, [key]: !notifications[key] };
    setNotifications(newSettings);
    setIsUpdatingNotifications(true);
    try {
      await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
    } catch {
      console.error("Failed to update settings");
      // Rollback on error
      setNotifications(notifications);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError("");
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new,
        }),
      });

      if (res.ok) {
        setIsPasswordModalOpen(false);
        setPasswordForm({ current: "", new: "", confirm: "" });
      } else {
        const data = await res.json();
        setPasswordError(data.message || "Failed to update password");
      }
    } catch {
      setPasswordError("An unexpected error occurred");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmPassword) {
      setDeleteError("Password is required to confirm");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deleteConfirmPassword }),
      });

      if (res.ok) {
        signOut({ callbackUrl: "/" });
      } else {
        const data = await res.json();
        setDeleteError(data.message || "Failed to delete account");
      }
    } catch {
      setDeleteError("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!mounted) return null;
  
  const role = session?.user?.role;
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
          {/* Profile Section (Read Only) */}
          <section className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-border pb-4">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-black uppercase tracking-tight">Profile Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                <div className="p-3 border-2 border-border bg-secondary/30 text-muted-foreground font-medium cursor-not-allowed">
                  {session?.user?.name || "..."}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                <div className="p-3 border-2 border-border bg-secondary/30 text-muted-foreground font-medium cursor-not-allowed">
                  {session?.user?.email || "..."}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Account Role</label>
                <div className="p-3 border-2 border-border bg-secondary/30 text-muted-foreground font-medium cursor-not-allowed uppercase tracking-wide text-[10px]">
                  {role || "..."}
                </div>
              </div>
            </div>
            <p className="mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Profile details are managed by your identity provider and cannot be changed here.</p>
          </section>

          {/* Appearance Section */}
          <section className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-border pb-4">
              <Moon className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-black uppercase tracking-tight">Appearance</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Choose your preferred theme for the RecruitFlow interface.</p>
              
              <div className="flex flex-wrap gap-4">
                {[
                  { id: "light", icon: Sun, label: "Light" },
                  { id: "dark", icon: Moon, label: "Dark" },
                  { id: "system", icon: Monitor, label: "System" }
                ].map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-2 px-6 py-3 border-2 font-bold text-sm uppercase tracking-widest transition-all ${
                      theme === t.id ? "border-primary bg-primary/10 text-primary shadow-[2px_2px_0px_0px_currentColor]" : "border-border hover:border-foreground"
                    }`}
                  >
                    <t.icon className="w-4 h-4" /> {t.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
            <div className="flex items-center justify-between mb-6 border-b-2 border-border pb-4">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-black uppercase tracking-tight">Notifications</h2>
              </div>
              {isUpdatingNotifications && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: "emailAlerts", title: "Email Alerts", desc: "Receive summary of application activity via email." },
                { id: "pushAlerts", title: "Push Notifications", desc: "Get real-time browser alerts for new messages." },
                { id: "marketingEmails", title: "Marketing Updates", desc: "Tips, tricks and product news from RecruitFlow." }
              ].map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 border-2 border-border group hover:bg-secondary/10 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-sm uppercase tracking-tight">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleNotification(item.id as keyof NotificationSettings)}
                    className={`relative inline-flex h-6 w-11 items-center border-2 border-foreground transition-colors focus:outline-none ${
                      notifications[item.id as keyof NotificationSettings] ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 border-2 border-foreground bg-background transition-transform ${
                        notifications[item.id as keyof NotificationSettings] ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-2 border-border bg-secondary/20 hover:bg-secondary/30 transition-colors">
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2"><Key className="w-4 h-4" /> Change Password</h3>
                  <p className="text-sm text-muted-foreground">Secure your account with a new password</p>
                </div>
                <Button 
                  onClick={() => setIsPasswordModalOpen(true)}
                  variant="outline" 
                  className="border-2 rounded-none uppercase font-bold tracking-widest text-xs h-10 px-6 hover:bg-foreground hover:text-background"
                >
                  Update
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-2 border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                <div>
                  <h3 className="font-bold text-destructive flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Delete Account</h3>
                  <p className="text-sm text-destructive/80 font-medium">Permanently remove your account and all associated data</p>
                </div>
                <Button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  variant="destructive" 
                  className="border-2 rounded-none uppercase font-bold tracking-widest text-xs h-10 px-6"
                >
                  Terminate
                </Button>
              </div>
            </div>
          </section>
        </motion.div>
      </main>

      {/* Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="border-4 border-foreground rounded-none bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Update Password</DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">
              Confirm your identity to set a new password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordUpdate} className="space-y-4 py-4">
            {passwordError && (
              <div className="p-3 border-2 border-destructive bg-destructive/10 text-destructive text-xs font-bold uppercase tracking-widest">
                {passwordError}
              </div>
            )}
            <div className="space-y-2">
              <Label className="uppercase text-[10px] font-black tracking-[0.2em]">Current Password</Label>
              <Input
                type="password"
                required
                className="border-2 border-foreground rounded-none"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase text-[10px] font-black tracking-[0.2em]">New Password</Label>
              <Input
                type="password"
                required
                className="border-2 border-foreground rounded-none"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase text-[10px] font-black tracking-[0.2em]">Confirm New Password</Label>
              <Input
                type="password"
                required
                className="border-2 border-foreground rounded-none"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              />
            </div>
            <DialogFooter className="mt-6">
              <Button 
                type="submit" 
                disabled={isUpdatingPassword}
                className="w-full h-12 rounded-none font-black uppercase tracking-widest border-2 border-transparent hover:border-foreground"
              >
                {isUpdatingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : "Change Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="border-4 border-destructive rounded-none bg-card shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic text-destructive">Terminate Account</DialogTitle>
            <DialogDescription className="font-bold text-destructive/80 uppercase tracking-widest text-[10px]">
              This action is irreversible. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {deleteError && (
              <div className="p-3 border-2 border-destructive bg-destructive/10 text-destructive text-xs font-bold uppercase tracking-widest">
                {deleteError}
              </div>
            )}
            <div className="space-y-2">
              <Label className="uppercase text-[10px] font-black tracking-[0.2em] text-destructive">Enter Password to Confirm</Label>
              <Input
                type="password"
                required
                className="border-2 border-destructive rounded-none focus-visible:ring-destructive"
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 h-12 rounded-none font-black uppercase tracking-widest border-2 border-foreground"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              variant="destructive"
              className="flex-1 h-12 rounded-none font-black uppercase tracking-widest border-2 border-transparent hover:border-foreground"
            >
              {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete Everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
