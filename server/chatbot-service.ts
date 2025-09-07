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
        model: "llama3-8b-8192",
        messages,
        temperature: 0.7,
        max_tokens: 512,
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
      
      // Generate intelligent local responses based on message content
      const fallbackMessage = this.generateLocalResponse(message);
      const timestamp = new Date();
      
      // Add user message to history
      this.conversations[conversationId].push({
        id: `msg_${Date.now()}_user`,
        role: "user",
        content: message,
        timestamp,
      });

      // Add fallback response to history
      this.conversations[conversationId].push({
        id: `msg_${Date.now()}_assistant`,
        role: "assistant",
        content: fallbackMessage,
        timestamp,
      });
      
      return {
        message: fallbackMessage,
        conversation_id: conversationId,
        timestamp,
      };
    }
  }

  private generateLocalResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Event registration questions
    if (lowerMessage.includes('sign up') || lowerMessage.includes('register') || lowerMessage.includes('registration')) {
      return "To register for an event:\n\n1. Browse events on the main dashboard\n2. Click on an event you're interested in\n3. Click the 'Register Now' button\n4. You'll see a confirmation once registered\n\nNote: Some events have capacity limits and registration deadlines, so register early!";
    }
    
    // Latest events questions
    if (lowerMessage.includes('latest') || lowerMessage.includes('recent') || lowerMessage.includes('new') || lowerMessage.includes('upcoming')) {
      return "To see the latest events:\n\n1. Go to the main dashboard\n2. Events are displayed with the most recent first\n3. Use the search and filter options to find specific types of events\n4. Check the event date and status to see what's upcoming\n\nYou can also filter by date to see events happening soon!";
    }
    
    // Navigation help
    if (lowerMessage.includes('navigate') || lowerMessage.includes('find') || lowerMessage.includes('where') || lowerMessage.includes('how to')) {
      return "Here's how to navigate the platform:\n\n• **Dashboard**: Main page showing all events\n• **Event Details**: Click any event to see full information\n• **My Registrations**: View events you've signed up for\n• **Admin Panel**: Create and manage events (admin only)\n• **Profile**: Manage your account settings\n\nUse the navigation menu at the top to access different sections!";
    }
    
    // Attendance and feedback
    if (lowerMessage.includes('attend') || lowerMessage.includes('feedback') || lowerMessage.includes('review') || lowerMessage.includes('check in')) {
      return "For attendance and feedback:\n\n**Attendance**: Admins can mark attendance during events\n**Feedback**: After attending an event, you can:\n1. Go to the event details page\n2. Click 'Give Feedback' (appears after attendance)\n3. Rate the event and leave comments\n\nYour feedback helps improve future events!";
    }
    
    // Admin questions
    if (lowerMessage.includes('admin') || lowerMessage.includes('create event') || lowerMessage.includes('manage')) {
      return "For administrators:\n\n**Creating Events**:\n1. Go to Admin Dashboard\n2. Click 'Create Event'\n3. Fill in event details (title, date, location, capacity)\n4. Publish the event\n\n**Managing Events**:\n• View registrations and attendance\n• Edit event details\n• Mark attendance during events\n• View feedback and analytics";
    }
    
    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! I'm your Campus Assistant. I can help you with:\n\n• Finding and registering for events\n• Navigating the platform\n• Understanding event features\n• Admin tasks (if you're an administrator)\n\nWhat would you like to know about campus events?";
    }
    
    // Default response
    return "I'm here to help with campus events! I can assist you with:\n\n• **Event Registration**: How to sign up for events\n• **Finding Events**: Browse and search for events\n• **Platform Navigation**: Using different features\n• **Event Management**: Admin tasks and event creation\n• **Attendance & Feedback**: Check-in and reviews\n\nCould you be more specific about what you'd like to know?";
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