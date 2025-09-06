import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Bot, User, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  conversation_id: string;
  timestamp: string;
}

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data: ChatResponse = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(data.timestamp),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(data.conversation_id);

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Chat Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      await fetch(`/api/chatbot/conversation/${conversationId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error clearing conversation:", error);
    }

    setMessages([]);
    setConversationId(null);
    toast({
      title: "Conversation Cleared",
      description: "Your chat history has been cleared.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg cyber-border"
          data-testid="chatbot-open-button"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-end p-4"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Window */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, x: 100, y: 100 }}
              animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, x: 100, y: 100 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative"
            >
              <Card className="w-96 h-[600px] cyber-border bg-background/95 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Campus Assistant</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      AI
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearConversation}
                      disabled={messages.length === 0}
                      data-testid="chatbot-clear-button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      data-testid="chatbot-close-button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="flex flex-col h-[calc(100%-140px)] p-0">
                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Bot className="h-12 w-12 mb-4 text-primary/50" />
                        <h3 className="font-medium mb-2">Welcome to Campus Assistant!</h3>
                        <p className="text-sm">
                          I can help you with event information, platform features, and general questions about the campus event management system.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${
                              message.role === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`flex items-start space-x-2 max-w-[85%] ${
                                message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                              }`}
                            >
                              <div
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-secondary-foreground"
                                }`}
                              >
                                {message.role === "user" ? (
                                  <User className="h-4 w-4" />
                                ) : (
                                  <Bot className="h-4 w-4" />
                                )}
                              </div>
                              <div
                                className={`rounded-lg px-3 py-2 ${
                                  message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">
                                  {message.content}
                                </p>
                                <p className="text-xs opacity-70 mt-1">
                                  {formatTime(message.timestamp)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                          >
                            <div className="flex items-start space-x-2">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                                <Bot className="h-4 w-4" />
                              </div>
                              <div className="bg-muted rounded-lg px-3 py-2">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  <Separator />

                  {/* Input Area */}
                  <div className="p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about campus events..."
                        disabled={isLoading}
                        className="flex-1"
                        data-testid="chatbot-input"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        size="sm"
                        data-testid="chatbot-send-button"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}