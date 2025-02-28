
// API utilities for chatbot, donations, and video uploads

// Function to send user messages to OpenAI API
export async function sendMessageToOpenAI(message: string, history: Array<{role: string, content: string}>) {
  try {
    // Create the payload for OpenAI API
    const payload = {
      model: "gpt-4o-mini", // You can change this to other models like "gpt-4o" if needed
      messages: history.concat([{ role: "user", content: message }]),
      temperature: 0.7,
      max_tokens: 800,
    };

    // Send the request to OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      message: data.choices[0].message.content,
      role: "assistant"
    };
  } catch (error) {
    console.error("Error sending message to OpenAI:", error);
    return {
      success: false,
      message: "Sorry, I couldn't process your request. Please check your API key and try again.",
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
