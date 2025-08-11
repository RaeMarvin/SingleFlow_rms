import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
import useSupabaseStore from './store/useSupabaseStore';
import { useInitializeData } from './hooks/useInitializeData';
import { 
  TaskBoard, 
  Header, 
  StatsPanel, 
  IdeaParkingLot, 
  DailyReviewModal, 
  TaskCard,
  DebugPanel
} from './components';
import { Task } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showDailyReview, setShowDailyReview] = useState(false);
  const { moveTask, reorderTasks, tasks, settings } = useSupabaseStore();
  const { isLoading } = useInitializeData();
  const { user, loading: authLoading } = useAuth();

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
    
    // Check if this is cross-column movement (dropping on signal/noise)
    if (overId === 'signal' || overId === 'noise') {
      if (activeTask.category !== overId) {
        moveTask(activeId, overId);
      }
      return;
    }
    
    // Check if this is within-column reordering (dropping on another task)
    const overTask = tasks.find(t => t.id === overId);
    if (overTask && activeTask.category === overTask.category) {
      // Get all tasks in this category, sorted by order
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

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className={`min-h-screen transition-colors duration-200${
        settings.darkMode ? ' dark' : ''
      }`}>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show welcome screen for unauthenticated users
  if (!user) {
    return (
      <div className={`min-h-screen transition-colors duration-200${
        settings.darkMode ? ' dark' : ''
      }`}>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
          <Header onShowDailyReview={() => setShowDailyReview(true)} />
          
          <main className="container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <span className="text-white font-bold text-2xl">SF</span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Fozzle
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                The productivity app that helps you distinguish between <span className="font-semibold text-blue-600">Signal</span> (important work) and <span className="font-semibold text-purple-600">Noise</span> (busy work).
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-lg">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Focus on What Matters
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Categorize tasks as Signal or Noise to maintain focus on high-impact work
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-600 font-bold text-lg">📈</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Track Your Progress
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Monitor your Signal-to-Noise ratio and optimize your productivity
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold text-lg">☁️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Cloud Sync
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Access your tasks anywhere with secure cloud synchronization
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Sign in to start organizing your tasks and boost your productivity today.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200${
      settings.darkMode ? ' dark' : ''
    }`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your tasks...</p>
            </div>
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
          >
            <Header onShowDailyReview={() => setShowDailyReview(true)} />
            
            <main className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Stats Panel */}
                <div className="lg:col-span-1">
                  <StatsPanel />
                </div>
                
                {/* Task Board */}
                <div className="lg:col-span-2">
                  <TaskBoard />
                </div>
                
                {/* Idea Parking Lot */}
                <div className="lg:col-span-1">
                  <IdeaParkingLot />
                </div>
              </div>
            </main>
            
            <DragOverlay>
              {activeTask && (
                <div className="rotate-6 opacity-90">
                  <TaskCard task={activeTask} isDragging />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
        
        {showDailyReview && (
          <DailyReviewModal 
            onClose={() => setShowDailyReview(false)} 
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
