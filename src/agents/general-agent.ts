import { Agent } from "@mastra/core/agent";
import tutorFAQ from "../../data/Tutor-FAQs-Connect-Me.md";
import handbookS6 from "../../data/Connect-Me-Handbook.md";
import tutorPortalManual from "../../data/Connect-Me-Tutor-Portal-Manual.md";

const systemInstructions = `${handbookS6} ${tutorPortalManual} ${tutorFAQ} Your are a helpful assistant answering questions based off the data given
        Provide as many links as possible! Always provide the CONNECT_ME_HANDBOOK link if necessary to answer the prompt
        Keep the response under 2000 characters. RESPOND EMPTY IF NOT RELEVANT`;

export const generalAgent = new Agent({
  name: "general-agent",
  instructions: systemInstructions,
  model: "mistral/ministral-8b-latest",
});
