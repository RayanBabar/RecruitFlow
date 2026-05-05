"use client";

import { DashboardLayout } from "@/components/features/dashboard/DashboardLayout";
import { mockInterviewData } from "@/data/mockData";
import { PhoneOff, Mic, Paperclip, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function MockInterviewPage() {
  const { messages } = mockInterviewData;

  return (
    <DashboardLayout role="seeker">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col h-[calc(100vh-6rem)] relative border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] bg-card"
      >
        {/* Chat Header */}
        <header className="h-20 flex-shrink-0 bg-secondary/50 border-b-2 border-border px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-primary border-2 border-border flex items-center justify-center font-black text-primary-foreground text-xl">
                HR
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black dark:border-white"></span>
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tighter uppercase">HR Agent</h2>
              <p className="font-bold text-xs text-green-600 dark:text-green-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                <Sparkles className="w-3 h-3" />
                AI Active
              </p>
            </div>
          </div>
          <Button variant="outline" className="border-2 border-border rounded-none font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-rose-500 hover:text-white transition-colors group text-rose-600">
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">End Interview</span>
          </Button>
        </header>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-background relative custom-scrollbar">
          {/* Noise overlay for chat bg */}
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none z-0 mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
          
          {/* Context Date/Time Divider */}
          <div className="flex items-center justify-center w-full my-2 relative z-10">
            <span className="bg-secondary border-2 border-border text-foreground font-bold text-[10px] uppercase tracking-widest px-4 py-1">
              Today, 10:00 AM
            </span>
          </div>

          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-4 max-w-[85%] md:max-w-[70%] relative z-10 ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              <div className={`w-10 h-10 border-2 border-border flex items-center justify-center font-black text-sm shrink-0 hidden md:flex ${msg.role === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                {msg.role === 'ai' ? 'HR' : 'YOU'}
              </div>
              <div className={`p-5 border-2 border-border ${msg.role === 'user' ? 'bg-primary text-primary-foreground shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[-4px_4px_0px_0px_rgba(255,255,255,0.1)]' : 'bg-card text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]'}`}>
                {msg.content.map((paragraph, pIdx) => (
                  <p key={pIdx} className={`font-medium text-sm leading-relaxed ${pIdx > 0 ? 'mt-4' : ''}`}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* AI Typing Indicator (Simulated) */}
          <div className="flex items-start gap-4 self-start max-w-[85%] md:max-w-[70%] mt-2 opacity-70 relative z-10">
            <div className="w-10 h-10 border-2 border-border bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shrink-0 hidden md:flex">
              HR
            </div>
            <div className="bg-card p-4 border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] flex gap-2 items-center h-12 w-20 justify-center">
              <div className="w-2 h-2 bg-foreground animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-foreground animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-foreground animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>

        {/* Chat Input Area */}
        <div className="bg-secondary/50 border-t-2 border-border p-6 flex-shrink-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            {/* Input Field Container */}
            <div className="flex-1 bg-background border-2 border-border flex items-center px-4 py-2 focus-within:border-foreground transition-colors">
              <button aria-label="Use Microphone" className="text-muted-foreground hover:text-foreground p-2 rounded transition-colors flex-shrink-0 hover:bg-secondary">
                <Mic className="w-5 h-5" />
              </button>
              <Input 
                className="flex-1 border-none focus-visible:ring-0 px-4 font-bold text-sm tracking-wider uppercase bg-transparent" 
                placeholder="Type your response or use the mic..." 
              />
              <button aria-label="Attach File" className="text-muted-foreground hover:text-foreground p-2 rounded transition-colors flex-shrink-0 hover:bg-secondary">
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
            {/* Send Button */}
            <Button className="h-[52px] w-[52px] border-2 border-transparent hover:border-foreground rounded-none bg-primary text-primary-foreground flex items-center justify-center transition-colors flex-shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
              <Send className="w-6 h-6 ml-1" />
            </Button>
          </div>
          <div className="text-center mt-4">
            <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
              AI responses are generated based on the specific job description and your profile.
            </p>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
