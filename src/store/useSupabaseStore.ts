import { create } from 'zustand';
import { Task, Store } from '../types';
import { taskService, ideaService, settingsService } from '../lib/database';

const useSupabaseStore = create<Store & { 
  isLoading: boolean;
  loadData: () => Promise<void>;
  syncWithSupabase: boolean;
  hasTriggeredConfetti: boolean;
  previousCompletedSignalRatio: number;
  setConfettiTriggered: () => void;
  resetConfetti: () => void;
}>()((set, get) => ({
  // Initial state
  tasks: [],
  ideas: [],
  isLoading: false,
  syncWithSupabase: true,
  hasTriggeredConfetti: false,
  previousCompletedSignalRatio: 0,
  dailyGoal: {
    signalRatio: 0.8,
    totalTasks: 10,
  },
  stats: {
    signalCompleted: 0,
    noiseCompleted: 0,
    totalCompleted: 0,
    signalRatio: 0,
    completedSignalRatio: 0,
  },
  settings: {
    darkMode: false,
    notifications: true,
    dailyReviewTime: '18:00',
  },

  // Load initial data from Supabase
  loadData: async () => {
    set({ isLoading: true });
    try {
      const [tasks, ideas, settings] = await Promise.all([
        taskService.getAll(),
        ideaService.getAll(),
        settingsService.get(),
      ]);

      set({
        tasks,
        ideas,
        settings: settings.settings || settings,
        dailyGoal: settings.dailyGoal || { signalRatio: 0.8, totalTasks: 10 },
        isLoading: false,
      });

      get().updateStats();
    } catch (error) {
      console.error('Error loading data from Supabase:', error);
      set({ isLoading: false });
    }
  },

  // Task actions
  addTask: async (taskData) => {
    console.log('Adding task:', taskData);
    try {
      const newTask = await taskService.create({
        ...taskData,
        completed: false,
      });

      console.log('Task created:', newTask);

      if (newTask) {
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
        get().updateStats();
        console.log('Task added to store');
      } else {
        console.error('Failed to create task - no task returned');
      }
    } catch (error) {
      console.error('Error in addTask:', error);
    }
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    const originalTask = get().tasks.find(t => t.id === id);
    if (!originalTask) return;

    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    }));

    try {
      await taskService.update(id, updates);
    } catch (error) {
      // Revert on error
      console.error('Error updating task:', error);
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? originalTask : task
        )
      }));
      throw error;
    }
  },

  deleteTask: async (id) => {
    // Optimistically update UI
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));

    // Sync with Supabase
    const success = await taskService.delete(id);
    
    if (!success) {
      console.error('Failed to delete task from Supabase');
      get().loadData(); // Reload from server
    }

    get().updateStats();
  },

    toggleTaskComplete: async (id) => {
    const { tasks } = get();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompletedStatus = !task.completed;
    const completedAt = newCompletedStatus ? new Date() : undefined;

    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === id 
          ? { 
              ...t, 
              completed: newCompletedStatus,
              completedAt
            }
          : t
      )
    }));

    // Update stats immediately after optimistic update for instant UI feedback
    get().updateStats();

    try {
      await taskService.update(id, { 
        completed: newCompletedStatus,
        completedAt
      });
      
      // Don't update stats again - the optimistic update should have handled UI updates
      console.log('Debug - Task completion synced to server successfully');
    } catch (error) {
      // Revert on error
      console.error('Error toggling task completion:', error);
      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === id ? task : t
        )
      }));
      // Update stats after revert
      get().updateStats();
      throw error;
    }
  },

  rejectTask: async (id) => {
    const { tasks } = get();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newRejectedStatus = !task.rejected;
    const rejectedAt = newRejectedStatus ? new Date() : undefined;

    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === id 
          ? { 
              ...t, 
              rejected: newRejectedStatus,
              rejectedAt,
              completed: false, // Reset completed status when rejecting
              completedAt: undefined
            }
          : t
      )
    }));

    // Update stats immediately after optimistic update for instant UI feedback
    get().updateStats();

    try {
      await taskService.update(id, { 
        rejected: newRejectedStatus,
        rejectedAt,
        completed: false,
        completedAt: undefined
      });
      
      console.log('Debug - Task rejection synced to server successfully');
    } catch (error) {
      // Revert on error
      console.error('Error rejecting task:', error);
      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === id ? task : t
        )
      }));
      // Update stats after revert
      get().updateStats();
      throw error;
    }
  },

  moveTask: async (id, category) => {
    // When moving a task to Signal or Noise, clear rejected status
    const updates: Partial<Task> = {
      category,
      rejected: false, // Clear rejected status
      rejectedAt: undefined, // Clear rejected timestamp
    };
    
    await get().updateTask(id, updates);
    get().updateStats(); // Ensure stats are updated after moving tasks
  },

  reorderTasks: async (_category, taskIds) => {
    // Update the order of tasks in the specified category
    const updates = taskIds.map((taskId, index) => 
      get().updateTask(taskId, { order: index })
    );
    
    await Promise.all(updates);
  },

  // Idea actions
  addIdea: async (ideaData) => {
    const newIdea = await ideaService.create({
      ...ideaData,
      promoted: false,
    });

    if (newIdea) {
      set((state) => ({
        ideas: [newIdea, ...state.ideas],
      }));
    }
  },

  updateIdea: async (id, updates) => {
    // Optimistically update UI
    set((state) => ({
      ideas: state.ideas.map((idea) =>
        idea.id === id ? { ...idea, ...updates } : idea
      ),
    }));

    // Sync with Supabase
    const updatedIdea = await ideaService.update(id, updates);
    
    if (!updatedIdea) {
      console.error('Failed to update idea in Supabase');
      get().loadData(); // Reload from server
    }
  },

  deleteIdea: async (id) => {
    // Optimistically update UI
    set((state) => ({
      ideas: state.ideas.filter((idea) => idea.id !== id),
    }));

    // Sync with Supabase
    const success = await ideaService.delete(id);
    
    if (!success) {
      console.error('Failed to delete idea from Supabase');
      get().loadData(); // Reload from server
    }
  },

  promoteIdea: async (id: string, category: 'signal' | 'noise' = 'signal') => {
    const idea = get().ideas.find((i) => i.id === id);
    if (idea) {
      // Create the task
      await get().addTask({
        title: idea.title,
        description: idea.description,
        category,
        priority: 'medium',
        completed: false,
      });

      // Mark idea as promoted
      await get().updateIdea(id, { promoted: true });
    }
  },

  // Stats and settings
  updateStats: () => {
    const { tasks } = get();
    
    // Get today's date (start of day) in local timezone
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log('Debug - Today date string:', todayDateString);
    console.log('Debug - All tasks:', tasks.map(t => ({ 
      id: t.id.slice(0,8), 
      completed: t.completed, 
      completedAt: t.completedAt,
      category: t.category 
    })));
    
    // All tasks (completed and incomplete)
    const signalTasks = tasks.filter((task) => task.category === 'signal');
    const totalTasks = tasks.length;
    
    // Filter for tasks completed today only
    const completedToday = tasks.filter((task) => {
      if (!task.completed || !task.completedAt) return false;
      
      // Convert completedAt to date string (YYYY-MM-DD)
      const completedDate = new Date(task.completedAt);
      const completedDateString = completedDate.toISOString().split('T')[0];
      
      const isToday = completedDateString === todayDateString;
      console.log('Debug - Task', task.id.slice(0, 8), 'completed:', completedDateString, 'vs today:', todayDateString, 'isToday:', isToday, 'category:', task.category);
      
      return isToday;
    });
    
    console.log('Debug - Completed today:', completedToday.length);
    
    const signalCompleted = completedToday.filter((task) => task.category === 'signal').length;
    const noiseCompleted = completedToday.filter((task) => task.category === 'noise').length;
    const totalCompleted = completedToday.length;
    
    // Calculate ratios
    const signalRatio = totalTasks > 0 ? signalTasks.length / totalTasks : 0;
    const completedSignalRatio = totalCompleted > 0 ? signalCompleted / totalCompleted : 0;

    console.log('Debug - Final stats:', {
      signalCompleted,
      noiseCompleted,
      totalCompleted,
      signalRatio,
      completedSignalRatio,
      previousCompletedSignalRatio: get().previousCompletedSignalRatio,
      hasTriggeredConfetti: get().hasTriggeredConfetti
    });

    // Check if we should trigger confetti: crossing from below 80% to 80%+ 
    const previousRatio = get().previousCompletedSignalRatio;
    const crossedThreshold = previousRatio < 0.8 && completedSignalRatio >= 0.8;
    const shouldTriggerConfetti = crossedThreshold && totalCompleted > 0;
    
    console.log('Debug - Confetti trigger check:', {
      previousRatio: (previousRatio * 100).toFixed(1) + '%',
      currentRatio: (completedSignalRatio * 100).toFixed(1) + '%',
      crossedThreshold,
      hasCompletedTasks: totalCompleted > 0,
      shouldTrigger: shouldTriggerConfetti
    });

    set({
      stats: {
        signalCompleted,
        noiseCompleted,
        totalCompleted,
        signalRatio, // This is now the ratio of all Signal tasks to all tasks
        completedSignalRatio, // This is the ratio of completed Signal to completed tasks
      },
      previousCompletedSignalRatio: completedSignalRatio, // Always update previous ratio
    });

    // Trigger confetti if conditions are met (crossed threshold)
    if (shouldTriggerConfetti) {
      console.log('Debug - 🎉 THRESHOLD CROSSED! Triggering confetti!', { 
        from: (previousRatio * 100).toFixed(1) + '%',
        to: (completedSignalRatio * 100).toFixed(1) + '%',
        signalCompleted, 
        totalCompleted 
      });
      // Dispatch custom event that components can listen to
      window.dispatchEvent(new CustomEvent('fozzle-confetti-trigger', { 
        detail: { 
          completedSignalRatio,
          signalCompleted,
          totalCompleted,
          crossedThreshold: true
        } 
      }));
    } else {
      console.log('Debug - No confetti triggered. Threshold not crossed.');
    }
  },

  updateSettings: async (newSettings) => {
    const currentSettings = get().settings;
    const updatedSettings = { ...currentSettings, ...newSettings };
    
    set({ settings: updatedSettings });

    // Sync with Supabase
    const success = await settingsService.update({
      ...updatedSettings,
      dailyGoal: get().dailyGoal,
    });
    
    if (!success) {
      console.error('Failed to update settings in Supabase');
    }
  },

  resetDailyProgress: async () => {
    // Delete all tasks
    const taskIds = get().tasks.map(t => t.id);
    await Promise.all(taskIds.map(id => taskService.delete(id)));

    // Delete all ideas
    const ideaIds = get().ideas.map(i => i.id);
    await Promise.all(ideaIds.map(id => ideaService.delete(id)));

    set({
      tasks: [],
      ideas: [],
      stats: {
        signalCompleted: 0,
        noiseCompleted: 0,
        totalCompleted: 0,
        signalRatio: 0,
      },
    });
  },

  setConfettiTriggered: () => {
    set({ hasTriggeredConfetti: true });
  },

  resetConfetti: () => {
    set({ 
      hasTriggeredConfetti: false,
      previousCompletedSignalRatio: 0
    });
  },
}));

export default useSupabaseStore;
