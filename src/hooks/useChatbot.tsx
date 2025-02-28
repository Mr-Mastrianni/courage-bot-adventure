
import { useState, useEffect, useCallback } from 'react';
import { sendMessageToOpenAI, logConversationToAirtable } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

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
        content: "Hi there! I'm your Be Courageous guide. I'd like to help you understand and face your fears. \n\n**What specific adventure activities are you most interested in trying, but might be afraid of?** \n\nSome examples include:\n* Skydiving\n* Rock climbing\n* Swimming with sharks\n* Bungee jumping\n* Zip lining\n* Deep water diving",
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
          content: "Hi there! I'm your Be Courageous guide. I'd like to help you understand and face your fears. \n\n**What specific adventure activities are you most interested in trying, but might be afraid of?** \n\nSome examples include:\n* Skydiving\n* Rock climbing\n* Swimming with sharks\n* Bungee jumping\n* Zip lining\n* Deep water diving",
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

  // Generate next question based on conversation step
  const getNextQuestion = useCallback((step: ChatState['step'], fearInfo: ChatState['fearInfo']) => {
    switch (step) {
      case 'activities':
        return "**Thank you for sharing.** Now, I'd like to understand more about your fears. \n\n**Could you tell me specifically what makes you afraid of these activities?** \n\nFor example:\n* Is it fear of heights?\n* Fear of water?\n* Fear of losing control?\n* Fear of getting hurt?";
      case 'reasons':
        return "**I appreciate your honesty.** Let's dig a little deeper. \n\n**What do you think might be the root cause of these fears?** \n\nSometimes our fears are connected to past experiences or deeper emotions. Any insights you can share would be helpful.";
      case 'root':
        const activities = fearInfo.activities?.join(', ') || "these activities";
        return `**Thank you for opening up.** Based on what you've shared about ${activities}, I can offer some personalized recommendations to help you face these fears safely. \n\n**Would you like me to suggest a specific activity that might be a good first step, along with safety information?**`;
      default:
        return "";
    }
  }, []);

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
      let systemMessage = "You are a helpful AI assistant for Be Courageous, a company that helps people face their fears through adventure activities. Format your responses using Markdown for better readability with **bold text**, bullet points, and structure. Be warm, empathetic and encouraging.";
      
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

      // Get the next question to guide the conversation
      const nextQuestion = getNextQuestion(nextStep, updatedFearInfo);
      
      // Add assistant response to chat
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.message + (nextQuestion ? '\n\n' + nextQuestion : ''),
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
  }, [state.messages, state.step, state.fearInfo, processMessage, getNextQuestion, toast, userId]);

  return {
    ...state,
    sendMessage,
    toggleChat,
    resetChat,
  };
}

export default useChatbot;
