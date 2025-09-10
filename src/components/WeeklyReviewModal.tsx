import { X, TrendingUp, Target, Award } from 'lucide-react';
import useSupabaseStore from '../store/useSupabaseStore';

interface WeeklyReviewModalProps {
  onClose: () => void;
}

const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({ onClose }) => {
  const { tasks } = useSupabaseStore();
  
  // Get Monday of current week (with proper timezone handling)
  const getMonday = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0); // Start of day
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust for Sunday
    d.setDate(diff);
    return d;
  };

  // Get Sunday of current week (end of day)
  const getSunday = (monday: Date) => {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999); // End of day
    return sunday;
  };

  const today = new Date();
  const weekStart = getMonday(new Date(today));
  const weekEnd = getSunday(new Date(weekStart));

  // Format week range
  const formatWeekRange = () => {
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Daily breakdown for the week
  const getDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' });
  
  interface WeekDay {
    date: Date;
    name: string;
    isToday: boolean;
    completedSignal: number;
    completedNoise: number;
    totalCompleted: number;
    rejectedTasks: number;
    fozzleScore: number;
  }
  
  const weekDays: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    let dayCompletedSignal = 0;
    let dayCompletedNoise = 0;
    let dayRejectedNoise = 0;
    let dayUncompletedSignal = 0;
    let totalCompletedThisDay = 0;

    tasks.forEach(task => {
      const createdAt = new Date(task.createdAt);
      const completedAt = task.completedAt ? new Date(task.completedAt) : null;
      const rejectedAt = task.rejectedAt ? new Date(task.rejectedAt) : null;
      const categoryChangedAt = task.category_changed_at ? new Date(task.category_changed_at) : null;

      // Determine the task's category on this specific day
      let categoryOnDay = task.category;
      if (categoryChangedAt && categoryChangedAt > dayEnd) {
        // If the last change was after this day, it had the opposite category
        categoryOnDay = task.category === 'signal' ? 'noise' : 'signal';
      }

      // --- Calculations based on the task's state *on this day* ---

      // 1. Was the task completed on this day?
      if (completedAt && completedAt >= dayStart && completedAt <= dayEnd) {
        totalCompletedThisDay++;
        if (categoryOnDay === 'signal') {
          dayCompletedSignal++;
        } else {
          dayCompletedNoise++;
        }
      }

      // 2. Was a 'noise' task rejected on this day?
      if (rejectedAt && rejectedAt >= dayStart && rejectedAt <= dayEnd) {
        if (categoryOnDay === 'noise') {
          dayRejectedNoise++;
        }
      }

      // 3. Was it an uncompleted 'signal' task by the end of this day?
      if (categoryOnDay === 'signal' && createdAt <= dayEnd && (!completedAt || completedAt > dayEnd)) {
        dayUncompletedSignal++;
      }
    });

    // Aligned Fozzle Score Calculation for the day
    const fozzleNumerator = dayCompletedSignal + dayRejectedNoise;
    const fozzleDenominator = totalCompletedThisDay + dayRejectedNoise + dayUncompletedSignal;
    const dayFozzleScore = fozzleDenominator > 0 ? (fozzleNumerator / fozzleDenominator) * 100 : 0;
    
    weekDays.push({
      date: day,
      name: getDayName(day),
      isToday: day.toDateString() === today.toDateString(),
      completedSignal: dayCompletedSignal,
      completedNoise: dayCompletedNoise,
      totalCompleted: totalCompletedThisDay,
      rejectedTasks: dayRejectedNoise,
      fozzleScore: dayFozzleScore
    });
  }

  // --- Corrected Weekly Aggregate Calculations ---

  // 1. Fozzle Score (Week) - Average of daily scores with activity
  const daysWithActivity = weekDays.filter(d => d.totalCompleted > 0 || d.rejectedTasks > 0);
  const totalFozzleScore = daysWithActivity.reduce((sum, day) => sum + day.fozzleScore, 0);
  const fozzleScore = daysWithActivity.length > 0 ? totalFozzleScore / daysWithActivity.length : 0;

  // 2. Signal & Noise Tasks Completed This Week
  const completedWeekSignalTasks = weekDays.reduce((sum, day) => sum + day.completedSignal, 0);
  const completedWeekNoiseTasks = weekDays.reduce((sum, day) => sum + day.completedNoise, 0);

  // 3. Tasks Rejected This Week
  const rejectedWeekTasks = weekDays.reduce((sum, day) => sum + day.rejectedTasks, 0);

  // 4. Completion Rate (for insights)
  const createdThisWeek = tasks.filter(t => {
    const createdAt = new Date(t.createdAt);
    return createdAt >= weekStart && createdAt <= weekEnd;
  });
  const completedThisWeekCount = weekDays.reduce((sum, day) => sum + day.totalCompleted, 0);
  
  
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
          {/* Insights - moved to top */}
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-3">
              Weekly Insights
            </h3>
            <div className="space-y-2 text-sm">
              {fozzleScore >= 80 && (
                <p className="text-signal-700 dark:text-signal-300">
                  🎉 Excellent Fozzle Score this week! You achieved an average of {fozzleScore.toFixed(0)}% focus.
                </p>
              )}
              {rejectedWeekTasks > 0 && (
                <p className="text-primary-700 dark:text-primary-300">
                  💪 Great job saying NO to {rejectedWeekTasks} distracting task{rejectedWeekTasks !== 1 ? 's' : ''} this week!
                </p>
              )}
              {fozzleScore < 80 && fozzleScore >= 50 && (
                <p className="text-primary-700 dark:text-primary-300">
                  ⚡ Good Fozzle Score with an average of {fozzleScore.toFixed(0)}%. Try to get closer to 80% next week.
                </p>
              )}
              {fozzleScore < 50 && (completedWeekSignalTasks + completedWeekNoiseTasks) > 0 && (
                <p className="text-noise-700 dark:text-noise-300">
                  🎯 Why not review your Noise activities. Your average Fozzle Score is {fozzleScore.toFixed(0)}%. Prioritize more Signal work.
                </p>
              )}
              
              {completedThisWeekCount === 0 && createdThisWeek.length > 0 && (
                <p className="text-neutral-600 dark:text-gray-400">
                  📝 No tasks completed this week yet. There's still time to make progress!
                </p>
              )}
              {createdThisWeek.length === 0 && completedThisWeekCount === 0 && (
                <p className="text-neutral-600 dark:text-gray-400">
                  🚀 No tasks created or completed this week yet. Time to plan your priorities!
                </p>
              )}
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatBox
              icon={<Award className="w-6 h-6 text-blue-600" />}
              title="Fozzle Score (Week)"
              value={`${fozzleScore.toFixed(0)}%`}
              subtitle={getScoreLabel(fozzleScore)}
              valueColor={getScoreColor(fozzleScore)}
            />
            <StatBox
              icon={<Target className="w-6 h-6 text-signal-600" />}
              title="Signal Tasks Completed"
              value={completedWeekSignalTasks}
              subtitle={`Focus on what matters`}
            />
            <StatBox
              icon={<TrendingUp className="w-6 h-6 text-noise-600" />}
              title="Noise Tasks Completed"
              value={completedWeekNoiseTasks}
              subtitle={`Distractions handled`}
            />
            <StatBox
              icon={<X className="w-6 h-6 text-primary-600" />}
              title="Tasks Rejected This Week"
              value={rejectedWeekTasks}
              subtitle="Said NO to distractions"
              valueColor="text-primary-600"
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
                  className={`text-center p-2 sm:p-3 transition-all ${
                    day.isToday 
                      ? 'sm:border-2 sm:border-primary-500 sm:bg-primary-50 sm:dark:bg-primary-900/20 sm:rounded-lg' 
                      : 'sm:border-2 sm:border-gray-200 sm:dark:border-gray-600 sm:bg-white sm:dark:bg-gray-800 sm:rounded-lg'
                  }`}
                >
                  <div className="text-xs font-medium text-neutral-600 dark:text-gray-400 mb-1">
                    {day.name}
                  </div>
                  <div className={`text-base sm:text-lg font-bold mb-1 ${
                    day.fozzleScore >= 80 ? 'text-signal-600' :
                    day.fozzleScore >= 60 ? 'text-primary-600' : 'text-noise-600'
                  }`}>
                    {day.totalCompleted > 0 ? `${day.fozzleScore.toFixed(0)}%` : '-'}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-gray-400">
                    {day.totalCompleted > 0 ? 'Fozzle Score' : 'No tasks'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signal vs Noise Breakdown */}
          <div className="bg-neutral-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4">
              Daily Task Actions (This Week)
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => {
                  const maxTasks = Math.max(...weekDays.map(d => Math.max(d.completedSignal, d.completedNoise, d.rejectedTasks)));
                  const maxHeight = maxTasks > 0 ? 120 : 20; // px
                  
                  return (
                    <div key={index} className="text-center">
                      <div className="text-xs font-medium text-neutral-600 dark:text-gray-400 mb-2">
                        {day.name}
                      </div>
                      
                      {/* Bar Chart Container */}
                      <div className="relative flex items-end justify-center space-x-0.5" style={{ height: `${maxHeight + 20}px` }}>
                        {/* Signal Bar */}
                        <div className="w-3 bg-signal-500 rounded-t" 
                             style={{ 
                               height: maxTasks > 0 ? `${(day.completedSignal / maxTasks) * maxHeight}px` : '4px',
                               minHeight: day.completedSignal > 0 ? '8px' : '4px'
                             }}
                             title={`${day.completedSignal} Signal tasks completed`}>
                        </div>
                        
                        {/* Noise Bar */}
                        <div className="w-3 bg-noise-500 rounded-t" 
                             style={{ 
                               height: maxTasks > 0 ? `${(day.completedNoise / maxTasks) * maxHeight}px` : '4px',
                               minHeight: day.completedNoise > 0 ? '8px' : '4px'
                             }}
                             title={`${day.completedNoise} Noise tasks completed`}>
                        </div>
                        
                        {/* Rejected Bar */}
                        <div className="w-3 bg-primary-500 rounded-t" 
                             style={{ 
                               height: maxTasks > 0 ? `${(day.rejectedTasks / maxTasks) * maxHeight}px` : '4px',
                               minHeight: day.rejectedTasks > 0 ? '8px' : '4px'
                             }}
                             title={`${day.rejectedTasks} tasks rejected`}>
                        </div>
                      </div>
                      
                      {/* Task Count Labels */}
                      <div className="text-xs text-neutral-600 dark:text-gray-400 mt-2">
                        <div className="flex justify-center space-x-1">
                          <span className="text-signal-600">{day.completedSignal}S</span>
                          <span className="text-noise-600">{day.completedNoise}N</span>
                          <span className="text-primary-600">{day.rejectedTasks}R</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-signal-500 rounded"></div>
                  <span className="text-sm text-neutral-600 dark:text-gray-400">Signal Tasks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-noise-500 rounded"></div>
                  <span className="text-sm text-neutral-600 dark:text-gray-400">Noise Tasks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary-500 rounded"></div>
                  <span className="text-sm text-neutral-600 dark:text-gray-400">Rejected Tasks</span>
                </div>
              </div>
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

export default WeeklyReviewModal;
