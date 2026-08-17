import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "framer-motion"

import { fadeIn, fadeUp, scaleIn } from "@/design-system/motion"

interface MotionRevealProps extends HTMLMotionProps<"div"> {
  animation?: "fade" | "fade-up" | "scale"
  delay?: number
  once?: boolean
}

const variants: Record<NonNullable<MotionRevealProps["animation"]>, Variants> = {
  fade: fadeIn,
  "fade-up": fadeUp,
  scale: scaleIn,
}

export function MotionReveal({ animation = "fade-up", delay = 0, once = true, ...props }: MotionRevealProps) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      variants={reduceMotion ? fadeIn : variants[animation]}
      initial="hidden"
      whileInView="visible"
      exit="exit"
      viewport={{ once, amount: 0.15 }}
      transition={{ delay }}
      {...props}
    />
  )
}

