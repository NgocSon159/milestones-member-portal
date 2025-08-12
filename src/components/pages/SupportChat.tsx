import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { 
  Send,
  Paperclip,
  Bot,
  User,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle,
  HelpCircle,
  Plane,
  CreditCard,
  Award
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "agent" | "bot";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const quickQuestions = [
  {
    id: 1,
    question: "How do I check my miles balance?",
    category: "Miles & Rewards",
    icon: Award
  },
  {
    id: 2,
    question: "How can I change my flight booking?",
    category: "Flight Changes",
    icon: Plane
  },
  {
    id: 3,
    question: "What is your baggage policy?",
    category: "Baggage",
    icon: Plane
  },
  {
    id: 4,
    question: "How do I request a refund?",
    category: "Billing",
    icon: CreditCard
  }
];

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "bot",
    content: "Hello! I'm your virtual assistant. How can I help you today? You can ask me questions or choose from the quick options below.",
    timestamp: new Date(Date.now() - 60000)
  }
];

export function SupportChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<"bot" | "human">("bot");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "";
      const lowerContent = content.toLowerCase();

      if (lowerContent.includes("miles") || lowerContent.includes("balance")) {
        botResponse = "Your current miles balance is 48,750 miles. You can view detailed miles activity in your Dashboard. Would you like me to help you with anything else related to your miles?";
      } else if (lowerContent.includes("flight") || lowerContent.includes("booking")) {
        botResponse = "I can help you with flight changes! You can modify your booking online up to 24 hours before departure. There may be fees depending on your ticket type. Would you like me to connect you with an agent for specific booking changes?";
      } else if (lowerContent.includes("baggage")) {
        botResponse = "Our baggage policy allows 1 free checked bag (up to 23kg) for economy class. Additional bags are $50 each. Carry-on bags must be under 7kg. Need more specific baggage information?";
      } else if (lowerContent.includes("refund")) {
        botResponse = "Refund eligibility depends on your ticket type. Flexible tickets are fully refundable, while basic economy tickets have restrictions. I can connect you with our billing team for a detailed review of your booking.";
      } else if (lowerContent.includes("human") || lowerContent.includes("agent")) {
        botResponse = "I'll connect you with a human agent right away. Please hold on while I transfer your chat.";
        setChatMode("human");
      } else {
        botResponse = "Thank you for your question. I'm here to help with miles, bookings, baggage, and billing questions. If you need specialized assistance, I can connect you with a human agent. How can I assist you further?";
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: chatMode === "human" ? "agent" : "bot",
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // If switching to human mode, add agent introduction
      if (chatMode === "human" && lowerContent.includes("human")) {
        setTimeout(() => {
          const agentMessage: Message = {
            id: (Date.now() + 2).toString(),
            sender: "agent",
            content: "Hi! I'm Sarah from customer support. I see you were asking about flight bookings. I'm here to help with any specific questions or changes you need to make. What can I assist you with?",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, agentMessage]);
        }, 2000);
      }
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  return (
    <div className="space-y-6">
      {/* Support Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600">Chat with our support team</p>
            <Badge className="mt-2 bg-green-100 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Online
            </Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Phone Support</h3>
            <p className="text-sm text-gray-600">Call us at +84 1900 1234</p>
            <Badge className="mt-2 bg-blue-100 text-blue-700">
              <Clock className="h-3 w-3 mr-1" />
              24/7 Available
            </Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-sm text-gray-600">support@airline.com</p>
            <Badge className="mt-2 bg-gray-100 text-gray-700">
              <Clock className="h-3 w-3 mr-1" />
              24h Response
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {chatMode === "bot" ? (
                    <Bot className="h-5 w-5 text-blue-500" />
                  ) : (
                    <User className="h-5 w-5 text-green-500" />
                  )}
                  <span>
                    {chatMode === "bot" ? "AI Assistant" : "Live Support - Sarah"}
                  </span>
                </CardTitle>
                <Badge className={chatMode === "bot" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>
                  {chatMode === "bot" ? "Bot" : "Human Agent"}
                </Badge>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : message.sender === "bot"
                          ? "bg-gray-100 text-gray-900"
                          : "bg-green-100 text-gray-900"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender !== "user" && (
                          <div className="flex-shrink-0 mt-1">
                            {message.sender === "bot" ? (
                              <Bot className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === "user" ? "text-blue-100" : "text-gray-500"
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        {chatMode === "bot" ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Button type="button" variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button type="submit" disabled={!newMessage.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Quick Questions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5" />
                <span>Quick Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickQuestions.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-3 text-left"
                    onClick={() => handleQuickQuestion(item.question)}
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent className="h-4 w-4 mt-0.5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{item.question}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Human Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                If you need to speak with a human agent, just type "human" or "agent" in the chat.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => sendMessage("I need to speak with a human agent")}
              >
                Connect with Agent
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}