import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import DesktopConfetti from './DesktopConfetti';

type CardConfettiProps = {
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
};

const defaultConfig = {
  particleCount: 15,
  angle: 90,
  spread: 45,
  startVelocity: 25,
  decay: 0.9,
  gravity: 0.8,
  drift: 0,
  colors: [
    '#22c55e',
    '#a78bfa',
    '#7dc3ff',
    '#6ee7b7',
    '#fb7185',
    '#ffffff',
  ],
  shapes: ['circle', 'square'],
  scalar: 0.8,
};

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

const CardConfetti: React.FC<CardConfettiProps> = ({ trigger, duration = 2000, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger && isMobileDevice()) {
      const canvas = canvasRef.current;
      if (canvas && canvas instanceof HTMLCanvasElement && document.body.contains(canvas)) {
        setActive(true);
        const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });
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
      }
    }
  }, [trigger, duration, config]);

  // Render appropriate confetti for the platform
  return isMobileDevice() ? (
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
  ) : (
    <DesktopConfetti trigger={trigger} duration={duration} />
  );
};

export default CardConfetti;
