require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  console.log("Listing models...");
  // list models is not available in @google/generative-ai SDK directly, but let's just fetch it
  const apiKey = process.env.GEMINI_API_KEY;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  console.log(data.models.map(m => m.name));
}
run();
