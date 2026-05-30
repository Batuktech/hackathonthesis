import { runAiUsageAgent, runCommitteeAgent, runConversation, runPresentationAgent, runStructureAgent } from "./agents";
import { extractPdfText } from "./pdfService";
import type {
  AgentThinking,
  ConversationRound,
  DefenseEvaluationResult,
  DefenseStreamEvent,
  ScoreSummary,
} from "./types";

type Emit = (event: DefenseStreamEvent) => void;

interface OrchestrationInput {
  pdfBuffer: Buffer;
  transcript: string;
  fileName: string;
  emit: Emit;
}

function buildScoreSummary(result: Omit<DefenseEvaluationResult, "scores" | "thinking" | "fileName">): ScoreSummary {
  const { structure, aiUsage, presentation, committee } = result;
  const committeeScore = committee.finalScore;
  const blended = Math.round(
    structure.structureScore * 0.25 +
      aiUsage.originalityScore * 0.2 +
      ((presentation.speakingScore + presentation.clarityScore + presentation.confidenceScore + presentation.technicalScore) / 4) * 0.25 +
      committeeScore * 0.3,
  );
  return {
    structureScore: structure.structureScore,
    aiUsageScore: aiUsage.aiProbability,
    originalityScore: aiUsage.originalityScore,
    speakingScore: presentation.speakingScore,
    technicalScore: presentation.technicalScore,
    committeeScore,
    finalScore: committee.finalScore || blended,
  };
}

export async function orchestrateDefense({ pdfBuffer, transcript, fileName, emit }: OrchestrationInput): Promise<DefenseEvaluationResult> {
  emit({ type: "status", stage: "pdf", state: "running", message: "PDF бүтэц шинжилж байна..." });
  const thesisText = await extractPdfText(pdfBuffer);
  const structure = await runStructureAgent(thesisText);
  const structureThinking: AgentThinking = {
    agentName: "PDF бүтэц шинжилгээний агент",
    status: "completed",
    summary: structure.summary,
    reasoning: structure.reasoning,
    findings: structure.findings,
    score: structure.structureScore,
  };
  emit({ type: "agent", agent: structureThinking });
  emit({ type: "status", stage: "pdf", state: "done", message: "✓ PDF бүтэц шинжилгээ дууслаа" });

  emit({ type: "status", stage: "ai", state: "running", message: "AI хэрэглээ илрүүлж байна..." });
  const aiUsage = await runAiUsageAgent(thesisText, structure);
  const aiThinking: AgentThinking = {
    agentName: "AI хэрэглээ шинжилгээний агент",
    status: "completed",
    summary: aiUsage.summary,
    reasoning: aiUsage.reasoning,
    findings: aiUsage.findings,
    score: aiUsage.originalityScore,
  };
  emit({ type: "agent", agent: aiThinking });
  emit({ type: "status", stage: "ai", state: "done", message: "✓ AI хэрэглээний шинжилгээ дууслаа" });

  emit({ type: "status", stage: "presentation", state: "running", message: "Илтгэлийн текст үнэлж байна..." });
  const presentation = await runPresentationAgent(transcript, structure);
  const presentationThinking: AgentThinking = {
    agentName: "Илтгэлийн үнэлгээний агент",
    status: "completed",
    summary: presentation.summary,
    reasoning: presentation.reasoning,
    findings: presentation.findings,
    score: presentation.speakingScore,
  };
  emit({ type: "agent", agent: presentationThinking });
  emit({ type: "status", stage: "presentation", state: "done", message: "✓ Илтгэлийн үнэлгээ дууслаа" });

  emit({ type: "status", stage: "committee", state: "running", message: "Комисс зөвлөлдөж байна..." });
  const conversation: ConversationRound[] = await runConversation(structure, aiUsage, presentation);
  for (const round of conversation) {
    emit({ type: "conversation", round });
  }

  const committee = await runCommitteeAgent(structure, aiUsage, presentation, conversation);
  const committeeThinking: AgentThinking = {
    agentName: "Комиссын агент",
    status: "completed",
    summary: committee.summary,
    reasoning: committee.reasoning,
    findings: committee.criticalIssues,
    score: committee.finalScore,
  };
  emit({ type: "agent", agent: committeeThinking });
  emit({ type: "status", stage: "committee", state: "done", message: "✓ Эцсийн үнэлгээ бэлэн боллоо" });

  const thinking = [structureThinking, aiThinking, presentationThinking, committeeThinking];
  const scores = buildScoreSummary({ structure, aiUsage, presentation, committee, conversation });

  return {
    scores,
    structure,
    aiUsage,
    presentation,
    committee,
    thinking,
    conversation,
    fileName,
  };
}
