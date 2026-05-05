"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { landingData } from "@/data/mockData";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 w-full py-20 md:py-32 flex flex-col items-center text-center relative overflow-hidden">
      {/* Background grain texture for brutalist materiality */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-widest mb-8 border border-border">
          <Sparkles className="w-4 h-4" />
          {landingData.hero.badge}
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="font-bold text-5xl md:text-7xl lg:text-8xl text-foreground max-w-5xl tracking-tighter mb-8 uppercase leading-[0.9]"
      >
        {landingData.hero.titleLine1} <br className="hidden md:block" />
        <span className="text-primary">{landingData.hero.titleLine2}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12"
      >
        {landingData.hero.description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
      >
        <Button asChild size="lg" className="w-full sm:w-auto uppercase tracking-wider font-bold rounded-none text-sm group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-y-[-2px] transition-transform">
          <Link href="/signup">
            {landingData.hero.ctaPrimary}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto uppercase tracking-wider font-bold rounded-none text-sm border-2">
          <Link href="/login">{landingData.hero.ctaSecondary}</Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6, type: "spring" }}
        className="mt-24 w-full max-w-6xl border-2 border-border bg-card h-[400px] md:h-[600px] relative overflow-hidden"
      >
        {/* Layered depth for screenshot */}
        <div className="absolute inset-0 bg-primary/5 mix-blend-overlay z-10 pointer-events-none"></div>
        <Image
          alt="RecruitFlow Dashboard Preview — AI-powered recruitment platform showing applicant pipeline with match scores"
          width={1200}
          height={800}
          priority
          className="w-full h-full object-cover object-top transition-all duration-700"
          src="/hero-dashboard.png"
        />
      </motion.div>
    </section>
  );
}
