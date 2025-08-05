import { X, TrendingUp, Target, Award, RefreshCw } from 'lucide-react';
import useSupabaseStore from '../store/useSupabaseStore';

interface DailyReviewModalProps {
  onClose: () => void;
}

const DailyReviewModal: React.FC<DailyReviewModalProps> = ({ onClose }) => {
  const { stats, tasks, resetDailyProgress } = useSupabaseStore();
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed);
  const signalTasks = tasks.filter(t => t.category === 'signal');
  const completedSignalTasks = completedTasks.filter(t => t.category === 'signal');
  
  const signalRatioPercentage = stats.signalRatio * 100;
  const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const handleResetDay = () => {
    if (window.confirm('Are you sure you want to reset your daily progress? This will clear all tasks and start fresh.')) {
      resetDailyProgress();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Daily Review
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatBox
              icon={<Target className="w-6 h-6 text-blue-600" />}
              title="Total Tasks"
              value={totalTasks}
              subtitle={`${completedTasks.length} completed`}
            />
            <StatBox
              icon={<TrendingUp className="w-6 h-6 text-green-600" />}
              title="Signal Focus"
              value={`${signalRatioPercentage.toFixed(0)}%`}
              subtitle={getScoreLabel(signalRatioPercentage)}
              valueColor={getScoreColor(signalRatioPercentage)}
            />
            <StatBox
              icon={<Award className="w-6 h-6 text-purple-600" />}
              title="Completion Rate"
              value={`${completionRate.toFixed(0)}%`}
              subtitle={getScoreLabel(completionRate)}
              valueColor={getScoreColor(completionRate)}
            />
          </div>

          {/* Signal vs Noise Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Signal vs. Noise Breakdown
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200 dark:text-gray-600"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(completedSignalTasks.length / Math.max(signalTasks.length, 1)) * 251} 251`}
                      className="text-signal-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {signalTasks.length > 0 ? Math.round((completedSignalTasks.length / signalTasks.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <h4 className="font-semibold text-signal-600 mb-1">Signal Tasks</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {completedSignalTasks.length} of {signalTasks.length} completed
                </p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200 dark:text-gray-600"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(stats.noiseCompleted / Math.max(totalTasks - signalTasks.length, 1)) * 251} 251`}
                      className="text-noise-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {(totalTasks - signalTasks.length) > 0 ? Math.round((stats.noiseCompleted / (totalTasks - signalTasks.length)) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <h4 className="font-semibold text-noise-600 mb-1">Noise Tasks</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.noiseCompleted} of {totalTasks - signalTasks.length} completed
                </p>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Daily Insights
            </h3>
            <div className="space-y-2 text-sm">
              {signalRatioPercentage >= 80 && (
                <p className="text-green-700 dark:text-green-300">
                  🎉 Excellent focus! You maintained the 80/20 rule with {signalRatioPercentage.toFixed(0)}% signal tasks.
                </p>
              )}
              {signalRatioPercentage < 80 && signalRatioPercentage >= 60 && (
                <p className="text-yellow-700 dark:text-yellow-300">
                  ⚡ Good focus with {signalRatioPercentage.toFixed(0)}% signal tasks. Try to get closer to 80% tomorrow.
                </p>
              )}
              {signalRatioPercentage < 60 && (
                <p className="text-red-700 dark:text-red-300">
                  🎯 Focus improvement needed. Only {signalRatioPercentage.toFixed(0)}% of your tasks were signal. Try to prioritize more important work.
                </p>
              )}
              {completionRate >= 80 && (
                <p className="text-green-700 dark:text-green-300">
                  ✅ Great productivity! You completed {completionRate.toFixed(0)}% of your tasks.
                </p>
              )}
              {completedTasks.length === 0 && (
                <p className="text-gray-600 dark:text-gray-400">
                  📝 No tasks completed today. Tomorrow is a fresh start!
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleResetDay}
              className="inline-flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Start Fresh Day
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Continue Working
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatBoxProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  valueColor?: string;
}

const StatBox: React.FC<StatBoxProps> = ({ icon, title, value, subtitle, valueColor = 'text-gray-900 dark:text-white' }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center space-x-3 mb-2">
      {icon}
      <h3 className="font-medium text-gray-700 dark:text-gray-300">
        {title}
      </h3>
    </div>
    <div className={`text-2xl font-bold ${valueColor} mb-1`}>
      {value}
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      {subtitle}
    </p>
  </div>
);

export default DailyReviewModal;
