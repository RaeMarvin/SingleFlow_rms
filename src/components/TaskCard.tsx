import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Trash2, X, Edit3 } from 'lucide-react';
import { Task } from '../types';
import useSupabaseStore from '../store/useSupabaseStore';
import { useSignalFlash } from '../hooks/useSignalFlash';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onTaskClick?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false, onTaskClick }) => {
  const { deleteTask, toggleTaskComplete, rejectTask } = useSupabaseStore();
  const { isFlashing, triggerSignalFlash } = useSignalFlash();

  // Use sortable for within-column reordering
  const {
    attributes: sortableAttributes,
    listeners: sortableListeners,
    setNodeRef: setSortableNodeRef,
    transform: sortableTransform,
    transition,
  } = useSortable({
    id: task.id,
  });

  // Use draggable for cross-column movement (fallback)
  const {
    attributes: draggableAttributes,
    listeners: draggableListeners,
    setNodeRef: setDraggableNodeRef,
    transform: draggableTransform,
    isDragging: isDragActive,
  } = useDraggable({
    id: task.id,
  });

  // Combine refs
  const setNodeRef = (node: HTMLElement | null) => {
    setSortableNodeRef(node);
    setDraggableNodeRef(node);
  };

  // Combine attributes and listeners
  const attributes = { ...draggableAttributes, ...sortableAttributes };
  const listeners = { ...draggableListeners, ...sortableListeners };
  
  // Use sortable transform if available, otherwise use draggable
  const transform = sortableTransform || draggableTransform;
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-signal-100 text-signal-700 border-signal-200';
      case 'medium':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'low':
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
      case 'high':
        return 'border-signal-400 bg-white hover:border-signal-500';
      case 'medium':
        return 'border-purple-400 bg-white hover:border-purple-500';
      case 'low':
        return 'border-noise-400 bg-white hover:border-noise-500';
      default:
        return 'border-gray-300 bg-white hover:border-gray-400';
    }
  };

  // Handle double click/tap to open task detail modal
  const [lastTap, setLastTap] = useState<number>(0);
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  // Handle mobile double-tap
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // 300ms window for double tap
    
    if (lastTap && (now - lastTap) < DOUBLE_TAP_DELAY) {
      if (onTaskClick) {
        onTaskClick(task);
      }
      setLastTap(0); // Reset to prevent triple tap
    } else {
      setLastTap(now);
    }
  };

  // Handle checkbox click
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If this is a Signal task being completed (not uncompleted), trigger flash
    if (!task.completed && task.category === 'signal') {
      triggerSignalFlash();
      // Delay the actual completion to allow the flash to be visible
      setTimeout(() => {
        toggleTaskComplete(task.id);
      }, 100);
    } else {
      // For all other cases (uncompleting tasks, completing Noise tasks), complete immediately
      toggleTaskComplete(task.id);
    }
  };

  // Handle reject click - only for Noise tasks
  const handleRejectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    rejectTask(task.id);
  };

  // Handle edit click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderColor: isFlashing ? '#7dc3ff' : undefined,
        boxShadow: isFlashing ? '0 0 20px rgba(125, 195, 255, 0.4)' : undefined,
      }}
      className={`
        group relative rounded-xl p-4 border transition-all duration-200
        ${task.category === 'noise' ? 'bg-gray-50' : 'bg-white'}
        ${isDragging ? 'shadow-xl' : isDragActive ? 'shadow-xl rotate-1 scale-105 z-50' : 'hover:shadow-md'}
        ${task.completed ? 'opacity-75' : ''}
        ${isFlashing ? 'border-2 shadow-lg' : 'border border-gray-200 shadow-sm'}
      `}
    >
      {/* Dedicated drag handle - larger area for easier grabbing */}
      <div 
        className="absolute top-0 left-0 right-0 h-8 cursor-grab active:cursor-grabbing flex items-center justify-center"
        {...listeners}
        {...attributes}
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
                  w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer
                  ${getCheckboxColor()}
                  ${task.completed ? '' : 'hover:scale-110'}
                `}
                onClick={handleCheckboxClick}
                title={task.completed ? "Mark as incomplete" : "Mark as complete"}
              >
                {task.completed && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
                {!task.completed && task.priority === 'high' && (
                  <div className="w-2 h-2 bg-signal-500 rounded-full"></div>
                )}
              </div>

              {/* Edit icon - for Signal tasks, show to the right of checkbox */}
              {task.category === 'signal' && !task.completed && (
                <div
                  className="w-5 h-5 rounded-full border-2 border-blue-300 bg-white hover:bg-blue-50 hover:border-blue-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110"
                  onClick={handleEditClick}
                  title="Edit task"
                >
                  <Edit3 className="w-3 h-3 text-blue-500" strokeWidth={2} />
                </div>
              )}

              {/* Reject button - only show for Noise tasks that aren't completed */}
              {task.category === 'noise' && !task.completed && (
                <div
                  className="w-5 h-5 rounded-full border-2 border-red-300 bg-white hover:bg-red-50 hover:border-red-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110"
                  onClick={handleRejectClick}
                  title="Say NO to this task"
                >
                  <X className="w-3 h-3 text-red-500" strokeWidth={3} />
                </div>
              )}

              {/* Edit icon - for Noise tasks, show to the right of reject button */}
              {task.category === 'noise' && !task.completed && (
                <div
                  className="w-5 h-5 rounded-full border-2 border-blue-300 bg-white hover:bg-blue-50 hover:border-blue-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110"
                  onClick={handleEditClick}
                  title="Edit task"
                >
                  <Edit3 className="w-3 h-3 text-blue-500" strokeWidth={2} />
                </div>
              )}
            </div>

            {/* Task content - double-click/tap area */}
            <div 
              className="flex-1 min-w-0 cursor-pointer select-none"
              onDoubleClick={handleDoubleClick}
              onTouchEnd={handleTouchEnd}
              title="Double-click/tap to edit task"
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
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Delete button - appears on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteTask(task.id);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200 p-1 rounded"
        title="Delete task"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TaskCard;
