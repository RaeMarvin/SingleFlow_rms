import { useDroppable } from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Signal, Volume2, TrendingUp } from 'lucide-react';
import useSupabaseStore from '../store/useSupabaseStore';
import TaskCard from './TaskCard';

const TaskBoard: React.FC = () => {
  const { tasks } = useSupabaseStore();
  
  // Only show incomplete tasks on the board
  const signalTasks = tasks.filter((task) => task.category === 'signal' && !task.completed);
  const noiseTasks = tasks.filter((task) => task.category === 'noise' && !task.completed);

  return (
    <div className="space-y-6">
      {/* Current Tasks Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current Tasks
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-signal-50 dark:bg-signal-900/20 rounded-lg">
            <div className="text-xl font-bold text-signal-600">
              {signalTasks.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Signal
            </div>
          </div>
          
          <div className="text-center p-3 bg-noise-50 dark:bg-noise-900/20 rounded-lg">
            <div className="text-xl font-bold text-noise-600">
              {noiseTasks.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Noise
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Signal Column */}
        <TaskColumn
          id="signal"
          title="Signal"
          subtitle="Critical & Important"
          icon={<Signal className="w-5 h-5" />}
          tasks={signalTasks}
          colorClass="border-signal-300 bg-signal-50 dark:bg-signal-900/10"
          headerClass="bg-signal-600"
        />

        {/* Noise Column */}
        <TaskColumn
          id="noise"
          title="Noise"
          subtitle="Less Critical"
          icon={<Volume2 className="w-5 h-5" />}
          tasks={noiseTasks}
          colorClass="border-noise-300 bg-noise-50 dark:bg-noise-900/10"
          headerClass="bg-noise-600"
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
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  id,
  title,
  subtitle,
  icon,
  tasks,
  colorClass,
  headerClass,
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
        ${isOver ? 'ring-2 ring-primary-400 bg-primary-50 dark:bg-primary-900/20' : colorClass}
      `}
    >
      {/* Column Header */}
      <div className={`${headerClass} text-white p-4 rounded-t-lg flex items-center space-x-3`}>
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
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="mb-3 opacity-50">
              {icon}
            </div>
            <p className="text-sm">
              {id === 'signal' 
                ? 'Drop important tasks here' 
                : 'Drop less critical tasks here'
              }
            </p>
          </div>
        ) : (
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {sortedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
};

export default TaskBoard;