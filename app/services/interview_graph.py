"""
LangGraph orchestration for the Multi-Agent Mock Interview.
"""

import os
from typing import Literal, TypedDict, Annotated
from langchain_core.messages import AnyMessage, SystemMessage, HumanMessage, AIMessage
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver

# ---------------------------------------------------------------------------
# State Schema
# ---------------------------------------------------------------------------
class InterviewState(TypedDict):
    """The state dictionary passed between all nodes in the interview graph."""
    messages: Annotated[list[AnyMessage], add_messages]
    resume_data: dict
    job_description: str
    current_agent: Literal["hr", "technical", "concluded"]
    question_count: int

# ---------------------------------------------------------------------------
# LLM Initialization
# ---------------------------------------------------------------------------
MODAL_ENDPOINT_URL = os.getenv("MODAL_ENDPOINT_URL", "").rstrip("/")
if not MODAL_ENDPOINT_URL:
    raise RuntimeError("MODAL_ENDPOINT_URL must be set in the environment.")

# We use ChatOpenAI because vLLM on Modal serves an OpenAI-compatible API
llm = ChatOpenAI(
    base_url=f"{MODAL_ENDPOINT_URL}/v1",
    api_key="none",  # Not strictly required by our vLLM deployment
    model="llm",     # 'llm' is the served-model-name configured in Modal
    temperature=0.7,
    max_tokens=256,
)

# ---------------------------------------------------------------------------
# Node Functions
# ---------------------------------------------------------------------------

def hr_agent(state: InterviewState):
    """
    The HR Agent asks behavioral and culture-fit questions based on the resume.
    """
    messages = state.get("messages", [])
    resume = state.get("resume_data", {})
    jd = state.get("job_description", "")
    
    # System prompt for the HR agent
    sys_prompt = SystemMessage(content=(
        "You are an expert HR Recruiter conducting the first half of a mock interview. "
        "Your goal is to assess culture fit, communication skills, and past experience based on the candidate's resume. "
        f"\n\nJOB DESCRIPTION:\n{jd}"
        f"\n\nCANDIDATE RESUME DATA:\n{resume}"
        "\n\nInstructions: Ask exactly one behavioral question at a time. Do not answer for the candidate. "
        "Keep your responses very concise and conversational (1-3 sentences max). "
        "If you have asked 4 questions and received responses, or if you feel the behavioral assessment is complete, "
        "you MUST output the exact keyword '<HANDOFF_TO_TECH>' at the end of your message to transition to the Technical round."
    ))
    
    # Prepend the system prompt dynamically
    conversation = [sys_prompt] + messages
    
    response = llm.invoke(conversation)
    
    return {"messages": [response], "current_agent": "hr"}

def tech_agent(state: InterviewState):
    """
    The Technical Agent asks domain-specific technical questions based on the job description.
    """
    messages = state.get("messages", [])
    resume = state.get("resume_data", {})
    jd = state.get("job_description", "")
    
    sys_prompt = SystemMessage(content=(
        "You are a Senior Engineering Manager conducting the technical portion of a mock interview. "
        "The HR recruiter has just handed the candidate over to you. The conversation history above is between the HR recruiter and the candidate. "
        "YOU have not asked any questions yet. "
        "Your goal is to assess the candidate's hard skills, system design knowledge, and problem-solving abilities "
        "based strictly on the technologies mentioned in the Job Description and the candidate's resume. "
        f"\n\nJOB DESCRIPTION:\n{jd}"
        f"\n\nCANDIDATE RESUME DATA:\n{resume}"
        "\n\nInstructions: Ask exactly one technical question at a time. Do not answer for the candidate. "
        "Keep your responses concise and conversational (1-3 sentences max). "
        "Start your first message by introducing yourself as the Engineering Manager and asking your first technical question. "
        "Once YOU personally have asked 3 to 4 technical questions and received responses to them, "
        "you MUST output the exact keyword '<END_INTERVIEW>' to finish the interview and provide brief feedback."
    ))
    
    # Filter out the internal system messages and just pass the conversation
    conversation = [sys_prompt] + messages
    
    response = llm.invoke(conversation)
    
    return {"messages": [response], "current_agent": "technical"}

