import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { Lock, Mail, User, Phone, Shield, ArrowRight, Bike, Car, Upload, Camera, Check } from 'lucide-react';

export default function AuthPage({ onSuccess, onRequireOnboarding }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingVehicle, setUploadingVehicle] = useState(false);
  const [error, setError] = useState(null);

  // Form State for manual registration
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'MALE',
    age: 25,
    preferredMode: 'BIKE',
    vehicleModel: '',
    vehicleNumber: '',
    avatarUrl: '',
    vehiclePhotoUrl: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bio: ''
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const res = await api.uploadImage(file, 'ridetribe/avatars');
      setFormData(prev => ({ ...prev, avatarUrl: res.url }));
    } catch (err) {
      alert("Failed to upload avatar: " + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleVehiclePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVehicle(true);
    try {
      const res = await api.uploadImage(file, 'ridetribe/vehicles');
      setFormData(prev => ({ ...prev, vehiclePhotoUrl: res.url }));
    } catch (err) {
      alert("Failed to upload vehicle photo: " + err.message);
    } finally {
      setUploadingVehicle(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(formData);
      } else {
        await login(formData.email, formData.password);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 px-4 sm:px-6">
      
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isRegister ? 'Create Rider Profile' : 'Sign in to RideTribe'}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isRegister
            ? 'Add your vehicle details & profile photo for Bangalore weekend matching'
            : 'Access your matched ride groups and live highway convoys'}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-subtle space-y-4">
        
        {/* Real Google OAuth Account Chooser Button */}
        <GoogleLoginButton
          onSuccess={onSuccess}
          onRequireOnboarding={onRequireOnboarding}
          fullWidth={true}
        />

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-3 text-[11px] text-muted-foreground font-medium">or email credentials</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Toggle Sign In / Register */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`flex-1 pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              !isRegister
                ? 'border-signal text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`flex-1 pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              isRegister
                ? 'border-signal text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Register Profile
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-[#161f33] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white min-h-[44px]"
                  />
                </div>
              </div>

              {/* Gender & Age */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={formData.gender || 'MALE'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-2.5 py-2.5 text-xs bg-slate-50 dark:bg-[#161f33] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white min-h-[44px]"
                  >
                    <option value="MALE">Male ♂</option>
                    <option value="FEMALE">Female ♀</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    min="18"
                    max="90"
                    required
                    value={formData.age || 25}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 25 })}
                    placeholder="25"
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#161f33] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white min-h-[44px]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="rider@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-[#161f33] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-[#161f33] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white min-h-[44px]"
              />
            </div>
          </div>

          {isRegister && (
            <>
              {/* Photo Upload Section (Cloudinary) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center space-x-1">
                    <Camera className="w-3.5 h-3.5 text-slate-500 dark:text-white" />
                    <span>Upload Photos (Cloudinary)</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Rider Profile Photo Upload */}
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Rider Photo</label>
                    <label className="flex flex-col items-center justify-center p-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111726] cursor-pointer hover:border-slate-400 min-h-[70px]">
                      {formData.avatarUrl ? (
                        <div className="flex items-center space-x-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <img src={formData.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                          <span>Uploaded ✓</span>
                        </div>
                      ) : (
                        <div className="text-center text-[10px] text-slate-500 dark:text-slate-400">
                          {uploadingAvatar ? <span className="text-amber-500">Uploading...</span> : <span>+ Add Avatar</span>}
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                  </div>

                  {/* Bike/Car Photo Upload */}
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Bike / Car Photo</label>
                    <label className="flex flex-col items-center justify-center p-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111726] cursor-pointer hover:border-slate-400 min-h-[70px]">
                      {formData.vehiclePhotoUrl ? (
                        <div className="flex items-center space-x-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <img src={formData.vehiclePhotoUrl} alt="" className="w-7 h-7 rounded-md object-cover" />
                          <span>Uploaded ✓</span>
                        </div>
                      ) : (
                        <div className="text-center text-[10px] text-slate-500 dark:text-slate-400">
                          {uploadingVehicle ? <span className="text-amber-500">Uploading...</span> : <span>+ Add Bike Pic</span>}
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleVehiclePhotoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Mode & Vehicle */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Travel Mode</label>
                  <select
                    value={formData.preferredMode}
                    onChange={(e) => setFormData({ ...formData, preferredMode: e.target.value })}
                    className="w-full px-2.5 py-2.5 text-xs bg-slate-50 dark:bg-[#161f33] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white min-h-[44px]"
                  >
                    <option value="BIKE">🏍️ Motorcycle</option>
                    <option value="CAR">🚗 Car</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    placeholder="e.g. Himalayan 450"
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#161f33] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Emergency Safety Contact</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    placeholder="Contact Name"
                    className="w-full px-2.5 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    placeholder="Phone (+91...)"
                    className="w-full px-2.5 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-semibold disabled:opacity-50 flex items-center justify-center space-x-2 min-h-[44px] shadow-sm transition-all active:scale-[0.99]"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{isRegister ? 'Complete Profile & Join' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
