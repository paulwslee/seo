async function test() {
  require('dotenv').config({ path: '.env.local' });
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
  const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://taekworld.com/7037601000&category=performance&category=seo&strategy=desktop${apiKey ? `&key=${apiKey}` : ""}`;
  console.log("Calling URL:", url);
  const res = await fetch(url);
  console.log("Status:", res.status);
  if (res.ok) {
    const data = await res.json();
    console.log("Lighthouse:", !!data.lighthouseResult);
  } else {
    console.log("Error:", await res.text());
  }
}
test();
