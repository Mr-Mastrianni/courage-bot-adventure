// API utilities for chatbot, donations, and video uploads
import { User } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/lib/supabase";

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

// Function to save user data to Airtable
export async function saveUserToAirtable(userData: {
  name: string;
  email: string;
  phone?: string;
  birthday?: string;
  adventures?: string[];
}) {
  try {
    console.log("Saving user data to Airtable:", userData);
    
    const { data, error } = await supabase.functions.invoke('airtable', {
      body: { userData }
    });

    if (error) {
      console.error("Supabase Edge Function error:", error);
      throw new Error(`Error: ${error.message || 'Unknown error'}`);
    }

    console.log("Airtable save response:", data);
    return data;
  } catch (error) {
    console.error("Error saving to Airtable:", error);
    return {
      success: false,
      message: "Sorry, we couldn't save your information. Please try again."
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

// REMOVED: Function to schedule an appointment
// We no longer offer appointment booking as per site requirements
/* 
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
*/

// REMOVED: Function to process donation - No longer needed as we now use Zeffy
/*
export async function processDonation(
  amount: number,
  name: string,
  email: string,
  paymentMethod: string,
  paymentToken: string
) {
  try {
    // This would connect to a payment processor API
    console.log("Processing donation:", { 
      amount, 
      name, 
      email,
      paymentMethod,
      paymentToken
    });
    
    return { 
      success: true,
      message: "Thank you for your donation! Your contribution will help others face their fears."
    };
  } catch (error) {
    console.error("Error processing donation:", error);
    return { 
      success: false,
      message: "Sorry, we couldn't process your donation. Please try again or contact us directly."
    };
  }
}
*/

// REMOVED: Function to upload video - No longer needed as per site requirements
/*
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
*/
