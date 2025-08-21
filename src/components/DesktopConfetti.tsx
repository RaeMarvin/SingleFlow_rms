import React, { useEffect, useState } from 'react';

interface DesktopConfettiProps {
  trigger: boolean;
  duration?: number;
}

interface Particle {
  id: number;
  left: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
}

const colors = [
  '#22c55e', // Signal green
  '#a78bfa', // Accent purple
  '#7dc3ff', // Fozzle blue
  '#6ee7b7', // Mint green
  '#fb7185', // Coral
  '#ffffff', // White
];

const DesktopConfetti: React.FC<DesktopConfettiProps> = ({ trigger, duration = 2000 }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsActive(true);
      
      // Create 15 particles
      const newParticles: Particle[] = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 80 + 10, // 10% to 90% from left
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4, // 4px to 12px
        delay: Math.random() * 500, // 0 to 500ms delay
        duration: Math.random() * 1000 + 1500, // 1.5s to 2.5s duration
      }));

      setParticles(newParticles);

      // Clean up after animation
      setTimeout(() => {
        setIsActive(false);
        setParticles([]);
      }, duration);
    }
  }, [trigger, duration]);

  if (!isActive) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.left}%`,
            top: '-10px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: '50%',
            animation: `fall ${particle.duration}ms ease-in ${particle.delay}ms forwards`,
          }}
        />
      ))}
      <style>
        {`
          @keyframes fall {
            0% {
              transform: translateY(-10px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(400px) rotate(360deg);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default DesktopConfetti;
