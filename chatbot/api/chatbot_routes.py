from fastapi import APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from chatbot.models.chat_models import ChatRequest, ChatResponse
from chatbot.services.groq_service import GroqChatService
from typing import List

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

# Initialize the Groq service
groq_service = GroqChatService()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Send a message to the chatbot and get a response
    """
    try:
        response = groq_service.chat(
            message=request.message,
            conversation_id=request.conversation_id
        )
        
        return ChatResponse(
            message=response["message"],
            conversation_id=response["conversation_id"],
            timestamp=response["timestamp"]
        )
    
    except Exception as e:
        print(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/conversation/{conversation_id}")
async def get_conversation_history(conversation_id: str):
    """
    Get the conversation history for a specific conversation
    """
    try:
        history = groq_service.get_conversation_history(conversation_id)
        return {"conversation_id": conversation_id, "messages": history}
    
    except Exception as e:
        print(f"Get conversation error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/conversation/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """
    Clear a conversation history
    """
    try:
        success = groq_service.clear_conversation(conversation_id)
        if success:
            return {"message": "Conversation cleared successfully"}
        else:
            raise HTTPException(status_code=404, detail="Conversation not found")
    
    except Exception as e:
        print(f"Clear conversation error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/health")
async def health_check():
    """
    Health check endpoint for the chatbot service
    """
    return {"status": "healthy", "service": "chatbot"}