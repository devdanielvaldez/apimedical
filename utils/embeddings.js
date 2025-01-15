const OpenAI = require("openai");
const { config } = require('dotenv');
config();

const openai = new OpenAI({ apiKey: process.env.OpenAI_API_KEY });

async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  } catch (err) {
    console.error("Error generando embedding:", err);
    throw err;
  }
}

module.exports = { generateEmbedding };
