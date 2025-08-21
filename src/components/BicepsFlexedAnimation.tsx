import { useEffect } from 'react';
import logoImage from '../assets/logo.png';

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
    <div className="fixed inset-0 flex items-center justify-center lg:items-start lg:justify-start lg:pt-48 lg:pl-[calc(62.5%-5rem)] z-50 pointer-events-none">
      <div className="relative">
        {/* Main Logo - Static */}
        <img 
          src={logoImage} 
          alt="Great job saying NO to distractions!" 
          className="w-32 h-32 sm:w-40 sm:h-40 drop-shadow-2xl"
        />
        
        {/* Sparkle Effects - Doubled */}
        <div className="absolute -top-3 -left-3 text-yellow-400 text-2xl animate-ping">✨</div>
        <div className="absolute -top-3 -right-3 text-white text-xl animate-pulse" style={{animationDelay: '0.2s'}}>⭐</div>
        <div className="absolute -bottom-3 -left-3 text-blue-400 text-xl animate-bounce" style={{animationDelay: '0.4s'}}>✨</div>
        <div className="absolute -bottom-3 -right-3 text-yellow-300 text-2xl animate-ping" style={{animationDelay: '0.6s'}}>⭐</div>
        <div className="absolute top-1/2 -left-4 text-white text-lg animate-pulse" style={{animationDelay: '0.8s'}}>✨</div>
        <div className="absolute top-1/2 -right-4 text-blue-300 text-lg animate-bounce" style={{animationDelay: '1s'}}>⭐</div>
        
        {/* Additional Sparkles */}
        <div className="absolute -top-1 left-1/2 text-blue-300 text-lg animate-ping" style={{animationDelay: '0.1s'}}>✨</div>
        <div className="absolute -bottom-1 left-1/2 text-yellow-400 text-lg animate-pulse" style={{animationDelay: '0.3s'}}>⭐</div>
        <div className="absolute top-1/4 -left-5 text-yellow-300 text-md animate-bounce" style={{animationDelay: '0.5s'}}>✨</div>
        <div className="absolute top-1/4 -right-5 text-white text-md animate-ping" style={{animationDelay: '0.7s'}}>⭐</div>
        <div className="absolute top-3/4 -left-5 text-blue-400 text-md animate-pulse" style={{animationDelay: '0.9s'}}>✨</div>
        <div className="absolute top-3/4 -right-5 text-yellow-400 text-md animate-bounce" style={{animationDelay: '1.1s'}}>⭐</div>
      </div>
    </div>
  );
};

export default BicepsFlexedAnimation;