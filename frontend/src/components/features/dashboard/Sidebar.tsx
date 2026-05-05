"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { dashboardNav } from "@/data/mockData";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Calendar, 
  BarChart, 
  Settings, 
  HelpCircle,
  FileText,
  Mic,
  User as UserIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mapping string icons from mockData to Lucide React components
const iconMap: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  work: Briefcase,
  people: Users,
  event: Calendar,
  analytics: BarChart,
  settings: Settings,
  help: HelpCircle,
  assignment: FileText,
  record_voice_over: Mic,
  person: UserIcon,
};

interface SidebarProps {
  role: "employer" | "seeker";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const navLinks = dashboardNav[role];
  const sharedLinks = dashboardNav.shared;
  
  const userName = session?.user?.name || "Loading...";
  const userRole = session?.user?.role || role;
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <nav className="w-64 h-screen fixed left-0 top-0 hidden md:flex flex-col bg-background border-r-2 border-border z-50">
      <div className="px-6 py-6 border-b-2 border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center text-primary-foreground font-black text-xl border-2 border-transparent">
            {initials}
          </div>
          <div className="overflow-hidden">
            <h1 className="text-xl font-black text-foreground uppercase tracking-tighter leading-tight truncate">
              {userName}
            </h1>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
              {userRole}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col h-full py-6 space-y-2 overflow-y-auto px-4">
        {navLinks.map((link) => {
          const Icon = iconMap[link.icon];
          const isActive = pathname.startsWith(link.href);
          
          return (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-150 border-2",
                isActive 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "text-foreground border-transparent hover:border-foreground/20 hover:bg-secondary"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-auto border-t-2 border-border py-6 px-4 shrink-0 space-y-2">
        {sharedLinks.map((link) => {
          const Icon = iconMap[link.icon];
          return (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground hover:bg-secondary border-2 border-transparent hover:border-foreground/20 transition-all duration-150"
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
