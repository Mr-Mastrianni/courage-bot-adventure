
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY') || '';
const AIRTABLE_BASE_ID = Deno.env.get('AIRTABLE_BASE_ID') || '';
const TABLE_NAME = 'Users'; // Change this if your table has a different name

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userData } = await req.json();
    
    console.log("Received user data:", userData);
    
    if (!userData || !userData.name || !userData.email) {
      throw new Error("Required user data is missing");
    }

    // Format the data for Airtable
    const airtableData = {
      records: [
        {
          fields: {
            "NAME": userData.name,
            "PHONE #": userData.phone || "",
            "EMAIL": userData.email,
            "BIRTHDAY": userData.birthday || "",
            "TOP 3 Adventures THAT THEIR SCARED OF": (userData.adventures || []).join(", ")
          }
        }
      ]
    };

    console.log("Sending data to Airtable:", JSON.stringify(airtableData));
    console.log("Using API Key:", AIRTABLE_API_KEY.substring(0, 5) + "..." + AIRTABLE_API_KEY.substring(AIRTABLE_API_KEY.length - 5));
    console.log("Using Base ID:", AIRTABLE_BASE_ID);
    console.log("Using Table Name:", TABLE_NAME);

    // Send data to Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`,
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
