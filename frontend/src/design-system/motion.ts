import type { Transition, Variants } from "framer-motion"

export const transitions = {
  fast: { duration: 0.15, ease: "easeOut" },
  default: { duration: 0.25, ease: "easeOut" },
  spring: { type: "spring", stiffness: 380, damping: 30 },
} satisfies Record<string, Transition>

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.default },
  exit: { opacity: 0, transition: transitions.fast },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: transitions.default },
  exit: { opacity: 0, y: 8, transition: transitions.fast },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transitions.spring },
  exit: { opacity: 0, scale: 0.98, transition: transitions.fast },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

