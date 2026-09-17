"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxDeg?: number;
}

export default function TiltCard({ children, className, maxDeg = 5 }: TiltCardProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 180, damping: 22, mass: 0.6 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 22, mass: 0.6 });

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(x * maxDeg * 2);
    rotateX.set(-y * maxDeg * 2);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div
      ref={ref}
      className={cn("h-full", className)}
      style={{ perspective: 900 }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      <motion.div
        className="h-full"
        style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}