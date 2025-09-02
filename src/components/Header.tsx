import { BarChart3, Plus, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import AddTaskModal from './AddTaskModal';
import { AuthModal } from './AuthModal';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../assets/logo.png';
import wordmarkImage from '../assets/wordmark.png';

interface HeaderProps {
  onShowWeeklyReview: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowWeeklyReview }) => {
  const { user, signOut } = useAuth();
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo section */}
            <div className="flex items-center space-x-2">
              <img 
                src={logoImage} 
                alt="Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md object-contain"
              />
              <img 
                src={wordmarkImage} 
                alt="Fozzle" 
                className="h-6 sm:h-8 object-contain"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {user && (
                <button
                  onClick={() => setShowAddTask(true)}
                  className="inline-flex items-center px-3 py-2 sm:px-6 sm:py-2.5 text-white rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                  style={{backgroundColor: '#7dc3ff'}}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6bb6ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7dc3ff'}
                >
                  <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="sm:hidden">Task</span>
                  <span className="hidden sm:inline">Add a task</span>
                </button>
              )}
              
              {user && (
                              <button
                onClick={onShowWeeklyReview}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                title="Weekly Review"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              )}



              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:block">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                  className="text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  style={{backgroundColor: '#7dc3ff'}}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6bb6ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7dc3ff'}
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
