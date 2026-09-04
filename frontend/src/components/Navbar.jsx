import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GoogleLoginButton from './GoogleLoginButton';
import { Compass, Users, Sparkles, LogOut, Sun, Moon, Bike, User, Plus, Menu, X, Search } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenHostTrip, onOpenMatcherModal }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Left: Brand & Desktop Nav Links */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => handleNav('explore-trips')}
              className="flex items-center space-x-2.5 focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-xs shadow-xs transition-transform group-hover:scale-105">
                <Bike className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm tracking-tight text-foreground">
                  RideTribe
                </span>
                <span className="text-[10px] uppercase font-mono font-medium px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                  BLR
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 text-xs">
              <button
                onClick={() => handleNav('explore-trips')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeTab === 'explore-trips'
                    ? 'text-foreground bg-secondary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                Explore
              </button>

              <button
                onClick={() => handleNav('my-rides')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeTab === 'my-rides' || activeTab === 'group' || activeTab === 'live'
                    ? 'text-foreground bg-secondary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                My Rides
              </button>

              <button
                onClick={() => {
                  onOpenMatcherModal();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 rounded-md font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                Match Pool
              </button>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Search Bar Widget (Desktop) */}
            <button
              onClick={() => handleNav('explore-trips')}
              className="hidden lg:flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-xs text-muted-foreground border border-border transition-colors w-52 justify-between"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Search routes...</span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border border-border text-foreground">
                ⌘K
              </kbd>
            </button>

            {/* High-Contrast Primary CTA: + Host Ride */}
            <button
              onClick={onOpenHostTrip}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-foreground text-background hover:opacity-90 active:scale-95 shadow-sm transition-all whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden xs:inline sm:inline">Host Ride</span>
              <span className="inline xs:hidden sm:hidden">Host</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full border border-border bg-background hover:bg-secondary text-foreground flex items-center justify-center transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 stroke-[1.75]" />
              ) : (
                <Moon className="w-4 h-4 stroke-[1.75]" />
              )}
            </button>

            {/* User Profile & Auth */}
            {user ? (
              <div className="flex items-center space-x-1.5 pl-1.5 border-l border-border">
                <button
                  onClick={() => handleNav('profile')}
                  className={`relative p-0.5 rounded-full transition-all ${
                    activeTab === 'profile'
                      ? 'ring-2 ring-foreground'
                      : 'hover:opacity-80'
                  }`}
                  title={`${user.name} Profile`}
                >
                  <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold text-foreground overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => {
                    logout();
                    handleNav('auth');
                  }}
                  className="w-7 h-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-secondary flex items-center justify-center transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <GoogleLoginButton
                  onSuccess={() => handleNav('explore-trips')}
                  onRequireOnboarding={() => handleNav('onboarding')}
                  className="!py-1.5 !pl-1.5 !pr-3 text-[11px]"
                />
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden w-8 h-8 rounded-full border border-border bg-background hover:bg-secondary text-foreground flex items-center justify-center transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>
        </div>

        {/* Responsive Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-border space-y-1 animate-in slide-in-from-top duration-150">
            <button
              onClick={() => handleNav('explore-trips')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'explore-trips'
                  ? 'bg-secondary text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              Explore Convoys
            </button>

            <button
              onClick={() => handleNav('my-rides')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'my-rides' || activeTab === 'group' || activeTab === 'live'
                  ? 'bg-secondary text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              My Rides & Active Convoys
            </button>

            <button
              onClick={() => {
                onOpenMatcherModal();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              Match Pool Simulator
            </button>

            {user && (
              <button
                onClick={() => handleNav('profile')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-secondary text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                My Profile & Garage
              </button>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
