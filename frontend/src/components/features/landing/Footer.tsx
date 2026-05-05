"use client";

import Link from "next/link";
import { landingData } from "@/data/mockData";
import { Globe, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t-2 border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <Link href="#" className="text-2xl font-bold tracking-tighter text-foreground mb-6 block uppercase">
              RecruitFlow
            </Link>
            <p className="text-muted-foreground mb-8">
              {landingData.footer.companyDescription}
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors border-2 border-transparent hover:border-primary p-2">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors border-2 border-transparent hover:border-primary p-2">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {landingData.footer.sections.map((section, idx) => (
            <div key={idx} className="col-span-1">
              <h4 className="font-bold text-foreground mb-6 uppercase tracking-wider text-sm">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-4">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t-2 border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-sm font-medium">
            {landingData.footer.copyright}
          </p>
          <div className="flex items-center gap-3 text-muted-foreground text-sm font-bold uppercase tracking-wider">
            <span className="w-3 h-3 bg-primary border-2 border-foreground animate-pulse"></span>
            Systems Operational
          </div>
        </div>
      </div>
    </footer>
  );
}
