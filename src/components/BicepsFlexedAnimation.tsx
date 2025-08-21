import { useEffect } from 'react';
import { Zap } from 'lucide-react';

interface BicepsFlexedAnimationProps {
  show: boolean;
  onComplete: () => void;
}

const BicepsFlexedAnimation: React.FC<BicepsFlexedAnimationProps> = ({ show, onComplete }) => {
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
        <div className="rounded-full p-8 shadow-2xl" style={{ backgroundColor: '#5dccdb' }}>
          <Zap 
            className="w-16 h-16 sm:w-20 sm:h-20 text-white" 
            strokeWidth={2}
          />
        </div>
      </div>
    </div>
  );
};

export default BicepsFlexedAnimation;