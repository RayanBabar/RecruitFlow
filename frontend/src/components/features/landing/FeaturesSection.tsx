"use client";

import { landingData } from "@/data/mockData";
import { FileScan, Mic, Kanban } from "lucide-react";
import { motion, Variants } from "framer-motion";

const iconMap: Record<string, React.ReactNode> = {
  document_scanner: <FileScan className="w-8 h-8" />,
  record_voice_over: <Mic className="w-8 h-8" />,
  schema: <Kanban className="w-8 h-8" />,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export function FeaturesSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 w-full py-24 relative">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 uppercase tracking-tighter">
          {landingData.features.title}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          {landingData.features.description}
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {landingData.features.items.map((feature, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            className="bg-card border-2 border-border p-8 hover:bg-secondary/50 hover:-translate-y-2 transition-all duration-300 flex flex-col h-full group relative overflow-hidden"
          >
            {/* Subtle grain texture */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
            
            <div className="w-16 h-16 bg-primary/10 border border-primary text-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              {iconMap[feature.icon]}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-4 uppercase tracking-wider">
              {feature.title}
            </h3>
            <p className="text-muted-foreground flex-grow leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
