import React from 'react';
import SparklingStars from './SparklingStars';
import logoImage from '../assets/logo.png';

interface Props {
  show: boolean;
  onClose: () => void;
  consecutiveDays: number;
  weeklyAveragePercent: number; // 0-100
}

const WelcomeBackModal: React.FC<Props> = ({ show, onClose, consecutiveDays, weeklyAveragePercent }) => {
  if (!show) return null;

  const variant = weeklyAveragePercent >= 80 ? 'gold' : (weeklyAveragePercent >= 50 ? 'silver' : undefined);
  const accentColor = '#7dc3ff'; // match Add Task button

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center" style={{color: accentColor}}>
        <div className="mx-auto w-32 h-32 sm:w-36 sm:h-36 relative">
          <SparklingStars show={!!variant} variant={variant as any} />
          <img src={logoImage} alt="Fozzle" className="w-full h-full object-contain mx-auto" />
        </div>

        <h3 className="mt-4 text-xl font-bold">Welcome back, focus champion! 🌟</h3>
        <p className="mt-2 text-sm">Let's get Fozzling</p>

        <div className="mt-4 space-y-2">
          <div className="text-sm">
            <span className="font-semibold">Consecutive days:</span> {consecutiveDays}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Weekly average Fozzle score:</span> {weeklyAveragePercent.toFixed(0)}%
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-white font-medium"
            style={{ backgroundColor: accentColor }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBackModal;
