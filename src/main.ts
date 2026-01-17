import { GoogleGenAI } from "@google/genai";
import { Hono } from "hono";
import tutorFAQ from "../data/Tutor-FAQs-Connect-Me.md";
import handbookS6 from "../data/Connect-Me-Handbook.md";
import tutorPortalManual from "../data/Connect-Me-Tutor-Portal-Manual.md";
import { dmAgent, generalAgent } from "./agents/agent-config";

const app = new Hono();
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get("/", async (c) => {
  return c.text("Hono App Is Working");
});

app.post("/process-dm", async (c) => {
  const body = await c.req.json();
  try {
    const response = await callDmAgent(body.message);
    return response ? c.text(response) : c.text("No response");
  } catch (error) {
    console.error("Read Item Exception");
    throw error;
  }
});

app.post("/process-general", async (c) => {
  const body = await c.req.json();
  try {
    const response = await callGeneralAgent(body.message);
    return response ? c.text(response) : c.text("No response");
  } catch (error) {
    console.error("Read Item Exception");
    throw error;
  }
});

const callGeneralAgent = async (query: string) => {
  const response = await generalAgent.generate(query);
  return response.text;
};

const callDmAgent = async (query: string) => {
  const response = await dmAgent.generate(query)
  return response.text
}

const callGemini = async (query: string) => {
  const systemInstructions = `${handbookS6} ${tutorPortalManual} ${tutorFAQ} Your are a helpful assistant answering questions based off the data given
        Provide as many links as possible! Always provide the CONNECT_ME_HANDBOOK link if necessary to answer the prompt
        Keep the response under 2000 characters. RESPOND EMPTY IF NOT RELEVANT`;

  try {
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstructions,
        thinkingConfig: {
          thinkingBudget: 0,
        },
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
