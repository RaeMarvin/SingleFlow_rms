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

      moveTask: (id, category) => {
        get().updateTask(id, { category });
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
        const completed = tasks.filter((task) => task.completed);
        const signalCompleted = completed.filter((task) => task.category === 'signal').length;
        const noiseCompleted = completed.filter((task) => task.category === 'noise').length;
        const totalCompleted = completed.length;
        const signalRatio = totalCompleted > 0 ? signalCompleted / totalCompleted : 0;

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
      name: 'singleflow-storage',
      version: 1,
    }
  )
);

export default useStore;
