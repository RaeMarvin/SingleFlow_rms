import { useDroppable } from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Signal, Volume2, TrendingUp } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import useSupabaseStore from '../store/useSupabaseStore';
import TaskCard from './TaskCard';
import ThumbsUpAnimation from './ThumbsUpAnimation'; // Assuming ThumbsUpAnimation is in the same components folder
import useMediaQuery from '../hooks/useMediaQuery';

import { Task } from '../types';

interface TaskBoardProps {
  onTaskClick?: (task: Task) => void;
  onSignalComplete?: () => void;
  onNoiseReject?: () => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ onTaskClick, onSignalComplete, onNoiseReject }) => {
  const { tasks } = useSupabaseStore();
  const signalFigureRef = useRef<HTMLDivElement>(null);
  const signalLabelRef = useRef<HTMLDivElement>(null);
  const [showSignalCompletionPopup, setShowSignalCompletionPopup] = useState(false);
  const [popupCoords, setPopupCoords] = useState<{ x: number; y: number; } | null>(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  // Only show incomplete and non-rejected tasks on the board
  const signalTasks = tasks.filter((task) => task.category === 'signal' && !task.completed && !task.rejected);
  const noiseTasks = tasks.filter((task) => task.category === 'noise' && !task.completed && !task.rejected);

  const handleSignalTaskComplete = () => {
    if (signalLabelRef.current) {
      const rect = signalLabelRef.current.getBoundingClientRect();
      // Position above the label, centered horizontally
      setPopupCoords({ x: rect.left + rect.width / 2, y: rect.top - 21 }); // 21 = 16 (popup height) + 5 (padding)
    }
    setShowSignalCompletionPopup(true);
    // Original onSignalComplete from App.tsx
    onSignalComplete?.();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSignalCompletionPopup) {
      timer = setTimeout(() => {
        setShowSignalCompletionPopup(false);
        setPopupCoords(null);
      }, 1500); // Show for 1.5 seconds
    }
    return () => clearTimeout(timer);
  }, [showSignalCompletionPopup]);

  return (
    <div className="space-y-4">
      {/* Current Tasks Overview */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 relative">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-medium text-gray-700">
            Current Tasks
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div ref={signalFigureRef} className="text-center p-2 bg-signal-50 rounded">
            <div className="text-lg font-semibold text-signal-600">
              {signalTasks.length}
            </div>
            <div className="text-xs text-gray-600" ref={signalLabelRef}>
              Signal
            </div>
          </div>
          
          {isDesktop && showSignalCompletionPopup && popupCoords && (
            <ThumbsUpAnimation 
              show={showSignalCompletionPopup} 
              onComplete={() => setShowSignalCompletionPopup(false)} 
              coords={popupCoords}
              isDesktop={isDesktop}
            />
          )}
          
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
          onTaskClick={onTaskClick}
          onSignalComplete={handleSignalTaskComplete}
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
                ? 'Drop important tasks here' 
                : 'Drop less critical tasks here'
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