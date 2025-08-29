import React from 'react';
import SparklingStars from './SparklingStars';
import logoImage from '../assets/logo.png';

interface Props {
  show: boolean;
  onClose: () => void;
  consecutiveDays: number;
  weeklyAveragePercent: number;
}

const WelcomeBackModal: React.FC<Props> = ({ show, onClose, consecutiveDays, weeklyAveragePercent }) => {
  if (!show) return null;

  const accent = '#7dc3ff';

  const starVariant = weeklyAveragePercent >= 80 ? 'gold' : (weeklyAveragePercent >= 50 ? 'silver' : 'silver');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 relative" style={{color: accent}}>
        <div className="flex items-center justify-center relative">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center border border-gray-100 drop-shadow-lg relative">
            <img src={logoImage} alt="Fozzle" className="w-16 h-16 object-contain" />
            <SparklingStars show={true} variant={starVariant as any} />
          </div>
        </div>

        <div className="text-center mt-4">
          <h2 className="text-xl font-semibold" style={{color: accent}}>Welcome back, focus champion! 🌟</h2>
          <p className="mt-2" style={{color: accent}}>Let's get Fozzling</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Consecutive days</div>
            <div className="text-2xl font-semibold" style={{color: accent}}>{consecutiveDays}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Weekly average</div>
            <div className="text-2xl font-semibold" style={{color: accent}}>{Math.round(weeklyAveragePercent)}%</div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button onClick={onClose} className="px-6 py-2 rounded-full font-medium" style={{backgroundColor: accent, color: 'white'}}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBackModal;
