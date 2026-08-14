import { OpenAI } from "openai";
const client = new OpenAI();
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}
export interface InvokeParams {
  messages: Message[];
  model?: string;
  responseFormat?: { type: "json_object" | "text" };
}
export interface InvokeResult {
  choices: { message: { content: string | null } }[];
}
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  try {
    const response = await client.chat.completions.create({
      model: params.model || "gpt-4.1-mini",
      messages: params.messages,
      response_format: params.responseFormat,
    });
    return {
      choices: response.choices.map((c) => ({
        message: { content: c.message.content },
      })),
    };
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Unknown LLM failure";
    throw new Error(`AI Strategist offline: ${detail}`);
  }
}
