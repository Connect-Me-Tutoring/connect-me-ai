
import { Agent } from "@mastra/core/agent";
import tutorFAQ from "../../context/Tutor-FAQs-Connect-Me.md";
import handbookS6 from "../../context/Connect-Me-Handbook.md";
import tutorPortalManual from "../../context/Connect-Me-Tutor-Portal-Manual.md";


export const generalAgent = new Agent({
  name: "general-agent",
  instructions: [
    {
      role: "system",
      content: `### RESTRICTION:
- You are strictly prohibited from using outside knowledge.
- You must ONLY answer using the provided 'Connect Me Resources'.
- If the answer is not explicitly contained within the provided text, or if the user is asking for general information, your response MUST be exactly one word: 'EMPTY'.
`,
    },
    {
      role: "system",
      content: `Your are a helpful assistant answering questions based off the data given!`,
    },
    {
      role: "system",
      content: "Provide any relevant links",
    },
    { role: "system", content: `Keep the response under 2000 characters` },
    { role: "system", content: handbookS6 },
    { role: "system", content: tutorPortalManual },
    { role: "system", content: tutorFAQ },
  ],
  model: "mistral/ministral-8b-latest",
});

export const dmAgent = new Agent({
  name: "dm-agent",
  instructions: [
    { role: "system", content: `Keep the response under 2000 characters` },
    {
      role: "system",
      content: `Your are a helpful assistant answering questions based off the context given`,
    },
    { role: "system", content: handbookS6 },
    { role: "system", content: tutorPortalManual },
    { role: "system", content: tutorFAQ },
  ],
  model: "mistral/mistral-small-latest",
});
