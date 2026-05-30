"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { AnimatedButton } from "@/components/reactbits/AnimatedButton";
import { FadeIn, FadeInOnScroll } from "@/components/reactbits/FadeIn";
import { GradientText } from "@/components/reactbits/GradientText";
import { LogIn, ArrowRight, Users, BookOpen, Shield, Settings } from "lucide-react";

const roles = [
  {
    title: "Оюутан",
    description: "Диплом үүсгэх, PDF оруулах, хуваарь, оноо, шүүмж харах.",
    icon: BookOpen,
  },
  {
    title: "Удирдагч багш",
    description: "Оноогдсон оюутнуудаа харж 1-р хамгаалалтад оноо өгнө.",
    icon: Users,
  },
  {
    title: "Шүүмж багш",
    description: "Бүлгийн хамгаалалтад оноо өгч шүүмжийн засвар шалгана.",
    icon: Shield,
  },
  {
    title: "Админ",
    description: "Хэрэглэгч, комисс, хуваарь, диплом, статистик удирдана.",
    icon: Settings,
  },
];

const workflow = [
  "Диплом бүртгэх",
  "Удирдагч оноох",
  "1-р хамгаалалт",
  "Шүүмж комисс",
  "2-3-р хамгаалалт",
  "Тусгай шүүмж",
  "Эцсийн хамгаалалт",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <motion.span
            className="text-lg font-black tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Диплом хамгаалалт
          </motion.span>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/login">
              <AnimatedButton icon={<LogIn className="w-4 h-4" />}>
                Нэвтрэх
              </AnimatedButton>
            </Link>
          </motion.div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <FadeIn delay={0.1}>
          <SpotlightCard className="p-8">
            <p className="text-sm font-bold uppercase tracking-wide text-neutral-500">
              Диплом хамгаалалтын систем
            </p>
            <h1 className="mt-4 text-5xl font-black leading-tight md:text-6xl">
              <GradientText>Дипломын явцыг нэг самбараас удирдана.</GradientText>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
              Оюутан, багш, PDF файл, хамгаалалтын хуваарь, оноо, шүүмж, статистикийг эрхийн дагуу удирдах веб систем.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login">
                <AnimatedButton icon={<LogIn className="w-4 h-4" />}>
                  Систем нээх
                </AnimatedButton>
              </Link>
              <Link href="#workflow">
                <AnimatedButton variant="outline" icon={<ArrowRight className="w-4 h-4" />}>
                  Явц
                </AnimatedButton>
              </Link>
            </div>
          </SpotlightCard>
        </FadeIn>

        <FadeIn delay={0.2}>
          <SpotlightCard className="p-6">
            <h2 className="text-xl font-black mb-4">Demo эрхүүд</h2>
            <motion.div
              className="grid gap-2 text-sm"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {["admin@demo.com", "student1@demo.com", "mentor@demo.com", "critique1@demo.com"].map((email) => (
                <motion.div
                  key={email}
                  variants={itemVariants}
                  className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 border border-neutral-100 hover:border-neutral-200 transition-colors"
                >
                  <span className="font-semibold">{email}</span>
                  <span className="text-neutral-500 text-xs font-mono bg-neutral-100 px-2 py-1 rounded">password123</span>
                </motion.div>
              ))}
            </motion.div>
          </SpotlightCard>
        </FadeIn>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 md:grid-cols-4">
        <motion.div
          className="grid gap-4 md:grid-cols-4 md:col-span-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <motion.div key={role.title} variants={itemVariants}>
                <SpotlightCard className="p-5 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-neutral-100">
                      <Icon className="w-5 h-5 text-neutral-700" />
                    </div>
                    <h2 className="text-xl font-black">{role.title}</h2>
                  </div>
                  <p className="text-sm leading-6 text-neutral-600">{role.description}</p>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-4 pb-16">
        <FadeInOnScroll>
          <SpotlightCard className="p-8">
            <h2 className="text-2xl font-black mb-6">Хамгаалалтын явц</h2>
            <motion.div
              className="grid gap-3 md:grid-cols-7"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {workflow.map((item, index) => (
                <motion.div
                  key={item}
                  variants={itemVariants}
                  className="relative"
                >
                  <SpotlightCard className="p-4 text-center h-full">
                    <motion.div
                      className="w-8 h-8 rounded-full bg-neutral-950 text-white flex items-center justify-center font-bold text-sm mx-auto mb-2"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {index + 1}
                    </motion.div>
                    <p className="text-sm text-neutral-700 font-medium">{item}</p>
                  </SpotlightCard>
                  {index < workflow.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-4 h-4 text-neutral-300" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </SpotlightCard>
        </FadeInOnScroll>
      </section>
    </main>
  );
}
