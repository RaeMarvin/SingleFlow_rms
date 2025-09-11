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
  TaskDetailModal,
  DraggedTaskCard
} from './components';
import ThumbsUpAnimation from './components/ThumbsUpAnimation';
import BicepsFlexedAnimation from './components/BicepsFlexedAnimation';
import WelcomeBackModal from './components/WelcomeBackModal';
import MissedReturnModal from './components/MissedReturnModal';
import { Task } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import logoImage from './assets/logo.png';
import wordmarkImage from './assets/wordmark.png';

function AppContent() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeTaskWidth, setActiveTaskWidth] = useState<number | null>(null);
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
  const [showMissedReturn, setShowMissedReturn] = useState(false);

  // Compute weekly stats and decide whether to show WelcomeBackModal
  useEffect(() => {
    if (!user || authLoading || isLoading || !tasks.length) return;

    const today = new Date();
    const todayStr = today.toDateString();

    // --- Helper function to calculate Fozzle score for any given day ---
    const calculateFozzleScoreForDate = (date: Date) => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
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

        let categoryOnDay = task.category;
        if (categoryChangedAt && categoryChangedAt > dayEnd) {
          categoryOnDay = task.category === 'signal' ? 'noise' : 'signal';
        }

        if (completedAt && completedAt >= dayStart && completedAt <= dayEnd) {
          totalCompletedThisDay++;
          if (categoryOnDay === 'signal') dayCompletedSignal++;
          else dayCompletedNoise++;
        }
        if (rejectedAt && rejectedAt >= dayStart && rejectedAt <= dayEnd && categoryOnDay === 'noise') {
          dayRejectedNoise++;
        }
        if (categoryOnDay === 'signal' && createdAt <= dayEnd && (!completedAt || completedAt > dayEnd)) {
          dayUncompletedSignal++;
        }
      });

      const numerator = dayCompletedSignal + dayRejectedNoise;
      const denominator = totalCompletedThisDay + dayRejectedNoise + dayUncompletedSignal;
      return denominator > 0 ? (numerator / denominator) * 100 : 0;
    };

    // --- Calculations for the current week ---
    const getMonday = (d: Date) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      date.setDate(diff);
      return date;
    };

    const weekStart = getMonday(today);
    const dailyScores = Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return calculateFozzleScoreForDate(day);
    });

    const daysWithActivity = dailyScores.filter(score => score > 0);
    const weeklyAverage = daysWithActivity.length > 0 ? daysWithActivity.reduce((a, b) => a + b, 0) / daysWithActivity.length : 0;
    setWeeklyAveragePercent(weeklyAverage);

    // --- Logic for Streak and Modal Visibility ---
    const todayIndex = today.getDay() - (today.getDay() === 0 ? -6 : 1);
    
    let pastStreak = 0;
    // Calculate the streak of days ending yesterday
    for (let i = todayIndex - 1; i >= 0; i--) {
      if (dailyScores[i] > 0) {
        pastStreak++;
      } else {
        break;
      }
    }

    // Determine the streak to display based on the user's rule
    let displayStreak = 0;
    if (pastStreak > 0) {
      displayStreak = pastStreak + 1;
    }
    setConsecutiveDays(displayStreak);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const startOfYesterday = new Date(yesterday);
    startOfYesterday.setHours(0, 0, 0, 0);

    const yesterdayPercent = calculateFozzleScoreForDate(yesterday);

    const hasPriorActivityBeforeYesterday = tasks.some(t => {
      const completedAt = t.completedAt ? new Date(t.completedAt) : null;
      const rejectedAt = t.rejectedAt ? new Date(t.rejectedAt) : null;
      if (completedAt && completedAt < startOfYesterday && t.category === 'signal') return true;
      if (rejectedAt && rejectedAt < startOfYesterday) return true;
      return false;
    });

    // --- Modal Display Logic (gated by sessionStorage) ---
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('forceWelcome') === '1') {
        sessionStorage.setItem('welcomeShown', todayStr);
        setShowWelcomeBack(true);
        return;
      }
      if (params.get('debugWelcome') === '1') {
        sessionStorage.removeItem('welcomeShown');
        sessionStorage.removeItem('missedReturnShown');
      }

      const storedWelcome = sessionStorage.getItem('welcomeShown');
      if (yesterdayPercent > 0 && storedWelcome !== todayStr) {
        setShowWelcomeBack(true);
        sessionStorage.setItem('welcomeShown', todayStr);
        return;
      }

      const storedMissed = sessionStorage.getItem('missedReturnShown');
      if (yesterdayPercent === 0 && hasPriorActivityBeforeYesterday && storedMissed !== todayStr) {
        setShowMissedReturn(true);
        sessionStorage.setItem('missedReturnShown', todayStr);
      }
    } catch (e) {
      // Ignore sessionStorage errors in restricted environments
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
    if (event.active.rect.current.initial) {
      setActiveTaskWidth(event.active.rect.current.initial.width);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    setActiveTaskWidth(null);
    
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
                Fozzle today and keep distractions at bay
              </p>
              
              {/* Demo task list matching the image */}
                <div className="mx-auto mb-8 lg:max-w-md">
                <h2 className="text-2xl font-semibold text-neutral-800 mb-6">
                  Today's Focus
                </h2>
                
                <div className="space-y-3">
                  {/* Work priority task */}
                  <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      </div>
                      <span className="text-neutral-800 font-medium">Item 1</span>
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
                      <span className="text-neutral-800 font-medium">Item 2</span>
                    </div>
                    <span className="px-3 py-1 bg-signal-100 text-signal-700 text-sm font-medium rounded-full border border-signal-200">
                      Home
                    </span>
                  </div>

                  {/* Social priority task */}
                  <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full border-2 border-noise-400"></div>
                      <span className="text-neutral-800 font-medium">Item 3</span>
                    </div>
                    <span className="px-3 py-1 bg-noise-100 text-noise-700 text-sm font-medium rounded-full border border-noise-200">
                      Social
                    </span>
                  </div>
                </div>
              </div>
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
                <div style={{ width: activeTaskWidth ? `${activeTaskWidth}px` : 'auto' }}>
                  <DraggedTaskCard task={activeTask} />
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

        <MissedReturnModal
          show={showMissedReturn}
          onClose={() => setShowMissedReturn(false)}
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
