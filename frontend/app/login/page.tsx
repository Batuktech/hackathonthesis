"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { defaultPassword, demoAccounts } from "@/lib/constants";
import { roleHome, storeSession } from "@/lib/auth";
import { AnimatedButton } from "@/components/reactbits/AnimatedButton";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { FadeIn } from "@/components/reactbits/FadeIn";
import { ArrowLeft, LogIn, User, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState(defaultPassword);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.login(email, password);
      storeSession(result.token, result.user);
      router.push(roleHome(result.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Нэвтрэхэд алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-100 px-4 py-10 text-neutral-950">
      <FadeIn className="w-full max-w-md">
        <SpotlightCard className="p-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Нүүр рүү буцах
          </Link>
          
          <motion.h1
            className="mt-4 text-3xl font-black"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Нэвтрэх
          </motion.h1>
          
          <motion.p
            className="mt-2 text-neutral-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Админы үүсгэсэн эсвэл demo эрхээр нэвтэрнэ.
          </motion.p>

          <form className="mt-6 grid gap-4" onSubmit={submit}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="data-label">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-400" />
                  Имэйл
                </span>
                <input
                  className="data-input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="имэйл@жишээ.com"
                />
              </label>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="data-label">
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-neutral-400" />
                  Нууц үг
                </span>
                <input
                  className="data-input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Нууц үг"
                />
              </label>
            </motion.div>
            
            {error ? (
              <motion.p
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.p>
            ) : null}
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <AnimatedButton
                type="submit"
                disabled={loading}
                className="w-full"
                icon={<LogIn className="w-4 h-4" />}
              >
                {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
              </AnimatedButton>
            </motion.div>
          </form>

          <motion.div
            className="mt-6 grid gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm font-bold text-neutral-500 mb-2">Demo эрхүүд</p>
            {demoAccounts.map(([label, account], index) => (
              <motion.button
                key={account}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2.5 text-left text-sm hover:bg-neutral-50 hover:border-neutral-300 transition-all"
                onClick={() => setEmail(account)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-neutral-500" />
                </div>
                <div>
                  <b className="block">{label}</b>
                  <span className="text-neutral-500 text-xs">{account}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </SpotlightCard>
      </FadeIn>
    </main>
  );
}
