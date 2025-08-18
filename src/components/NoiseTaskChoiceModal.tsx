import React from 'react';
import { Check, X } from 'lucide-react';

interface NoiseTaskChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted: () => void;
  onDeclined: () => void;
  taskTitle: string;
}

const NoiseTaskChoiceModal: React.FC<NoiseTaskChoiceModalProps> = ({
  isOpen,
  onClose,
  onCompleted,
  onDeclined,
  taskTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Task Complete
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            How did you handle "{taskTitle}"?
          </p>
          
          <div className="flex flex-col space-y-3">
            {/* Completed Option */}
            <button
              onClick={onCompleted}
              className="flex items-center justify-center space-x-3 w-full p-4 rounded-lg border-2 border-signal-200 bg-signal-50 hover:bg-signal-100 hover:border-signal-300 transition-colors duration-200 group"
            >
              <div className="w-6 h-6 rounded-full border-2 border-signal-500 bg-signal-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <div className="text-left">
                <div className="font-medium text-signal-700">Completed</div>
                <div className="text-xs text-signal-600">I finished this task</div>
              </div>
            </button>

            {/* Declined Option */}
            <button
              onClick={onDeclined}
              className="flex items-center justify-center space-x-3 w-full p-4 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-colors duration-200 group"
            >
              <div className="w-6 h-6 rounded-full border-2 border-red-500 bg-red-500 flex items-center justify-center">
                <X className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <div className="text-left">
                <div className="font-medium text-red-700">Said No</div>
                <div className="text-xs text-red-600">I declined to do this task</div>
              </div>
            </button>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoiseTaskChoiceModal;
