
// API utilities for chatbot, donations, and video uploads
import { supabase } from "@/integrations/supabase/client";

// Function to send user messages to OpenAI API via Supabase Edge Function
export async function sendMessageToOpenAI(message: string, history: Array<{role: string, content: string}>) {
  try {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { message, history }
    });

    if (error) {
      console.error("Supabase Edge Function error:", error);
      throw new Error(`Error: ${error.message || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      success: false,
      message: "Sorry, I couldn't process your request. Please try again.",
      role: "assistant"
    };
  }
}

// Function to log conversation to Airtable
export async function logConversationToAirtable(
  conversation: Array<{role: string, content: string}>, 
  userId: string,
  fearInfo: {
    activities?: string[],
    reasons?: string,
    rootCause?: string
  }
) {
  try {
    // This would be replaced with your actual Airtable API call
    console.log("Logging to Airtable:", { 
      conversation, 
      userId,
      fearInfo
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error logging to Airtable:", error);
    return { success: false };
  }
}

// Function to schedule an appointment
export async function scheduleAppointment(
  date: string, 
  time: string, 
  name: string, 
  email: string,
  activityType: string
) {
  try {
    // This would connect to Google Calendar API
    console.log("Scheduling appointment:", { 
      date, 
      time, 
      name, 
      email,
      activityType
    });
    
    return { 
      success: true,
      message: "Your appointment has been scheduled! We'll send you a confirmation email shortly."
    };
  } catch (error) {
    console.error("Error scheduling appointment:", error);
    return { 
      success: false,
      message: "Sorry, we couldn't schedule your appointment. Please try again or contact us directly."
    };
  }
}

// Function to process donation
export async function processDonation(
  amount: number,
  name: string,
  email: string,
  paymentMethod: string,
  // This would be a token from a payment processor in a real implementation
  paymentToken: string
) {
  try {
    // This would connect to a payment processor like Stripe
    console.log("Processing donation:", { 
      amount, 
      name, 
      email,
      paymentMethod,
      paymentToken: "XXXX" // Masking for security
    });
    
    return { 
      success: true,
      message: "Thank you for your donation! Your support helps us empower more people to face their fears."
    };
  } catch (error) {
    console.error("Error processing donation:", error);
    return { 
      success: false,
      message: "Sorry, we couldn't process your donation. Please try again or contact us directly."
    };
  }
}

// Function to upload video
export async function uploadVideo(
  file: File,
  title: string,
  description: string,
  category: string,
  uploaderName: string
) {
  try {
    // This would connect to a file storage service
    console.log("Uploading video:", { 
      fileName: file.name,
      fileSize: `${Math.round(file.size / 1024 / 1024)} MB`,
      title,
      description,
      category,
      uploaderName
    });
    
    // Simulate upload progress and success
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ 
          success: true,
          message: "Your video has been uploaded successfully! It will be reviewed and published soon.",
          videoId: "video_" + Math.random().toString(36).substr(2, 9)
        });
      }, 2000);
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    return { 
      success: false,
      message: "Sorry, we couldn't upload your video. Please try again or contact us directly."
    };
  }
}
