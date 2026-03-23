import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const HealthChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reportAnalyzerOpen, setReportAnalyzerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { toast } = useToast();

  const loadChatHistory = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        // Show welcome message for unauthenticated users
        setMessages([{
          role: "assistant",
          content: "👋 Welcome to Health Assistant!\n\nI'm your personal health companion. How can I help you today?\n\n💡 Quick tips:\n• Ask about diet and nutrition\n• Get exercise recommendations\n• Learn about mental wellness\n• Understand health conditions"
        }]);
        return;
      }

      // Try to get existing session from localStorage first
      let currentSessionId = sessionId || localStorage.getItem('health_chat_session_id');

      // If no session exists, create one immediately
      if (!currentSessionId) {
        currentSessionId = crypto.randomUUID();
        localStorage.setItem('health_chat_session_id', currentSessionId);
        setSessionId(currentSessionId);
      }

      if (currentSessionId) {
        // Load existing chat history for the session
        const { data: chatHistory, error: historyError } = await supabase
          .from("chat_history")
          .select("role, content")
          .eq("user_id", user.id)
          .eq("session_id", currentSessionId)
          .order("created_at", { ascending: true });

        if (!historyError && chatHistory && chatHistory.length > 0) {
          setMessages(chatHistory.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
          })));
          setSessionId(currentSessionId);
          return;
        }
      }

      // Show welcome message if no history or new session
      setMessages([{
        role: "assistant",
        content: "👋 Welcome to Health Assistant!\n\nI'm your personal health companion. How can I help you today?\n\n💡 Quick tips:\n• Ask about diet and nutrition\n• Get exercise recommendations\n• Learn about mental wellness\n• Understand health conditions"
      }]);
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Fallback to welcome message
      setMessages([{
        role: "assistant",
        content: "👋 Welcome to Health Assistant!\n\nI'm your personal health companion. How can I help you today?\n\n💡 Quick tips:\n• Ask about diet and nutrition\n• Get exercise recommendations\n• Learn about mental wellness\n• Understand health conditions"
      }]);
    }
  };

  useEffect(() => {
    // Load chat history when component mounts
    loadChatHistory();
  }, []);

  useEffect(() => {
    // Reload chat history when sessionId changes (e.g., when a new session is created)
    if (sessionId) {
      loadChatHistory();
    }
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));

      const { data, error } = await supabase.functions.invoke("health-chatbot", {
        body: { message: userMessage, session_id: sessionId },
      });

      if (error) throw error;

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      // Update session ID if it's a new session
      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
        localStorage.setItem('health_chat_session_id', data.session_id);
      }
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get response";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className={`fixed rounded-full h-14 w-14 shadow-lg z-50 transition-all duration-300 ${
          reportAnalyzerOpen ? 'bottom-6 right-48' : 'bottom-24 right-6'
        }`}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <>
      {/* Chat Interface */}
      <Card className={`fixed bottom-24 right-6 ${isMobile ? 'w-[280px]' : 'w-96'} h-[500px] shadow-2xl flex flex-col z-50`}>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Health Assistant</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4 h-[350px]">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Ask me anything about health, wellness, or fitness!</p>
              </div>
            ) : (
              <div className="space-y-4 pr-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
          <div className="p-4 border-t bg-background shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about health..."
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
