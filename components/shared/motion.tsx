'use client';

import { motion, type MotionProps } from 'framer-motion';
import { type ReactNode } from 'react';

const fadeInAnimation: MotionProps = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export function FadeIn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div {...fadeInAnimation} className={className}>
      {children}
    </motion.div>
  );
}

export const FadeInDiv = motion.div;

export const fadeInProps = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export const slideUpProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};
