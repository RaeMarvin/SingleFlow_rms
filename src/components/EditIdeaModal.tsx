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
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Idea</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </form>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditIdeaModal;