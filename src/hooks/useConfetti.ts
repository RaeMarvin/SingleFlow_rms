import { useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiConfig {
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
}

export const useConfetti = () => {
  // Check if user is on mobile device
  const isMobile = useCallback(() => {
    // Returns true if the primary input mechanism is a coarse pointer (e.g., touch)
    return window.matchMedia('(pointer: coarse)').matches;
  }, []);

  const triggerConfetti = useCallback((config?: ConfettiConfig) => {
    const mobileCheck = isMobile();
    
    if (!mobileCheck) {
      return;
    }

    
    
    // Default Fozzle brand colors
    const defaultColors = [
      '#22c55e', // Signal green
      '#a78bfa', // Accent purple
      '#7dc3ff', // Fozzle blue
      '#6ee7b7', // Mint green
      '#fb7185', // Coral
      '#ffffff', // White
    ];

    // Mobile-optimized settings
    const mobileConfig: ConfettiConfig = {
      particleCount: 15, // Reduced by half from 30
      angle: 90,
      spread: 45,
      startVelocity: 25,
      decay: 0.9,
      gravity: 0.8,
      drift: 0,
      colors: defaultColors,
      shapes: ['circle', 'square'],
      scalar: 0.8,
    };

    // Use provided config or mobile default
    const finalConfig = config || mobileConfig;

    // Create multiple bursts for a more celebratory effect
    const duration = 2000; // 2 seconds (reduced by 1/3 from 3000ms)
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const frame = () => {
      if (Date.now() > animationEnd) return;

      confetti({
        ...finalConfig,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2,
        },
      });

      requestAnimationFrame(frame);
    };

    frame();
  }, [isMobile]);

  const triggerSuccess = useCallback(() => {
    if (!isMobile()) {
      return;
    }
    
    
    
    // Special success confetti with more celebration
    const count = 100; // Reduced by half from 200
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: ['#22c55e', '#a78bfa', '#7dc3ff', '#6ee7b7'],
      });
    }

    // Multiple bursts with different angles
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, [isMobile]);

  return {
    triggerConfetti,
    triggerSuccess,
  };
};
