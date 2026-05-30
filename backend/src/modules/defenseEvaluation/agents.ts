import { generateStructured } from "./geminiService";
import {
  aiUsageSchema,
  aiUsageSystemPrompt,
  committeeSchema,
  committeeSystemPrompt,
  conversationSchema,
  orchestratorSystemPrompt,
  presentationSchema,
  presentationSystemPrompt,
  structureSchema,
  structureSystemPrompt,
} from "./prompts";
import type {
  AiUsageAgentResult,
  CommitteeAgentResult,
  ConversationRound,
  PresentationAgentResult,
  StructureAgentResult,
} from "./types";

function clampScore(value: number, max = 100): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(max, Math.round(value)));
}

export async function runStructureAgent(thesisText: string): Promise<StructureAgentResult> {
  const prompt = [
    "Дараах дипломын текстийн академик бүтэц, зохион байгуулалтыг үнэл.",
    "Гарчгийн хуудас, хураангуй, агуулга, оршил, судалгааны тойм, арга зүй, үр дүн, хэлэлцүүлэг, дүгнэлт, ном зүй болон форматын тогтвортой байдлыг шалга.",
    "structureScore нь 0-100 хооронд бүхэл тоо байна. missingSections-д зөвхөн дутуу хэсгүүдийг бич.",
    "reasoning талбарт оноог хэрхэн гаргасан алхам бүрээ дэлгэрэнгүй тайлбарла.",
    "",
    "=== ДИПЛОМЫН ТЕКСТ ===",
    thesisText,
  ].join("\n");

  const result = await generateStructured<StructureAgentResult>({
    system: structureSystemPrompt,
    prompt,
    schema: structureSchema,
    temperature: 0.3,
  });
  result.structureScore = clampScore(result.structureScore);
  return result;
}

export async function runAiUsageAgent(thesisText: string, structure: StructureAgentResult): Promise<AiUsageAgentResult> {
  const prompt = [
    "Дараах дипломын текстийг хиймэл оюун ухаанаар бичигдсэн магадлал болон эх сурвалжийн талаас шинжил.",
    "Хэл шинжлэлийн шинж тэмдэг, бичлэгийн тогтвортой байдал, давтагдсан бүтэц, эшлэлийн нягтралд тулгуурла.",
    "aiProbability болон humanProbability нийлбэр нь 100 байх ёстой. originalityScore нь 0-100 хооронд байна.",
    "riskLevel нь 'Бага', 'Дунд', 'Өндөр' гэсэн утгуудын аль нэг байна.",
    "Өмнөх бүтцийн агентын дүгнэлтийг харгалзан үз:",
    JSON.stringify({ structureScore: structure.structureScore, weaknesses: structure.weaknesses }, null, 2),
    "",
    "=== ДИПЛОМЫН ТЕКСТ ===",
    thesisText,
  ].join("\n");

  const result = await generateStructured<AiUsageAgentResult>({
    system: aiUsageSystemPrompt,
    prompt,
    schema: aiUsageSchema,
    temperature: 0.35,
  });
  result.aiProbability = clampScore(result.aiProbability);
  result.humanProbability = clampScore(100 - result.aiProbability);
  result.originalityScore = clampScore(result.originalityScore);
  return result;
}

export async function runPresentationAgent(
  transcript: string,
  structure: StructureAgentResult,
): Promise<PresentationAgentResult> {
  const prompt = [
    "Дараах илтгэлийн текст буюу хамгаалалтын ярианы бичвэрийг үнэл.",
    "Ярианы урсгал, ойлгомжтой байдал, өөртөө итгэлтэй байдал, техникийн нарийвчлал, сэдвийн ойлголт, тайлбарын чанар, асуултад бэлэн байдлыг шинжил.",
    "speakingScore, clarityScore, confidenceScore, technicalScore нь тус бүр 0-100 хооронд бүхэл тоо байна.",
    "reasoning талбарт үнэлгээний алхмуудаа дэлгэрэнгүй тайлбарла.",
    "Дипломын бүтцийн дүгнэлттэй уялдуулан үнэл:",
    JSON.stringify({ structureScore: structure.structureScore, strengths: structure.strengths }, null, 2),
    "",
    "=== ИЛТГЭЛИЙН ТЕКСТ ===",
    transcript,
  ].join("\n");

  const result = await generateStructured<PresentationAgentResult>({
    system: presentationSystemPrompt,
    prompt,
    schema: presentationSchema,
    temperature: 0.35,
  });
  result.speakingScore = clampScore(result.speakingScore);
  result.clarityScore = clampScore(result.clarityScore);
  result.confidenceScore = clampScore(result.confidenceScore);
  result.technicalScore = clampScore(result.technicalScore);
  return result;
}

