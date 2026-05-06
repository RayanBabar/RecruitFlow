import { useState, useEffect, useRef, useCallback } from "react";

interface InterviewMessage {
  speaker: "HR" | "Technical" | "User" | "System";
  text: string;
}

export interface InterviewContext {
  jobData?: {
    title: string;
    description: string;
    requirements?: string;
  };
  profileData?: {
    resumeData?: Record<string, unknown>;
  };
}

interface EvaluationData {
  [key: string]: number;
}

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export function useInterviewWebSocket(
  candidateId: string, 
  jobId: string,
  context: InterviewContext | null = null
) {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!context) return; // Wait until context is loaded

    // Initialize WebSocket
    const ws = new WebSocket(`${WS_BASE_URL}/ws/interview/${candidateId}-${jobId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
      setMessages((prev) => [
        ...prev,
        { speaker: "System", text: "Connected to AI Interview Agents." },
      ]);
      
      // Send initialization payload
      const initPayload = {
        type: "init",
        resume_data: context.profileData?.resumeData || {},
        job_description: context.jobData ? `${context.jobData.title}\n${context.jobData.description}\n${context.jobData.requirements || ""}` : "General Software Engineer position",
      };
      ws.send(JSON.stringify(initPayload));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "agent") {
          setMessages((prev) => [
            ...prev,
            { speaker: data.agent.includes("hr") ? "HR" : "Technical", text: data.content },
          ]);
        } else if (data.type === "system") {
          setMessages((prev) => [
            ...prev,
            { speaker: "System", text: data.content },
          ]);
        } else if (data.type === "evaluation") {
          setEvaluation(data.scores);
        } else if (data.type === "error" || data.error) {
          setError(data.message || data.error || "Unknown error occurred");
        } else {
          // Fallback
          setMessages((prev) => [
            ...prev,
            { speaker: "System", text: typeof data === 'string' ? data : JSON.stringify(data) },
          ]);
        }
      } catch {
        // Handle non-JSON streaming text
        setMessages((prev) => [
          ...prev,
          { speaker: "System", text: event.data },
        ]);
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket Error:", e);
      setError("WebSocket connection error.");
    };

    ws.onclose = () => {
      setIsConnected(false);
      setMessages((prev) => [
        ...prev,
        { speaker: "System", text: "Disconnected from AI Interview Agents." },
      ]);
    };

    return () => {
      ws.close();
    };
  }, [candidateId, jobId, context]);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "message", content: text }));
      setMessages((prev) => [...prev, { speaker: "User", text }]);
    } else {
      setError("Cannot send message: Not connected.");
    }
  }, []);

  return { messages, isConnected, error, sendMessage, evaluation };
}
