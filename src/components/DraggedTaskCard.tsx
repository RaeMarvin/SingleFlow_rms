import { Check, Edit3 } from 'lucide-react';
import { Task } from '../types';

interface DraggedTaskCardProps {
  task: Task;
}

const DraggedTaskCard: React.FC<DraggedTaskCardProps> = ({ task }) => {
  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'work':
        return 'bg-primary-100 text-primary-700 border-primary-200';
      case 'home':
        return 'bg-signal-100 text-signal-700 border-signal-200';
      case 'social':
        return 'bg-noise-100 text-noise-700 border-noise-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCheckboxColor = () => {
    if (task.completed) {
      return 'border-signal-500 bg-signal-500';
    }
    switch (task.priority) {
      case 'work':
        return 'border-primary-400 bg-white';
      case 'home':
        return 'border-accent-mint bg-white';
      case 'social':
        return 'border-noise-400 bg-white';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <div
      className={`
        group relative rounded-xl p-4 border transition-all duration-200
        ${task.category === 'noise' ? 'bg-gray-50' : 'bg-white'}
        shadow-xl rotate-3 scale-110
        ${task.completed ? 'opacity-75' : ''}
        border border-gray-200 shadow-sm
      `}
    >
      {/* Dedicated drag handle - larger area for easier grabbing */}
      <div 
        className="absolute top-0 left-0 right-0 h-8 cursor-grabbing flex items-center justify-center"
        title="Drag to move task"
      >
        {/* Drag indicator dots */}
        <div className="flex space-x-1 opacity-30 group-hover:opacity-60">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      {/* Main content area - offset to account for drag handle */}
      <div className="relative mt-4">
        <div className="flex items-center justify-between">
          {/* Left side - checkbox, reject button (for Noise), and task info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Action buttons container */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Circular checkbox */}
              <div
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                  ${getCheckboxColor()}
                `}
              >
                {task.completed && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>

              {/* Edit icon */}
              {(task.category === 'signal' || task.category === 'noise') && !task.completed && (
                <div
                  className="w-5 h-5 rounded-full border-2 border-blue-300 bg-white flex items-center justify-center transition-all duration-200"
                >
                  <Edit3 className="w-3 h-3 text-blue-500" strokeWidth={2} />
                </div>
              )}
            </div>

            {/* Task content */}
            <div 
              className="flex-1 min-w-0 select-none"
            >
              <h3 className={`
                font-medium text-neutral-800 text-sm leading-tight
                ${task.completed ? 'line-through text-gray-500' : ''}
              `}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`
                  text-xs text-gray-600 mt-1 truncate
                  ${task.completed ? 'line-through' : ''}
                `}>
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Right side - priority badge */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className={`
              px-3 py-1 text-sm font-medium rounded-full border
              ${getPriorityBadge()}
            `}>
              {task.priority === 'work' ? 'Work' : task.priority === 'home' ? 'Home' : task.priority === 'social' ? 'Social' : task.priority}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraggedTaskCard;
