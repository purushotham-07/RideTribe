import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import PostIntentPage from './pages/PostIntentPage';
import MyRidesPage from './pages/MyRidesPage';
import GroupConfirmationPage from './pages/GroupConfirmationPage';
import LiveRidePage from './pages/LiveRidePage';
import PostRideRatingPage from './pages/PostRideRatingPage';
import ProfilePage from './pages/ProfilePage';
import MatchVisualizerModal from './components/MatchVisualizerModal';

// Google OAuth Client ID (can be configured via VITE_GOOGLE_CLIENT_ID in .env)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1088497672288-placeholder.apps.googleusercontent.com";

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'my-rides' | 'group' | 'live' | 'rating' | 'auth' | 'profile' | 'onboarding'
  const [selectedGroupId, setSelectedGroupId] = useState(1);
  const [isMatcherOpen, setIsMatcherOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-medium text-slate-500 mt-3">Loading RideTribe...</p>
      </div>
    );
  }

  const handleOpenGroup = (groupId) => {
    setSelectedGroupId(groupId);
    setActiveTab('group');
  };

  const handleOpenLive = (groupId) => {
    setSelectedGroupId(groupId);
    setActiveTab('live');
  };

  const handleOpenRating = (groupId) => {
    setSelectedGroupId(groupId);
    setActiveTab('rating');
  };

  const handleIntentCreated = () => {
    setActiveTab('my-rides');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-150">
      
      {/* Navbar (Only avatar displayed for user) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMatcherModal={() => setIsMatcherOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 pb-8">
        {activeTab === 'auth' && (
          <AuthPage
            onSuccess={() => setActiveTab('explore')}
            onRequireOnboarding={() => setActiveTab('onboarding')}
          />
        )}

        {activeTab === 'onboarding' && (
          <ProfilePage
            isOnboarding={true}
            onComplete={() => setActiveTab('explore')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            isOnboarding={false}
            onBack={() => setActiveTab('explore')}
          />
        )}

        {activeTab === 'explore' && (
          <PostIntentPage
            onIntentCreated={handleIntentCreated}
            onOpenMatcherModal={() => setIsMatcherOpen(true)}
          />
        )}

        {activeTab === 'my-rides' && (
          <MyRidesPage
            onOpenGroup={handleOpenGroup}
            onOpenLive={handleOpenLive}
            onOpenRating={handleOpenRating}
            onOpenMatcherModal={() => setIsMatcherOpen(true)}
            onPostNewIntent={() => setActiveTab('explore')}
          />
        )}

        {activeTab === 'group' && (
          <GroupConfirmationPage
            groupId={selectedGroupId}
            onStartRide={handleOpenLive}
            onBack={() => setActiveTab('my-rides')}
          />
        )}

        {activeTab === 'live' && (
          <LiveRidePage
            groupId={selectedGroupId}
            onCompleteRide={handleOpenRating}
            onBack={() => setActiveTab('my-rides')}
          />
        )}

        {activeTab === 'rating' && (
          <PostRideRatingPage
            groupId={selectedGroupId}
            onDone={() => setActiveTab('my-rides')}
          />
        )}
      </main>

      {/* Match Engine Modal */}
      <MatchVisualizerModal
        isOpen={isMatcherOpen}
        onClose={() => setIsMatcherOpen(false)}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d16] py-5 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 RideTribe — Weekend Group Ride Matcher (Bangalore)</p>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400 dark:text-slate-500">
            <span>Spring Boot 3</span>
            <span>•</span>
            <span>Google OAuth 2.0</span>
            <span>•</span>
            <span>React Leaflet</span>
            <span>•</span>
            <span>Cloudinary Photos</span>
            <span>•</span>
            <span>Union-Find Matcher</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
