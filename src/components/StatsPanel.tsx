import { Target, TrendingUp, CheckCircle, Circle } from 'lucide-react';
import useSupabaseStore from '../store/useSupabaseStore';

const StatsPanel: React.FC = () => {
  const { stats, tasks, dailyGoal } = useSupabaseStore();
  
  const signalTasks = tasks.filter(t => t.category === 'signal').length;
  const noiseTasks = tasks.filter(t => t.category === 'noise').length;
  
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
                className="text-blue-600 transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalCompleted}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  completed today
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="space-y-3">
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            label="Signal Completed Today"
            value={stats.signalCompleted}
            color="text-green-600"
          />
          
          <StatCard
            icon={<Circle className="w-5 h-5 text-orange-600" />}
            label="Noise Completed Today"
            value={stats.noiseCompleted}
            color="text-orange-600"
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
                  signalRatioPercentage >= 80 ? 'bg-green-500' :
                  signalRatioPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${signalRatioPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Target: 80%</span>
              <span className={
                signalRatioPercentage >= 80 ? 'text-green-600' :
                signalRatioPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
              }>
                {signalRatioPercentage >= 80 ? 'Great!' :
                 signalRatioPercentage >= 60 ? 'Good' : 'Focus on Signal'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Tasks Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current Tasks
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-signal-50 dark:bg-signal-900/20 rounded-lg">
            <div className="text-2xl font-bold text-signal-600">
              {signalTasks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Signal
            </div>
          </div>
          
          <div className="text-center p-3 bg-noise-50 dark:bg-noise-900/20 rounded-lg">
            <div className="text-2xl font-bold text-noise-600">
              {noiseTasks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Noise
            </div>
          </div>
        </div>
      </div>
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

export default StatsPanel;
