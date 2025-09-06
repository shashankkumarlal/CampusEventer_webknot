import os
from groq import Groq
from typing import List
import uuid
from datetime import datetime

class GroqChatService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY environment variable is required")
        
        self.client = Groq(api_key=self.api_key)
        
        # Store conversation history in memory (in production, use a database)
        self.conversations = {}
    
    def get_system_prompt(self) -> str:
        return """You are a helpful AI assistant for a Campus Event Management Platform. You can help users with:

1. **Event Information**: Answer questions about campus events, registration processes, and event details
2. **Platform Features**: Explain how to use the platform's features like event creation, registration, attendance tracking
3. **General Assistance**: Help with navigation, account management, and platform-related queries

Key features of the platform:
- Students can browse and register for events
- Administrators can create and manage events
- Real-time event capacity tracking
- Attendance management and feedback collection
- Analytics dashboard for event insights

Be friendly, helpful, and concise in your responses. If users ask about specific events or account details, remind them that you can provide general guidance but they should check the platform directly for their personal information."""

    def generate_conversation_id(self) -> str:
        return str(uuid.uuid4())

    def chat(self, message: str, conversation_id: str | None = None) -> dict:
        if not conversation_id:
            conversation_id = self.generate_conversation_id()
            self.conversations[conversation_id] = []

        # Get conversation history
        history = self.conversations.get(conversation_id, [])
        
        # Prepare messages for the API
        messages = [{"role": "system", "content": self.get_system_prompt()}]
        
        # Add conversation history
        for msg in history[-10:]:  # Keep last 10 messages for context
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Add current user message
        messages.append({"role": "user", "content": message})
        
        try:
            # Get response from Groq
            response = self.client.chat.completions.create(
                model="llama-3.1-70b-versatile",
                messages=messages,
                temperature=0.7,
                max_tokens=1024
            )
            response_content = response.choices[0].message.content
            
            # Update conversation history
            timestamp = datetime.now()
            
            # Add user message to history
            self.conversations[conversation_id].append({
                "id": str(uuid.uuid4()),
                "role": "user",
                "content": message,
                "timestamp": timestamp
            })
            
            # Add assistant response to history
            self.conversations[conversation_id].append({
                "id": str(uuid.uuid4()),
                "role": "assistant", 
                "content": response_content,
                "timestamp": timestamp
            })
            
            return {
                "message": response_content,
                "conversation_id": conversation_id,
                "timestamp": timestamp
            }
            
        except Exception as e:
            print(f"Error in Groq API call: {e}")
            return {
                "message": "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
                "conversation_id": conversation_id,
                "timestamp": datetime.now()
            }

    def get_conversation_history(self, conversation_id: str) -> List[dict]:
        return self.conversations.get(conversation_id, [])

    def clear_conversation(self, conversation_id: str) -> bool:
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]
            return True
        return False