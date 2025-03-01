import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, X, ArrowDown } from "lucide-react";
import useChatbot from "@/hooks/useChatbot";
import ReactMarkdown from 'react-markdown';

const ChatBot = () => {
  const { 
    isOpen, 
    messages, 
    isLoading, 
    sendMessage, 
    toggleChat, 
    resetChat 
  } = useChatbot();
  
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <Button
        onClick={toggleChat}
        className={`fixed right-4 bottom-4 z-40 rounded-full h-14 w-14 shadow-lg flex items-center justify-center ${
          isOpen ? 'bg-gray-700 hover:bg-gray-800' : 'bg-courage-600 hover:bg-courage-700'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </Button>

      {/* Chat window */}
      <div
        className={`fixed right-4 bottom-20 z-40 w-full sm:max-w-sm md:max-w-md transition-all duration-300 ease-in-out chatbot-container ${
          isOpen ? 'chatbot-open' : 'chatbot-closed'
        }`}
      >
        <Card className="border border-gray-200 shadow-xl overflow-hidden">
          {/* Chat header */}
          <div className="bg-courage-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare size={20} />
              <h3 className="font-medium">Be Courageous Assistant</h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-courage-700 h-8 w-8"
              onClick={resetChat}
            >
              <ArrowDown size={16} />
            </Button>
          </div>

          {/* Chat messages */}
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[85%] animate-scale-in ${
                      message.role === 'user'
                        ? 'bg-courage-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="text-sm prose-sm max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 max-w-[85%]">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-courage-400 animate-pulse" style={{ animationDelay: "0s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-courage-400 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-courage-400 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
              <div className="flex space-x-2">
                <Textarea
                  id="chatInput"
                  name="chatInput"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your response here..."
                  className="flex-1 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="bg-courage-600 hover:bg-courage-700 h-10 w-10 flex-shrink-0 self-end"
                >
                  <Send size={18} />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ChatBot;
