# 5. Development Roadmap (4-Week Sprint)

This document tracks the progress of the Smart Job Portal & Resume Analyzer against the defined 4-week final-year project timeline. 

Because we prioritized tackling the highest-risk technical challenges first (Agentic LLMs, GPU deployment, and WebSockets), the timeline currently reflects that **Weeks 3 and 4 are largely complete ahead of schedule.** The remaining focus is on the web foundation (Weeks 1 and 2).

---

## 🟢 Week 3 & 4 (COMPLETED: AI Microservice Phase)
*The core intelligence engine has been built and verified.*

- [x] **FastAPI Setup:** Initialize Python backend.
- [x] **Modal vLLM Integration:** Deploy `google/gemma-4-E2B-it` to a serverless NVIDIA L4 GPU for high-speed inference.
- [x] **Resume Parsing Pipeline:** Implement structured JSON extraction for skills, experience, and match scoring (`llm_service.py`).
- [x] **LangGraph Orchestration:** Implement the state machine managing the HR Agent and Technical Agent (`interview_graph.py`).
- [x] **WebSocket Integration:** Build the bidirectional streaming endpoint for real-time AI mock interviews (`interview.py`).

---

## 🟡 Week 1 (NEXT PHASE: Foundation)
*Setting up the Next.js frontend and PostgreSQL database.*

- [ ] **Next.js Initialization:** Bootstrap the project using App Router, Tailwind CSS, and Shadcn UI.
- [ ] **Database Schema:** Initialize Prisma and push the schema (Users, Jobs, Applications) to the Neon.tech database.
- [ ] **Authentication:** Implement role-based authentication using NextAuth.js (Admin, Employer, Job Seeker).
- [ ] **Layouts:** Create the base structural layouts (Navigation bars, sidebars) protected by role.

---

## 🔴 Week 2 (PENDING: Core Web App)
*Building out the CRUD interfaces and connecting the AI endpoints.*

- [ ] **Job Seeker Dashboard:** Profile creation, PDF resume upload, and job browsing.
- [ ] **Employer Dashboard:** Job posting CRUD and applicant management table.
- [ ] **API Integration (Parsing):** Wire the "Apply to Job" button to send the PDF to the FastAPI `/api/v1/resume/parse` endpoint and save the Match Score.
- [ ] **UI Integration (Mock Interview):** Build the chat interface that connects to the FastAPI `ws://` endpoint, handling the real-time streamed responses from the HR/Technical agents.
