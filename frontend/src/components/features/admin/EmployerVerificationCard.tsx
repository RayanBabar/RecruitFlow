"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Globe, Phone, Hash, Calendar, CheckCircle2, XCircle,
  ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmployerProfile {
  id: string;
  companyName: string;
  companyWebsite: string | null;
  companyPhone: string | null;
  companyDescription: string | null;
  registrationNumber: string | null;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  adminNote: string | null;
  createdAt: string;
}

interface Employer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  employerProfile: EmployerProfile | null;
}

interface Props {
  employer: Employer;
  onAction: (userId: string, status: "APPROVED" | "REJECTED", note?: string) => Promise<void>;
}

const statusStyles = {
  PENDING: "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  APPROVED: "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
  REJECTED: "border-destructive bg-destructive/10 text-destructive",
};

export function EmployerVerificationCard({ employer, onAction }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profile = employer.employerProfile;
  const status = profile?.verificationStatus ?? "PENDING";

  const handleApprove = async () => {
    setIsSubmitting(true);
    await onAction(employer.id, "APPROVED");
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    await onAction(employer.id, "REJECTED", rejectNote);
    setIsSubmitting(false);
    setRejecting(false);
    setRejectNote("");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
    >
      {/* Header Row */}
      <div className="p-5 flex items-center gap-4">
        {/* Company Initial */}
        <div className="w-12 h-12 bg-secondary border-2 border-border flex items-center justify-center font-black text-xl text-foreground shrink-0">
          {(profile?.companyName?.[0] ?? employer.name[0]).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-foreground text-base uppercase tracking-tight truncate">
              {profile?.companyName ?? "No Company Info"}
            </h3>
            <span className={`inline-flex items-center px-2 py-0.5 border-2 font-bold text-[10px] uppercase tracking-widest ${statusStyles[status]}`}>
              {status}
            </span>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
            {employer.name} — {employer.email}
          </p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Registered {new Date(employer.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 border-2 border-border hover:border-foreground hover:bg-secondary transition-colors"
          aria-label="Toggle details"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && profile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t-2 border-border p-5 space-y-3 bg-secondary/30">
              {profile.registrationNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Reg No:</span>
                  <span className="font-bold text-foreground text-xs">{profile.registrationNumber}</span>
                </div>
              )}
              {profile.companyWebsite && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a
                    href={profile.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-xs text-primary hover:underline decoration-2 underline-offset-2 flex items-center gap-1"
                  >
                    {profile.companyWebsite} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {profile.companyPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-bold text-xs text-foreground">{profile.companyPhone}</span>
                </div>
              )}
              {profile.companyDescription && (
                <div className="flex gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">{profile.companyDescription}</p>
                </div>
              )}
              {profile.adminNote && (
                <div className="p-3 border-2 border-border bg-background">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Previous Admin Note</p>
                  <p className="text-xs font-medium text-foreground">{profile.adminNote}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Row — only for PENDING */}
      {status === "PENDING" && (
        <div className="border-t-2 border-border p-4 flex flex-col gap-3">
          <AnimatePresence>
            {rejecting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 pb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                    Rejection Reason (shown to employer)
                  </label>
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    rows={2}
                    placeholder="e.g. Invalid registration number provided..."
                    className="w-full px-3 py-2 border-2 border-border bg-background text-foreground text-xs font-medium rounded-none outline-none focus:border-destructive transition-colors resize-none placeholder:text-muted-foreground"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 justify-end">
            {rejecting ? (
              <>
                <Button
                  onClick={() => { setRejecting(false); setRejectNote(""); }}
                  variant="outline"
                  disabled={isSubmitting}
                  className="rounded-none border-2 border-border font-bold uppercase tracking-widest text-xs px-4"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="rounded-none border-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold uppercase tracking-widest text-xs px-4"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Rejecting..." : "Confirm Reject"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setRejecting(true)}
                  variant="outline"
                  className="rounded-none border-2 border-destructive/50 text-destructive hover:bg-destructive/10 font-bold uppercase tracking-widest text-xs px-4"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="rounded-none border-2 border-transparent hover:border-foreground font-bold uppercase tracking-widest text-xs px-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Approving..." : "Approve"}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
