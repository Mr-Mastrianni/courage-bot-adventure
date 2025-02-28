
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY') || '';
const AIRTABLE_BASE_ID = Deno.env.get('AIRTABLE_BASE_ID') || '';
// We'll use a more generic field mapping approach
const TABLE_NAME = 'Users'; 

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function helps us map our internal field names to whatever the user has in Airtable
function mapFieldsToAirtable(userData) {
  // First try the standard field names
  try {
    return {
      "Name": userData.name || "",
      "Email": userData.email || "",
      "Phone": userData.phone || "",
      "Birthday": userData.birthday || "",
      "Feared Adventures": (userData.adventures || []).join(", ")
    };
  } catch (e) {
    console.error("Error mapping fields:", e);
    // Fallback to uppercase field names
    return {
      "NAME": userData.name || "",
      "EMAIL": userData.email || "",
      "PHONE #": userData.phone || "",
      "BIRTHDAY": userData.birthday || "",
      "TOP 3 Adventures THAT THEIR SCARED OF": (userData.adventures || []).join(", ")
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Airtable Edge Function called");
    
    // Check if API key and Base ID are available
    if (!AIRTABLE_API_KEY || AIRTABLE_API_KEY.length < 10) {
      throw new Error("Invalid Airtable API Key. Please check your environment variables.");
    }
    
    if (!AIRTABLE_BASE_ID || !AIRTABLE_BASE_ID.startsWith("app")) {
      throw new Error("Invalid Airtable Base ID. Please check your environment variables.");
    }
    
    console.log("Environment variables:", {
      baseId: AIRTABLE_BASE_ID,
      apiKeyExists: !!AIRTABLE_API_KEY,
      apiKeyLength: AIRTABLE_API_KEY.length
    });

    // Parse the request body
    let userData;
    try {
      const body = await req.json();
      userData = body.userData;
      console.log("Received user data:", userData);
    } catch (e) {
      console.error("Error parsing request body:", e);
      throw new Error("Invalid request body format. Expected JSON with userData object.");
    }
    
    if (!userData || !userData.name || !userData.email) {
      throw new Error("Required user data is missing (name and email are required)");
    }

    // Format the data for Airtable with flexible field mapping
    const fields = mapFieldsToAirtable(userData);
    
    const airtableData = {
      records: [{ fields }]
    };

    console.log("Sending data to Airtable:", JSON.stringify(airtableData));
    
    // First, let's try to get the base info to verify connectivity
    try {
      const checkResponse = await fetch(
        `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          },
        }
      );
      
      const checkText = await checkResponse.text();
      console.log("Base check response status:", checkResponse.status);
      console.log("Base check response:", checkText.substring(0, 500) + "..."); // Log just the beginning
      
      if (!checkResponse.ok) {
        throw new Error(`Cannot access Airtable base. Status: ${checkResponse.status}, Response: ${checkText}`);
      }
      
      // If we can, try to parse it to get table names
      try {
        const baseInfo = JSON.parse(checkText);
        console.log("Available tables:", baseInfo.tables.map(t => t.name).join(", "));
      } catch (e) {
        console.error("Could not parse base info:", e);
      }
    } catch (e) {
      console.error("Error checking base:", e);
      // We'll continue anyway to try the actual insertion
    }

    // Now let's try to insert the data
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;
    console.log("Airtable URL:", airtableUrl);

    const response = await fetch(
      airtableUrl,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(airtableData),
      }
    );

    const responseText = await response.text();
    console.log("Airtable API response status:", response.status);
    console.log("Airtable API response:", responseText);

    if (!response.ok) {
      // If we get a 404, the table might not exist
      if (response.status === 404) {
        throw new Error(`Table "${TABLE_NAME}" not found in Airtable base. Please check the table name.`);
      }
      
      // If we get a 422, there might be field name mismatches
      if (response.status === 422) {
        throw new Error(`Airtable rejected the data. Field names might not match. Response: ${responseText}`);
      }
      
      throw new Error(`Airtable API error: Status ${response.status}, Response: ${responseText}`);
    }

    const data = JSON.parse(responseText);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "User data saved successfully to Airtable",
        data: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error saving to Airtable:", error.message || error);
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
