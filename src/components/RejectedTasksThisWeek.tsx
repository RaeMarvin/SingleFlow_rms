import { X, Calendar } from 'lucide-react';
import useSupabaseStore from '../store/useSupabaseStore';
import { Task } from '../types';

const RejectedTasksThisWeek: React.FC = () => {
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

  // Filter for tasks rejected this week
  const rejectedThisWeekTasks = tasks.filter(task => {
    if (!task.rejected) return false;
    
    // If task has rejectedAt, use that date
    if (task.rejectedAt) {
      const rejectedDate = new Date(task.rejectedAt);
      return rejectedDate >= weekStart && rejectedDate <= weekEnd;
    }
    
    // Fallback: if no rejectedAt but task is rejected, check if created this week
    // This is for backward compatibility with older rejected tasks
    const createdDate = new Date(task.createdAt);
    return createdDate >= weekStart && createdDate <= weekEnd;
  });

  // Group by day for better organization
  const groupTasksByDay = (tasks: Task[]) => {
    const grouped: { [key: string]: Task[] } = {};
    
    tasks.forEach(task => {
      const date = task.rejectedAt ? new Date(task.rejectedAt) : new Date(task.createdAt);
      const dayKey = date.toDateString();
      
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(task);
    });

    return grouped;
  };

  const groupedTasks = groupTasksByDay(rejectedThisWeekTasks);
  const sortedDays = Object.keys(groupedTasks).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime() // Most recent first
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  const getCategoryColor = (category: string) => {
    return category === 'signal' ? 'text-signal-600 bg-signal-50 border-signal-200' : 'text-noise-600 bg-noise-50 border-noise-200';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'work': return 'text-primary-600';
      case 'home': return 'text-accent-mint';
      case 'social': return 'text-noise-600';
      default: return 'text-neutral-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <X className="w-5 h-5 text-red-600" />
        <h2 className="text-lg font-semibold text-neutral-800 dark:text-white">
          Said NO To This Week
        </h2>
        <span className="text-sm text-neutral-500 dark:text-gray-400 bg-neutral-100 dark:bg-gray-700 px-2 py-1 rounded-full">
          {rejectedThisWeekTasks.length}
        </span>
      </div>

      {rejectedThisWeekTasks.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 dark:text-gray-400 text-sm">
            No tasks rejected this week.
          </p>
          <p className="text-neutral-400 dark:text-gray-500 text-xs mt-1">
            Use the ❌ button on Noise tasks to practice saying NO 💪
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sortedDays.map(dayKey => (
            <div key={dayKey} className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-600 dark:text-gray-400 sticky top-0 bg-white dark:bg-gray-800 py-1">
                {formatDate(dayKey)} ({groupedTasks[dayKey].length})
              </h3>
              <div className="space-y-2 pl-2">
                {groupedTasks[dayKey].map(task => (
                  <div 
                    key={task.id}
                    className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-neutral-800 dark:text-white text-sm line-through">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-neutral-600 dark:text-gray-400 mt-1 line-through">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'work' ? 'Work' : task.priority === 'home' ? 'Home' : task.priority === 'social' ? 'Social' : task.priority}
                        </span>
                        {task.rejectedAt && (
                          <span className="text-xs text-neutral-500 dark:text-gray-400">
                            {new Date(task.rejectedAt).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </span>
                        )}
                        <span className="text-xs text-red-600 font-medium">
                          Said NO 🚫
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RejectedTasksThisWeek;
