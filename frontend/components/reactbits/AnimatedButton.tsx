"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  icon?: ReactNode;
}

export function AnimatedButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  className = "",
  icon,
}: AnimatedButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-200 overflow-hidden";
  
  const variants = {
    primary: "bg-neutral-950 text-white hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-950/20",
    secondary: "bg-neutral-100 text-neutral-950 hover:bg-neutral-200",
    outline: "border-2 border-neutral-300 text-neutral-950 hover:border-neutral-950 hover:bg-neutral-50",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      <motion.div
        className="absolute inset-0 bg-white/10"
        initial={{ x: "-100%", opacity: 0 }}
        whileHover={{ x: "100%", opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
    </motion.button>
  );
}
