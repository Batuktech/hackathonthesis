import { GoogleGenAI } from "@google/genai";
import type { Schema } from "@google/genai";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!env.geminiApiKey) {
    throw new AppError("GEMINI_API_KEY тохиргоо хийгдээгүй байна.", 500);
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }
  return client;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GenerateParams {
  system: string;
  prompt: string;
  schema: Schema;
  temperature?: number;
}

export async function generateStructured<T>({ system, prompt, schema, temperature = 0.4 }: GenerateParams): Promise<T> {
  const ai = getClient();
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: env.geminiModel,
        contents: prompt,
        config: {
          systemInstruction: system,
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Gemini хоосон хариу буцаалаа.");
      }
      return JSON.parse(text) as T;
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await delay(500 * (attempt + 1));
      }
    }
  }

  throw new AppError(`Gemini хүсэлт амжилтгүй боллоо: ${lastError instanceof Error ? lastError.message : "тодорхойгүй алдаа"}`, 502);
}
