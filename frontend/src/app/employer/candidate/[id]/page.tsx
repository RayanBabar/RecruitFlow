"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { candidateAnalysisData } from "@/data/mockData";
import { ArrowLeft, X, Calendar, CheckCircle, Sparkles, CheckCircle2, XCircle, FileText, ZoomOut, ZoomIn, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CandidateAnalysisPage() {
  const { candidate, aiSummary, requirements, resumeUrl } = candidateAnalysisData;

  return (
    <DashboardLayout role="employer">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col h-[calc(100vh-6rem)]"
      >
        {/* Top Header Actions */}
        <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-border">
          <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-foreground transition-colors p-2 border-2 border-transparent hover:border-border hover:bg-secondary">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">{candidate.name}</h2>
              <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest">{candidate.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-2 border-border rounded-none font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-secondary text-rose-600 hover:text-rose-700">
              <X className="w-4 h-4" />
              Reject
            </Button>
            <Button variant="outline" className="border-2 border-border rounded-none font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-secondary">
              <Calendar className="w-4 h-4" />
              Interview
            </Button>
            <Button className="border-2 border-transparent hover:border-foreground rounded-none font-bold uppercase tracking-widest text-xs flex items-center gap-2 bg-primary text-primary-foreground">
              <CheckCircle className="w-4 h-4" />
              Hire
            </Button>
          </div>
        </div>

        {/* Split View */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          
          {/* Left Column: AI Analysis */}
          <div className="w-full lg:w-5/12 flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
            
            {/* Profile Header Card */}
            <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-black text-foreground tracking-tighter">{candidate.name}</h1>
                  <p className="font-bold text-xs text-muted-foreground uppercase tracking-widest mt-1">
                    {candidate.location}
                  </p>
                </div>
                <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-3 py-1 border-2 border-green-800 dark:border-green-100 font-black text-lg">
                  {candidate.matchScore}% Match
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-secondary text-foreground border-2 border-border px-3 py-1 font-bold text-xs uppercase tracking-widest">
                  {candidate.yoe}
                </span>
                <span className="bg-secondary text-foreground border-2 border-border px-3 py-1 font-bold text-xs uppercase tracking-widest">
                  {candidate.education}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t-2 border-border">
                <div>
                  <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Current Role</p>
                  <p className="font-bold text-sm text-foreground">{candidate.currentRole}</p>
                </div>
                <div>
                  <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Expected Salary</p>
                  <p className="font-bold text-sm text-foreground">{candidate.expectedSalary}</p>
                </div>
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="bg-primary/5 border-2 border-primary p-6 relative shadow-[4px_4px_0px_0px_rgba(79,70,229,0.3)]">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-primary w-5 h-5" />
                <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">AI Match Summary</h3>
              </div>
              <p className="font-medium text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {aiSummary}
              </p>
            </div>

            {/* Requirements Checklist */}
            <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
              <h3 className="text-xl font-black text-foreground tracking-tighter uppercase mb-6">Requirements Analysis</h3>
              
              <div className="space-y-6">
                {/* Matched */}
                <div>
                  <h4 className="font-bold text-xs text-green-600 dark:text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Matched Requirements ({requirements.matched.length})
                  </h4>
                  <ul className="space-y-4">
                    {requirements.matched.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="text-green-600 dark:text-green-400 w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-sm text-foreground">{req.title}</p>
                          <p className="font-medium text-xs text-muted-foreground mt-1">{req.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t-2 border-border"></div>

                {/* Missing */}
                <div>
                  <h4 className="font-bold text-xs text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Missing Requirements ({requirements.missing.length})
                  </h4>
                  <ul className="space-y-4">
                    {requirements.missing.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <XCircle className="text-rose-600 dark:text-rose-400 w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-sm text-foreground">{req.title}</p>
                          <p className="font-medium text-xs text-muted-foreground mt-1">{req.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Document Viewer */}
          <div className="w-full lg:w-7/12 bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] flex flex-col h-full min-h-[600px]">
            {/* Viewer Toolbar */}
            <div className="bg-secondary/50 border-b-2 border-border p-3 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <FileText className="text-muted-foreground w-5 h-5" />
                <span className="font-bold text-xs text-foreground uppercase tracking-widest">{resumeUrl}</span>
              </div>
              <div className="flex items-center gap-1 bg-background border-2 border-border p-1">
                <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-black text-xs text-foreground px-3">100%</span>
                <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-0.5 h-4 bg-border mx-2"></div>
                <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mock PDF Content Area */}
            <div className="flex-1 bg-background overflow-y-auto p-4 md:p-8 flex justify-center custom-scrollbar">
              <div className="bg-white text-black w-full max-w-[800px] min-h-[1056px] shadow-lg border border-gray-200 p-8 md:p-12">
                <div className="border-b-4 border-black pb-6 mb-8">
                  <h1 className="text-5xl font-black mb-2 uppercase tracking-tighter">Sarah Jenkins</h1>
                  <p className="text-gray-600 font-bold text-sm tracking-widest">SAN FRANCISCO, CA | SARAH.JENKINS@EMAIL.COM | (555) 123-4567</p>
                </div>

                <div className="mb-10">
                  <h2 className="text-xl font-black uppercase tracking-widest mb-6 border-l-4 border-black pl-3">Experience</h2>
                  
                  <div className="mb-8">
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-black text-lg uppercase tracking-wide">Lead Product Designer</h3>
                      <span className="font-bold text-sm text-gray-500">2020 - Present</span>
                    </div>
                    <p className="font-bold text-sm text-indigo-600 mb-4 uppercase tracking-widest">FinTech Corp, San Francisco, CA</p>
                    <ul className="list-disc list-inside font-medium text-sm text-gray-700 space-y-2">
                      <li>Spearheaded the redesign of the core dashboard, improving user retention by 24%.</li>
                      <li>Established and maintained the company&apos;s first comprehensive design system in Figma.</li>
                      <li>Collaborated cross-functionally with PMs and engineering leads to deliver quarterly roadmap initiatives.</li>
                      <li>Mentored 3 junior designers, providing weekly portfolio reviews and guidance.</li>
                    </ul>
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-black text-lg uppercase tracking-wide">UX/UI Designer</h3>
                      <span className="font-bold text-sm text-gray-500">2017 - 2020</span>
                    </div>
                    <p className="font-bold text-sm text-indigo-600 mb-4 uppercase tracking-widest">HealthTech Solutions, Austin, TX</p>
                    <ul className="list-disc list-inside font-medium text-sm text-gray-700 space-y-2">
                      <li>Designed end-to-end patient onboarding flows for mobile and web platforms.</li>
                      <li>Conducted extensive user research and usability testing sessions with over 50 participants.</li>
                      <li>Reduced onboarding drop-off rate by 15% through iterative A/B testing.</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-10">
                  <h2 className="text-xl font-black uppercase tracking-widest mb-6 border-l-4 border-black pl-3">Education</h2>
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-black text-lg uppercase tracking-wide">MFA in Interaction Design</h3>
                      <span className="font-bold text-sm text-gray-500">2017</span>
                    </div>
                    <p className="font-bold text-sm text-gray-700 uppercase tracking-widest">California College of the Arts</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-black uppercase tracking-widest mb-6 border-l-4 border-black pl-3">Skills</h2>
                  <p className="font-medium text-sm text-gray-700 leading-relaxed">
                    <strong className="font-black text-black uppercase tracking-wider mr-2">Design:</strong> UI/UX Design, Rapid Prototyping, Wireframing, User Research, Usability Testing, Design Systems, Information Architecture.<br/><br/>
                    <strong className="font-black text-black uppercase tracking-wider mr-2">Tools:</strong> Figma, Sketch, Adobe Creative Suite, Principle, InVision, JIRA.<br/><br/>
                    <strong className="font-black text-black uppercase tracking-wider mr-2">Technical:</strong> Basic HTML/CSS, understanding of React component structures.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
}
