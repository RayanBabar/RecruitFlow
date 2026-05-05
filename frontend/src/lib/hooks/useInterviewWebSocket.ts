import { useState, useEffect, useRef, useCallback } from "react";

interface InterviewMessage {
  speaker: "HR" | "Technical" | "User" | "System";
  text: string;
}

export function useInterviewWebSocket(candidateId: string, jobId: string) {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1";

  useEffect(() => {
    // Initialize WebSocket
    const ws = new WebSocket(`${WS_URL}/interview/ws/${candidateId}/${jobId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
      setMessages((prev) => [
        ...prev,
        { speaker: "System", text: "Connected to AI Interview Agents." },
      ]);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "agent_response") {
          setMessages((prev) => [
            ...prev,
            { speaker: data.agent === "hr" ? "HR" : "Technical", text: data.message },
          ]);
        } else if (data.type === "error") {
          setError(data.message);
        } else {
          // Fallback for raw text chunks if streaming directly
          setMessages((prev) => [
            ...prev,
            { speaker: "System", text: event.data },
          ]);
        }
      } catch (e) {
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
  }, [candidateId, jobId, WS_URL]);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text }));
      setMessages((prev) => [...prev, { speaker: "User", text }]);
    } else {
      setError("Cannot send message: Not connected.");
    }
  }, []);

  return { messages, isConnected, error, sendMessage };
}
