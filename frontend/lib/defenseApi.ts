import { getToken } from "@/lib/auth";
import type { DefenseStreamEvent } from "@/types/defense";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001/api";

interface AnalyzeInput {
  file: File;
  transcript: string;
}

export async function analyzeDefense(input: AnalyzeInput, onEvent: (event: DefenseStreamEvent) => void): Promise<void> {
  const form = new FormData();
  form.append("file", input.file);
  form.append("transcript", input.transcript);

  const token = getToken();
  const headers = new Headers();
  if (token) headers.set("authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}/defense-evaluation/analyze`, {
    method: "POST",
    headers,
    body: form,
    cache: "no-store",
  });

  if (!response.ok || !response.body) {
    let message = `Хүсэлт амжилтгүй боллоо (${response.status})`;
    try {
      const payload = await response.json();
      if (payload?.message) message = payload.message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";
    for (const chunk of chunks) {
      const line = chunk.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      onEvent(JSON.parse(payload) as DefenseStreamEvent);
    }
  }
}
