import { X } from 'lucide-react';
import { useState } from 'react';
import useSupabaseStore from '../store/useSupabaseStore';

interface AddTaskModalProps {
  onClose: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ onClose }) => {
  const { addTask } = useSupabaseStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'work' as 'work' | 'home' | 'social',
  });

  const handleAddTask = (category: 'signal' | 'noise') => {
    if (formData.title.trim()) {
      addTask({
        ...formData,
        category,
        completed: false,
      });
      onClose();
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Task
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter task title"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          <div>
            <div className="grid grid-cols-3 gap-2 rounded-lg">
              <button
                type="button"
                onClick={() => handleChange('priority', 'work')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${formData.priority === 'work' ? 'bg-primary-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                Work
              </button>
              <button
                type="button"
                onClick={() => handleChange('priority', 'home')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${formData.priority === 'home' ? 'bg-signal-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                Home
              </button>
              <button
                type="button"
                onClick={() => handleChange('priority', 'social')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${formData.priority === 'social' ? 'bg-noise-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                Social
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleAddTask('signal')}
              className="px-6 py-2 bg-signal-600 hover:bg-signal-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Add Signal
            </button>
            <button
              type="button"
              onClick={() => handleAddTask('noise')}
              className="px-6 py-2 bg-noise-600 hover:bg-noise-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Add Noise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
