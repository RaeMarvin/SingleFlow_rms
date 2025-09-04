import { create } from 'zustand';
import { Task, Store } from '../types';
import { taskService, ideaService, settingsService } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';

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
    const tempId = uuidv4(); // Generate a temporary ID
    const optimisticTask = { ...taskData, id: tempId, completed: false, createdAt: new Date(), order: 0 }; // Add createdAt and order for consistency

    // Optimistically add the task to the store
    set((state) => ({
      tasks: [optimisticTask, ...state.tasks],
    }));
    get().updateStats(); // Update stats immediately for UI feedback
    console.log('Optimistically added task:', optimisticTask);

    try {
      const newTask = await taskService.create({
        ...taskData,
        completed: false,
      });

      console.log('Task created on server:', newTask);

      if (newTask) {
        // Replace the optimistic task with the actual task from the server
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === tempId ? newTask : task
          ),
        }));
        get().updateStats(); // Update stats again with the actual task
        console.log('Task updated in store with actual ID');
      } else {
        // If no task is returned, remove the optimistic task
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== tempId),
        }));
        get().updateStats(); // Revert stats
        console.error('Failed to create task - no task returned, reverting optimistic update');
      }
    } catch (error) {
      // Revert optimistic update on error
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== tempId),
      }));
      get().updateStats(); // Revert stats
      console.error('Error in addTask, reverting optimistic update:', error);
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
      // Update stats after successful task update
      get().updateStats();
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

    // When completing a task, we must also un-reject it.
    const updates: Partial<Task> = {
      completed: newCompletedStatus,
      completedAt,
    };

    if (newCompletedStatus) {
      updates.rejected = false;
      updates.rejectedAt = undefined;
    }

    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === id 
          ? { ...t, ...updates }
          : t
      )
    }));

    // Update stats immediately after optimistic update for instant UI feedback
    get().updateStats();

    try {
      await taskService.update(id, updates);
      
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
    // Signal tasks cannot be rejected, so do nothing if the task is a signal.
    if (!task || task.category === 'signal') return;

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
        priority: 'work',
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
    today.setHours(0, 0, 0, 0);

    // Filter for tasks completed today only
    const completedToday = tasks.filter((task) => {
      if (!task.completed || !task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate.getFullYear() === today.getFullYear() &&
        completedDate.getMonth() === today.getMonth() &&
        completedDate.getDate() === today.getDate();
    });

    // Filter for NO (rejected) tasks today - only Noise tasks can be rejected
    const noToday = tasks.filter((task) => {
      if (task.category !== 'noise' || !task.rejected || !task.rejectedAt) return false;
      const rejectedDate = new Date(task.rejectedAt);
      return rejectedDate.getFullYear() === today.getFullYear() &&
        rejectedDate.getMonth() === today.getMonth() &&
        rejectedDate.getDate() === today.getDate();
    });

    const signalCompleted = completedToday.filter((task) => task.category === 'signal').length;
    const noiseCompleted = completedToday.filter((task) => task.category === 'noise').length;
    const totalCompleted = completedToday.length;

    // Fozzle Score: (Signal Done + NOs) / (Total Done + NOs + Outstanding Signals)
    const uncompletedSignal = tasks.filter(t => t.category === 'signal' && !t.completed).length;
    const fozzleNumerator = signalCompleted + noToday.length;
    const fozzleDenominator = totalCompleted + noToday.length + uncompletedSignal;
    const completedSignalRatio = fozzleDenominator > 0 ? fozzleNumerator / fozzleDenominator : 0;

    // Check if we should trigger confetti: crossing from below 80% to 80%+ 
    const previousRatio = get().previousCompletedSignalRatio;
    const crossedThreshold = previousRatio < 0.8 && completedSignalRatio >= 0.8;
    const shouldTriggerConfetti = crossedThreshold && totalCompleted > 0;

    set({
      stats: {
        signalCompleted,
        noiseCompleted,
        totalCompleted,
        completedSignalRatio, // This is now the ratio of (completed Signal + NO) to (completed + NO)
      },
      previousCompletedSignalRatio: completedSignalRatio, // Always update previous ratio
    });

    // Trigger confetti if conditions are met (crossed threshold)
    if (shouldTriggerConfetti) {
      window.dispatchEvent(new CustomEvent('fozzle-confetti-trigger', { 
        detail: { 
          completedSignalRatio,
          signalCompleted,
          totalCompleted,
          crossedThreshold: true
        } 
      }));
      window.dispatchEvent(new CustomEvent('fozzle-border-flash-trigger', {
        detail: {
          completedSignalRatio,
          signalCompleted,
          totalCompleted,
          crossedThreshold: true
        }
      }));
    }
  },

  updateSettings: async (newSettings) => {
    const currentSettings = get().settings;
    const updatedSettings = { ...currentSettings, ...newSettings };
    set({ settings: updatedSettings });
    // Sync with Supabase
    await settingsService.update(updatedSettings);
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
}))

export default useSupabaseStore;
