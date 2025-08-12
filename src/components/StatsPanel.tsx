import { Target, CheckCircle, Circle, ChevronRight, ChevronDown, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import useSupabaseStore from '../store/useSupabaseStore';
import { Task } from '../types';

const StatsPanel: React.FC = () => {
  const { stats, dailyGoal, tasks, ideas } = useSupabaseStore();
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  
  const progressPercentage = Math.min((stats.totalCompleted / dailyGoal.totalTasks) * 100, 100);
  // Use completedSignalRatio for today's completed tasks ratio
  const signalRatioPercentage = (stats.completedSignalRatio || 0) * 100;

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Daily Progress
          </h2>
        </div>

        {/* Progress Ring */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${progressPercentage * 3.14} 314`}
                className="text-primary-500 transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-800 dark:text-white">
                  {stats.totalCompleted}
                </div>
                <div className="text-sm text-neutral-500 dark:text-gray-400">
                  completed today
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="space-y-3">
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-signal-600" />}
            label="Signal Completed Today"
            value={stats.signalCompleted}
            color="text-signal-600"
          />
          
          <StatCard
            icon={<Circle className="w-5 h-5 text-noise-600" />}
            label="Noise Completed Today"
            value={stats.noiseCompleted}
            color="text-noise-600"
          />

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Today's Signal Ratio
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {signalRatioPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  signalRatioPercentage >= 80 ? 'bg-signal-500' :
                  signalRatioPercentage >= 60 ? 'bg-primary-500' : 'bg-noise-500'
                }`}
                style={{ width: `${signalRatioPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Target: 80%</span>
              <span className={
                signalRatioPercentage >= 80 ? 'text-signal-600' :
                signalRatioPercentage >= 60 ? 'text-primary-600' : 'text-noise-600'
              }>
                {signalRatioPercentage >= 80 ? 'Great!' :
                 signalRatioPercentage >= 60 ? 'Good' : 'Focus on Signal'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Tasks Dropdown */}
      <CompletedTasksDropdown 
        tasks={tasks}
        isOpen={showCompletedTasks}
        onToggle={() => setShowCompletedTasks(!showCompletedTasks)}
      />

      {/* Ideas Dropdown */}
      <IdeasDropdown 
        ideas={ideas}
        isOpen={showIdeas}
        onToggle={() => setShowIdeas(!showIdeas)}
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <div className="flex items-center space-x-3">
      {icon}
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
    </div>
    <span className={`text-lg font-bold ${color}`}>
      {value}
    </span>
  </div>
);

interface CompletedTasksDropdownProps {
  tasks: Task[];
  isOpen: boolean;
  onToggle: () => void;
}

const CompletedTasksDropdown: React.FC<CompletedTasksDropdownProps> = ({ tasks, isOpen, onToggle }) => {
  // Filter for completed tasks this week
  const getMonday = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d;
  };

  const getSunday = (monday: Date) => {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  };

  const today = new Date();
  const weekStart = getMonday(new Date(today));
  const weekEnd = getSunday(new Date(weekStart));

  const completedThisWeek = tasks.filter(task => {
    if (!task.completed) return false;
    const completedDate = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);
    return completedDate >= weekStart && completedDate <= weekEnd;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-xl"
      >
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-signal-600" />
          <span className="font-medium text-gray-900 dark:text-white">
            Completed Tasks ({completedThisWeek.length})
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-2 max-h-60 overflow-y-auto">
          {completedThisWeek.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
              No tasks completed this week yet.
            </p>
          ) : (
            completedThisWeek.map(task => (
              <div key={task.id} className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <CheckCircle className="w-4 h-4 text-signal-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 dark:text-white text-sm line-through">
                    {task.title}
                  </h4>
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
}

const IdeasDropdown: React.FC<IdeasDropdownProps> = ({ ideas, isOpen, onToggle }) => {
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
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-2 max-h-60 overflow-y-auto">
          {ideas.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
              No ideas captured yet.
            </p>
          ) : (
            ideas.map(idea => (
              <div key={idea.id} className="flex items-start space-x-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-white">
                    {idea.content}
                  </p>
                  {idea.createdAt && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(idea.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
