import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from chatbot.api.chatbot_routes import router as chatbot_router

# Create FastAPI app
app = FastAPI(
    title="Campus Event Chatbot API",
    description="AI-powered chatbot for campus event management assistance",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "https://*.replit.dev", "*"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include chatbot routes
app.include_router(chatbot_router)

@app.get("/")
async def root():
    return {"message": "Campus Event Chatbot API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "api": "chatbot"}

if __name__ == "__main__":
    port = int(os.getenv("CHATBOT_PORT", "8001"))
    uvicorn.run(
        "chatbot.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )