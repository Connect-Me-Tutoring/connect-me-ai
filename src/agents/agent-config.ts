import { Agent } from "@mastra/core/agent";
import { TokenLimiterProcessor } from "@mastra/core/processors";
import tutorFAQ from "../../data/Tutor-FAQs-Connect-Me.md";
import handbookS6 from "../../data/Connect-Me-Handbook.md";
import tutorPortalManual from "../../data/Connect-Me-Tutor-Portal-Manual.md";

const GeneralAgentSystemInstructions = `${handbookS6} ${tutorPortalManual} ${tutorFAQ} Your are a helpful assistant answering questions based off the data given
        Provide as many links as possible! Always provide the CONNECT_ME_HANDBOOK link if necessary to answer the prompt
        Keep the response under 2000 characters. RESPOND EMPTY IF NOT RELEVANT`;

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
    {
      role: "system",
      content: `Your are a helpful assistant answering questions based off the data given`,
    },
    { role: "system", content: `Keep the response under 2000 characters` },
    { role: "system", content: handbookS6 },
    { role: "system", content: tutorPortalManual },
    { role: "system", content: tutorFAQ },
  ],
  model: "mistral/ministral-8b-latest",
});
