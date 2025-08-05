import { useDroppable } from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  arrayMove 
} from '@dnd-kit/sortable';
import { Signal, Volume2 } from 'lucide-react';
import useSupabaseStore from '../store/useSupabaseStore';
import TaskCard from './TaskCard';
import { DragEndEvent } from '@dnd-kit/core';

const TaskBoard: React.FC = () => {
  const { tasks } = useSupabaseStore();
  
  const signalTasks = tasks.filter((task) => task.category === 'signal');
  const noiseTasks = tasks.filter((task) => task.category === 'noise');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Task Board
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Drag tasks between Signal and Noise categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Signal Column */}
        <TaskColumn
          id="signal"
          title="Signal"
          subtitle="Critical & Important"
          icon={<Signal className="w-5 h-5" />}
          tasks={signalTasks}
          colorClass="border-signal-500 bg-signal-50 dark:bg-signal-900/20"
          headerClass="bg-signal-500"
        />

        {/* Noise Column */}
        <TaskColumn
          id="noise"
          title="Noise"
          subtitle="Less Critical"
          icon={<Volume2 className="w-5 h-5" />}
          tasks={noiseTasks}
          colorClass="border-noise-500 bg-noise-50 dark:bg-noise-900/20"
          headerClass="bg-noise-500"
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
        ${isOver ? 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20' : colorClass}
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
