import Groq from "groq-sdk";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ConversationHistory {
  [conversationId: string]: ChatMessage[];
}

export class ChatbotService {
  private groq: Groq;
  private conversations: ConversationHistory = {};

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is required");
    }
    this.groq = new Groq({ apiKey });
  }

  private getSystemPrompt(): string {
    return `You are a helpful AI assistant for a Campus Event Management Platform. You can help users with:

1. **Event Information**: Answer questions about campus events, registration processes, and event details
2. **Platform Features**: Explain how to use the platform's features like event creation, registration, attendance tracking
3. **General Assistance**: Help with navigation, account management, and platform-related queries

Key features of the platform:
- Students can browse and register for events
- Administrators can create and manage events
- Real-time event capacity tracking
- Attendance management and feedback collection
- Analytics dashboard for event insights

Be friendly, helpful, and concise in your responses. If users ask about specific events or account details, remind them that you can provide general guidance but they should check the platform directly for their personal information.`;
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async chat(message: string, conversationId?: string): Promise<{
    message: string;
    conversation_id: string;
    timestamp: Date;
  }> {
    if (!conversationId) {
      conversationId = this.generateConversationId();
      this.conversations[conversationId] = [];
    }

    // Get conversation history
    const history = this.conversations[conversationId] || [];

    // Prepare messages for the API
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: this.getSystemPrompt() }
    ];

    // Add recent conversation history (last 10 messages for context)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      if (msg.role !== "system") {
        messages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content
        });
      }
    }

    // Add current user message
    messages.push({ role: "user", content: message });

    try {
      // Get response from Groq
      const response = await this.groq.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const responseContent = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
      const timestamp = new Date();

      // Add user message to history
      this.conversations[conversationId].push({
        id: `msg_${Date.now()}_user`,
        role: "user",
        content: message,
        timestamp,
      });

      // Add assistant response to history
      this.conversations[conversationId].push({
        id: `msg_${Date.now()}_assistant`,
        role: "assistant",
        content: responseContent,
        timestamp,
      });

      return {
        message: responseContent,
        conversation_id: conversationId,
        timestamp,
      };

    } catch (error) {
      console.error("Error in Groq API call:", error);
      return {
        message: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        conversation_id: conversationId,
        timestamp: new Date(),
      };
    }
  }

  getConversationHistory(conversationId: string): ChatMessage[] {
    return this.conversations[conversationId] || [];
  }

  clearConversation(conversationId: string): boolean {
    if (conversationId in this.conversations) {
      delete this.conversations[conversationId];
      return true;
    }
    return false;
  }
}