import { useEffect, useState } from 'react';
import useSupabaseStore from '../store/useSupabaseStore';
import { supabase } from '../lib/supabase';
import { useConfetti } from '../hooks/useConfetti';

interface DebugInfo {
  userId: string;
  tasksCount: number;
  signalTasks: number;
  noiseTasks: number;
  completedTasks: number;
  statsSignalCompleted: number;
  supabaseConnection: boolean;
  lastError: string | null;
}

export default function DebugPanel() {
  const { triggerConfetti } = useConfetti();
  const { resetConfetti } = useSupabaseStore();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    userId: '',
    tasksCount: 0,
    signalTasks: 0,
    noiseTasks: 0,
    completedTasks: 0,
    statsSignalCompleted: 0,
    supabaseConnection: false,
    lastError: null,
  });
  const [showDebug, setShowDebug] = useState(false);
  const tasks = useSupabaseStore(state => state.tasks);
  const stats = useSupabaseStore(state => state.stats);

  useEffect(() => {
    const getUserId = () => {
      let userId = localStorage.getItem('fozzle-user-id');
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('fozzle-user-id', userId);
      }
      return userId;
    };

    const testConnection = async () => {
      try {
        const { error } = await supabase
          .from('tasks')
          .select('id')
          .eq('user_id', getUserId())
          .limit(1);
        
        const signalTasks = tasks.filter(t => t.category === 'signal').length;
        const noiseTasks = tasks.filter(t => t.category === 'noise').length;
        const completedTasks = tasks.filter(t => t.completed).length;
        
        setDebugInfo({
          userId: getUserId(),
          tasksCount: tasks.length,
          signalTasks,
          noiseTasks,
          completedTasks,
          statsSignalCompleted: stats.signalCompleted,
          supabaseConnection: !error,
          lastError: error?.message || null,
        });
      } catch (err) {
        setDebugInfo(prev => ({
          ...prev,
          supabaseConnection: false,
          lastError: err instanceof Error ? err.message : 'Unknown error',
        }));
      }
    };

    testConnection();
  }, [tasks]);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded text-xs"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded shadow-lg border text-xs max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Debug Info</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div><strong>User ID:</strong> {debugInfo.userId.slice(0, 8)}...</div>
        <div><strong>Total Tasks:</strong> {debugInfo.tasksCount}</div>
        <div><strong>Signal Tasks:</strong> {debugInfo.signalTasks}</div>
        <div><strong>Noise Tasks:</strong> {debugInfo.noiseTasks}</div>
        <div><strong>Completed:</strong> {debugInfo.completedTasks}</div>
        <div><strong>Signal Ratio (all):</strong> {((stats.signalRatio ?? 0) * 100).toFixed(1)}%</div>
        <div><strong>Signal Ratio (completed):</strong> {((stats.completedSignalRatio || 0) * 100).toFixed(1)}%</div>
        <div><strong>Stats Signal:</strong> {debugInfo.statsSignalCompleted}</div>
        <div><strong>Supabase:</strong> 
          <span className={debugInfo.supabaseConnection ? 'text-green-600' : 'text-red-600'}>
            {debugInfo.supabaseConnection ? ' Connected' : ' Error'}
          </span>
        </div>
        {debugInfo.lastError && (
          <div className="text-red-600 text-xs">
            <strong>Error:</strong> {debugInfo.lastError}
          </div>
        )}
      </div>
      
      <div className="mt-2 space-y-1">
        <button
          onClick={async () => {
            try {
              const loadData = useSupabaseStore.getState().loadData;
              await loadData();
              alert('Data refreshed!');
            } catch (err) {
              alert('Error refreshing: ' + (err instanceof Error ? err.message : 'Unknown'));
            }
          }}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs w-full"
        >
          Refresh Data
        </button>
        
        <button
          onClick={async () => {
            try {
              // Test basic connection first
              const { error: testError } = await supabase
                .from('tasks')
                .select('*')
                .limit(1);
              
              if (testError) {
                alert('Connection test failed: ' + testError.message);
                return;
              }
              
              // Create a test task
              const userId = localStorage.getItem('fozzle-user-id') || crypto.randomUUID();
              localStorage.setItem('fozzle-user-id', userId);
              
              const { error } = await supabase
                .from('tasks')
                .insert([{
                  id: crypto.randomUUID(),
                  title: 'Debug Test Task',
                  description: 'This is a test task to verify connection',
                  category: 'signal',
                  priority: 'medium',
                  completed: false,
                  user_id: userId,
                  created_at: new Date().toISOString(),
                }])
                .select();
              
              if (error) {
                alert('Error creating test task: ' + error.message);
              } else {
                alert('Test task created successfully! Reloading app...');
                // Trigger a manual reload of data
                const loadData = useSupabaseStore.getState().loadData;
                await loadData();
                window.location.reload();
              }
            } catch (err) {
              alert('Error: ' + (err instanceof Error ? err.message : 'Unknown'));
            }
          }}
          className="bg-green-500 text-white px-2 py-1 rounded text-xs w-full"
        >
          Create Test Task
        </button>

        <button
          onClick={() => {
            triggerConfetti();
          }}
          className="bg-purple-500 text-white px-2 py-1 rounded text-xs w-full"
        >
          Test Confetti 🎉
        </button>

        <button
          onClick={() => {
            resetConfetti();
            alert(`Confetti threshold reset! Confetti will fire when you cross from below 80% to 80%+ completed Signal ratio. Currently at ${((stats.completedSignalRatio || 0) * 100).toFixed(1)}%`);
          }}
          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs w-full"
        >
          Reset Confetti
        </button>
      </div>
    </div>
  );
}
