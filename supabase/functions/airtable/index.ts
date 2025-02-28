
// This file implements an Edge Function to save user data to Airtable
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle the HTTP request
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Airtable Edge Function called");
    
    // Get API key and Base ID from environment
    const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY');
    const AIRTABLE_BASE_ID = Deno.env.get('AIRTABLE_BASE_ID');
    
    // Log environment variable status
    console.log("Environment variables status:", {
      AIRTABLE_API_KEY: AIRTABLE_API_KEY ? `Found (${AIRTABLE_API_KEY.length} chars)` : "Not found",
      AIRTABLE_BASE_ID: AIRTABLE_BASE_ID || "Not found"
    });
    
    // Validate environment variables
    if (!AIRTABLE_API_KEY) {
      throw new Error("Missing Airtable API Key in environment variables");
    }
    
    if (!AIRTABLE_BASE_ID) {
      throw new Error("Missing Airtable Base ID in environment variables");
    }

    // Parse request data
    const { userData } = await req.json();
    console.log("Received user data:", userData);
    
    if (!userData || !userData.name || !userData.email) {
      throw new Error("Required user data missing (name and email are required)");
    }

    // Define table name - must match Airtable exactly
    const TABLE_NAME = 'Users';
    
    // Map fields to Airtable format
    const fields = {
      "Name": userData.name,
      "Email": userData.email,
      "Phone": userData.phone || "",
      "Birthday": userData.birthday || "",
      "Feared Adventures": Array.isArray(userData.adventures) ? userData.adventures.join(", ") : ""
    };
    
    // Prepare data for Airtable API
    const airtableData = {
      records: [{ fields }]
    };
    
    // Log the data we're sending
    console.log(`Sending data to Airtable base ${AIRTABLE_BASE_ID}, table ${TABLE_NAME}:`, 
      JSON.stringify(airtableData));
    
    // Send data to Airtable API
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(airtableData),
      }
    );
    
    // Get and log response
    const responseText = await response.text();
    console.log(`Airtable API response (${response.status}):`, responseText);

    // Handle errors based on HTTP status
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Table "${TABLE_NAME}" not found in Airtable base. Check the table name.`);
      } else if (response.status === 401 || response.status === 403) {
        throw new Error(`Authentication failed. Check your Airtable API key permissions.`);
      } else if (response.status === 422) {
        throw new Error(`Field names don't match Airtable schema. Response: ${responseText}`);
      } else {
        throw new Error(`Airtable API error (${response.status}): ${responseText}`);
      }
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "User data saved successfully to Airtable",
        data: JSON.parse(responseText)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Log and return error
    console.error("Error in Airtable Edge Function:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Failed to save user data to Airtable",
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
