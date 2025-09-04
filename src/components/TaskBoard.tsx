import { useDroppable } from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Signal, Volume2 } from 'lucide-react';
// no refs required
import useSupabaseStore from '../store/useSupabaseStore';
import TaskCard from './TaskCard';
import DayInsight from './DayInsight';
// import ThumbsUpAnimation from './ThumbsUpAnimation'; // Assuming ThumbsUpAnimation is in the same components folder
import useMediaQuery from '../hooks/useMediaQuery';

import { Task } from '../types';

interface TaskBoardProps {
  onTaskClick?: (task: Task) => void;
  onSignalComplete?: () => void;
  onNoiseReject?: () => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ onTaskClick, onSignalComplete, onNoiseReject }) => {
  const { tasks } = useSupabaseStore();
  // refs removed (no longer needed for Day Insight replacement)
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  // Only show incomplete and non-rejected tasks on the board
  const signalTasks = tasks.filter((task) => task.category === 'signal' && !task.completed && !task.rejected);
  const noiseTasks = tasks.filter((task) => task.category === 'noise' && !task.completed && !task.rejected);

  // Compute today's Fozzle percent using the new formula
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedToday = tasks.filter((task) => {
    if (!task.completed || !task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    return completedDate.getFullYear() === today.getFullYear() &&
      completedDate.getMonth() === today.getMonth() &&
      completedDate.getDate() === today.getDate();
  });

  const noToday = tasks.filter((task) => {
    if (task.category !== 'noise' || !task.rejected || !task.rejectedAt) return false;
    const rejectedDate = new Date(task.rejectedAt);
    return rejectedDate.getFullYear() === today.getFullYear() &&
      rejectedDate.getMonth() === today.getMonth() &&
      rejectedDate.getDate() === today.getDate();
  });

  const signalCompleted = completedToday.filter((task) => task.category === 'signal').length;
  const totalCompleted = completedToday.length;
  const uncompletedSignal = tasks.filter(t => t.category === 'signal' && !t.completed).length;

  const fozzleNumerator = signalCompleted + noToday.length;
  const fozzleDenominator = totalCompleted + noToday.length + uncompletedSignal;
  const todayPercent = fozzleDenominator > 0 ? (fozzleNumerator / fozzleDenominator) * 100 : 0;

  const handleSignalTaskComplete = () => {
    if (!isDesktop) {
      onSignalComplete?.();
    }
  };

  // Removed useEffect for popup visibility

  return (
    <div className="space-y-4">
      {/* Day Insight (replaces Current Tasks overview) */}
      <div>
        <DayInsight todayPercent={todayPercent} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Signal Column */}
        <TaskColumn
          id="signal"
          title="Signal"
          subtitle="Today's focus items"
          icon={<Signal className="w-5 h-5" />}
          tasks={signalTasks}
          colorClass="border-signal-300 bg-signal-50"
          headerClass="bg-signal-600 text-white"
          onTaskClick={onTaskClick}
          onSignalComplete={handleSignalTaskComplete}
        />

        {/* Noise Column */}
        <TaskColumn
          id="noise"
          title="Noise"
          subtitle="Today's distractions"
          icon={<Volume2 className="w-5 h-5" />}
          tasks={noiseTasks}
          colorClass="border-noise-300 bg-noise-50"
          headerClass="bg-purple-100 text-purple-700"
          onTaskClick={onTaskClick}
          onNoiseReject={onNoiseReject}
        />
      </div>
    </div>
  );
};

interface TaskColumnProps {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tasks: any[];
  colorClass: string;
  headerClass: string;
  onTaskClick?: (task: Task) => void;
  onSignalComplete?: () => void; // This is the prop from TaskBoard
  onNoiseReject?: () => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  id,
  title,
  subtitle,
  icon,
  tasks,
  colorClass,
  headerClass,
  onTaskClick,
  onSignalComplete, // Destructure the prop
  onNoiseReject,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  
  // Sort tasks by their order property
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
  const taskIds = sortedTasks.map(task => task.id);

  return (
    <div
      ref={setNodeRef}
      className={`
        border-2 border-dashed rounded-xl transition-all duration-200 min-h-[400px]
        ${isOver ? 'ring-2 ring-primary-400 bg-primary-50' : colorClass}
      `}
    >
      {/* Column Header */}
      <div className={`${headerClass} p-4 rounded-t-lg flex items-center space-x-3`}>
        {icon}
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm opacity-90">{subtitle}</p>
        </div>
        <div className="ml-auto">
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="p-4 space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-3 opacity-50">
              {icon}
            </div>
            <p className="text-sm">
              {id === 'signal' 
                ? 'Drop focus items here' 
                : 'Drop potential distractions here'
              }
            </p>
          </div>
        ) : (
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {sortedTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onTaskClick={onTaskClick} 
                onSignalComplete={id === 'signal' ? onSignalComplete : undefined} // Pass the prop down
                onNoiseReject={id === 'noise' ? onNoiseReject : undefined}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
};

export default TaskBoard;