# ---------------------------------------------------------------------------
# Routing Logic
# ---------------------------------------------------------------------------

def start_router(state: InterviewState) -> Literal["hr_agent", "tech_agent"]:
    """Routes the new user input to the correct agent."""
    if state.get("current_agent") == "technical":
        return "tech_agent"
    return "hr_agent"

def router(state: InterviewState) -> Literal["hr_agent", "tech_agent", "__end__"]:
    """
    Determines the next node based on the current state and latest message.
    In a chat UI loop, we usually route to END after an AI response, so the graph 
    pauses and waits for the next user input. But we also need to handle agent transitions.
    """
    messages = state.get("messages", [])
    if not messages:
        # Should never happen if we start properly
        return END
        
    last_message = messages[-1]
    
    # If the last message was from an AI, check for transition keywords
    if isinstance(last_message, AIMessage):
        content = str(last_message.content)
        
        if "<HANDOFF_TO_TECH>" in content:
            # We want to immediately trigger the tech agent, so the tech agent can introduce itself
            # We don't route to END here, we transition directly.
            # But the state mutation needs to happen. We'll handle state mutation in the route, 
            # or rely on the graph runner to update `current_agent`.
            # For simplicity, if we see HANDOFF, we return 'tech_agent' to chain the nodes.
            return "tech_agent"
            
        if "<END_INTERVIEW>" in content:
            return END
            
        # Otherwise, the AI just asked a question, pause the graph to wait for user input
        return END

    return END

# ---------------------------------------------------------------------------
# Evaluation Logic
# ---------------------------------------------------------------------------
from pydantic import BaseModel, Field
import json

class InterviewEvaluation(BaseModel):
    hr_score: int = Field(description="HR/Behavioral score from 0 to 100")
    technical_score: int = Field(description="Technical score from 0 to 100")
    improvement_areas: str = Field(description="Areas where the candidate can improve")

def generate_interview_evaluation(messages: list[AnyMessage], resume: dict, jd: str) -> dict:
    """Evaluates the entire interview transcript and returns scores and feedback."""
    eval_llm = llm.with_structured_output(InterviewEvaluation)
    
    transcript = ""
    for msg in messages:
        if isinstance(msg, HumanMessage):
            transcript += f"Candidate: {msg.content}\n"
        elif isinstance(msg, AIMessage):
            transcript += f"Interviewer: {msg.content}\n"
            
    prompt = SystemMessage(content=(
        "You are an expert Interview Evaluator. Review the transcript of this mock interview "
        "along with the job description and candidate resume. Provide an objective evaluation.\n\n"
        f"JOB DESCRIPTION:\n{jd}\n\n"
        f"CANDIDATE RESUME:\n{resume}\n\n"
        f"TRANSCRIPT:\n{transcript}"
    ))
    
    try:
        evaluation = eval_llm.invoke([prompt])
        return evaluation.dict()
    except Exception as e:
        # Fallback if structured output fails
        return {
            "hr_score": 75,
            "technical_score": 75,
            "improvement_areas": "Failed to generate structured evaluation. Please review transcript manually."
        }

# ---------------------------------------------------------------------------
# Graph Compilation
# ---------------------------------------------------------------------------

def build_interview_graph():
    """Builds and returns the compiled LangGraph StateGraph."""
    workflow = StateGraph(InterviewState)
    
    # Add nodes
    workflow.add_node("hr_agent", hr_agent)
    workflow.add_node("tech_agent", tech_agent)
    
    # Add routing edges
    # START -> conditional routing
    workflow.add_conditional_edges(START, start_router)
    
    # HR Agent outputs go to the router
    workflow.add_conditional_edges("hr_agent", router)
    
    # Tech Agent outputs go to the router
    workflow.add_conditional_edges("tech_agent", router)
    
    # Memory saver for state persistence across WebSocket messages
    memory = MemorySaver()
    
    # Compile
    return workflow.compile(checkpointer=memory)

# Export the compiled graph
interview_graph = build_interview_graph()
