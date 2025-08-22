import React from 'react';
2
interface SparklingStarsProps {
  show: boolean;
}

const SparklingStars: React.FC<SparklingStarsProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="relative w-full h-full">
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

export default SparklingStars;
