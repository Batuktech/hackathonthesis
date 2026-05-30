"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { FadeIn } from "@/components/reactbits/FadeIn";
import { api } from "@/lib/api";
import { teacherTypeLabel } from "@/lib/mn";
import { useToast } from "@/components/ui/Toast";
import { Users, Plus, X, UserPlus, UserMinus, BookOpen, AlertCircle } from "lucide-react";

export default function AdminGroupsPage() {
  const { showToast } = useToast();
  const [groups, setGroups] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [degrees, setDegrees] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const critiqueTeachers = useMemo(
    () => teachers.filter((teacher) => teacher.user?.teacherType === "CRITIQUE" || teacher.user?.teacherType === "BOTH"),
    [teachers],
  );

  async function refresh() {
    try {
      const [groupRows, seasonRows, degreeRows, teacherRows, studentRows] = await Promise.all([
        api.getGroups(),
        api.getSeasons(),
        api.getDegreeTypes(),
        api.getTeachers(),
        api.getStudents(),
      ]);
      setGroups(groupRows);
      setSeasons(seasonRows);
      setDegrees(degreeRows);
      setTeachers(teacherRows);
      setStudents(studentRows);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function createGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    
    try {
      const formData = new FormData(event.currentTarget);
      const data: Record<string, string> = {};
      formData.forEach((value, key) => {
        if (typeof value === 'string') {
          data[key] = value;
        }
      });
      
      // Remove empty degreeTypeId to avoid validation errors
      if (!data.degreeTypeId || data.degreeTypeId === "") {
        delete data.degreeTypeId;
      }
      
      await api.createGroup(data);
      showToast("Бүлэг амжилттай нэмэгдлээ!", "success");
      event.currentTarget.reset();
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Бүлэг нэмэхэд алдаа гарлаа";
      setError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function assignTeacher(groupId: string, form: HTMLFormElement) {
    try {
      const teacherId = String(new FormData(form).get("teacherId"));
      await api.addGroupTeacher(groupId, teacherId);
      showToast("Багш амжилттай нэмэгдлээ!", "success");
      form.reset();
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Багш нэмэхэд алдаа гарлаа";
      showToast(message, "error");
    }
  }

  async function assignStudent(groupId: string, form: HTMLFormElement) {
    try {
      const studentId = String(new FormData(form).get("studentId"));
      await api.addGroupStudent(groupId, studentId);
      showToast("Оюутан амжилттай нэмэгдлээ!", "success");
      form.reset();
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Оюутан нэмэхэд алдаа гарлаа";
      showToast(message, "error");
    }
  }

  async function removeTeacher(groupId: string, teacherId: string) {
    try {
      await api.removeGroupTeacher(groupId, teacherId);
      showToast("Багш хасагдлаа!", "success");
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Багш хасахад алдаа гарлаа";
      showToast(message, "error");
    }
  }

  async function removeStudent(groupId: string, studentId: string) {
    try {
      await api.removeGroupStudent(groupId, studentId);
      showToast("Оюутан хасагдлаа!", "success");
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Оюутан хасахад алдаа гарлаа";
      showToast(message, "error");
    }
  }

  return (
    <DashboardShell>
      <div className="grid gap-6">
        <FadeIn>
          <SpotlightCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-100">
                <BookOpen className="w-6 h-6 text-neutral-700" />
              </div>
              <div>
                <h1 className="text-3xl font-black">Шүүмжийн бүлэг</h1>
                <p className="text-neutral-600">Шүүмж багш болон оюутнуудыг бүлэгт онооно.</p>
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
          <SpotlightCard className="p-5">
            <h2 className="mb-4 font-black flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Бүлэг нэмэх
            </h2>
            <form className="grid gap-3 md:grid-cols-4" onSubmit={createGroup}>
              <label className="data-label">
                Бүлгийн нэр
                <input name="name" className="data-input" placeholder="Хаврын хамгаалалт A" required />
              </label>
              <label className="data-label">
                Улирал
                <select name="academicSeasonId" className="data-input" required>
                  <option value="">Сонгох...</option>
                  {seasons.map((season) => (
                    <option key={season.id} value={season.id}>{season.name}</option>
                  ))}
                </select>
              </label>
              <label className="data-label">
                Зэрэг
                <select name="degreeTypeId" className="data-input">
                  <option value="">Бүх зэрэг</option>
                  {degrees.map((degree) => (
                    <option key={degree.id} value={degree.id}>{degree.name}</option>
                  ))}
                </select>
              </label>
              <div className="flex items-end">
                <motion.button
                  className="data-button w-full"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={submitting}
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  {submitting ? "Нэмж байна..." : "Нэмэх"}
                </motion.button>
              </div>
            </form>
          </SpotlightCard>
        </FadeIn>

        <div className="grid gap-4">
          {groups.map((group, index) => {
            const activeTeachers = group.teachers?.filter((item: any) => item.isActive) ?? [];
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <SpotlightCard className="p-5">
                  <div className="flex flex-col gap-2 border-b border-neutral-200 pb-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-xl font-black">{group.name}</h2>
                      <p className="text-sm text-neutral-600">
                        {group.academicSeason?.name} · {group.degreeType?.name ?? "Бүх зэрэг"}
                      </p>
                    </div>
                    <span className="status-pill">{activeTeachers.length}/6 багш · {group.students?.length ?? 0} оюутан</span>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <h3 className="font-black flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Шүүмж багш
                      </h3>
                      <div className="mt-3 grid gap-2">
                        {activeTeachers.map((item: any) => (
                          <motion.div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
                            whileHover={{ backgroundColor: "rgba(245, 245, 245, 1)" }}
                          >
                            <div>
                              <p className="font-bold">{item.teacher?.user?.name}</p>
                              <p className="text-xs text-neutral-500">
                                {teacherTypeLabel(item.teacher?.user?.teacherType)} · {item.teacher?.user?.email}
                              </p>
                            </div>
                            <motion.button
                              className="data-button secondary"
                              onClick={() => removeTeacher(group.id, item.teacherId)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <UserMinus className="w-3 h-3 inline mr-1" />
                              Хасах
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                      <form
                        className="mt-3 flex gap-2"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void assignTeacher(group.id, event.currentTarget);
                        }}
                      >
                        <select name="teacherId" className="data-input" required>
                          <option value="">Сонгох...</option>
                          {critiqueTeachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>{teacher.user?.name}</option>
                          ))}
                        </select>
                        <motion.button
                          className="data-button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <UserPlus className="w-3 h-3 inline mr-1" />
                          Нэмэх
                        </motion.button>
                      </form>
                    </div>

                    <div>
                      <h3 className="font-black flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Оюутан
                      </h3>
                      <div className="mt-3 grid gap-2">
                        {(group.students ?? []).map((item: any) => (
                          <motion.div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
                            whileHover={{ backgroundColor: "rgba(245, 245, 245, 1)" }}
                          >
                            <div>
                              <p className="font-bold">{item.student?.user?.name}</p>
                              <p className="text-xs text-neutral-500">{item.student?.studentCode}</p>
                            </div>
                            <motion.button
                              className="data-button secondary"
                              onClick={() => removeStudent(group.id, item.studentId)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <UserMinus className="w-3 h-3 inline mr-1" />
                              Хасах
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                      <form
                        className="mt-3 flex gap-2"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void assignStudent(group.id, event.currentTarget);
                        }}
                      >
                        <select name="studentId" className="data-input" required>
                          <option value="">Сонгох...</option>
                          {students.map((student) => (
                            <option key={student.id} value={student.id}>{student.user?.name}</option>
                          ))}
                        </select>
                        <motion.button
                          className="data-button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <UserPlus className="w-3 h-3 inline mr-1" />
                          Нэмэх
                        </motion.button>
                      </form>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
