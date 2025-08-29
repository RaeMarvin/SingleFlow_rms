import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';
import useSupabaseStore from './store/useSupabaseStore';
import { useInitializeData } from './hooks/useInitializeData';
import { 
  TaskBoard, 
  Header, 
  StatsPanel, 
  WeeklyReviewModal, 
  TaskCard,
  TaskDetailModal
} from './components';
import ThumbsUpAnimation from './components/ThumbsUpAnimation';
import BicepsFlexedAnimation from './components/BicepsFlexedAnimation';
import WelcomeBackModal from './components/WelcomeBackModal';
import { Task } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import logoImage from './assets/logo.png';
import wordmarkImage from './assets/wordmark.png';

function AppContent() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showThumbsUp, setShowThumbsUp] = useState(false);
  const [showBicepsFlexed, setShowBicepsFlexed] = useState(false);
  const { moveTask, reorderTasks, tasks } = useSupabaseStore();
  const { isLoading } = useInitializeData();
  const { user, loading: authLoading } = useAuth();
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [weeklyAveragePercent, setWeeklyAveragePercent] = useState(0);

  // Compute weekly stats and decide whether to show WelcomeBackModal
  useEffect(() => {
    if (!user || authLoading || isLoading) return;

    // Reuse WeeklyReviewModal's day-based logic so streaks/averages match exactly
    const getMonday = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      return d;
    };

  const today = new Date();
  const weekStart = getMonday(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

    const dailyScores: number[] = [];
    let otherDayWithScore = false;

  let todayIndex = 0;
  for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);

      // tasks completed on this specific day
      const dayCompletedTasks = tasks.filter(task => {
        if (!task.completed || !task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        return completedDate.toDateString() === day.toDateString();
      });

      // tasks rejected on this day
      const dayRejectedTasks = tasks.filter(task => {
        if (!task.rejected) return false;
        const rejectedDate = task.rejectedAt ? new Date(task.rejectedAt) : new Date(task.createdAt);
        return rejectedDate.toDateString() === day.toDateString();
      });

      const completedSignal = dayCompletedTasks.filter(t => t.category === 'signal').length;
      const numerator = completedSignal + dayRejectedTasks.length;
      const denominator = dayCompletedTasks.length + dayRejectedTasks.length;
      const percent = denominator > 0 ? (numerator / denominator) * 100 : 0;

      dailyScores.push(percent);
      const todayStr = today.toDateString();
      if (day.toDateString() === todayStr) todayIndex = i;
      if (day.toDateString() !== todayStr && percent > 0) otherDayWithScore = true;
    }

  // Compute weekly aggregate fozzle score the same way WeeklyReviewModal does
    const weekTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      const isCreatedThisWeek = taskDate >= weekStart && taskDate <= weekEnd;

      if (task.completed && task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const isCompletedThisWeek = completedDate >= weekStart && completedDate <= weekEnd;
        return isCreatedThisWeek || isCompletedThisWeek;
      }

      return isCreatedThisWeek;
    });

    const completedWeekTasks = weekTasks.filter(t => t.completed);
    const completedWeekSignalTasks = completedWeekTasks.filter(t => t.category === 'signal');
    const weeklyAggregate = completedWeekTasks.length > 0 ? (completedWeekSignalTasks.length / completedWeekTasks.length) * 100 : 0;
  // Compute average to-date across days from week start through today (count days up to today)
  // Note: we will show the weekly aggregate (completed signal tasks / completed tasks) in the Welcome modal
  // because the weeklyAggregate matches the console "weeklyAggregate" value users expect.
  // Use weeklyAggregate for the modal display (matches WeeklyReviewModal's aggregate)
  setWeeklyAveragePercent(weeklyAggregate);

    // consecutive days: check backwards. If today has no score, start from yesterday so streak isn't broken by a missing-today login.
    let streak = 0;
    const startIndex = (dailyScores[todayIndex] > 0) ? todayIndex : (todayIndex - 1);
    for (let i = startIndex; i >= 0; i--) {
      const p = dailyScores[i];
      if (p > 0) streak++; else break;
    }
    setConsecutiveDays(streak);
    const todayPercent = dailyScores[todayIndex];
    // debug logs
    // eslint-disable-next-line no-console
    console.log('WelcomeBack debug', { todayPercent, todayIndex, otherDayWithScore, dailyScores, weeklyAggregate, streak });

    // Allow forcing the modal for testing via ?forceWelcome=1
    try {
      const params = new URLSearchParams(window.location.search);
      const todayDateStr = today.toDateString();
      if (params.get('forceWelcome') === '1') {
        // store the date so we only force it for today
        sessionStorage.setItem('welcomeShown', todayDateStr);
        setShowWelcomeBack(true);
        // eslint-disable-next-line no-console
        console.log('WelcomeBack: forced show via query param (stored date)', todayDateStr);
        return;
      }
      // If debugWelcome=1 is present, allow clearing stored value and force show for debugging
      if (params.get('debugWelcome') === '1') {
        // eslint-disable-next-line no-console
        console.log('WelcomeBack: debugWelcome=1 present — clearing stored key and forcing modal');
        sessionStorage.removeItem('welcomeShown');
      }
    } catch (e) {
      // ignore
    }

    // Show modal if user had another non-zero day this week (regardless of today's percent)
    try {
      const stored = sessionStorage.getItem('welcomeShown');
      // eslint-disable-next-line no-console
      console.log('WelcomeBack: session stored value =', stored);
      const todayDateStr = today.toDateString();
      if (otherDayWithScore && stored !== todayDateStr) {
        // eslint-disable-next-line no-console
        console.log('WelcomeBack: condition met — showing modal (otherDayWithScore && not shown today)');
        setShowWelcomeBack(true);
        sessionStorage.setItem('welcomeShown', todayDateStr);
      } else if (otherDayWithScore && stored === todayDateStr) {
        // eslint-disable-next-line no-console
        console.log('WelcomeBack: otherDayWithScore true but already shown today (stored === today)');
      }
    } catch (e) {
      if (otherDayWithScore) {
        // eslint-disable-next-line no-console
        console.log('WelcomeBack: sessionStorage threw, showing modal as fallback');
        setShowWelcomeBack(true);
      }
    }
  }, [tasks, user, authLoading, isLoading]);

  // Log when the welcome modal visibility changes (safe side-effect for debugging)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('WelcomeBack: showWelcomeBack changed ->', showWelcomeBack);
  }, [showWelcomeBack]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const triggerThumbsUp = () => {
    setShowThumbsUp(true);
  };

  const triggerBicepsFlexed = () => {
    setShowBicepsFlexed(true);
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
                  {/* Work priority task */}
                  <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      </div>
                      <span className="text-neutral-800 font-medium">Task</span>
                    </div>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full border border-primary-200">
                      Work
                    </span>
                  </div>

                  {/* Home priority task */}
                  <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full border-2 border-signal-200 flex items-center justify-center">
                        <div className="w-2 h-2 bg-signal-700 rounded-full"></div>
                      </div>
                      <span className="text-neutral-800 font-medium">Task</span>
                    </div>
                    <span className="px-3 py-1 bg-signal-100 text-signal-700 text-sm font-medium rounded-full border border-signal-200">
                      Home
                    </span>
                  </div>

                  {/* Social priority task */}
                  <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full border-2 border-noise-400"></div>
                      <span className="text-neutral-800 font-medium">Task</span>
                    </div>
                    <span className="px-3 py-1 bg-noise-100 text-noise-700 text-sm font-medium rounded-full border border-noise-200">
                      Social
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
                  <TaskBoard 
                    onTaskClick={handleTaskClick} 
                    onSignalComplete={triggerThumbsUp}
                    onNoiseReject={triggerBicepsFlexed}
                  />
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

        <WelcomeBackModal
          show={showWelcomeBack}
          onClose={() => setShowWelcomeBack(false)}
          consecutiveDays={consecutiveDays}
          weeklyAveragePercent={weeklyAveragePercent}
        />

        {/* Thumbs up animation for Signal task completion */}
        <ThumbsUpAnimation 
          show={showThumbsUp} 
          onComplete={() => setShowThumbsUp(false)} 
        />

        {/* Biceps flexed animation for Noise task rejection */}
        <BicepsFlexedAnimation 
          show={showBicepsFlexed} 
          onComplete={() => setShowBicepsFlexed(false)} 
        />
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
