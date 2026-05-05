import asyncio
import websockets
import json

async def test_interview():
    uri = "ws://localhost:8000/ws/interview/test-session-1"
    
    # Context
    init_payload = {
        "type": "init",
        "resume_data": {
            "skills": ["Python", "FastAPI", "React", "Docker"],
            "experience": [
                {"role": "Backend Engineer", "company": "Tech Corp", "duration": "3 years", "description": "Built scalable APIs."}
            ]
        },
        "job_description": "Senior Software Engineer. Must have strong Python, FastAPI, and system design skills. Experience with containerization is a plus."
    }
    
    print("Connecting to WebSocket...")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected. Sending init payload...")
            await websocket.send(json.dumps(init_payload))
            
            # Listen to incoming messages in a loop
            async def receive_loop():
                try:
                    while True:
                        msg = await websocket.recv()
                        data = json.loads(msg)
                        
                        if data.get("type") == "system":
                            print(f"\n[SYSTEM]: {data.get('content')}")
                        elif data.get("type") == "agent":
                            agent_name = "HR Recruiter" if data.get('agent') == "hr_agent" else "Technical Manager"
                            print(f"\n[{agent_name}]: {data.get('content')}")
                        elif data.get("error"):
                            print(f"\n[ERROR]: {data.get('error')}")
                except websockets.exceptions.ConnectionClosed:
                    print("\n[SYSTEM]: Connection closed.")
            
            # Start listener task
            listener = asyncio.create_task(receive_loop())
            
            # Let the first agent question come through
            await asyncio.sleep(2)
            
            # Simulate user responding
            responses = [
                "Hi! I'm doing well, thank you. I'm excited to be here.",
                "Yes, in my last role I built several microservices using FastAPI and Docker, which really improved our deployment times.",
                "Sure, I typically start by understanding the data models and then sketch out the API contracts."
            ]
            
            for i, response in enumerate(responses):
                print(f"\n[YOU]: {response}")
                await websocket.send(json.dumps({
                    "type": "message",
                    "content": response
                }))
                # Wait longer to give LLM time to generate
                await asyncio.sleep(10)
                
            # Wait a bit before terminating
            await asyncio.sleep(5)
            listener.cancel()
            
    except Exception as e:
        print(f"Failed to connect or error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(test_interview())
