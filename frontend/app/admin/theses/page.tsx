"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { FadeIn } from "@/components/reactbits/FadeIn";
import { api } from "@/lib/api";
import { statusLabel } from "@/lib/mn";
import { FileText, Users, BookOpen, Search, CheckCircle, AlertCircle } from "lucide-react";

const statuses = [
  "DRAFT",
  "SUBMITTED",
  "MENTOR_REVIEW",
  "DEFENSE_1_COMPLETED",
  "DEFENSE_2_COMPLETED",
  "DEFENSE_3_COMPLETED",
  "CRITIQUE_ASSIGNED",
  "REVISION_REQUIRED",
  "REVISION_SUBMITTED",
  "FINAL_DEFENSE_READY",
  "COMPLETED",
  "REJECTED",
];

export default function AdminThesesPage() {
  const [theses, setTheses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  const mentors = useMemo(
    () => teachers.filter((teacher) => teacher.user?.teacherType === "MENTOR" || teacher.user?.teacherType === "BOTH"),
    [teachers],
  );
  const critiqueTeachers = useMemo(
    () => teachers.filter((teacher) => teacher.user?.teacherType === "CRITIQUE" || teacher.user?.teacherType === "BOTH"),
    [teachers],
  );

  async function refresh() {
    const [thesisRows, teacherRows, groupRows] = await Promise.all([api.getTheses(), api.getTeachers(), api.getGroups()]);
    setTheses(thesisRows);
    setTeachers(teacherRows);
    setGroups(groupRows);
  }

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, []);

  const filtered = theses.filter((thesis) => {
    const haystack = `${thesis.title} ${thesis.status} ${thesis.student?.user?.name} ${thesis.academicSeason?.name} ${thesis.degreeType?.name}`.toLowerCase();
    return haystack.includes(filter.toLowerCase());
  });

  async function updateAssignment(thesisId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const mentorTeacherId = String(form.get("mentorTeacherId") ?? "");
    const critiqueGroupId = String(form.get("critiqueGroupId") ?? "");
    const status = String(form.get("status") ?? "");
    const specificTeacherId = String(form.get("specificTeacherId") ?? "");

    if (mentorTeacherId) await api.assignMentor(thesisId, mentorTeacherId);
    if (critiqueGroupId) await api.assignCritiqueGroup(thesisId, critiqueGroupId);
    if (status) await api.updateThesis(thesisId, { status });
    if (specificTeacherId) await api.assignSpecificCritiqueTeacher(thesisId, specificTeacherId);
    await refresh();
  }

  return (
    <DashboardShell>
      <div className="grid gap-6">
        <FadeIn>
          <SpotlightCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-100">
                <FileText className="w-6 h-6 text-neutral-700" />
              </div>
              <div>
                <h1 className="text-3xl font-black">Диплом</h1>
                <p className="text-neutral-600">Удирдагч багш, шүүмж бүлэг, төлөв болон тусгай шүүмж багшийг онооно.</p>
              </div>
            </div>
          </SpotlightCard>
        </FadeIn>

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

        <FadeIn delay={0.1}>
          <SpotlightCard className="p-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-neutral-400 flex-shrink-0" />
              <input
                className="data-input"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder="Оюутан, сэдэв, улирал, төлөв..."
              />
            </div>
          </SpotlightCard>
        </FadeIn>

        <div className="grid gap-4">
          {filtered.map((thesis, index) => (
            <motion.div
              key={thesis.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <SpotlightCard className="p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black">{thesis.title}</h2>
                      <span className="status-pill">{statusLabel(thesis.status)}</span>
                      <span className="status-pill">{thesis.currentDefenseStage}-р хамгаалалт</span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-600">
                      {thesis.student?.user?.name} · {thesis.academicSeason?.name} · {thesis.degreeType?.name}
                    </p>
                    <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                      <div className="rounded-lg bg-neutral-50 p-3">
                        <dt className="font-bold flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Удирдагч багш
                        </dt>
                        <dd className="mt-1 text-neutral-600">{thesis.mentorTeacher?.user?.name ?? "Оноогоогүй"}</dd>
                      </div>
                      <div className="rounded-lg bg-neutral-50 p-3">
                        <dt className="font-bold flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          Шүүмж бүлэг
                        </dt>
                        <dd className="mt-1 text-neutral-600">{thesis.critiqueGroup?.name ?? "Оноогоогүй"}</dd>
                      </div>
                      <div className="rounded-lg bg-neutral-50 p-3">
                        <dt className="font-bold flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Файл / оноо
                        </dt>
                        <dd className="mt-1 text-neutral-600">{thesis.files?.length ?? 0} файл · {thesis.defenseScores?.length ?? 0} оноо</dd>
                      </div>
                    </dl>
                  </div>

                  <form className="grid gap-3 rounded-lg border border-neutral-200 p-4" onSubmit={(event) => updateAssignment(thesis.id, event)}>
                    <label className="data-label">
                      Удирдагч багш
                      <select className="data-input" name="mentorTeacherId" defaultValue="">
                        <option value="">Өөрчлөхгүй</option>
                        {mentors.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>{teacher.user?.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="data-label">
                      Шүүмж бүлэг
                      <select className="data-input" name="critiqueGroupId" defaultValue="">
                        <option value="">Өөрчлөхгүй</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="data-label">
                      Төлөв
                      <select className="data-input" name="status" defaultValue="">
                        <option value="">Өөрчлөхгүй</option>
                        {statuses.map((status) => (
                          <option key={status} value={status}>{statusLabel(status)}</option>
                        ))}
                      </select>
                    </label>
                    <label className="data-label">
                      Тусгай шүүмж багш
                      <select className="data-input" name="specificTeacherId" defaultValue="">
                        <option value="">Оноохгүй</option>
                        {critiqueTeachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>{teacher.user?.name}</option>
                        ))}
                      </select>
                    </label>
                    <motion.button
                      className="data-button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Хадгалах
                    </motion.button>
                  </form>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
