import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createRemoteJWKSet, jwtVerify } from "https://deno.land/x/jose@v4.14.4/index.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const AUTH0_DOMAIN      = Deno.env.get("AUTH0_DOMAIN")!;
const AUTH0_AUDIENCE    = Deno.env.get("AUTH0_AUDIENCE")!;

const JWKS = createRemoteJWKSet(
  new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`)
);

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate JWT
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    await jwtVerify(token, JWKS, { audience: AUTH0_AUDIENCE });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse request body
  const { imageBase64, mimeType } = await req.json();
  if (!imageBase64) {
    return new Response(JSON.stringify({ error: "imageBase64 required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const systemPrompt = `You are a voucher/gift card scanner. Extract information and return ONLY valid JSON:
{"store":"name","barcode":"CODE","amount":number_or_null,"currency":"$ or € or ₪ or £","location":"Online or store name","expiredBy":"YYYY-MM-DD or empty string","category":"Supermarket|Restaurants|Clothing|Books|Pharmacy|Entertainment|Travel|Other","notes":"conditions or restrictions","color":"#hexcolor matching brand"}
Default currency to ₪ if not visible. ONLY JSON. No markdown. Null for unknown numbers, empty string for unknown strings.`;

  // Call Anthropic Claude
  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system:     systemPrompt,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mimeType || "image/jpeg", data: imageBase64 } },
          { type: "text",  text: "Extract voucher info as JSON." },
        ],
      }],
    }),
  });

  const anthropicData = await anthropicRes.json();
  const text = anthropicData.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";

  let parsed;
  try {
    parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return new Response(JSON.stringify({ error: "Could not parse voucher data" }), {
      status: 422,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(parsed), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
