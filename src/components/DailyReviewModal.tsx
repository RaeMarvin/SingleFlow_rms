import { X, TrendingUp, Target, Award } from 'lucide-react';
import useSupabaseStore from '../store/useSupabaseStore';

interface DailyReviewModalProps {
  onClose: () => void;
}

const DailyReviewModal: React.FC<DailyReviewModalProps> = ({ onClose }) => {
  const { tasks } = useSupabaseStore();
  
  // Get Monday of current week
  const getMonday = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust for Sunday
    return new Date(date.setDate(diff));
  };

  // Get Sunday of current week
  const getSunday = (monday: Date) => {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return sunday;
  };

  const today = new Date();
  const weekStart = getMonday(new Date(today));
  const weekEnd = getSunday(new Date(weekStart));

  // Format week range
  const formatWeekRange = () => {
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Filter tasks for current week
  const weekTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    return taskDate >= weekStart && taskDate <= weekEnd;
  });

  const completedWeekTasks = weekTasks.filter(t => t.completed);
  const weekSignalTasks = weekTasks.filter(t => t.category === 'signal');
  const completedWeekSignalTasks = completedWeekTasks.filter(t => t.category === 'signal');
  
  const signalRatioPercentage = weekTasks.length > 0 ? (weekSignalTasks.length / weekTasks.length) * 100 : 0;
  const completionRate = weekTasks.length > 0 ? (completedWeekTasks.length / weekTasks.length) * 100 : 0;

  // Daily breakdown for the week
  const getDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' });
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate.toDateString() === day.toDateString();
    });
    const dayCompleted = dayTasks.filter(t => t.completed);
    
    weekDays.push({
      date: day,
      name: getDayName(day),
      isToday: day.toDateString() === today.toDateString(),
      tasks: dayTasks.length,
      completed: dayCompleted.length,
      completionRate: dayTasks.length > 0 ? (dayCompleted.length / dayTasks.length) * 100 : 0
    });
  }
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-signal-600';
    if (percentage >= 60) return 'text-primary-600';
    return 'text-noise-600';
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">
              Weekly Review
            </h2>
            <p className="text-sm text-neutral-600 dark:text-gray-400">
              {formatWeekRange()} • Week {Math.ceil((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}
            </p>
          </div>
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
              icon={<Target className="w-6 h-6 text-primary-600" />}
              title="Week Tasks"
              value={weekTasks.length}
              subtitle={`${completedWeekTasks.length} completed`}
            />
            <StatBox
              icon={<TrendingUp className="w-6 h-6 text-signal-600" />}
              title="Signal Focus"
              value={`${signalRatioPercentage.toFixed(0)}%`}
              subtitle={getScoreLabel(signalRatioPercentage)}
              valueColor={getScoreColor(signalRatioPercentage)}
            />
            <StatBox
              icon={<Award className="w-6 h-6 text-accent-purple" />}
              title="Completion Rate"
              value={`${completionRate.toFixed(0)}%`}
              subtitle={getScoreLabel(completionRate)}
              valueColor={getScoreColor(completionRate)}
            />
          </div>

          {/* Daily Progress Chart */}
          <div className="bg-neutral-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4">
              Daily Progress This Week
            </h3>
            
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map((day, index) => (
                <div 
                  key={index} 
                  className={`text-center p-3 rounded-lg border-2 transition-all ${
                    day.isToday 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="text-xs font-medium text-neutral-600 dark:text-gray-400 mb-1">
                    {day.name}
                  </div>
                  <div className="text-sm font-bold text-neutral-800 dark:text-white">
                    {day.completed}/{day.tasks}
                  </div>
                  <div className={`text-xs mt-1 ${
                    day.completionRate >= 80 ? 'text-signal-600' :
                    day.completionRate >= 60 ? 'text-primary-600' : 'text-noise-600'
                  }`}>
                    {day.tasks > 0 ? `${day.completionRate.toFixed(0)}%` : '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signal vs Noise Breakdown */}
          <div className="bg-neutral-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4">
              Signal vs. Noise Breakdown (This Week)
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
                      strokeDasharray={`${(completedWeekSignalTasks.length / Math.max(weekSignalTasks.length, 1)) * 251} 251`}
                      className="text-signal-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-neutral-800 dark:text-white">
                      {weekSignalTasks.length > 0 ? Math.round((completedWeekSignalTasks.length / weekSignalTasks.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <h4 className="font-semibold text-signal-600 mb-1">Signal Tasks</h4>
                <p className="text-sm text-neutral-600 dark:text-gray-400">
                  {completedWeekSignalTasks.length} of {weekSignalTasks.length} completed
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
                      strokeDasharray={`${((completedWeekTasks.length - completedWeekSignalTasks.length) / Math.max(weekTasks.length - weekSignalTasks.length, 1)) * 251} 251`}
                      className="text-noise-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-neutral-800 dark:text-white">
                      {(weekTasks.length - weekSignalTasks.length) > 0 ? Math.round(((completedWeekTasks.length - completedWeekSignalTasks.length) / (weekTasks.length - weekSignalTasks.length)) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <h4 className="font-semibold text-noise-600 mb-1">Noise Tasks</h4>
                <p className="text-sm text-neutral-600 dark:text-gray-400">
                  {completedWeekTasks.length - completedWeekSignalTasks.length} of {weekTasks.length - weekSignalTasks.length} completed
                </p>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-3">
              Weekly Insights
            </h3>
            <div className="space-y-2 text-sm">
              {signalRatioPercentage >= 80 && (
                <p className="text-signal-700 dark:text-signal-300">
                  🎉 Excellent focus this week! You maintained the 80/20 rule with {signalRatioPercentage.toFixed(0)}% signal tasks.
                </p>
              )}
              {signalRatioPercentage < 80 && signalRatioPercentage >= 60 && (
                <p className="text-primary-700 dark:text-primary-300">
                  ⚡ Good focus this week with {signalRatioPercentage.toFixed(0)}% signal tasks. Try to get closer to 80% next week.
                </p>
              )}
              {signalRatioPercentage < 60 && weekTasks.length > 0 && (
                <p className="text-noise-700 dark:text-noise-300">
                  🎯 Focus improvement needed. Only {signalRatioPercentage.toFixed(0)}% of your tasks were signal. Try to prioritize more important work next week.
                </p>
              )}
              {completionRate >= 80 && (
                <p className="text-signal-700 dark:text-signal-300">
                  ✅ Great productivity this week! You completed {completionRate.toFixed(0)}% of your tasks.
                </p>
              )}
              {completedWeekTasks.length === 0 && weekTasks.length > 0 && (
                <p className="text-neutral-600 dark:text-gray-400">
                  📝 No tasks completed this week yet. There's still time to make progress!
                </p>
              )}
              {weekTasks.length === 0 && (
                <p className="text-neutral-600 dark:text-gray-400">
                  🚀 No tasks created this week yet. Time to plan your priorities!
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 text-neutral-600 dark:text-gray-400 hover:text-neutral-800 dark:hover:text-white"
            >
              Close Review
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors duration-200"
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
