import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

async function testPsi() {
  const url = "https://taekworld.com";
  const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  console.log("Using Key ending in:", key ? key.slice(-4) : "NONE");
  
  const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=seo&strategy=desktop${key ? `&key=${key}` : ""}`;
  
  console.log("Requesting:", psiUrl.replace(key, "HIDDEN"));
  
  const res = await fetch(psiUrl);
  console.log("Status:", res.status);
  
  if (!res.ok) {
    const text = await res.text();
    console.log("Error Response:", text);
  } else {
    console.log("Success! Performance data received.");
  }
}

testPsi();
