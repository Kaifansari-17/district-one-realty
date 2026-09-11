import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** "up" (default) slides in from below; "none" only fades, no movement. */
  direction?: "up" | "none";
}

/**
 * Reveals content once as it scrolls into view — not on every re-render, and not
 * repeatedly on re-scroll (amount/once tuned for section-level reveals, not toy effects).
 * Respects prefers-reduced-motion by skipping the transform entirely.
 */
export function FadeIn({ children, delay = 0, className, direction = "up" }: FadeInProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion || direction === "none" ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
