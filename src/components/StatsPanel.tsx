import { Target, CheckCircle, Circle, ChevronRight, ChevronDown, Lightbulb, Plus, X, Signal, Volume2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import useSupabaseStore from '../store/useSupabaseStore';
import { Task } from '../types';
import CardConfetti from './CardConfetti';
import SparklingStars from './SparklingStars';

interface StatsPanelProps {
  onTaskClick?: (task: Task) => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ onTaskClick }) => {
  const { stats, tasks, ideas, addIdea, deleteIdea, promoteIdea } = useSupabaseStore();
  
  const [showIdeas, setShowIdeas] = useState(false);
  const [showStars, setShowStars] = useState(false);
  // Add showConfetti state for mobile confetti

  // Removed isFlashing, not used

  // Calculate Noise Said No To Today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  
  // Confetti logic removed. No-op for desktop confetti event.
  
  // Filter out promoted ideas
  const availableIdeas = ideas.filter(idea => !idea.promoted);
  
  // Calculate Signal tasks scheduled today (completed + not completed) and completed Signal tasks today
  const startOfToday = today;
  const endOfToday = new Date(startOfToday);
  endOfToday.setHours(23, 59, 59, 999);

  // Signal tasks completed today
  const signalCompletedToday = tasks.filter(task => {
    if (task.category !== 'signal' || !task.completed) return false;
    const completedDate = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);
    return (
      completedDate.getFullYear() === startOfToday.getFullYear() &&
      completedDate.getMonth() === startOfToday.getMonth() &&
      completedDate.getDate() === startOfToday.getDate()
    );
  }).length;

  // Outstanding Signal tasks (not date-restricted): all Signal tasks that are not completed
  const signalOutstanding = tasks.filter(task => task.category === 'signal' && !task.completed).length;

  // Target = completed today + outstanding (not date-restricted)
  const signalScheduledToday = signalCompletedToday + signalOutstanding;

  const progressPercentage = signalScheduledToday > 0
    ? Math.min((signalCompletedToday / signalScheduledToday) * 100, 100)
    : 0;

  // Use completedSignalRatio for today's completed tasks ratio (for the Fozzle score ring)
  const signalRatioPercentage = (stats.completedSignalRatio || 0) * 100;

  useEffect(() => {
    if (signalRatioPercentage >= 50) {
      setShowStars(true);
    } else {
      setShowStars(false);
    }
  }, [signalRatioPercentage]);
  
  // Trigger confetti when signal ratio reaches 80% or above
  const shouldShowConfetti = signalRatioPercentage >= 80;

  const signalCompletedTodayTasks = tasks.filter(task => {
    if (task.category !== 'signal' || !task.completed) return false;
    const completedDate = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);
    return (
      completedDate.getFullYear() === today.getFullYear() &&
      completedDate.getMonth() === today.getMonth() &&
      completedDate.getDate() === today.getDate()
    );
  });

  const noiseCompletedTodayTasks = tasks.filter(task => {
    if (task.category !== 'noise' || !task.completed) return false;
    const completedDate = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);
    return (
      completedDate.getFullYear() === today.getFullYear() &&
      completedDate.getMonth() === today.getMonth() &&
      completedDate.getDate() === today.getDate()
    );
  });

  const noiseRejectedTodayTasks = tasks.filter(task => {
    if (task.category !== 'noise' || !task.rejected) return false;
    if (!task.rejectedAt) return false;
    const rejectedDate = new Date(task.rejectedAt);
    return rejectedDate.getFullYear() === today.getFullYear() &&
      rejectedDate.getMonth() === today.getMonth() &&
      rejectedDate.getDate() === today.getDate();
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Confetti for both mobile and desktop when score >= 80% */}
        <CardConfetti trigger={shouldShowConfetti} duration={2000} />
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-transparent transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Daily Progress
            </h2>
          </div>

          {/* Fozzle Score Ring - Signal Percentage */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              {/* show silver stars for 50-79.9% and gold for >=80% */}
              <SparklingStars show={showStars} variant={signalRatioPercentage >= 80 ? 'gold' : 'silver'} />
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke={signalRatioPercentage >= 80 ? '#7dc3ff' : 'currentColor'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${signalRatioPercentage * 3.14} 314`}
                  className={`transition-all duration-500 ${
                    signalRatioPercentage >= 80 ? '' :
                    signalRatioPercentage >= 60 ? 'text-primary-500' : 'text-noise-500'
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-neutral-800">
                    {signalRatioPercentage.toFixed(0)}%
                  </div>
                  <div className="text-sm text-neutral-500">
                    Fozzle Score
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-3">
            <DailyStatDropdown
              icon={<CheckCircle className="w-5 h-5 text-signal-600" />}
              label="Signal Completed Today"
              tasks={signalCompletedTodayTasks}
              color="text-signal-600"
              onTaskClick={onTaskClick}
            />
            <DailyStatDropdown
              icon={<Circle className="w-5 h-5 text-noise-600" />}
              label="Noise Completed Today"
              tasks={noiseCompletedTodayTasks}
              color="text-noise-600"
              onTaskClick={onTaskClick}
            />
            <DailyStatDropdown
              icon={<X className="w-5 h-5 text-[#7dc3ff]" />}
              label="Noise Said No To Today"
              tasks={noiseRejectedTodayTasks}
              color="text-[#7dc3ff]"
              onTaskClick={onTaskClick}
            />
            <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Signal Tasks Completed Today
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {signalCompletedToday} / {signalScheduledToday}
                  </span>
                </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    progressPercentage >= 100 ? 'bg-signal-500' :
                    progressPercentage >= 80 ? 'bg-primary-500' : 'bg-noise-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Goal: {signalScheduledToday}</span>
                <span className={
                  progressPercentage >= 100 ? 'text-signal-600' :
                  progressPercentage >= 80 ? 'text-primary-600' : 'text-noise-600'
                }>
                  {signalScheduledToday === 0
                    ? 'No Signal tasks scheduled'
                    : progressPercentage >= 100 ? 'Goal Achieved!' :
                      progressPercentage >= 80 ? 'Almost There' : 'Keep Going!'
                  }
                </span>
              </div>
            </div>
          </div>
          {/* end of Stats Cards */}
        </div>
      </div>

      {/* Completed Tasks Dropdown */}
      {/* <CompletedTasksDropdown 
        tasks={tasks}
        isOpen={showCompletedTasks}
        onToggle={() => setShowCompletedTasks(!showCompletedTasks)}
        onTaskClick={onTaskClick}
      /> */}

      {/* Rejected Tasks Dropdown (NO List) */}
      {/* <RejectedTasksDropdown 
        tasks={tasks}
        isOpen={showRejectedTasks}
        onToggle={() => setShowRejectedTasks(!showRejectedTasks)}
        onTaskClick={onTaskClick}
        onMoveTask={moveTask}
      /> */}

      {/* Ideas Dropdown */}
      <IdeasDropdown 
        ideas={availableIdeas}
        isOpen={showIdeas}
        onToggle={() => setShowIdeas(!showIdeas)}
        onAddIdea={addIdea}
        onDeleteIdea={deleteIdea}
        onPromoteIdea={promoteIdea}
      />
    </div>
  );
};

interface DailyStatDropdownProps {
  icon: React.ReactNode;
  label: string;
  tasks: Task[];
  color: string;
  onTaskClick?: (task: Task) => void;
}

const DailyStatDropdown: React.FC<DailyStatDropdownProps> = ({ icon, label, tasks, color, onTaskClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-50 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-3">
          {icon}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`text-lg font-bold ${color}`}>{tasks.length}</span>
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-3 pb-3 space-y-2 max-h-48 overflow-y-auto">
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500 py-2 text-center">No tasks today.</p>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className={`flex items-start space-x-3 p-2 bg-white rounded-lg transition-colors ${
                  onTaskClick ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => onTaskClick?.(task)}
              >
                <div className="mt-0.5 flex-shrink-0">{icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm line-through">{task.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      task.category === 'signal'
                        ? 'text-signal-600 bg-signal-50 border border-signal-200'
                        : 'text-noise-600 bg-noise-50 border border-noise-200'
                    }`}>
                      {task.category}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};





interface IdeasDropdownProps {
  ideas: any[];
  isOpen: boolean;
  onToggle: () => void;
  onAddIdea: (idea: { title: string; description?: string }) => void;
  onDeleteIdea: (id: string) => void;
  onPromoteIdea: (id: string, category: 'signal' | 'noise') => void;
}

const IdeasDropdown: React.FC<IdeasDropdownProps> = ({ ideas, isOpen, onToggle, onAddIdea, onDeleteIdea, onPromoteIdea }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', description: '' });

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIdea.title.trim()) {
      onAddIdea({
        title: newIdea.title.trim(),
        description: newIdea.description.trim() || undefined
      });
      setNewIdea({ title: '', description: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteIdea = (id: string) => {
    onDeleteIdea(id);
  };

  const handlePromoteIdea = (id: string, category: 'signal' | 'noise') => {
    onPromoteIdea(id, category);
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-xl"
      >
        <div className="flex items-center space-x-3">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <span className="font-medium text-gray-900 dark:text-white">
            Ideas ({ideas.length})
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {isOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAddForm(!showAddForm);
              }}
              className="p-1 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded transition-colors duration-200"
              title="Add Idea"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4">
          {/* Add Idea Form */}
          {showAddForm && (
            <form onSubmit={handleAddIdea} className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
              <input
                type="text"
                placeholder="Enter your idea..."
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                className="w-full p-2 border border-yellow-200 dark:border-yellow-800 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-2"
                autoFocus
              />
              <textarea
                placeholder="Description (optional)..."
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                className="w-full p-2 border border-yellow-200 dark:border-yellow-800 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-2 resize-none"
                rows={2}
              />
              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors duration-200"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Ideas List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {ideas.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                No ideas captured yet.
              </p>
            ) : (
              ideas.map(idea => (
                <div key={idea.id} className="group flex items-start space-x-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors duration-200">
                  <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-white">
                      {idea.title}
                    </p>
                    {idea.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {idea.description}
                      </p>
                    )}
                    {idea.createdAt && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                        {new Date(idea.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handlePromoteIdea(idea.id, 'signal')}
                      className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
                      title="Promote to Signal task"
                    >
                      <Signal className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePromoteIdea(idea.id, 'noise')}
                      className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                      title="Promote to Noise task"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteIdea(idea.id)}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
                      title="Delete idea"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
