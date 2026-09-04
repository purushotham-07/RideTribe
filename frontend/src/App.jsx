import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import ExploreTripsPage from './pages/ExploreTripsPage';
import PostIntentPage from './pages/PostIntentPage';
import MyRidesPage from './pages/MyRidesPage';
import GroupConfirmationPage from './pages/GroupConfirmationPage';
import LiveRidePage from './pages/LiveRidePage';
import PostRideRatingPage from './pages/PostRideRatingPage';
import ProfilePage from './pages/ProfilePage';
import HostTripModal from './components/HostTripModal';
import TripDetailsModal from './components/TripDetailsModal';
import TripChatModal from './components/TripChatModal';
import MatchVisualizerModal from './components/MatchVisualizerModal';
import NotFoundPage from './pages/NotFoundPage';

// Google OAuth Client ID (can be configured via VITE_GOOGLE_CLIENT_ID in .env)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1088497672288-placeholder.apps.googleusercontent.com";

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('explore-trips'); // 'explore-trips' | 'post-intent' | 'my-rides' | 'group' | 'live' | 'rating' | 'auth' | 'profile' | 'onboarding'
  const [selectedGroupId, setSelectedGroupId] = useState(1);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [chatTrip, setChatTrip] = useState(null);
  const [isHostTripOpen, setIsHostTripOpen] = useState(false);
  const [isTripDetailsOpen, setIsTripDetailsOpen] = useState(false);
  const [isMatcherOpen, setIsMatcherOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <div className="w-5 h-5 border-2 border-signal border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-muted-foreground mt-3 tracking-wider uppercase">Loading RideTribe...</p>
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

  const handleViewTripDetails = (tripId) => {
    setSelectedTripId(tripId);
    setIsTripDetailsOpen(true);
  };

  const handleOpenTripChat = (trip) => {
    setChatTrip(trip);
  };

  const handleTripCreatedOrUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-950 dark:text-zinc-50 flex flex-col transition-colors duration-150 selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-black">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHostTrip={() => setIsHostTripOpen(true)}
        onOpenMatcherModal={() => setIsMatcherOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 pb-12">
        {activeTab === 'auth' && (
          <AuthPage
            onSuccess={() => setActiveTab('explore-trips')}
            onRequireOnboarding={() => setActiveTab('onboarding')}
          />
        )}

        {activeTab === 'onboarding' && (
          <ProfilePage
            isOnboarding={true}
            onComplete={() => setActiveTab('explore-trips')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            isOnboarding={false}
            onBack={() => setActiveTab('explore-trips')}
          />
        )}

        {/* Home Dashboard: Explore Community Trips */}
        {activeTab === 'explore-trips' && (
          <ExploreTripsPage
            key={refreshKey}
            onHostTrip={() => setIsHostTripOpen(true)}
            onViewTripDetails={handleViewTripDetails}
            onOpenTripChat={handleOpenTripChat}
            onOpenLiveCockpit={handleOpenLive}
          />
        )}

        {activeTab === 'post-intent' && (
          <PostIntentPage
            onIntentCreated={() => setActiveTab('my-rides')}
            onOpenMatcherModal={() => setIsMatcherOpen(true)}
          />
        )}

        {activeTab === 'my-rides' && (
          <MyRidesPage
            onOpenGroup={handleOpenGroup}
            onOpenLive={handleOpenLive}
            onOpenRating={handleOpenRating}
            onOpenChat={handleOpenTripChat}
            onOpenMatcherModal={() => setIsMatcherOpen(true)}
            onPostNewIntent={() => setIsHostTripOpen(true)}
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

        {!['auth', 'onboarding', 'profile', 'explore-trips', 'post-intent', 'my-rides', 'group', 'live', 'rating'].includes(activeTab) && (
          <NotFoundPage onNavigateHome={() => setActiveTab('explore-trips')} />
        )}
      </main>

      {/* Host Trip Modal */}
      <HostTripModal
        isOpen={isHostTripOpen}
        onClose={() => setIsHostTripOpen(false)}
        onTripCreated={handleTripCreatedOrUpdated}
      />

      {/* Trip Details & Join Requests Modal */}
      {isTripDetailsOpen && (
        <TripDetailsModal
          tripId={selectedTripId}
          isOpen={isTripDetailsOpen}
          onClose={() => setIsTripDetailsOpen(false)}
          onOpenChat={(trip) => {
            setIsTripDetailsOpen(false);
            setChatTrip(trip);
          }}
          onOpenLiveCockpit={(groupId) => {
            setIsTripDetailsOpen(false);
            handleOpenLive(groupId);
          }}
          onTripUpdated={handleTripCreatedOrUpdated}
        />
      )}

      {/* Trip Group Chat Modal */}
      {chatTrip && (
        <TripChatModal
          trip={chatTrip}
          isOpen={Boolean(chatTrip)}
          onClose={() => setChatTrip(null)}
        />
      )}

      {/* Match Engine Modal */}
      <MatchVisualizerModal
        isOpen={isMatcherOpen}
        onClose={() => setIsMatcherOpen(false)}
      />

      {/* Design System Minimalist Footer */}
      <footer className="border-t border-border bg-background py-8 text-xs text-muted-foreground font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-foreground tracking-tight">RideTribe</span>
            <span>— Real-time convoy & group touring platform.</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-mono text-muted-foreground">
            <span>Spring Boot 3 + MongoDB</span>
            <span>/</span>
            <span>Leaflet OSRM</span>
            <span>/</span>
            <span>Live Telemetry</span>
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
          <ToastProvider>
            <MainApp />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
