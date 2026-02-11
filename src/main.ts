import { Hono } from "hono";
import { dmAgent, generalAgent } from "./agents/agent-config";

const app = new Hono();

app.get("/", (c) => c.text("Hono App Is Working v3"));

app.post("/process-dm", async (c) => {
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
            controller.enqueue(
              encoder.encode(`data: ${String(chunk)}\n\n`)
            );
          }
        }
      } catch (err: any) {
        controller.enqueue(
          encoder.encode(`data: Error: ${err?.message ?? "Error"}\n\n`)
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
      "Connection": "keep-alive",
    },
  });
});

export default app;
