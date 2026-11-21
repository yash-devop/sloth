import type { MotionProps } from "motion/react";

type MotionPreset = Pick<MotionProps, "initial" | "animate" | "exit">;

const transition = { duration: 0.15, ease: "easeOut" } as const;

export const fadeBlurMotion = {
  initial: {
    opacity: 0,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    transition,
  },
  exit: {
    opacity: 0,
    filter: "blur(10px)",
    transition: { ...transition, duration: 0.2 },
  },
} satisfies MotionPreset;
