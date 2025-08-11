import { create } from 'zustand';
import { Task, Store } from '../types';
import { taskService, ideaService, settingsService } from '../lib/database';

const useSupabaseStore = create<Store & { 
  isLoading: boolean;
  loadData: () => Promise<void>;
  syncWithSupabase: boolean;
}>()((set, get) => ({
  // Initial state
  tasks: [],
  ideas: [],
  isLoading: false,
  syncWithSupabase: true,
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

  updateTask: async (id, updates) => {
    // Optimistically update UI
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));

    // Sync with Supabase
    const updatedTask = await taskService.update(id, updates);
    
    if (!updatedTask) {
      // Revert on error
      console.error('Failed to update task in Supabase');
      get().loadData(); // Reload from server
    }

    // Always update stats when any task is modified
    get().updateStats();
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
    console.log('toggleTaskComplete called with id:', id);
    const task = get().tasks.find((t) => t.id === id);
    console.log('Found task:', task);
    
    if (task) {
      const updates: Partial<Task> = {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : undefined,
      };
      console.log('Updating task with:', updates);
      await get().updateTask(id, updates);
    }
  },

  moveTask: async (id, category) => {
    await get().updateTask(id, { category });
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

  promoteIdea: async (id) => {
    const idea = get().ideas.find((i) => i.id === id);
    if (idea) {
      // Create the task
      await get().addTask({
        title: idea.title,
        description: idea.description,
        category: 'signal',
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
      
      console.log('Debug - Task completed date:', completedDateString, 'vs today:', todayDateString);
      
      return completedDateString === todayDateString;
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
      completedSignalRatio
    });

    set({
      stats: {
        signalCompleted,
        noiseCompleted,
        totalCompleted,
        signalRatio, // This is now the ratio of all Signal tasks to all tasks
        completedSignalRatio, // This is the ratio of completed Signal to completed tasks
      },
    });
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
}));

export default useSupabaseStore;
