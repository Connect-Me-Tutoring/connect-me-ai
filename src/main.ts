import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
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

app.use("*", async (c, next) => {
  if (!c.req.path.startsWith("/process-")) {
    return next();
  }

  const token = c.env?.API_TOKEN || process.env.API_TOKEN;

  if (!token) {
    console.error("No API_TOKEN found in c.env or process.env");
    return c.text("Configuration Error", 500);
  }

  const auth = bearerAuth({ token });
  return auth(c, next);
});

app.get("/", (c) => c.text("Hono App Is Working v3"));

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

app.post("/process-dm-stream", async (c) => {
  const body = await c.req.json<{ message?: string }>();
  const message = body.message?.trim();

  if (!message) {
    return c.text("Missing message in body", 400);
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await dmAgent.stream(message);

        if (
          !result?.textStream ||
          typeof result.textStream[Symbol.asyncIterator] !== "function"
        ) {
          throw new Error("Agent does not support streaming output");
        }

        for await (const chunk of result.textStream) {
          if (chunk !== null && chunk !== undefined) {
            controller.enqueue(encoder.encode(`data: ${String(chunk)}\n\n`));
          }
        }
      } catch (err: any) {
        controller.enqueue(
          encoder.encode(`data: Error: ${err?.message ?? "Error"}\n\n`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
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
