import { useDraggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Trash2, GripVertical } from 'lucide-react';
import { Task } from '../types';
import useSupabaseStore from '../store/useSupabaseStore';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false }) => {
  const { toggleTaskComplete, deleteTask } = useSupabaseStore();
  
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

  // Combine attributes and listeners (prefer sortable for within-column sorting)
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200
        ${isDragging ? 'shadow-xl' : isDragActive ? 'shadow-xl rotate-1 scale-105 z-50' : 'hover:shadow-md'}
        ${task.completed ? 'opacity-75' : ''}
      `}
    >
      {/* Main content area - drag handle */}
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing flex items-center justify-between"
      >
        {/* Left side - checkbox and task info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Drag handle */}
          <GripVertical className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-50 flex-shrink-0" />
          
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
              font-medium text-neutral-800 dark:text-white text-sm leading-tight
              ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}
            `}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`
                text-xs text-gray-600 dark:text-gray-400 mt-1 truncate
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
