import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function GoogleLoginButton({ onSuccess, onRequireOnboarding, className = "", fullWidth = false }) {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Fetch user profile directly from Google OAuth userinfo endpoint
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`
          }
        });

        if (!userInfoRes.ok) {
          throw new Error("Failed to fetch Google profile info");
        }

        const googleUser = await userInfoRes.json();
        
        // Extract real Google name, email, and Google profile picture avatar
        const email = googleUser.email;
        const name = googleUser.name || `${googleUser.given_name || ''} ${googleUser.family_name || ''}`.trim() || email.split('@')[0];
        const avatarUrl = googleUser.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

        const loggedInUser = await googleLogin(email, name, avatarUrl);

        // Check if user is first-time (missing vehicle info or phone)
        if (!loggedInUser?.vehicleModel || !loggedInUser?.phone) {
          if (onRequireOnboarding) {
            onRequireOnboarding(loggedInUser);
          } else if (onSuccess) {
            onSuccess();
          }
        } else {
          if (onSuccess) {
            onSuccess();
          }
        }
      } catch (err) {
        console.error("Google Auth error:", err);
        alert("Google Login Error: " + err.message);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.warn("Google Sign-In Popup Cancelled / Error:", error);
    }
  });

  return (
    <button
      type="button"
      onClick={() => loginWithGoogle()}
      disabled={loading}
      className={`group relative inline-flex items-center justify-center bg-[#131314] hover:bg-[#202124] active:scale-[0.99] text-white border border-[#3c4043] rounded-2xl p-1.5 pl-2 pr-5 transition-all shadow-md hover:border-slate-400 disabled:opacity-50 select-none cursor-pointer ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      title="Continue with Google"
    >
      {/* White Icon Badge with Google G logo */}
      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center mr-3 shrink-0 shadow-sm transition-transform group-hover:scale-105">
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      </div>

      {/* Button Text */}
      <span className="font-bold text-sm text-white tracking-normal font-sans">
        {loading ? 'Opening Google...' : 'Continue with Google'}
      </span>
    </button>
  );
}
