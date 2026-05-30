"use client";

import { FormEvent, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { analyzeDefense } from "@/lib/defenseApi";
import type {
  AgentThinking,
  ConversationRound,
  DefenseEvaluationResult,
  DefenseStreamEvent,
} from "@/types/defense";

type Phase = "idle" | "running" | "done" | "error";

type StageState = "pending" | "running" | "done";

const STAGES: { key: string; label: string }[] = [
  { key: "pdf", label: "PDF бүтэц шинжилгээ" },
  { key: "ai", label: "AI хэрэглээний шинжилгээ" },
  { key: "presentation", label: "Илтгэлийн үнэлгээ" },
  { key: "committee", label: "Комиссын дүгнэлт" },
];

const SPEAKER_ACCENTS: Record<string, string> = {
  "PDF бүтэц шинжилгээний агент": "border-l-neutral-900",
  "AI хэрэглээ шинжилгээний агент": "border-l-neutral-500",
  "Илтгэлийн үнэлгээний агент": "border-l-neutral-700",
  "Комиссын агент": "border-l-neutral-950",
};

function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />;
}

function ScoreTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-center">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs font-semibold text-neutral-500">{label}</p>
    </div>
  );
}

function Bullets({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-500">{title}</p>
      <ul className="grid gap-1 text-sm text-neutral-700">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2">
            <span className="text-neutral-400">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AgentCard({ agent }: { agent: AgentThinking }) {
  return (
    <article className="float-card rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black">{agent.agentName}</h3>
          <span className="status-pill mt-1">Дууссан</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black">{agent.score}</p>
          <p className="text-xs text-neutral-500">/100</p>
        </div>
      </div>
      <p className="mb-3 text-sm text-neutral-700">{agent.summary}</p>
      <div className="grid gap-3">
        <Bullets title="Үнэлгээний алхмууд" items={agent.reasoning} />
        <Bullets title="Илрүүлсэн зүйлс" items={agent.findings} />
      </div>
    </article>
  );
}

export function DefenseEvaluationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [stages, setStages] = useState<Record<string, StageState>>({});
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [agents, setAgents] = useState<AgentThinking[]>([]);
  const [conversation, setConversation] = useState<ConversationRound[]>([]);
  const [result, setResult] = useState<DefenseEvaluationResult | null>(null);

  function handleEvent(event: DefenseStreamEvent) {
    if (event.type === "status") {
      setStages((prev) => ({ ...prev, [event.stage]: event.state === "running" ? "running" : "done" }));
      setStatusLog((prev) => [...prev, event.message]);
    } else if (event.type === "agent") {
      setAgents((prev) => [...prev, event.agent]);
    } else if (event.type === "conversation") {
      setConversation((prev) => [...prev, event.round]);
    } else if (event.type === "final") {
      setResult(event.result);
      setPhase("done");
    } else if (event.type === "error") {
      setError(event.message);
      setPhase("error");
    }
  }

  async function submit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!file) {
      setError("Дипломын PDF файлаа оруулна уу.");
      setPhase("error");
      return;
    }
    setPhase("running");
    setError("");
    setStatusLog([]);
    setAgents([]);
    setConversation([]);
    setResult(null);
    setStages({});

    try {
      await analyzeDefense({ file, transcript }, handleEvent);
      setPhase((current) => (current === "error" ? "error" : "done"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Шинжилгээ хийх явцад алдаа гарлаа.");
      setPhase("error");
    }
  }

  const running = phase === "running";
  const scores = result?.scores;

  return (
    <DashboardShell>
      <div className="grid gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h1 className="text-3xl font-black">AI хамгаалалтын үнэлгээ</h1>
          <p className="mt-2 text-neutral-600">
            Дипломын PDF болон илтгэлийн текстийг дөрвөн агентаас бүрдсэн комисс шинжилж, бүтэц, AI хэрэглээ, илтгэл болон эцсийн хамгаалалтын
            үнэлгээг бүрэн ил тод гаргана.
          </p>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-black">Материал оруулах</h2>
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="data-label">
                Дипломын PDF файл
                <input
                  type="file"
                  accept="application/pdf"
                  className="data-input"
                  disabled={running}
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  required
                />
              </label>
              <div className="grid content-end gap-1 text-sm text-neutral-600">
                <p>Сонгосон файл:</p>
                <p className="font-semibold text-neutral-900">{file?.name ?? "Файл сонгоогүй"}</p>
              </div>
            </div>
            <label className="data-label">
              Илтгэлийн текст
              <textarea
                className="data-input min-h-40"
                placeholder="Хамгаалалтын илтгэл, ярианы бичвэрээ энд оруулна уу..."
                value={transcript}
                disabled={running}
                onChange={(event) => setTranscript(event.target.value)}
                required
                minLength={20}
              />
            </label>
            <button className="data-button flex w-fit items-center gap-2" disabled={running}>
              {running ? <Spinner /> : null}
              {running ? "Шинжилж байна..." : "Шинжилгээ эхлүүлэх"}
            </button>
          </form>
        </section>

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</p> : null}

        {phase !== "idle" ? (
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-black">Шинжилгээний явц</h2>
            <div className="grid gap-3 md:grid-cols-4">
              {STAGES.map((stage) => {
                const state = stages[stage.key] ?? "pending";
                return (
                  <div
                    key={stage.key}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      state === "done"
                        ? "border-neutral-900 bg-neutral-50"
                        : state === "running"
                          ? "border-neutral-400 bg-white"
                          : "border-neutral-200 bg-white"
                    }`}
                  >
                    {state === "running" ? (
                      <Spinner />
                    ) : (
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                          state === "done" ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-500"
                        }`}
                      >
                        {state === "done" ? "✓" : ""}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-neutral-800">{stage.label}</span>
                  </div>
                );
              })}
            </div>
            {statusLog.length > 0 ? (
              <div className="mt-4 grid gap-1 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-600">
                {statusLog.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {scores ? (
          <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-black">Эцсийн хамгаалалтын үнэлгээ</h2>
                <p className="mt-1 text-sm text-neutral-600">{result?.committee.defenseReadiness}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl font-black">{scores.finalScore}</p>
                  <p className="text-xs text-neutral-500">Нийт оноо /100</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 text-3xl font-black text-white">
                  {result?.committee.grade}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
              <ScoreTile label="Бүтэц" value={scores.structureScore} />
              <ScoreTile label="AI магадлал" value={scores.aiUsageScore} />
              <ScoreTile label="Өвөрмөц байдал" value={scores.originalityScore} />
              <ScoreTile label="Илтгэх" value={scores.speakingScore} />
              <ScoreTile label="Техник" value={scores.technicalScore} />
              <ScoreTile label="Комисс" value={scores.committeeScore} />
              <ScoreTile label="Нийт" value={scores.finalScore} />
            </div>

            {result ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Bullets title="Комиссын санал" items={result.committee.committeeFeedback} />
                <Bullets title="Чухал асуудлууд" items={result.committee.criticalIssues} />
              </div>
            ) : null}

            {result?.committee.finalRecommendation ? (
              <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-500">Эцсийн зөвлөмж</p>
                <p className="text-sm text-neutral-800">{result.committee.finalRecommendation}</p>
              </div>
            ) : null}
          </section>
        ) : null}

        {agents.length > 0 ? (
          <section className="grid gap-4">
            <h2 className="text-lg font-black">Агентуудын дүгнэлт</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {agents.map((agent) => (
                <AgentCard key={agent.agentName} agent={agent} />
              ))}
            </div>
          </section>
        ) : null}

        {conversation.length > 0 ? (
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-black">Агентуудын хэлэлцүүлэг</h2>
            <div className="grid gap-5">
              {conversation.map((round) => (
                <div key={round.round} className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <span className="status-pill">{round.round}-р раунд</span>
                    <span className="text-sm font-semibold text-neutral-700">{round.title}</span>
                  </div>
                  <div className="grid gap-3">
                    {round.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`rounded-lg border border-neutral-200 border-l-4 bg-neutral-50 p-3 ${
                          SPEAKER_ACCENTS[message.speaker] ?? "border-l-neutral-400"
                        }`}
                      >
                        <p className="mb-1 text-sm font-black text-neutral-900">{message.speaker}</p>
                        <p className="text-sm text-neutral-700">→ {message.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </DashboardShell>
  );
}
