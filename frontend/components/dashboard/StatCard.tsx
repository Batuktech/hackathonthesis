"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/reactbits/GlassCard";

export function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail?: string; icon?: LucideIcon }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-500">{label}</p>
          <motion.p
            className="mt-2 text-3xl font-black text-neutral-950"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            {value}
          </motion.p>
          {detail ? <p className="mt-2 text-xs text-neutral-500">{detail}</p> : null}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-neutral-100">
            <Icon className="w-5 h-5 text-neutral-600" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}
