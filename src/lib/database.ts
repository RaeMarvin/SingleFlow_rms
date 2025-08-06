import { supabase, TaskRow, IdeaRow } from './supabase';
import { Task, Idea } from '../types';

// Get the current authenticated user's ID
const getUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

// Convert database rows to app types
const mapTaskFromDb = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  description: row.description || undefined,
  category: row.category,
  priority: row.priority,
  completed: row.completed,
  order: row.task_order,
  createdAt: new Date(row.created_at),
  completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
});

const mapIdeaFromDb = (row: IdeaRow): Idea => ({
  id: row.id,
  title: row.title,
  description: row.description || undefined,
  createdAt: new Date(row.created_at),
  promoted: row.promoted,
});

// Task operations
export const taskService = {
  async getAll(): Promise<Task[]> {
    const userId = await getUserId();
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('task_order', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data.map(mapTaskFromDb);
  },

  async create(task: Omit<Task, 'id' | 'createdAt' | 'order'>): Promise<Task | null> {
    console.log('Creating task in database:', task);
    const userId = await getUserId();
    if (!userId) {
      console.error('No authenticated user');
      return null;
    }
    
    console.log('User ID:', userId);
    
    // First, get all existing tasks in the same category to increment their orders
    const { data: existingTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id, task_order')
      .eq('user_id', userId)
      .eq('category', task.category);
    
    if (fetchError) {
      console.error('Error fetching existing tasks:', fetchError);
    }
    
    // Increment order of all existing tasks in the same category
    if (existingTasks && existingTasks.length > 0) {
      const updates = existingTasks.map(existingTask => ({
        id: existingTask.id,
        task_order: existingTask.task_order + 1
      }));
      
      // Update all tasks in batch
      const { error: updateError } = await supabase
        .from('tasks')
        .upsert(updates);
      
      if (updateError) {
        console.error('Error updating task orders:', updateError);
      } else {
        console.log(`Incremented order for ${updates.length} existing tasks`);
      }
    }

    const insertData = {
      id: crypto.randomUUID(),
      title: task.title,
      description: task.description || null,
      category: task.category,
      priority: task.priority,
      completed: task.completed,
      task_order: 0, // Always insert new tasks at the top
      created_at: new Date().toISOString(),
      completed_at: task.completedAt?.toISOString() || null,
      user_id: userId,
    };
    
    console.log('Inserting data:', insertData);

    const { data, error } = await supabase
      .from('tasks')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return null;
    }

    console.log('Task created successfully:', data);
    return mapTaskFromDb(data);
  },

  async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    const dbUpdates: Partial<TaskRow> = {
      ...(updates.title && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description || null }),
      ...(updates.category && { category: updates.category }),
      ...(updates.priority && { priority: updates.priority }),
      ...(updates.completed !== undefined && { completed: updates.completed }),
      ...(updates.order !== undefined && { task_order: updates.order }),
      ...(updates.completedAt !== undefined && { 
        completed_at: updates.completedAt?.toISOString() || null 
      }),
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return null;
    }

    return mapTaskFromDb(data);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return false;
    }

    return true;
  },
};

// Idea operations
export const ideaService = {
  async getAll(): Promise<Idea[]> {
    const userId = await getUserId();
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ideas:', error);
      return [];
    }

    return data.map(mapIdeaFromDb);
  },

  async create(idea: Omit<Idea, 'id' | 'createdAt'>): Promise<Idea | null> {
    const userId = await getUserId();
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('ideas')
      .insert([
        {
          id: crypto.randomUUID(),
          title: idea.title,
          description: idea.description || null,
          created_at: new Date().toISOString(),
          promoted: idea.promoted || false,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating idea:', error);
      return null;
    }

    return mapIdeaFromDb(data);
  },

  async update(id: string, updates: Partial<Idea>): Promise<Idea | null> {
    const dbUpdates: Partial<IdeaRow> = {
      ...(updates.title && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description || null }),
      ...(updates.promoted !== undefined && { promoted: updates.promoted }),
    };

    const { data, error } = await supabase
      .from('ideas')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating idea:', error);
      return null;
    }

    return mapIdeaFromDb(data);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting idea:', error);
      return false;
    }

    return true;
  },
};

// Settings operations
export const settingsService = {
  async get(): Promise<any> {
    const userId = await getUserId();
    if (!userId) {
      return {
        darkMode: false,
        notifications: true,
        dailyReviewTime: '18:00',
        dailyGoal: {
          signalRatio: 0.8,
          totalTasks: 10,
        },
      };
    }
    
    console.log('Getting settings for user:', userId);
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching settings:', error);
      // Return default settings if error
      return {
        darkMode: false,
        notifications: true,
        dailyReviewTime: '18:00',
        dailyGoal: {
          signalRatio: 0.8,
          totalTasks: 10,
        },
      };
    }

    // If no settings exist, return defaults
    if (!data || data.length === 0) {
      console.log('No settings found, returning defaults');
      return {
        darkMode: false,
        notifications: true,
        dailyReviewTime: '18:00',
        dailyGoal: {
          signalRatio: 0.8,
          totalTasks: 10,
        },
      };
    }

    console.log('Settings found:', data[0]);
    return {
      darkMode: data[0].dark_mode,
      notifications: data[0].notifications,
      dailyReviewTime: data[0].daily_review_time,
      dailyGoal: {
        signalRatio: data[0].daily_goal_signal_ratio,
        totalTasks: data[0].daily_goal_total_tasks,
      },
    };
  },

  async update(settings: any): Promise<boolean> {
    const userId = await getUserId();
    if (!userId) return false;
    
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        dark_mode: settings.darkMode,
        notifications: settings.notifications,
        daily_review_time: settings.dailyReviewTime,
        daily_goal_signal_ratio: settings.dailyGoal?.signalRatio || 0.8,
        daily_goal_total_tasks: settings.dailyGoal?.totalTasks || 10,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating settings:', error);
      return false;
    }

    return true;
  },
};
