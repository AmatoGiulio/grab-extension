'use client';

import { motion, SpringOptions, useScroll, useSpring, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';
import type { RefObject } from 'react';

export type ScrollProgressProps = {
  className?: string;
  springOptions?: SpringOptions;
  containerRef?: RefObject<HTMLElement | null>;
  mode?: 'scale' | 'opacity';
};

const DEFAULT_SPRING_OPTIONS: SpringOptions = {
  stiffness: 200,
  damping: 50,
  restDelta: 0.001,
};

export function ScrollProgress({
  className,
  springOptions,
  containerRef,
  mode = 'scale',
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll({
    container: containerRef as RefObject<HTMLElement | null>,
  });

  const spring = useSpring(scrollYProgress, {
    ...DEFAULT_SPRING_OPTIONS,
    ...(springOptions ?? {}),
  });

  if (mode === 'opacity') {
    const opacity = useTransform(spring, [0.92, 1], [1, 0]);
    return (
      <motion.div
        className={cn('inset-x-0 bottom-0', className)}
        style={{ opacity }}
      />
    );
  }

  const scaleX = spring;

  return (
    <motion.div
      className={cn('inset-x-0 top-0 h-1 origin-left', className)}
      style={{ scaleX }}
    />
  );
}
