import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Idea, Store } from '../types';

const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [],
      ideas: [],
      dailyGoal: {
        signalRatio: 0.8, // 80% signal tasks
        totalTasks: 10,
      },
      stats: {
        signalCompleted: 0,
        noiseCompleted: 0,
        totalCompleted: 0,
        signalRatio: 0,
      },
      settings: {
        darkMode: false,
        notifications: true,
        dailyReviewTime: '18:00',
      },

      // Task actions
      addTask: (taskData) => {
        const state = get();
        
        // Create new task with order 0 (top of the list)
        const newTask: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          order: 0,
          createdAt: new Date(),
        };
        
        // Increment order of all existing tasks in the same category
        const updatedTasks = state.tasks.map((task) => 
          task.category === taskData.category
            ? { ...task, order: task.order + 1 }
            : task
        );
        
        set(() => ({
          tasks: [newTask, ...updatedTasks],
        }));
        get().updateStats();
      },

      updateTask: (id, updates) => {
        console.log('updateTask called with id:', id, 'updates:', updates);
        set((state) => {
          const newTasks = state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          );
          console.log('New tasks after update:', newTasks);
          return { tasks: newTasks };
        });
        if (updates.completed !== undefined) {
          get().updateStats();
        }
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
        get().updateStats();
      },

      toggleTaskComplete: (id) => {
        console.log('toggleTaskComplete called with id:', id);
        const task = get().tasks.find((t) => t.id === id);
        console.log('Found task:', task);
        if (task) {
          const updates: Partial<Task> = {
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : undefined,
          };
          console.log('Updating task with:', updates);
          get().updateTask(id, updates);
        }
      },

      rejectTask: (id) => {
        console.log('rejectTask called with id:', id);
        const task = get().tasks.find((t) => t.id === id);
        console.log('Found task:', task);
        if (task) {
          const updates: Partial<Task> = {
            rejected: !task.rejected,
            rejectedAt: !task.rejected ? new Date() : undefined,
            completed: false, // Reset completed status when rejecting
            completedAt: undefined
          };
          console.log('Updating task with:', updates);
          get().updateTask(id, updates);
        }
      },

      moveTask: (id, category) => {
        // When moving a task to Signal or Noise, clear rejected status
        const updates: Partial<Task> = {
          category,
          rejected: false, // Clear rejected status
          rejectedAt: undefined, // Clear rejected timestamp
        };
        get().updateTask(id, updates);
      },

      reorderTasks: (category, taskIds) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.category === category) {
              const newOrder = taskIds.findIndex(taskId => taskId === task.id);
              return newOrder !== -1 ? { ...task, order: newOrder } : task;
            }
            return task;
          }),
        }));
      },

      // Idea actions
      addIdea: (ideaData) => {
        const newIdea: Idea = {
          ...ideaData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        set((state) => ({
          ideas: [...state.ideas, newIdea],
        }));
      },

      deleteIdea: (id) => {
        set((state) => ({
          ideas: state.ideas.filter((idea) => idea.id !== id),
        }));
      },

      promoteIdea: (id) => {
        const idea = get().ideas.find((i) => i.id === id);
        if (idea) {
          get().addTask({
            title: idea.title,
            description: idea.description,
            category: 'signal',
            priority: 'medium',
            completed: false,
          });
          set((state) => ({
            ideas: state.ideas.map((i) =>
              i.id === id ? { ...i, promoted: true } : i
            ),
          }));
        }
      },

      updateIdea: (id, updates) => {
        set((state) => ({
          ideas: state.ideas.map((idea) =>
            idea.id === id ? { ...idea, ...updates } : idea
          ),
        }));
      },

      // Stats and settings
      updateStats: () => {
        const { tasks } = get();
        
        // Get today's date (start of day) in local timezone
        const today = new Date();
        const todayDateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        console.log('Debug (useStore) - Today date string:', todayDateString);
        
        // Filter for tasks completed today only
        const completedToday = tasks.filter((task) => {
          if (!task.completed || !task.completedAt) return false;
          
          // Convert completedAt to date string (YYYY-MM-DD)
          const completedDate = new Date(task.completedAt);
          const completedDateString = completedDate.toISOString().split('T')[0];
          
          return completedDateString === todayDateString;
        });
        
        const signalCompleted = completedToday.filter((task) => task.category === 'signal').length;
        const noiseCompleted = completedToday.filter((task) => task.category === 'noise').length;
        const totalCompleted = completedToday.length;
        const signalRatio = totalCompleted > 0 ? signalCompleted / totalCompleted : 0;

        console.log('Debug (useStore) - Stats:', {
          completedToday: completedToday.length,
          signalCompleted,
          noiseCompleted,
          totalCompleted,
          signalRatio
        });

        set({
          stats: {
            signalCompleted,
            noiseCompleted,
            totalCompleted,
            signalRatio,
          },
        });
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      resetDailyProgress: () => {
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
    }),
    {
      name: 'fozzle-storage',
      version: 1,
    }
  )
);

export default useStore;
