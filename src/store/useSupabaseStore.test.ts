import { describe, it, expect, beforeEach, vi } from 'vitest';
import useSupabaseStore from './useSupabaseStore';
import { Task } from '../types';

// Mock the necessary parts of the store
const initialState = useSupabaseStore.getState();

describe('useSupabaseStore: updateStats', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test
    useSupabaseStore.setState(initialState);
  });

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  it('should calculate a Fozzle score of 0 when there are no tasks', () => {
    useSupabaseStore.setState({ tasks: [] });
    useSupabaseStore.getState().updateStats();
    const { stats } = useSupabaseStore.getState();
    expect(stats.completedSignalRatio).toBe(0);
  });

  it('should calculate a Fozzle score of 1 when only Signal tasks are completed today and no outstanding signals', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Signal 1', category: 'signal', completed: true, completedAt: today, createdAt: today, order: 0, priority: 'work' },
      { id: '2', title: 'Signal 2', category: 'signal', completed: true, completedAt: today, createdAt: today, order: 1, priority: 'work' },
    ];
    useSupabaseStore.setState({ tasks });
    useSupabaseStore.getState().updateStats();
    const { stats } = useSupabaseStore.getState();
    expect(stats.completedSignalRatio).toBe(1);
  });

  it('should correctly calculate the Fozzle score based on the new formula', () => {
    // 3 completed signals, 1 completed noise, 2 rejected NOs, 4 outstanding signals
    const tasks: Task[] = [
      // Completed today
      { id: '1', title: 'Signal 1', category: 'signal', completed: true, completedAt: today, createdAt: today, order: 0, priority: 'work' },
      { id: '2', title: 'Signal 2', category: 'signal', completed: true, completedAt: today, createdAt: today, order: 1, priority: 'work' },
      { id: '3', title: 'Signal 3', category: 'signal', completed: true, completedAt: today, createdAt: today, order: 2, priority: 'work' },
      { id: '4', title: 'Noise 1', category: 'noise', completed: true, completedAt: today, createdAt: today, order: 3, priority: 'work' },
      // Rejected today
      { id: '5', title: 'Noise 2', category: 'noise', completed: false, rejected: true, rejectedAt: today, createdAt: today, order: 4, priority: 'work' },
      { id: '6', title: 'Noise 3', category: 'noise', completed: false, rejected: true, rejectedAt: today, createdAt: today, order: 5, priority: 'work' },
      // Outstanding signals
      { id: '7', title: 'Signal 4', category: 'signal', completed: false, createdAt: today, order: 6, priority: 'work' },
      { id: '8', title: 'Signal 5', category: 'signal', completed: false, createdAt: today, order: 7, priority: 'work' },
      { id: '9', title: 'Signal 6', category: 'signal', completed: false, createdAt: today, order: 8, priority: 'work' },
      { id: '10', title: 'Signal 7', category: 'signal', completed: false, createdAt: today, order: 9, priority: 'work' },
      // Data from other days (should be ignored)
      { id: '11', title: 'Old Signal', category: 'signal', completed: true, completedAt: yesterday, createdAt: yesterday, order: 10, priority: 'work' },
    ];

    useSupabaseStore.setState({ tasks });
    useSupabaseStore.getState().updateStats();
    const { stats } = useSupabaseStore.getState();

    const signalCompleted = 3;
    const totalCompleted = 4;
    const noToday = 2;
    const uncompletedSignal = 4;

    const numerator = signalCompleted + noToday; // 3 + 2 = 5
    const denominator = totalCompleted + noToday + uncompletedSignal; // 4 + 2 + 4 = 10
    const expectedRatio = numerator / denominator; // 5 / 10 = 0.5

    expect(stats.completedSignalRatio).toBe(expectedRatio);
  });

  it('should trigger confetti when the threshold is crossed', () => {
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    
    const tasksForThreshold: Task[] = [
        { id: '1', title: 'Signal 1', category: 'signal', completed: true, completedAt: today, createdAt: today, order: 0, priority: 'work' },
        { id: '2', title: 'Signal 2', category: 'signal', completed: true, completedAt: today, createdAt: today, order: 1, priority: 'work' },
        { id: '3', title: 'Signal 3', category: 'signal', completed: true, completedAt: today, createdAt: today, order: 2, priority: 'work' },
        { id: '4', title: 'Signal 4', category: 'signal', completed: true, completedAt: today, createdAt: today, order: 3, priority: 'work' },
        { id: '5', title: 'Noise 1', category: 'noise', completed: true, completedAt: today, createdAt: today, order: 4, priority: 'work' },
    ];

    useSupabaseStore.setState({ tasks: tasksForThreshold, previousCompletedSignalRatio: 0.7 });
    useSupabaseStore.getState().updateStats();

    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
    expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
            type: 'fozzle-confetti-trigger'
        })
    );

    dispatchEventSpy.mockRestore();
  });
});
