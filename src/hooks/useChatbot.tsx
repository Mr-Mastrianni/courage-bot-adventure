
import { useState, useEffect, useCallback } from 'react';
import { sendMessageToOpenAI, logConversationToAirtable } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

type ChatState = {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  fearInfo: {
    activities?: string[];
    reasons?: string;
    rootCause?: string;
  };
  step: 'initial' | 'activities' | 'reasons' | 'root' | 'recommendation';
};

export function useChatbot() {
  const { toast } = useToast();
  const [userId] = useState(`user_${Math.random().toString(36).substring(2, 9)}`);
  const [state, setState] = useState<ChatState>({
    isOpen: false,
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hi there! I'm your Be Courageous guide. I can help you understand and face your fears. What adventure activities interest you the most?",
        timestamp: new Date(),
      },
    ],
    isLoading: false,
    fearInfo: {},
    step: 'initial',
  });

  // Toggle chatbot visibility
  const toggleChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  // Reset chat to initial state
  const resetChat = useCallback(() => {
    setState({
      isOpen: true,
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: "Hi there! I'm your Be Courageous guide. I can help you understand and face your fears. What adventure activities interest you the most?",
          timestamp: new Date(),
        },
      ],
      isLoading: false,
      fearInfo: {},
      step: 'initial',
    });
  }, []);

  // Process the message and determine the next step in the conversation flow
  const processMessage = useCallback((message: string, currentStep: ChatState['step']) => {
    let nextStep = currentStep;
    let updatedFearInfo = { ...state.fearInfo };

    // Simple state machine to guide the conversation
    switch (currentStep) {
      case 'initial':
        nextStep = 'activities';
        break;
      case 'activities':
        // Extract potentially feared activities from user message
        const activities = ['skydiving', 'hang gliding', 'rock climbing', 'swimming with sharks', 
                           'base jumping', 'kayaking', 'wing walking', 'bungee jumping', 
                           'zip lines', 'rope swings', 'swimming with whales', 'deep water diving'];
        
        const mentionedActivities = activities.filter(activity => 
          message.toLowerCase().includes(activity.toLowerCase()));
        
        updatedFearInfo.activities = mentionedActivities.length > 0 ? mentionedActivities : undefined;
        nextStep = 'reasons';
        break;
      case 'reasons':
        updatedFearInfo.reasons = message;
        nextStep = 'root';
        break;
      case 'root':
        updatedFearInfo.rootCause = message;
        nextStep = 'recommendation';
        break;
      case 'recommendation':
        // After recommendation, stay in this state for continued conversation
        break;
    }

    return { nextStep, updatedFearInfo };
  }, [state.fearInfo]);

  // Send message to OpenAI API
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    try {
      // Process the message to determine conversation flow
      const { nextStep, updatedFearInfo } = processMessage(message, state.step);

      // Format history for OpenAI
      const history = state.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add system message based on the current step
      let systemMessage = "You are a helpful AI assistant for Be Courageous, a company that helps people face their fears through adventure activities.";
      
      switch (nextStep) {
        case 'activities':
          systemMessage += " Ask the user which of these activities they're most afraid of: skydiving, hang gliding, rock climbing, swimming with sharks, base jumping, kayaking, wing walking, bungee jumping, zip lines, rope swings, swimming with whales, or deep water diving.";
          break;
        case 'reasons':
          systemMessage += " Ask the user why they're afraid of these activities. Dig deeper into their specific fears.";
          break;
        case 'root':
          systemMessage += " Ask the user to reflect on the root cause of their fear. Help them understand what underlying fears might be present.";
          break;
        case 'recommendation':
          systemMessage += " Based on their fears, recommend a specific activity that would help them face their fears in a safe, controlled way. Include specific safety information about the activity.";
          break;
      }

      // Add the system message to the history
      history.unshift({
        role: 'system',
        content: systemMessage,
      });

      // Send message to API
      const response = await sendMessageToOpenAI(message, history);

      // Log conversation to Airtable
      await logConversationToAirtable(
        [...history, { role: 'user', content: message }],
        userId,
        updatedFearInfo
      );

      // Add assistant response to chat
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
        fearInfo: updatedFearInfo,
        step: nextStep,
      }));
    } catch (error) {
      console.error('Error in chat:', error);
      toast({
        title: "Error",
        description: "Sorry, there was a problem processing your message. Please try again.",
        variant: "destructive",
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [state.messages, state.step, state.fearInfo, processMessage, toast, userId]);

  // Initialize with a delayed welcome message
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.messages.length === 1 && !state.isOpen) {
        setState(prev => ({ ...prev, isOpen: true }));
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [state.messages, state.isOpen]);

  return {
    ...state,
    sendMessage,
    toggleChat,
    resetChat,
  };
}

export default useChatbot;
