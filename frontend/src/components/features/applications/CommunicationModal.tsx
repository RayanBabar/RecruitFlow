"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Link as LinkIcon, MessageSquare } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    name: string;
    role: string;
  };
}

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  seekerName: string;
  jobTitle: string;
  userRole: "EMPLOYER" | "SEEKER";
}

export function CommunicationModal({ isOpen, onClose, applicationId, seekerName, jobTitle, userRole }: CommunicationModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, [applicationId]);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, applicationId, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const triggerAction = async (type: string, metadata: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, metadata }),
      });
      if (res.ok) {
        setNewMessage(`[Action] Sent ${type.toLowerCase().replace("_", " ")}`);
        handleSendMessage();
      }
    } catch (error) {
      console.error("Failed to trigger action:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 border-4 border-foreground shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-none">
        <DialogHeader className="p-6 border-b-4 border-foreground bg-secondary">
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
            Interview Hub: {seekerName}
          </DialogTitle>
          <DialogDescription className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
            {jobTitle} • Candidate Coordination
          </DialogDescription>
        </DialogHeader>

        {/* Action Center Bar - Employer Only */}
        {userRole === "EMPLOYER" && (
          <div className="flex gap-2 p-4 bg-muted border-b-2 border-foreground overflow-x-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const link = window.prompt("Enter Meeting Link (Google Meet/Zoom):");
                if (!link) return;
                const instructions = window.prompt("Enter Time/Instructions (e.g., Tomorrow at 2 PM):");
                if (!instructions) return;
                triggerAction("SEND_LINK", { url: link, instructions });
              }}
              className="rounded-none border-2 border-foreground font-black text-[10px] uppercase h-8 hover:bg-foreground hover:text-background transition-colors"
            >
              <LinkIcon className="w-3 h-3 mr-2" /> Share Meet Link
            </Button>
          </div>
        )}

        {/* Message Feed */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-background scrollbar-hide"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex flex-col ${m.sender.role === "EMPLOYER" ? "items-end" : "items-start"}`}
              >
                <div 
                  className={`max-w-[80%] p-3 border-2 border-foreground font-bold text-sm ${
                    m.sender.role === "EMPLOYER" 
                      ? "bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" 
                      : "bg-secondary text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-50">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t-4 border-foreground bg-secondary">
          <div className="flex gap-3">
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className="rounded-none border-2 border-foreground font-bold h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isSending || !newMessage.trim()}
              className="rounded-none h-12 w-12 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all p-0"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
