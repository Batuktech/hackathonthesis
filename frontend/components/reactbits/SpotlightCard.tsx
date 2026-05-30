"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function SpotlightCard({ children, className = "", onClick }: SpotlightCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl border border-neutral-200 bg-white ${className}`}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-100/50 to-transparent"
          style={{
            transform: "translateX(-100%)",
            animation: "none",
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
