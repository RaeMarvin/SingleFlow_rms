import { useEffect } from 'react';
import thumbsUpImage from '../assets/thumbs-up.png';

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
        <img 
          src={thumbsUpImage} 
          alt="Great job saying NO to distractions!" 
          className="w-32 h-32 sm:w-40 sm:h-40 drop-shadow-2xl transition-opacity duration-300"
          style={{
            filter: `hue-rotate(180deg) saturate(1.5) brightness(0.8)`
          }}
        />
      </div>
    </div>
  );
};

export default BicepsFlexedAnimation;