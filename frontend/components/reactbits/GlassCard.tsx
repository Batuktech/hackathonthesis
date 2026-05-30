"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = "", hover = true }: GlassCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-lg shadow-neutral-950/5 ${className}`}
      whileHover={hover ? { y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
