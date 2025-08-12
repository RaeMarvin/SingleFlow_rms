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
    <div className="space-y-4">
      {/* Current Tasks Overview */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-medium text-gray-700">
            Current Tasks
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-signal-50 rounded">
            <div className="text-lg font-semibold text-signal-600">
              {signalTasks.length}
            </div>
            <div className="text-xs text-gray-600">
              Signal
            </div>
          </div>
          
          <div className="text-center p-2 bg-noise-50 rounded">
            <div className="text-lg font-semibold text-noise-600">
              {noiseTasks.length}
            </div>
            <div className="text-xs text-gray-600">
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
          colorClass="border-signal-300 bg-signal-50"
          headerClass="bg-signal-600 text-white"
        />

        {/* Noise Column */}
        <TaskColumn
          id="noise"
          title="Noise"
          subtitle="Less Critical"
          icon={<Volume2 className="w-5 h-5" />}
          tasks={noiseTasks}
          colorClass="border-noise-300 bg-noise-50"
          headerClass="bg-purple-100 text-purple-700"
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