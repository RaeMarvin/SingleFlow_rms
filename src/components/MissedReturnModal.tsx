import React from 'react';
import SparklingStars from './SparklingStars';
import logoImage from '../assets/logo.png';

interface Props {
  show: boolean;
  onClose: () => void;
}

const MissedReturnModal: React.FC<Props> = ({ show, onClose }) => {
  if (!show) return null;

  const accent = '#7dc3ff';
  const starVariant = 'gold';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 relative" style={{ backgroundColor: accent }}>
        <div className="flex items-center justify-center relative">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center border border-gray-100 drop-shadow-lg relative">
            <img src={logoImage} alt="Fozzle" className="w-16 h-16 object-contain" />
            <SparklingStars show={true} variant={starVariant as any} />
          </div>
        </div>

        <div className="text-center mt-4 text-white">
          <h2 className="text-xl font-semibold">Welcome back, Fozzler! ✨</h2>
          <p className="mt-2">Today is where the real action happens. Let's get fozzling</p>
        </div>

        <div className="mt-6 text-center">
          <button onClick={onClose} className="px-6 py-2 rounded-full font-medium bg-white text-[#7dc3ff]">Close</button>
        </div>
      </div>
    </div>
  );
};

export default MissedReturnModal;
