import { Sun, Moon, BarChart3, Plus, User, LogOut } from 'lucide-react';
import useSupabaseStore from '../store/useSupabaseStore';
import { useState } from 'react';
import { AddTaskModal, AuthModal } from './';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../assets/logo.png';
import wordmarkImage from '../assets/wordmark.png';

interface HeaderProps {
  onShowWeeklyReview: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowWeeklyReview }) => {
  const { settings, updateSettings } = useSupabaseStore();
  const { user, signOut } = useAuth();
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src={logoImage} 
                  alt="Logo" 
                  className="w-10 h-10 drop-shadow-md object-contain"
                />
                <img 
                  src={wordmarkImage} 
                  alt="Fozzle" 
                  className="h-8 object-contain"
                />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-gray-400">
                  Focus on the next thing you need to do.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {user && (
                <button
                  onClick={() => setShowAddTask(true)}
                  className="inline-flex items-center px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add a task
                </button>
              )}
              
              {user && (
                              <button
                onClick={onShowWeeklyReview}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                title="Weekly Review"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              )}

              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                title="Toggle Theme"
              >
                {settings.darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:block">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-primary-500 text-white px-6 py-2.5 rounded-full hover:bg-primary-600 text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showAddTask && user && (
        <AddTaskModal onClose={() => setShowAddTask(false)} />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Header;
