import asyncio
from dotenv import load_dotenv
load_dotenv()

from app.services.interview_graph import interview_graph

async def test_graph():
    print("Testing graph directly...")
    initial_state = {
        "resume_data": {"skills": ["Python"]},
        "job_description": "We need Python.",
        "current_agent": "hr",
        "question_count": 0
    }
    
    config = {"configurable": {"thread_id": "direct-test-1"}}
    
    try:
        async for output in interview_graph.astream(initial_state, config=config):
            print("GRAPH OUTPUT:", output)
    except Exception as e:
        print("GRAPH ERROR:", e)

if __name__ == "__main__":
    asyncio.run(test_graph())
