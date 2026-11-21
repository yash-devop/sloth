import { cn } from "cn";
import { AnimatePresence, motion } from "motion/react";
import { fadeBlurMotion } from "../lib/motion";
export const SmoothSlideMotion = ({
  children,
  className,
  show = true,
}: {
  children: React.ReactNode;
  className?: string;
  show?: boolean;
}) => {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          variants={fadeBlurMotion}
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn(`w-fit`, className)}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
