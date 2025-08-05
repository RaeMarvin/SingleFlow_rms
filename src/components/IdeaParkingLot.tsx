import { Lightbulb, Plus, ArrowRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import useSupabaseStore from '../store/useSupabaseStore';

const IdeaParkingLot: React.FC = () => {
  const { ideas, addIdea, deleteIdea, promoteIdea } = useSupabaseStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', description: '' });

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIdea.title.trim()) {
      addIdea(newIdea);
      setNewIdea({ title: '', description: '' });
      setShowAddForm(false);
    }
  };

  const handlePromoteIdea = (id: string) => {
    promoteIdea(id);
    // Don't delete the idea immediately, let user see it was promoted
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Idea Parking Lot
          </h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          title="Add Idea"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Capture ideas here to avoid distraction from your current focus
      </p>

      {/* Add Idea Form */}
      {showAddForm && (
        <form onSubmit={handleAddIdea} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <input
            type="text"
            value={newIdea.title}
            onChange={(e) => setNewIdea(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Quick idea title..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
            autoFocus
          />
          <textarea
            value={newIdea.description}
            onChange={(e) => setNewIdea(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional details..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3"
            rows={2}
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewIdea({ title: '', description: '' });
              }}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors duration-200"
            >
              Save Idea
            </button>
          </div>
        </form>
      )}

      {/* Ideas List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {ideas.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              No ideas yet. Click the + button to add one.
            </p>
          </div>
        ) : (
          ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onPromote={() => handlePromoteIdea(idea.id)}
              onDelete={() => deleteIdea(idea.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface IdeaCardProps {
  idea: any;
  onPromote: () => void;
  onDelete: () => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onPromote, onDelete }) => (
  <div className={`
    group p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-all duration-200
    ${idea.promoted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700/50'}
  `}>
    <div className="flex items-start justify-between mb-2">
      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
        {idea.title}
      </h4>
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {!idea.promoted && (
          <button
            onClick={onPromote}
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            title="Promote to Task"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          title="Delete Idea"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
    
    {idea.description && (
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        {idea.description}
      </p>
    )}
    
    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
      <span>
        {new Date(idea.createdAt).toLocaleDateString()}
      </span>
      {idea.promoted && (
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
          Promoted
        </span>
      )}
    </div>
  </div>
);

export default IdeaParkingLot;
