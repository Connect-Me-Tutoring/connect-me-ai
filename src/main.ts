import { Hono } from "hono";
import { bearerAuth } from 'hono/bearer-auth';
import { dmAgent, generalAgent } from "./agents/agent-config";

const callGeneralAgent = async (query: string) => {
  const response = await generalAgent.generate(query);
  return response.text;
};

const callDmAgent = async (query: string) => {
  const response = await dmAgent.generate(query);
  return response.text;
};

type Bindings = {
  API_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/process-*", async (c, next) => {
  const auth = bearerAuth({ token: c.env.API_TOKEN});
  return auth(c, next);
});

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
    return c.text("Internal Server Error", 500);
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

export default app;
    
// export default {
//   port: 1234,
//   fetch: app.fetch,
// };
