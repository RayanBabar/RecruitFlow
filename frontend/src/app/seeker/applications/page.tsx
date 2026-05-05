"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";

const applications = [
  { company: "Stripe", role: "Senior Frontend Engineer", date: "Oct 24, 2023", status: "Shortlisted", statusColor: "text-green-600 bg-green-50 border-green-300 dark:bg-green-900/20 dark:text-green-400" },
  { company: "Airbnb", role: "Product Designer", date: "Oct 22, 2023", status: "Under Review", statusColor: "text-amber-600 bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400" },
  { company: "Netflix", role: "UX Researcher", date: "Oct 18, 2023", status: "Applied", statusColor: "text-foreground bg-secondary border-border" },
  { company: "Spotify", role: "Full Stack Developer", date: "Oct 15, 2023", status: "Rejected", statusColor: "text-rose-600 bg-rose-50 border-rose-300 dark:bg-rose-900/20 dark:text-rose-400" },
  { company: "Vercel", role: "DevRel Engineer", date: "Oct 12, 2023", status: "Applied", statusColor: "text-foreground bg-secondary border-border" },
  { company: "Linear", role: "Software Engineer", date: "Oct 08, 2023", status: "Under Review", statusColor: "text-amber-600 bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400" },
];

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "Shortlisted") return <CheckCircle2 className="w-4 h-4 text-green-600" />;
  if (status === "Rejected") return <XCircle className="w-4 h-4 text-rose-600" />;
  if (status === "Under Review") return <Clock className="w-4 h-4 text-amber-600" />;
  return <FileText className="w-4 h-4 text-muted-foreground" />;
};

export default function ApplicationsPage() {
  return (
    <DashboardLayout role="seeker">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
        <div className="flex justify-between items-end pb-6 border-b-2 border-border">
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">My Applications</h1>
            <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-2">{applications.length} total applications tracked</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Applied", "Under Review", "Shortlisted", "Rejected"].map((f, i) => (
              <button key={f} className={`px-4 py-2 border-2 font-bold text-xs uppercase tracking-widest transition-colors ${i === 0 ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground hover:bg-secondary"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/50 border-b-2 border-border">
                <th className="text-left p-4 font-black text-xs uppercase tracking-widest text-muted-foreground">Company</th>
                <th className="text-left p-4 font-black text-xs uppercase tracking-widest text-muted-foreground">Role</th>
                <th className="text-left p-4 font-black text-xs uppercase tracking-widest text-muted-foreground hidden md:table-cell">Date Applied</th>
                <th className="text-left p-4 font-black text-xs uppercase tracking-widest text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="border-b-2 border-border last:border-b-0 hover:bg-secondary/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-secondary border-2 border-border flex items-center justify-center font-black text-sm shrink-0">
                        {app.company[0]}
                      </div>
                      <span className="font-black text-sm text-foreground">{app.company}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-sm text-foreground">{app.role}</td>
                  <td className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-widest hidden md:table-cell">{app.date}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 font-bold text-xs uppercase tracking-widest ${app.statusColor}`}>
                      <StatusIcon status={app.status} />
                      {app.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
