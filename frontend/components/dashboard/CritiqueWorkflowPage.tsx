"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { FadeIn } from "@/components/reactbits/FadeIn";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { statusLabel } from "@/lib/mn";
import { MessageSquare, AlertCircle, CheckCircle, Upload, FileText, Send } from "lucide-react";

export function CritiqueWorkflowPage({ mode }: { mode: "student" | "teacher" }) {
  const [critiques, setCritiques] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    setCritiques(await api.getCritiques());
  }

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, []);

  async function submitFeedback(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    await api.submitCritiqueFeedback(id, data);
    setMessage("Шүүмж хадгалагдлаа");
    event.currentTarget.reset();
    await refresh();
  }

  async function submitRevision(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.submitRevision(id, new FormData(event.currentTarget));
    setMessage("Засвар илгээгдлээ");
    event.currentTarget.reset();
    await refresh();
  }

  async function submitDecision(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    await api.submitCritiqueFinalDecision(id, data);
    setMessage("Шийдвэр хадгалагдлаа");
    event.currentTarget.reset();
    await refresh();
  }

  const user = getStoredUser();

  return (
    <DashboardShell>
      <div className="grid gap-6">
        <FadeIn>
          <SpotlightCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-100">
                <MessageSquare className="w-6 h-6 text-neutral-700" />
              </div>
              <div>
                <h1 className="text-3xl font-black">
                  {mode === "teacher" ? "Оноогдсон шүүмж" : "Миний шүүмж"}
                </h1>
                <p className="text-neutral-600">
                  {mode === "teacher"
                    ? "3-р хамгаалалтын дараах санал, шаардлагатай засвар болон эцсийн шийдвэрийг оруулна."
                    : "Шүүмжийн санал, шаардлагатай засварыг хараад засварын файлаа илгээнэ."}
                </p>
              </div>
            </div>
          </SpotlightCard>
        </FadeIn>

        <AnimatePresence>
          {message ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SpotlightCard className="p-4 bg-green-50/50 border-green-200">
                <p className="flex items-center gap-2 text-green-700 font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  {message}
                </p>
              </SpotlightCard>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {error ? (
          <motion.p
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.p>
        ) : null}

        <div className="grid gap-4">
          {critiques.map((critique, index) => (
            <motion.div
              key={critique.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SpotlightCard className="p-5">
                <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-black">{critique.thesis?.title}</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                      Оюутан: {critique.thesis?.student?.user?.name} · Шүүмж багш: {critique.assignedTeacher?.user?.name}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="status-pill">{statusLabel(critique.status)}</span>
                    <span className="status-pill">Дуусах: {new Date(critique.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-neutral-50 p-4">
                    <h3 className="font-black flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Санал
                    </h3>
                    <p className="mt-2 text-sm text-neutral-700">{critique.feedback ?? "Одоогоор санал алга."}</p>
                    <h3 className="mt-4 font-black flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Шаардлагатай засвар
                    </h3>
                    <p className="mt-2 text-sm text-neutral-700">{critique.requiredChanges ?? "Одоогоор засварын шаардлага алга."}</p>
                  </div>

                  {mode === "teacher" ? (
                    <div className="grid gap-3">
                      <form className="grid gap-3 rounded-lg border border-neutral-200 p-4" onSubmit={(event) => submitFeedback(critique.id, event)}>
                        <h3 className="font-black">Шүүмж бичих</h3>
                        <textarea name="feedback" className="data-input min-h-24" placeholder="Санал" required />
                        <textarea name="requiredChanges" className="data-input min-h-20" placeholder="Шаардлагатай засвар" />
                        <motion.button
                          className="data-button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Send className="w-4 h-4 inline mr-1" />
                          Шүүмж хадгалах
                        </motion.button>
                      </form>
                      <form className="grid gap-3 rounded-lg border border-neutral-200 p-4" onSubmit={(event) => submitDecision(critique.id, event)}>
                        <h3 className="font-black">Эцсийн шийдвэр</h3>
                        <select name="status" className="data-input">
                          <option value="APPROVED">Батлах</option>
                          <option value="NEEDS_MORE_WORK">Дахин засуулах</option>
                        </select>
                        <input name="teacherFinalComment" className="data-input" placeholder="Эцсийн тайлбар" />
                        <motion.button
                          className="data-button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Шийдвэр хадгалах
                        </motion.button>
                      </form>
                    </div>
                  ) : (
                    <form className="grid gap-3 rounded-lg border border-neutral-200 p-4" onSubmit={(event) => submitRevision(critique.id, event)}>
                      <h3 className="font-black">Засвар илгээх</h3>
                      <p className="text-sm text-neutral-600">{user?.name} нэрээр нэвтэрсэн. Энэ шүүмжид нэг засварын файл илгээнэ.</p>
                      <input name="file" type="file" className="data-input" required />
                      <motion.button
                        className="data-button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Upload className="w-4 h-4 inline mr-1" />
                        Засвар илгээх
                      </motion.button>
                    </form>
                  )}
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
          {critiques.length === 0 ? (
            <SpotlightCard className="p-8">
              <p className="text-neutral-500 text-center">Одоогоор шүүмж оноогоогүй байна.</p>
            </SpotlightCard>
          ) : null}
        </div>
      </div>
    </DashboardShell>
  );
}
