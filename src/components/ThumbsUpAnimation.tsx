import { useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';

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
        <div className="bg-green-500 rounded-full p-8 shadow-2xl">
          <ThumbsUp 
            className="w-16 h-16 sm:w-20 sm:h-20 text-white" 
            strokeWidth={2}
          />
        </div>
      </div>
    </div>
  );
};

export default ThumbsUpAnimation;