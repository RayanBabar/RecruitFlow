# 4. API Contracts

## 4.1 Overview
The Next.js client primarily interacts with the PostgreSQL database through internal Next.js API Routes. However, for AI-driven functionality, Next.js communicates with the decoupled Python FastAPI microservice. 

Below are the contracts for the AI endpoints hosted on the FastAPI backend.

## 4.2 REST Endpoint: Resume Parsing & Scoring

Used when a Job Seeker applies to a job. The Next.js API route extracts text from the uploaded PDF and sends it to this endpoint to receive structured JSON.

* **Endpoint:** `POST <fastapi-url>/api/v1/resume/parse`
* **Content-Type:** `application/json`

### 4.2.1 Request Body
```json
{
  "job_description": "We are looking for a Senior React Developer...",
  "resume_text": "John Doe. 5 years experience with React and Node.js..."
}
```

### 4.2.2 Success Response (200 OK)
```json
{
  "skills": ["React", "Node.js", "TypeScript"],
  "education": [
    {
      "degree": "B.S. Computer Science",
      "institution": "University of Tech",
      "year": "2020"
    }
  ],
  "experience": [
    {
      "role": "Frontend Engineer",
      "company": "Tech Corp",
      "duration": "2020-2023",
      "description": "Built web applications using React."
    }
  ],
  "match_score": 85.5,
  "feedback": "Strong match based on React experience, but lacks AWS requirements."
}
```

## 4.3 WebSocket Endpoint: Mock Interview

Used for real-time streaming of the LangGraph multi-agent mock interview. The Next.js client connects directly to this endpoint from the browser.

* **Endpoint:** `WS <fastapi-url>/ws/interview/{session_id}`

### 4.3.1 Initialization (Client to Server)
The very first message sent by the client MUST be the context payload:
```json
{
  "type": "init",
  "resume_data": {
    "skills": ["React"],
    "experience": [...]
  },
  "job_description": "We are looking for a Senior React Developer..."
}
```

### 4.3.2 Server Responses (Server to Client)
The server will stream back messages. The `type` field distinguishes between system announcements and agent dialogue.

**System Message:**
```json
{
  "type": "system",
  "content": "Transitioning to Technical Interview..."
}
```

**Agent Message:**
```json
{
  "type": "agent",
  "agent": "hr_agent", 
  "content": "Welcome! Let's start with a behavioral question..."
}
```
*(Note: `agent` will either be `hr_agent` or `tech_agent`)*

### 4.3.3 Client Response (Client to Server)
When the user submits an answer to the agent:
```json
{
  "type": "message",
  "content": "I usually start by writing test cases..."
}
```
