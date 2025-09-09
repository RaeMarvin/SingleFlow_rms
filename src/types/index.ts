// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'signal' | 'noise';
  priority: 'work' | 'home' | 'social';
  completed: boolean;
  rejected?: boolean; // New field for NO list
  order: number; // for ordering within each category
  createdAt: Date;
  completedAt?: Date;
  rejectedAt?: Date; // New field for when task was rejected
  category_changed_at?: string; // New field for when category was changed
}

export interface Idea {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  promoted?: boolean; // if promoted to a task
}

// App state
export interface AppState {
  tasks: Task[];
  ideas: Idea[];
  dailyGoal: {
    signalRatio: number; // target percentage for signal tasks
    totalTasks: number;
  };
  stats: {
    signalCompleted: number;
    noiseCompleted: number;
    totalCompleted: number;
    signalRatio?: number; // ratio of Signal tasks to all tasks (optional)
    completedSignalRatio?: number; // ratio of completed Signal to completed tasks
  };
  settings: {
    darkMode: boolean;
    notifications: boolean;
    dailyReviewTime: string;
  };
}

// Store actions
export interface StoreActions {
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'order'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  rejectTask: (id: string) => void; // New action for rejecting tasks
  moveTask: (id: string, category: 'signal' | 'noise') => void;
  reorderTasks: (category: 'signal' | 'noise', taskIds: string[]) => void;
  
  // Idea actions
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt'>) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  promoteIdea: (id: string) => void;
  
  // Stats and settings
  updateStats: () => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  resetDailyProgress: () => void;
}

export type Store = AppState & StoreActions;
