import React, { useState, useEffect } from 'react';
import { Idea } from '../types';

interface EditIdeaModalProps {
  idea: Idea;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Idea>) => void;
}

const EditIdeaModal: React.FC<EditIdeaModalProps> = ({ idea, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState(idea.title);
  const [description, setDescription] = useState(idea.description);

  useEffect(() => {
    setTitle(idea.title);
    setDescription(idea.description);
  }, [idea]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave({ title, description });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-yellow-50 dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Idea</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-yellow-200 dark:border-yellow-800 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent mt-1"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              id="description"
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-2 border border-yellow-200 dark:border-yellow-800 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent mt-1 resize-none"
            />
          </div>
        </form>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors duration-200"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditIdeaModal;