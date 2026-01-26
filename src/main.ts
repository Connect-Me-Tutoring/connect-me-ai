import { Hono } from "hono";
import { dmAgent, generalAgent } from "./agents/agent-config";

const app = new Hono();

app.get("/", async (c) => {
  return c.text("Hono App Is Working");
});

app.post("/process-dm", async (c) => {
  const body = await c.req.json();
  try {
    const response = await callDmAgent(body.message);
    return response ? c.text(response) : c.text("No response");
  } catch (error) {
    console.error("Read Item Exception", error);
  }
});

app.post("/process-general", async (c) => {
  const body = await c.req.json();
  try {
    const response = await callGeneralAgent(body.message);
    return response ? c.text(response) : c.text("No response");
  } catch (error) {
    console.error("Read Item Exception", error);
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

export default app;
