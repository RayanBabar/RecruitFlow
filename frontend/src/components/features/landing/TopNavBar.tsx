"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { landingData } from "@/data/mockData";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";

export function TopNavBar() {
  const { data: session, status } = useSession();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed w-full top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border transition-all duration-200"
    >
      <div className="flex justify-between items-center px-8 h-16 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link
            href="#"
            className="text-xl font-bold tracking-tighter text-foreground uppercase"
          >
            RecruitFlow
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {landingData.navLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {status === "authenticated" ? (
            <>
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground uppercase tracking-wider text-xs font-bold rounded-none">
                <Link href={session.user?.role === "EMPLOYER" ? "/employer/dashboard" : "/seeker/find-jobs"}>Dashboard</Link>
              </Button>
              <Button onClick={() => signOut({ callbackUrl: "/" })} className="uppercase tracking-wider text-xs font-bold rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground uppercase tracking-wider text-xs font-bold rounded-none">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="uppercase tracking-wider text-xs font-bold rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
