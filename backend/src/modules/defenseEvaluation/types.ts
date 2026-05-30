export interface AgentThinking {
  agentName: string;
  status: "completed";
  summary: string;
  reasoning: string[];
  findings: string[];
  score: number;
}

export interface StructureAgentResult {
  structureScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSections: string[];
  recommendations: string[];
  summary: string;
  reasoning: string[];
  findings: string[];
}

export interface AiUsageAgentResult {
  aiProbability: number;
  humanProbability: number;
  originalityScore: number;
  riskLevel: string;
  analysis: string[];
  recommendations: string[];
  summary: string;
  reasoning: string[];
  findings: string[];
}

export interface PresentationAgentResult {
  speakingScore: number;
  clarityScore: number;
  confidenceScore: number;
  technicalScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary: string;
  reasoning: string[];
  findings: string[];
}

export interface CommitteeAgentResult {
  finalScore: number;
  grade: string;
  committeeFeedback: string[];
  criticalIssues: string[];
  defenseReadiness: string;
  finalRecommendation: string;
  summary: string;
  reasoning: string[];
}

export interface ConversationMessage {
  speaker: string;
  message: string;
}

export interface ConversationRound {
  round: number;
  title: string;
  messages: ConversationMessage[];
}

export interface ScoreSummary {
  structureScore: number;
  aiUsageScore: number;
  originalityScore: number;
  speakingScore: number;
  technicalScore: number;
  committeeScore: number;
  finalScore: number;
}

export interface DefenseEvaluationResult {
  scores: ScoreSummary;
  structure: StructureAgentResult;
  aiUsage: AiUsageAgentResult;
  presentation: PresentationAgentResult;
  committee: CommitteeAgentResult;
  thinking: AgentThinking[];
  conversation: ConversationRound[];
  fileName: string;
}

export type DefenseStreamEvent =
  | { type: "status"; stage: string; state: "running" | "done"; message: string }
  | { type: "agent"; agent: AgentThinking }
  | { type: "conversation"; round: ConversationRound }
  | { type: "final"; result: DefenseEvaluationResult }
  | { type: "error"; message: string };
