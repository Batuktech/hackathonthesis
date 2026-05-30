"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { FadeIn } from "@/components/reactbits/FadeIn";
import { api } from "@/lib/api";
import { Users, BookOpen, FileText, Award, BarChart3 } from "lucide-react";

export default function AdminStatisticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [teacherStats, setTeacherStats] = useState<any[]>([]);
  const [groupStats, setGroupStats] = useState<any[]>([]);

  useEffect(() => {
    void Promise.all([api.getStatisticsOverview(), api.getStatisticsTeachers(), api.getStatisticsGroups()]).then(([overviewData, teachers, groups]) => {
      setOverview(overviewData);
      setTeacherStats(teachers);
      setGroupStats(groups);
    });
  }, []);

  const counts = overview?.counts ?? {};
  return (
    <DashboardShell>
      <div className="grid gap-6">
        <FadeIn>
          <SpotlightCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-100">
                <BarChart3 className="w-6 h-6 text-neutral-700" />
              </div>
              <div>
                <h1 className="text-3xl font-black">Статистик</h1>
                <p className="text-neutral-600">Мэдээллийн баазын нэгтгэл, хамгаалалтын явц, оноо, багш болон бүлгүүд.</p>
              </div>
            </div>
          </SpotlightCard>
        </FadeIn>

        <motion.section
          className="grid gap-4 md:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StatCard label="Оюутан" value={counts.students ?? 0} icon={Users} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <StatCard label="Багш" value={counts.teachers ?? 0} icon={BookOpen} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <StatCard label="Диплом" value={counts.theses ?? 0} icon={FileText} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <StatCard label="Дундаж оноо" value={Math.round(overview?.avgTotalScore ?? 0)} icon={Award} />
          </motion.div>
        </motion.section>

        <section className="grid gap-4 lg:grid-cols-3">
          <FadeIn delay={0.2}>
            <SpotlightCard className="p-5 lg:col-span-2">
              <h2 className="text-xl font-black mb-4">Хамгаалалтын шат дундаж</h2>
              <div className="grid gap-3">
                {(overview?.stageAverages ?? []).map((stage: any, index: number) => (
                  <motion.div
                    key={stage.stage}
                    className="rounded-lg border border-neutral-200 p-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex justify-between text-sm font-semibold">
                      <span>{stage.stage}</span>
                      <span>{stage.average.toFixed(1)} дундаж · {stage.completed} оноо</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-neutral-100 overflow-hidden">
                      <motion.div
                        className="h-2 rounded-full bg-neutral-950"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(stage.average * 4, 100)}%` }}
                        transition={{ duration: 0.8, delay: index * 0.05 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </SpotlightCard>
          </FadeIn>

          <div className="grid gap-4">
            <FadeIn delay={0.3}>
              <SpotlightCard className="p-5">
                <h2 className="font-black">Багшийн дундаж</h2>
                <div className="mt-3 grid gap-2 text-sm">
                  {teacherStats.map((row, index) => (
                    <motion.div
                      key={row.teacher}
                      className="flex justify-between border-b border-neutral-100 py-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <span>{row.teacher}</span>
                      <b>{row.average.toFixed(1)}</b>
                    </motion.div>
                  ))}
                </div>
              </SpotlightCard>
            </FadeIn>
            <FadeIn delay={0.4}>
              <SpotlightCard className="p-5">
                <h2 className="font-black">Бүлгийн дундаж</h2>
                <div className="mt-3 grid gap-2 text-sm">
                  {groupStats.map((row, index) => (
                    <motion.div
                      key={row.group}
                      className="flex justify-between border-b border-neutral-100 py-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <span>{row.group}</span>
                      <b>{row.average.toFixed(1)}</b>
                    </motion.div>
                  ))}
                </div>
              </SpotlightCard>
            </FadeIn>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
