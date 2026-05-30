"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { FadeIn, FadeInOnScroll } from "@/components/reactbits/FadeIn";
import { api } from "@/lib/api";
import { roleLabel, teacherTypeLabel } from "@/lib/mn";
import {
  Users,
  FileText,
  Award,
  Calendar,
  MessageSquare,
  BookOpen,
  BarChart3,
  Settings,
  ArrowRight,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

export function OverviewClient({ mode }: { mode: "admin" | "student" | "teacher" }) {
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");
  const [teacherCodeMessage, setTeacherCodeMessage] = useState("");

  useEffect(() => {
    api.dashboard().then(setData).catch((err) => setError(err.message));
    if (mode === "admin") api.getStatisticsOverview().then(setStats).catch(() => null);
  }, [mode]);

  const cards = useMemo(() => {
    if (mode === "admin") {
      return [
        { label: "Оюутан", value: stats?.counts?.students ?? 0, icon: Users },
        { label: "Багш", value: stats?.counts?.teachers ?? 0, icon: BookOpen },
        { label: "Диплом", value: stats?.counts?.theses ?? 0, icon: FileText },
        { label: "Дундаж оноо", value: Math.round(stats?.avgTotalScore ?? 0), icon: Award },
      ];
    }
    if (mode === "student") {
      const thesis = data?.student?.thesis;
      return [
        { label: "Дипломын төлөв", value: thesis?.status ?? "Диплом үүсгээгүй", icon: FileText },
        { label: "Одоогийн хамгаалалт", value: thesis?.currentDefenseStage ?? "-", icon: Award },
        { label: "Оноо", value: thesis?.defenseScores?.length ?? 0, icon: Award },
        { label: "Шүүмж", value: thesis?.critiques?.length ?? 0, icon: MessageSquare },
      ];
    }
    return [
      { label: "Удирдаж буй диплом", value: data?.teacher?.mentoredTheses?.length ?? 0, icon: FileText },
      { label: "Шүүмж комисс", value: data?.teacher?.critiqueGroups?.length ?? 0, icon: BookOpen },
      { label: "Оноосон шүүмж", value: data?.teacher?.assignedCritiques?.length ?? 0, icon: MessageSquare },
      { label: "Төрөл", value: teacherTypeLabel(data?.teacher?.user?.teacherType), icon: Users },
    ];
  }, [data, mode, stats]);

  const actions =
    mode === "admin"
      ? [
          { href: "/admin/users", title: "Хэрэглэгч", description: "Оюутан, багш, админ нэмэх", icon: Users },
          { href: "/admin/groups", title: "Шүүмж комисс", description: "Багш, оюутан оноох", icon: BookOpen },
          { href: "/admin/theses", title: "Диплом оноолт", description: "Удирдагч, комисс, төлөв", icon: FileText },
          { href: "/admin/statistics", title: "Статистик", description: "Оноо ба явц", icon: BarChart3 },
        ]
      : mode === "student"
        ? [
            { href: "/student/thesis", title: "Диплом", description: "Мэдээлэл, PDF, удирдагчийн код", icon: FileText },
            { href: "/student/scores", title: "Оноо", description: "Хамгаалалтын оноо харах", icon: Award },
            { href: "/student/schedule", title: "Хуваарь", description: "Хамгаалалтын өдөр, өрөө", icon: Calendar },
            { href: "/student/critiques", title: "Шүүмж", description: "Санал ба засвар", icon: MessageSquare },
          ]
        : [
            { href: "/teacher/mentor-students", title: "Оюутнууд", description: "Удирдаж буй диплом", icon: Users },
            { href: "/teacher/critique-groups", title: "Шүүмж комисс", description: "Оноогдсон бүлгүүд", icon: BookOpen },
            { href: "/teacher/scoring", title: "Оноо", description: "Хамгаалалтын оноо өгөх", icon: Award },
            { href: "/teacher/reviews", title: "Шүүмж", description: "Санал, засвар шалгах", icon: MessageSquare },
          ];

  async function updateTeacherCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const teacherCode = String(new FormData(event.currentTarget).get("teacherCode") ?? "");
    await api.updateTeacherCode(teacherCode);
    setTeacherCodeMessage("Багшийн код шинэчлэгдлээ.");
    setData(await api.dashboard());
  }

  return (
    <DashboardShell>
      <div className="grid gap-6">
        <FadeIn>
          <SpotlightCard className="p-6">
            <p className="text-sm font-bold uppercase tracking-wide text-neutral-500">
              {roleLabel(mode === "admin" ? "ADMIN" : mode === "student" ? "STUDENT" : "TEACHER")}
            </p>
            <h1 className="mt-2 text-3xl font-black text-neutral-950 md:text-4xl">
              Диплом хамгаалалтын систем
            </h1>
          </SpotlightCard>
        </FadeIn>

        {error ? (
          <motion.p
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        ) : null}

        <motion.section
          className="grid gap-4 md:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {cards.map((card) => (
            <motion.div key={card.label} variants={itemVariants}>
              <StatCard
                label={card.label}
                value={card.value}
                icon={card.icon}
              />
            </motion.div>
          ))}
        </motion.section>

        {mode === "teacher" ? (
          <FadeIn delay={0.2}>
            <SpotlightCard className="p-5">
              <h2 className="font-black text-lg">Багшийн код</h2>
              <p className="mt-1 text-sm text-neutral-600">Оюутан энэ кодыг оруулбал таны удирдлагад автоматаар оноогдоно.</p>
              <form className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row" onSubmit={updateTeacherCode}>
                <input
                  name="teacherCode"
                  defaultValue={data?.teacher?.teacherCode ?? ""}
                  className="data-input"
                  placeholder="Жишээ: MENTOR-001"
                  required
                />
                <motion.button
                  className="data-button shrink-0"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Код хадгалах
                </motion.button>
              </form>
              {teacherCodeMessage ? (
                <motion.p
                  className="mt-3 text-sm font-semibold text-green-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {teacherCodeMessage}
                </motion.p>
              ) : null}
            </SpotlightCard>
          </FadeIn>
        ) : null}

        <motion.section
          className="grid gap-4 md:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div key={action.href} variants={itemVariants}>
                <Link href={action.href}>
                  <SpotlightCard className="p-5 h-full group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-neutral-100 group-hover:bg-neutral-200 transition-colors">
                        <Icon className="w-5 h-5 text-neutral-700" />
                      </div>
                      <h2 className="font-black text-neutral-950">{action.title}</h2>
                    </div>
                    <p className="text-sm text-neutral-600">{action.description}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-neutral-400 group-hover:text-neutral-600 transition-colors">
                      <span>Нээх</span>
                      <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </SpotlightCard>
                </Link>
              </motion.div>
            );
          })}
        </motion.section>
      </div>
    </DashboardShell>
  );
}
