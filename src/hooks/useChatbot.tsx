
import { useState, useEffect, useCallback } from 'react';
import { sendMessageToOpenAI, logConversationToAirtable, saveUserToAirtable } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

type UserData = {
  name?: string;
  email?: string;
  phone?: string;
  birthday?: string;
  adventures?: string[];
};

type ChatState = {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  userData: UserData;
  fearInfo: {
    activities?: string[];
    reasons?: string;
    rootCause?: string;
  };
  step: 'initial' | 'name' | 'email' | 'phone' | 'birthday' | 'adventures' | 'confirmation' | 'completed';
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
        content: "Hi there! I'm your Be Courageous guide. I'd like to help you understand and face your fears, but first I'd like to get to know you better. \n\n**What's your name?**",
        timestamp: new Date(),
      },
    ],
    isLoading: false,
    userData: {},
    fearInfo: {},
    step: 'name',
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
          content: "Hi there! I'm your Be Courageous guide. I'd like to help you understand and face your fears, but first I'd like to get to know you better. \n\n**What's your name?**",
          timestamp: new Date(),
        },
      ],
      isLoading: false,
      userData: {},
      fearInfo: {},
      step: 'name',
    });
  }, []);

  // Process the message and determine the next step in the conversation flow
  const processMessage = useCallback((message: string, currentStep: ChatState['step'], currentUserData: UserData) => {
    let nextStep = currentStep;
    const updatedUserData = { ...currentUserData };

    // Simple state machine to guide the conversation for user data collection
    switch (currentStep) {
      case 'name':
        updatedUserData.name = message.trim();
        nextStep = 'email';
        break;
      case 'email':
        updatedUserData.email = message.trim();
        nextStep = 'phone';
        break;
      case 'phone':
        updatedUserData.phone = message.trim();
        nextStep = 'birthday';
        break;
      case 'birthday':
        updatedUserData.birthday = message.trim();
        nextStep = 'adventures';
        break;
      case 'adventures':
        // Extract potentially feared activities from user message
        const activities = ['skydiving', 'hang gliding', 'rock climbing', 'swimming with sharks', 
                           'base jumping', 'kayaking', 'wing walking', 'bungee jumping', 
                           'zip lines', 'rope swings', 'swimming with whales', 'deep water diving'];
        
        // Try to extract mentioned activities
        const mentionedActivities = activities.filter(activity => 
          message.toLowerCase().includes(activity.toLowerCase()));
        
        // If none found, just save the raw input
        updatedUserData.adventures = mentionedActivities.length > 0 
          ? mentionedActivities 
          : message.split(',').map(item => item.trim());
        
        nextStep = 'confirmation';
        break;
      case 'confirmation':
        if (message.toLowerCase().includes('yes') || message.toLowerCase().includes('correct')) {
          nextStep = 'completed';
          // Save to Airtable here, but we'll do it in the sendMessage function
        } else {
          // If the user says the information is not correct, go back to the beginning
          updatedUserData.name = undefined;
          updatedUserData.email = undefined;
          updatedUserData.phone = undefined;
          updatedUserData.birthday = undefined;
          updatedUserData.adventures = undefined;
          nextStep = 'name';
        }
        break;
      case 'completed':
        // After saving to Airtable, continue with normal conversation
        break;
    }

    return { nextStep, updatedUserData };
  }, []);

  // Generate next question based on conversation step
  const getNextQuestion = useCallback((step: ChatState['step'], userData: UserData) => {
    switch (step) {
      case 'name':
        return "**What's your name?**";
      case 'email':
        return `**Thanks, ${userData.name}!** What email address can we reach you at?`;
      case 'phone':
        return "**Great!** What's your phone number? (This is optional, you can say 'skip' if you prefer not to share it)";
      case 'birthday':
        return "**Thanks for that!** When is your birthday? (Format: MM/DD/YYYY, or you can say 'skip')";
      case 'adventures':
        return "**Now, I'd love to know about your fears.** What are the top 3 adventure activities you're most scared of but interested in trying?";
      case 'confirmation':
        const adventures = userData.adventures?.join(', ') || "None specified";
        return `**Thank you for sharing!** Here's what I've got:\n\n- **Name**: ${userData.name}\n- **Email**: ${userData.email}\n- **Phone**: ${userData.phone || "Not provided"}\n- **Birthday**: ${userData.birthday || "Not provided"}\n- **Top Feared Adventures**: ${adventures}\n\n**Is this information correct?** (Yes/No)`;
      case 'completed':
        return "**Great! I've saved your information.** Now, let's talk more about your fears. What specifically makes you afraid of these activities?";
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
      const { nextStep, updatedUserData } = processMessage(message, state.step, state.userData);

      // Save to Airtable if we've reached the confirmation step and user confirmed
      if (state.step === 'confirmation' && nextStep === 'completed' && 
          updatedUserData.name && updatedUserData.email) { // Check required fields exist
        
        // Cast the userData to the required type since we've checked the required fields
        const userData = {
          name: updatedUserData.name,
          email: updatedUserData.email,
          phone: updatedUserData.phone,
          birthday: updatedUserData.birthday,
          adventures: updatedUserData.adventures
        };
        
        const saveResult = await saveUserToAirtable(userData);
        if (!saveResult.success) {
          toast({
            title: "Error",
            description: saveResult.message || "Failed to save your information. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Your information has been saved successfully!",
          });
        }
      } else if (state.step === 'confirmation' && nextStep === 'completed') {
        // Handle the case where required fields are missing
        toast({
          title: "Error",
          description: "Missing required information. Please provide your name and email.",
          variant: "destructive",
        });
        // Reset to name step if information is missing
        nextStep = 'name';
      }

      // Format history for OpenAI
      const history = state.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add system message based on the current step
      let systemMessage = "You are a helpful AI assistant for Be Courageous, a company that helps people face their fears through adventure activities. Format your responses using Markdown for better readability with **bold text**, bullet points, and structure. Be warm, empathetic and encouraging.";
      
      switch (nextStep) {
        case 'name':
          systemMessage += " Ask for the user's name in a friendly way.";
          break;
        case 'email':
          systemMessage += " Ask for the user's email address in a friendly way.";
          break;
        case 'phone':
          systemMessage += " Ask for the user's phone number, but mention it's optional.";
          break;
        case 'birthday':
          systemMessage += " Ask for the user's birthday in MM/DD/YYYY format, but mention it's optional.";
          break;
        case 'adventures':
          systemMessage += " Ask the user to share their top 3 adventure activities they're scared of but interested in trying.";
          break;
        case 'confirmation':
          systemMessage += " Show the user the information they've provided and ask them to confirm if it's correct.";
          break;
        case 'completed':
          systemMessage += " Thank the user for sharing their information. Now focus on understanding their fears related to the activities they mentioned.";
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
        state.fearInfo
      );

      // Get the next question to guide the conversation
      const nextQuestion = getNextQuestion(nextStep, updatedUserData);
      
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
        userData: updatedUserData,
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
  }, [state.messages, state.step, state.userData, state.fearInfo, processMessage, getNextQuestion, toast, userId]);

  return {
    ...state,
    sendMessage,
    toggleChat,
    resetChat,
  };
}

export default useChatbot;
