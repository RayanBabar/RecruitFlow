from typing import Annotated, Literal
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
import asyncio

class State(TypedDict):
    messages: Annotated[list, add_messages]
    current_agent: str

def hr(state: State):
    return {"messages": ["HR!"], "current_agent": "hr"}

def tech(state: State):
    return {"messages": ["TECH!"], "current_agent": "tech"}

def route_start(state: State) -> Literal["hr", "tech"]:
    agent = state.get("current_agent", "hr")
    return agent

workflow = StateGraph(State)
workflow.add_node("hr", hr)
workflow.add_node("tech", tech)
workflow.add_conditional_edges(START, route_start)
workflow.add_edge("hr", END)
workflow.add_edge("tech", END)

app = workflow.compile()
print(app.invoke({"messages": [], "current_agent": "tech"}))
