import { GoogleGenAI } from "@google/genai";
import { Hono } from "hono";
import { readFile } from "node:fs/promises";
import tutorFAQ from "./data/Tutor-FAQs-Connect-Me.md";
import handbookS6 from "./data/Connect-Me-Handbook.md";
import tutorPortalManual from "./data/Connect-Me-Tutor-Portal-Manual.md";

const app = new Hono();
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// const tutorFAQ = await readFile("./data/Tutor-FAQs-Connect-Me.md", "utf-8");
// const handbookS6 = await readFile("./data/Connect-Me-Handbook.md", "utf-8");
// const tutorPortalManual = await readFile(
//   "./data/Connect-Me-Tutor-Portal-Manual.md"
// );

app.get("/", async (c) => {
  return c.text("Hi")
})

app.post("/process-message", async (c) => {
  const body = await c.req.json();
  try {
    console.log(body)
    const response = await callGemini(body.message)
    console.log(response)
    return response ? c.text(response) : c.text("No response")
  } catch (error) {
    console.error("Read Item Exception");
    throw error;
  }
});

const callGemini = async (query: string) => {
  const systemInstructions = `${handbookS6} ${tutorPortalManual} ${tutorFAQ} Your are a helpful assistant answering questions based off the data given
        Provide as many links as possible. Always provide the CONNECT_ME_HANDBOOK link if necessary to answer the prompt.
        Keep the response under 2000 characters.`

  try {
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstructions,
      },
      contents: query,
    });

    return result.text;
  } catch (error) {
    console.error("Gemini Exception", error);
    throw error;
  }
};

export default app;
