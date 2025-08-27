import React from 'react';

interface SparklingStarsProps {
  show: boolean;
  variant?: 'gold' | 'silver';
}

const SparklingStars: React.FC<SparklingStarsProps> = ({ show, variant = 'gold' }) => {
  if (!show) return null;

  // color mapping per variant
  const primary = variant === 'gold' ? 'text-yellow-400' : 'text-gray-300';
  const primaryLarge = variant === 'gold' ? 'text-yellow-400' : 'text-gray-300';
  const secondary = variant === 'gold' ? 'text-yellow-300' : 'text-gray-400';
  const accentBlue = 'text-blue-400';
  const accentBlueMuted = 'text-blue-300';
  const white = 'text-white';

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="relative w-full h-full">
        {/* Sparkle Effects - Doubled */}
        <div className={`absolute -top-3 -left-3 ${primary} text-2xl animate-ping`}>✨</div>
        <div className={`absolute -top-3 -right-3 ${white} text-xl animate-pulse`} style={{animationDelay: '0.2s'}}>⭐</div>
        <div className={`absolute -bottom-3 -left-3 ${accentBlue} text-xl animate-bounce`} style={{animationDelay: '0.4s'}}>✨</div>
        <div className={`absolute -bottom-3 -right-3 ${secondary} text-2xl animate-ping`} style={{animationDelay: '0.6s'}}>⭐</div>
        <div className={`absolute top-1/2 -left-4 ${white} text-lg animate-pulse`} style={{animationDelay: '0.8s'}}>✨</div>
        <div className={`absolute top-1/2 -right-4 ${accentBlueMuted} text-lg animate-bounce`} style={{animationDelay: '1s'}}>⭐</div>
        
        {/* Additional Sparkles */}
        <div className={`absolute -top-1 left-1/2 ${accentBlueMuted} text-lg animate-ping`} style={{animationDelay: '0.1s'}}>✨</div>
        <div className={`absolute -bottom-1 left-1/2 ${primary} text-lg animate-pulse`} style={{animationDelay: '0.3s'}}>⭐</div>
        <div className={`absolute top-1/4 -left-5 ${secondary} text-md animate-bounce`} style={{animationDelay: '0.5s'}}>✨</div>
        <div className={`absolute top-1/4 -right-5 ${white} text-md animate-ping`} style={{animationDelay: '0.7s'}}>⭐</div>
        <div className={`absolute top-3/4 -left-5 ${accentBlue} text-md animate-pulse`} style={{animationDelay: '0.9s'}}>✨</div>
        <div className={`absolute top-3/4 -right-5 ${primaryLarge} text-md animate-bounce`} style={{animationDelay: '1.1s'}}>⭐</div>
      </div>
    </div>
  );
};

export default SparklingStars;
