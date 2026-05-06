import asyncio
import websockets
import json

async def test():
    uri = "ws://localhost:8000/ws/interview/test-session-123"
    headers = {"Origin": "http://localhost:3000"}
    try:
        async with websockets.connect(uri, additional_headers=headers) as websocket:
            init_payload = {
                "type": "init",
                "resume_data": {"name": "Test User", "experience": "5 years Python"},
                "job_description": "Senior Python Engineer"
            }
            await websocket.send(json.dumps(init_payload))
            
            while True:
                response = await websocket.recv()
                print("Received:", response)
                data = json.loads(response)
                
                if data.get("type") == "agent":
                    msg = {"type": "message", "content": "This is a test response."}
                    await websocket.send(json.dumps(msg))
                    print("Sent:", msg)
                    
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
