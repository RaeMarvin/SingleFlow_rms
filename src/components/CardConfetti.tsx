import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';

interface CardConfettiProps {
  trigger: boolean;
  duration?: number;
  config?: {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    colors?: string[];
    shapes?: ('square' | 'circle')[];
    scalar?: number;
  };
}

const defaultConfig = {
  particleCount: 15,
  angle: 90,
  spread: 45,
  startVelocity: 25,
  decay: 0.9,
  gravity: 0.8,
  drift: 0,
  colors: [
    '#22c55e', // Signal green
    '#a78bfa', // Accent purple
    '#7dc3ff', // Fozzle blue
    '#6ee7b7', // Mint green
    '#fb7185', // Coral
    '#ffffff', // White
  ],
  shapes: ['circle', 'square'] as ('circle' | 'square')[],
  scalar: 0.8,
};

const CardConfetti: React.FC<CardConfettiProps> = ({ trigger, duration = 2000, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      if (canvasRef.current && canvasRef.current instanceof HTMLCanvasElement) {
        setActive(true);
        const myConfetti = confetti.create(canvasRef.current, { resize: true, useWorker: true });
        const animationEnd = Date.now() + duration;
        const finalConfig = config || defaultConfig;
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const frame = () => {
          if (Date.now() > animationEnd) {
            setActive(false);
            return;
          }
          myConfetti({
            ...finalConfig,
            shapes: (finalConfig.shapes ?? defaultConfig.shapes) as ('circle' | 'square')[],
            origin: {
              x: randomInRange(0.1, 0.9),
              y: Math.random() - 0.2,
            },
          });
          requestAnimationFrame(frame);
        };
        frame();
      } else {
        // Fallback: trigger border flash event for desktop
        if (window.innerWidth > 768) {
          window.dispatchEvent(new CustomEvent('fozzle-border-flash-trigger'));
          console.log('Desktop detected - triggering border flash');
        }
      }
    }
  }, [trigger, duration, config]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        display: active ? 'block' : 'none',
      }}
    />
  );
};

export default CardConfetti;
