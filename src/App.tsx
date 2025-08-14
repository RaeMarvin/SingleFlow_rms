import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
import useSupabaseStore from './store/useSupabaseStore';
import { useInitializeData } from './hooks/useInitializeData';
import { 
  TaskBoard, 
  Header, 
  StatsPanel, 
  WeeklyReviewModal, 
  TaskCard,
  TaskDetailModal,
  DebugPanel
} from './components';
import { Task } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import logoImage from './assets/logo.png';
import wordmarkImage from './assets/wordmark.png';

function AppContent() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { moveTask, reorderTasks, tasks } = useSupabaseStore();
  const { isLoading } = useInitializeData();
  const { user, loading: authLoading } = useAuth();

  const handleTaskClick = (task: Task) => {
    console.log('App - handleTaskClick called with task:', task.id);
    console.log('App - Setting selectedTask to:', task);
    setSelectedTask(task);
    console.log('App - selectedTask has been set');
  };

  // Configure sensors for both mouse and touch devices
  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 10,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    // Press delay of 250ms, with tolerance of 5px of movement
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  
  const sensors = useSensors(mouseSensor, touchSensor);

  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id as string;
    const task = tasks.find((t: Task) => t.id === taskId);
    setActiveTask(task || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Find the active task
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;
    
    // Check if this is cross-column movement (dropping on signal/noise column headers)
    if (overId === 'signal' || overId === 'noise') {
      if (activeTask.category !== overId) {
        moveTask(activeId, overId);
      }
      return;
    }
    
    // Check if dropping on another task
    const overTask = tasks.find(t => t.id === overId);
    if (overTask) {
      // Cross-category movement - if dropping on a task in a different category
      if (activeTask.category !== overTask.category) {
        moveTask(activeId, overTask.category);
        return;
      }
      
      // Same-category reordering - if dropping on a task in the same category
      if (activeTask.category === overTask.category) {
        const categoryTasks = tasks
          .filter(t => t.category === activeTask.category)
          .sort((a, b) => a.order - b.order);
        
        const oldIndex = categoryTasks.findIndex(t => t.id === activeId);
        const newIndex = categoryTasks.findIndex(t => t.id === overId);
        
        if (oldIndex !== newIndex) {
          const reorderedTasks = arrayMove(categoryTasks, oldIndex, newIndex);
          const taskIds = reorderedTasks.map(t => t.id);
          reorderTasks(activeTask.category, taskIds);
        }
      }
    }
  }

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen transition-colors duration-200">
        <div className="bg-neutral-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show welcome screen for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen transition-colors duration-200">
        <div className="bg-neutral-50 min-h-screen">
          <Header onShowWeeklyReview={() => setShowWeeklyReview(true)} />
          
          <main className="container mx-auto px-4 py-16">
            <div className="text-center max-w-3xl mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-8">
                <img 
                  src={logoImage} 
                  alt="Logo" 
                  className="w-16 h-16 drop-shadow-lg object-contain"
                />
                <img 
                  src={wordmarkImage} 
                  alt="Fozzle" 
                  className="h-14 object-contain"
                />
              </div>
              
              <p className="text-xl text-neutral-600 mb-12 leading-relaxed">
                Focus on the next thing you need to do.
              </p>
              
              {/* Demo task list matching the image */}
              <div className="max-w-md mx-auto mb-12">
                <h2 className="text-2xl font-semibold text-neutral-800 mb-6">
                  Today's Tasks
                </h2>
                
                <div className="space-y-3">
                  {/* High priority task */}
                  <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      </div>
                      <span className="text-neutral-800 font-medium">Task</span>
                    </div>
                    <span className="px-3 py-1 bg-signal-100 text-signal-700 text-sm font-medium rounded-full border border-signal-200">
                      High
                    </span>
                  </div>

                  {/* Medium priority task */}
                  <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                      <span className="text-neutral-800 font-medium">Task</span>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full border border-purple-200">
                      Medium
                    </span>
                  </div>

                  {/* Low priority task */}
                  <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                      <span className="text-neutral-800 font-medium">Task</span>
                    </div>
                    <span className="px-3 py-1 bg-noise-100 text-noise-700 text-sm font-medium rounded-full border border-noise-200">
                      Low
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Action section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">
                  Quick Action
                </h3>
                <button className="w-full max-w-md mx-auto block text-white border rounded-xl py-4 px-6 text-lg font-medium transition-colors duration-200" style={{backgroundColor: '#7dc3ff', borderColor: '#6bb6ff'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6bb6ff'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7dc3ff'}>
                  Add a task
                </button>
              </div>
              
              <p className="text-neutral-600 mb-8">
                Sign in to start organizing your tasks and boost your productivity today.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-200">
      <div className="bg-neutral-50 min-h-screen">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your tasks...</p>
            </div>
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
          >
            <Header onShowWeeklyReview={() => setShowWeeklyReview(true)} />
            
            <main className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Stats Panel */}
                <div className="lg:col-span-1">
                  <StatsPanel onTaskClick={handleTaskClick} />
                </div>
                
                {/* Task Board */}
                <div className="lg:col-span-3">
                  <TaskBoard onTaskClick={handleTaskClick} />
                </div>
              </div>
            </main>
            
            <DragOverlay>
              {activeTask && (
                <div className="rotate-3 opacity-95 scale-110 transition-transform cursor-grabbing">
                  <TaskCard task={activeTask} isDragging />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
        
        {showWeeklyReview && (
          <WeeklyReviewModal
            onClose={() => setShowWeeklyReview(false)}
          />
        )}

        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            isOpen={true}
            onClose={() => setSelectedTask(null)}
          />
        )}

        {/* Only show DebugPanel in development mode */}
        {import.meta.env.DEV && <DebugPanel />}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
