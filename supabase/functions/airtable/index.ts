
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Airtable API error:", errorData);
      throw new Error(`Airtable API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("Airtable response:", data);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "User data saved successfully to Airtable",
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error saving to Airtable:", error);
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