export async function runConversation(
  structure: StructureAgentResult,
  aiUsage: AiUsageAgentResult,
  presentation: PresentationAgentResult,
): Promise<ConversationRound[]> {
  const prompt = [
    "Дөрвөн агент хоорондоо хэлэлцүүлэг хийнэ. Хэлэлцүүлгийг монгол хэл дээр үүсгэ.",
    "Оролцогчид: 'PDF бүтэц шинжилгээний агент', 'AI хэрэглээ шинжилгээний агент', 'Илтгэлийн үнэлгээний агент', 'Комиссын агент'.",
    "Дор хаяж 3 раунд үүсгэ:",
    "Раунд 1 — Анхны дүгнэлтүүдээ танилцуулна.",
    "Раунд 2 — Бие биенийхээ дүгнэлтийг шүүмжилж, сорьж, дэмжинэ.",
    "Эцсийн раунд — Комиссын агент бүх агентаас тодруулга авч, зөрчлийг шийдэж, эцсийн зөвшилцөлд хүрнэ.",
    "Раунд бүрд агент бүр өмнөх дүгнэлтүүдэд тулгуурлан тодорхой санал хэлнэ. Тоон үнэлгээнүүдийг дурд.",
    "",
    "PDF бүтцийн агентын дүгнэлт:",
    JSON.stringify({ structureScore: structure.structureScore, strengths: structure.strengths, weaknesses: structure.weaknesses, missingSections: structure.missingSections }, null, 2),
    "AI хэрэглээний агентын дүгнэлт:",
    JSON.stringify({ aiProbability: aiUsage.aiProbability, originalityScore: aiUsage.originalityScore, riskLevel: aiUsage.riskLevel, analysis: aiUsage.analysis }, null, 2),
    "Илтгэлийн агентын дүгнэлт:",
    JSON.stringify({ speakingScore: presentation.speakingScore, clarityScore: presentation.clarityScore, confidenceScore: presentation.confidenceScore, technicalScore: presentation.technicalScore }, null, 2),
  ].join("\n");

  const result = await generateStructured<{ rounds: ConversationRound[] }>({
    system: orchestratorSystemPrompt,
    prompt,
    schema: conversationSchema,
    temperature: 0.7,
  });

  return result.rounds
    .sort((a, b) => a.round - b.round)
    .map((round, index) => ({ ...round, round: index + 1 }));
}

export async function runCommitteeAgent(
  structure: StructureAgentResult,
  aiUsage: AiUsageAgentResult,
  presentation: PresentationAgentResult,
  conversation: ConversationRound[],
): Promise<CommitteeAgentResult> {
  const prompt = [
    "Та дипломын хамгаалалтын комиссын даргын хувьд эцсийн шийдвэрийг гаргана.",
    "Доорх бүх агентуудын дүгнэлт болон тэдгээрийн хэлэлцүүлгийг харгалзан үз.",
    "reasoning болон committeeFeedback талбаруудад агент бүрийн тодорхой дүгнэлтийг шууд иш татаж дурд.",
    "finalScore нь 0-100 хооронд бүхэл тоо. grade нь 'A', 'B', 'C', 'D', 'F'-ийн аль нэг.",
    "defenseReadiness нь 'Бэлэн', 'Нэмэлт засвар шаардлагатай', эсвэл 'Бэлэн бус' байна.",
    "",
    "PDF бүтцийн агент:",
    JSON.stringify(structure, null, 2),
    "AI хэрэглээний агент:",
    JSON.stringify(aiUsage, null, 2),
    "Илтгэлийн агент:",
    JSON.stringify(presentation, null, 2),
    "Агентуудын хэлэлцүүлэг:",
    JSON.stringify(conversation, null, 2),
  ].join("\n");

  const result = await generateStructured<CommitteeAgentResult>({
    system: committeeSystemPrompt,
    prompt,
    schema: committeeSchema,
    temperature: 0.4,
  });
  result.finalScore = clampScore(result.finalScore);
  return result;
}
