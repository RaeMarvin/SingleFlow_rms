import { useState } from 'react';
import { X, Check, Signal, Volume2, Lightbulb, Trash2, Undo } from 'lucide-react';
import { Task } from '../types';
import useSupabaseStore from '../store/useSupabaseStore';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
  const { updateTask, deleteTask, toggleTaskComplete, addIdea } = useSupabaseStore();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [category, setCategory] = useState(task.category);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category
      });
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await toggleTaskComplete(task.id);
      onClose();
    } catch (error) {
      console.error('Error toggling task completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkIncomplete = async () => {
    setIsLoading(true);
    try {
      // Use the task's original priority to determine category
      // This ensures consistent behavior regardless of current form state
      const targetCategory = getOriginalCategory(task.priority);
      
      console.log('Marking incomplete - Original priority:', task.priority, 'Target category:', targetCategory);
      
      // Update the task to be incomplete and move to the correct category
      await updateTask(task.id, {
        completed: false,
        category: targetCategory
      });
      onClose();
    } catch (error) {
      console.error('Error marking task as incomplete:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOriginalCategory = (taskPriority: string): 'signal' | 'noise' => {
    // High priority tasks go to Signal, Medium and Low go to Noise
    return taskPriority === 'high' ? 'signal' : 'noise';
  };

  const handleMoveToIdea = async () => {
    setIsLoading(true);
    try {
      // Create an idea from the task
      await addIdea({
        title: title.trim(),
        description: description.trim() || undefined
      });
      // Delete the task
      await deleteTask(task.id);
      onClose();
    } catch (error) {
      console.error('Error moving task to idea:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      setIsLoading(true);
      try {
        await deleteTask(task.id);
        onClose();
      } catch (error) {
        console.error('Error deleting task:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-signal-100 text-signal-700 border-signal-200';
      case 'medium': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'low': return 'bg-noise-100 text-noise-700 border-noise-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Enter task name..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"
              rows={3}
              placeholder="Enter task description..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCategory('signal')}
                className={`flex items-center justify-center px-3 py-2 rounded-lg border-2 transition-colors ${
                  category === 'signal'
                    ? 'border-signal-300 bg-signal-50 text-signal-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Signal className="w-4 h-4 mr-2" />
                Signal
              </button>
              <button
                onClick={() => setCategory('noise')}
                className={`flex items-center justify-center px-3 py-2 rounded-lg border-2 transition-colors ${
                  category === 'noise'
                    ? 'border-noise-300 bg-noise-50 text-noise-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Noise
              </button>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['high', 'medium', 'low'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p as 'high' | 'medium' | 'low')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    priority === p
                      ? getPriorityColor(p)
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Current Status */}
          {task.completed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-green-700">
                  <Check className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Task Completed</span>
                </div>
                <div className="text-xs text-green-600">
                  Will restore to: {getOriginalCategory(priority) === 'signal' ? 'Signal' : 'Noise'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 space-y-3">
          {/* Primary Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isLoading || !title.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            {!task.completed ? (
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                title="Mark as Complete"
              >
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleMarkIncomplete}
                disabled={isLoading}
                className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 transition-colors"
                title="Mark as Incomplete"
              >
                <Undo className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleMoveToIdea}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 transition-colors"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Move to Ideas
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
