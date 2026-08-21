import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GoogleLoginButton from './GoogleLoginButton';
import { Compass, Users, Sparkles, LogOut, Sun, Moon, Bike, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenMatcherModal }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand */}
          <div
            onClick={() => setActiveTab('explore')}
            className="flex items-center space-x-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                RideTribe
              </span>
              <span className="ml-1.5 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white border border-transparent dark:border-white/20">BLR</span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden sm:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'explore'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Post Intent</span>
            </button>

            <button
              onClick={() => setActiveTab('my-rides')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'my-rides' || activeTab === 'group' || activeTab === 'live'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>My Rides</span>
            </button>

            <button
              onClick={onOpenMatcherModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-white bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/20 hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
              <span>Match Engine</span>
            </button>
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center space-x-2">
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-transparent dark:border-white/10"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-white" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                {/* Profile Button - Avatar Only */}
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`p-1 rounded-full transition-transform hover:scale-105 ${
                    activeTab === 'profile'
                      ? 'ring-2 ring-slate-900 dark:ring-white'
                      : 'opacity-90 hover:opacity-100'
                  }`}
                  title={`${user.name} — View & Edit Profile`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 ring-1 ring-slate-300 dark:ring-white/30 flex items-center justify-center text-slate-700 dark:text-white font-bold overflow-hidden shadow-xs shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setActiveTab('auth');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <GoogleLoginButton
                  onSuccess={() => setActiveTab('explore')}
                  onRequireOnboarding={() => setActiveTab('onboarding')}
                  className="!py-1.5 !pl-1.5 !pr-3 text-[11px]"
                />
              </div>
            )}
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex sm:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'explore' ? 'text-black dark:text-white bg-slate-100 dark:bg-white/15' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Post</span>
          </button>

          <button
            onClick={() => setActiveTab('my-rides')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'my-rides' ? 'text-black dark:text-white bg-slate-100 dark:bg-white/15' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Rides</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'profile' ? 'text-black dark:text-white bg-slate-100 dark:bg-white/15' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            onClick={onOpenMatcherModal}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-white"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
            <span>Matcher</span>
          </button>
        </div>

      </div>
    </header>
  );
}
