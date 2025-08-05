import { useDraggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Clock, Flag, Trash2, GripVertical } from 'lucide-react';
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

  const priorityColors = {
    high: 'border-red-400 bg-red-50 dark:bg-red-900/20',
    medium: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    low: 'border-green-400 bg-green-50 dark:bg-green-900/20',
  };

  const categoryColors = {
    signal: 'bg-signal-500',
    noise: 'bg-noise-500',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative bg-white dark:bg-gray-800 rounded-lg border-2 p-4 transition-all duration-200
        ${isDragActive || isDragging ? 'shadow-xl rotate-2 scale-105 z-50' : 'shadow-sm hover:shadow-md'}
        ${task.completed ? 'opacity-75 bg-gray-50 dark:bg-gray-700' : ''}
        ${priorityColors[task.priority]}
      `}
    >
      {/* Drag handle area - everything except action buttons */}
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
      >
        {/* Category indicator */}
        <div className={`absolute top-0 left-0 w-full h-1 rounded-t-lg ${categoryColors[task.category]}`} />
        
        {/* Priority indicator */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <GripVertical className="w-3 h-3 text-gray-400 opacity-50" />
            <Flag className={`w-4 h-4 ${
              task.priority === 'high' ? 'text-red-500' :
              task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
            }`} />
            <span className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
              {task.category}
            </span>
          </div>
        </div>

        {/* Task content */}
        <div className="mb-3">
          <h3 className={`font-medium text-gray-900 dark:text-white mb-1 ${
            task.completed ? 'line-through' : ''
          }`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          <span>
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Action buttons - outside drag area */}
      <div className="absolute top-2 right-2 flex items-center space-x-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200 p-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('Complete button clicked for task:', task.id);
            toggleTaskComplete(task.id);
          }}
          className={`p-1.5 rounded-full transition-colors duration-200 ${
            task.completed
              ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
              : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600 dark:bg-gray-700 dark:text-gray-500 dark:hover:bg-green-900 dark:hover:text-green-400'
          }`}
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
