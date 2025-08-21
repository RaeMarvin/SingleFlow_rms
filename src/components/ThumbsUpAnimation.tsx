import { useEffect } from 'react';

interface ThumbsUpAnimationProps {
  show: boolean;
  onComplete: () => void;
}

const ThumbsUpAnimation: React.FC<ThumbsUpAnimationProps> = ({ show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1500); // Show for 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="animate-bounce">
        <img 
          src="/thumbs-up.png" 
          alt="Great job completing a Signal task!" 
          className="w-32 h-32 sm:w-40 sm:h-40 drop-shadow-2xl transition-opacity duration-300"
        />
      </div>
    </div>
  );
};

export default ThumbsUpAnimation;