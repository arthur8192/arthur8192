"use client";

import { useEffect, useRef } from "react";
import { CANVAS_SIZE, drawArthur } from "@/lib/renderer";
import type { ArthurState, Genome } from "@/lib/types";

type ArthurCanvasProps = {
  state: ArthurState;
  genome: Genome;
  className?: string;
};

export function useArthurAnimation(state: ArthurState, genome: Genome) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const context = ctx;
    context.imageSmoothingEnabled = false;

    function frame() {
      const time = (Date.now() - startTime.current) / 1000;
      drawArthur(context, state, genome, time);
      animationRef.current = requestAnimationFrame(frame);
    }

    animationRef.current = requestAnimationFrame(frame);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state, genome]);

  return canvasRef;
}

export function ArthurCanvas({ state, genome, className = "" }: ArthurCanvasProps) {
  const canvasRef = useArthurAnimation(state, genome);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className={`arthur-canvas ${className}`}
      aria-label="Arthur organism render"
    />
  );
}
