"use client";

import { motion } from "framer-motion";
import { springs } from "@/lib/springs";

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function SectionReveal({
  children,
  className,
  delay = 0,
}: SectionRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...springs.reveal, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
