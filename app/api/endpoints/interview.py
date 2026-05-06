from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import logging
from langchain_core.messages import HumanMessage

from app.services.interview_graph import interview_graph, generate_interview_evaluation

logger = logging.getLogger(__name__)
router = APIRouter()

@router.websocket("/{session_id}")
async def interview_websocket(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for the Multi-Agent Mock Interview.
    Expects an initial JSON payload with context:
    { "type": "init", "resume_data": {...}, "job_description": "..." }
    Subsequent messages are expected to be JSON:
    { "type": "message", "content": "..." }
    """
    await websocket.accept()
    logger.info(f"WebSocket connected for session: {session_id}")
    
    # LangGraph thread configuration
    config = {"configurable": {"thread_id": session_id}}
    
    try:
        # Wait for the initialization payload
        init_raw = await websocket.receive_text()
        try:
            init_payload = json.loads(init_raw)
        except json.JSONDecodeError:
            await websocket.send_json({"error": "Expected JSON initialization payload."})
            await websocket.close()
            return
            
        if init_payload.get("type") != "init":
            await websocket.send_json({"error": "First message must be type: 'init'"})
            await websocket.close()
            return
            
        # Kick off the graph by passing the initial state
        # We don't pass a message yet, so it naturally flows to the HR agent
        # which will ask the first question.
        initial_state = {
            "resume_data": init_payload.get("resume_data", {}),
            "job_description": init_payload.get("job_description", ""),
            "current_agent": "hr",
            "question_count": 0
        }
        
        await websocket.send_json({"type": "system", "content": "Starting interview session..."})
        
        # Invoke the graph to get the first question
        async for output in interview_graph.astream(initial_state, config=config):
            # output is a dict keyed by the node name that just ran
            for node_name, state_update in output.items():
                if "messages" in state_update and state_update["messages"]:
                    last_msg = state_update["messages"][-1]
                    content = last_msg.content
                    
                    # Clean up internal transition tokens before sending to client
                    if "<HANDOFF_TO_TECH>" in content:
                        content = content.replace("<HANDOFF_TO_TECH>", "").strip()
                        await websocket.send_json({"type": "system", "content": "Transitioning to Technical Interview..."})
                        
                    if "<END_INTERVIEW>" in content:
                        content = content.replace("<END_INTERVIEW>", "").strip()
                        await websocket.send_json({"type": "agent", "agent": node_name, "content": content})
                        await websocket.send_json({"type": "system", "content": "Interview Concluded."})
                        await websocket.close()
                        return
                    
                    if content:
                        await websocket.send_json({"type": "agent", "agent": node_name, "content": content})

        # Main chat loop
        while True:
            # Wait for user input
            raw_msg = await websocket.receive_text()
            try:
                msg_data = json.loads(raw_msg)
            except json.JSONDecodeError:
                await websocket.send_json({"error": "Expected JSON payload."})
                continue
                
            if msg_data.get("type") != "message":
                continue
                
            user_content = msg_data.get("content", "").strip()
            if not user_content:
                continue
                
            # Send the user message into the graph
            human_msg = HumanMessage(content=user_content)
            
            # Streaming the graph's execution
            async for output in interview_graph.astream({"messages": [human_msg]}, config=config):
                for node_name, state_update in output.items():
                    if "messages" in state_update and state_update["messages"]:
                        last_msg = state_update["messages"][-1]
                        # Only forward AI messages (to prevent echoing user input back incorrectly)
                        if last_msg.type == "ai":
                            content = last_msg.content
                            
                            # Intercept routing tokens
                            if "<HANDOFF_TO_TECH>" in content:
                                content = content.replace("<HANDOFF_TO_TECH>", "").strip()
                                if content:
                                    await websocket.send_json({"type": "agent", "agent": node_name, "content": content})
                                await websocket.send_json({"type": "system", "content": "Transitioning to Technical Interview..."})
                                continue # Graph will automatically continue to tech_agent
                                
                            if "<END_INTERVIEW>" in content:
                                content = content.replace("<END_INTERVIEW>", "").strip()
                                if content:
                                    await websocket.send_json({"type": "agent", "agent": node_name, "content": content})
                                await websocket.send_json({"type": "system", "content": "Interview Concluded. Generating evaluation..."})
                                
                                # Generate evaluation using the conversation history
                                try:
                                    # Use asyncio.to_thread because the LLM call is synchronous
                                    import asyncio
                                    # Fetch current state directly from the graph
                                    current_state = interview_graph.get_state(config)
                                    state_values = current_state.values
                                    
                                    resume_data = state_values.get("resume_data", {})
                                    job_desc = state_values.get("job_description", "")
                                    msgs = state_values.get("messages", [])
                                    
                                    evaluation = await asyncio.to_thread(
                                        generate_interview_evaluation,
                                        msgs,
                                        resume_data,
                                        job_desc
                                    )
                                    await websocket.send_json({"type": "evaluation", "scores": evaluation})
                                except Exception as e:
                                    logger.error(f"Evaluation generation failed: {e}")
                                    await websocket.send_json({"type": "error", "message": "Failed to generate evaluation."})
                                    
                                await websocket.close()
                                return
                                
                            if content:
                                await websocket.send_json({"type": "agent", "agent": node_name, "content": content})
                                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session: {session_id}")
        print(f"WS Disconnected: {session_id}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Error in interview websocket: {e}")
        try:
            await websocket.send_json({"error": str(e)})
            await websocket.close()
        except:
            pass
