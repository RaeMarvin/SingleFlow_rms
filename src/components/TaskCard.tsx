import { useDraggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { Task } from '../types';
import useSupabaseStore from '../store/useSupabaseStore';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onTaskClick?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false, onTaskClick }) => {
  const { toggleTaskComplete, deleteTask } = useSupabaseStore();
  const [isDragStarted, setIsDragStarted] = useState(false);
  const dragStartTimeRef = useRef<number>(0);

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
        return 'border-signal-500';
      case 'medium':
        return 'border-purple-500';
      case 'low':
        return 'border-noise-500';
      default:
        return 'border-gray-300';
    }
  };

  // Handle task click (for opening modal)
  const handleTaskClick = (e: React.MouseEvent) => {
    // Only handle click if:
    // 1. We have a click handler
    // 2. We're not currently dragging
    // 3. The click was quick (not a long press/drag)
    const clickDuration = Date.now() - dragStartTimeRef.current;
    
    if (onTaskClick && !isDragStarted && !isDragActive && clickDuration < 200) {
      e.stopPropagation();
      onTaskClick(task);
    }
  };

  // Handle mouse down (start of potential drag or click)
  const handleMouseDown = () => {
    dragStartTimeRef.current = Date.now();
    setIsDragStarted(false);
    
    // Set drag started flag after a delay
    setTimeout(() => {
      const duration = Date.now() - dragStartTimeRef.current;
      if (duration >= 150) { // If mouse has been down for 150ms, consider it a drag
        setIsDragStarted(true);
      }
    }, 150);
  };

  // Handle mouse up (end of drag or click)
  const handleMouseUp = () => {
    setTimeout(() => {
      setIsDragStarted(false);
    }, 50);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`
        group relative rounded-xl p-4 border border-gray-200 shadow-sm transition-all duration-200
        ${task.category === 'noise' ? 'bg-gray-50' : 'bg-white'}
        ${isDragging ? 'shadow-xl' : isDragActive ? 'shadow-xl rotate-1 scale-105 z-50' : 'hover:shadow-md'}
        ${task.completed ? 'opacity-75' : ''}
        cursor-grab active:cursor-grabbing
      `}
      {...listeners}
      {...attributes}
    >
      {/* Main content area */}
      <div className="flex items-center justify-between" onClick={handleTaskClick}>
        {/* Left side - checkbox and task info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Circular checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskComplete(task.id);
            }}
            className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0
              ${getCheckboxColor()}
              ${task.completed ? '' : 'hover:scale-110'}
            `}
          >
            {task.completed && (
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            )}
            {!task.completed && task.priority === 'high' && (
              <div className="w-2 h-2 bg-signal-500 rounded-full"></div>
            )}
          </button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
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
