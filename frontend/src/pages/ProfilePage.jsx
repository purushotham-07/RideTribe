import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { User, Phone, Shield, Bike, Car, Camera, Save, CheckCircle2, ArrowLeft, Star, Award, Calendar } from 'lucide-react';

export default function ProfilePage({ isOnboarding = false, onComplete, onBack }) {
  const { user, updateProfile, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'MALE',
    age: 25,
    preferredMode: 'BIKE',
    vehicleModel: '',
    vehicleNumber: '',
    vehiclePhotoUrl: '',
    avatarUrl: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bio: ''
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingVehicle, setUploadingVehicle] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        gender: user.gender || 'MALE',
        age: user.age || 25,
        preferredMode: user.preferredMode || 'BIKE',
        vehicleModel: user.vehicleModel || '',
        vehicleNumber: user.vehicleNumber || '',
        vehiclePhotoUrl: user.vehiclePhotoUrl || '',
        avatarUrl: user.avatarUrl || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setErrorMsg(null);
    try {
      const res = await api.uploadImage(file, 'ridetribe/avatars');
      setFormData(prev => ({ ...prev, avatarUrl: res.url }));
    } catch (err) {
      setErrorMsg("Failed to upload avatar: " + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleVehiclePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVehicle(true);
    setErrorMsg(null);
    try {
      const res = await api.uploadImage(file, 'ridetribe/vehicles');
      setFormData(prev => ({ ...prev, vehiclePhotoUrl: res.url }));
    } catch (err) {
      setErrorMsg("Failed to upload vehicle photo: " + err.message);
    } finally {
      setUploadingVehicle(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateProfile(formData);
      setSuccessMsg("Profile updated successfully!");
      if (isOnboarding && onComplete) {
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const genderLabel = formData.gender === 'FEMALE' ? 'Female' : (formData.gender === 'OTHER' ? 'Other' : 'Male');

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs font-medium text-muted-foreground hover:text-foreground mb-2 flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {isOnboarding ? 'Complete Your Rider Profile' : 'Rider Profile & Vehicle'}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isOnboarding
              ? 'Submit your demographic, vehicle details, and emergency contact for convoy matching.'
              : 'Manage your personal details, vehicle specs, and safety SOS contact.'}
          </p>
        </div>
      </div>

      {/* Onboarding Welcome Notice */}
      {isOnboarding && (
        <div className="p-4 rounded-2xl bg-secondary border border-border shadow-subtle flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-sm text-foreground">Welcome to RideTribe</p>
            <p className="text-muted-foreground mt-0.5">Please provide your gender, age, vehicle model, and emergency contact to finalize your account.</p>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-500 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Profile Overview Card */}
      {!isOnboarding && user && (
        <div className="p-6 rounded-2xl bg-card border border-border shadow-subtle flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 rounded-full bg-secondary border border-border overflow-hidden shrink-0 flex items-center justify-center">
              {formData.avatarUrl || user.avatarUrl ? (
                <img src={formData.avatarUrl || user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-semibold text-lg text-foreground tracking-tight">{user.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-secondary text-foreground border border-border">
                  {user.preferredMode === 'CAR' ? '🚗 Driver' : '🏍️ Biker'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-secondary text-muted-foreground border border-border">
                  {genderLabel}, {formData.age || user.age || 25} yrs
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
              
              <div className="flex items-center space-x-3 mt-2 text-xs font-medium">
                <span className="text-foreground">★ {user.avgRating || '5.0'} Rating</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground">{user.ridesCompleted || 0} Rides Completed</span>
              </div>
            </div>
          </div>

          {formData.vehiclePhotoUrl && (
            <div className="text-center sm:text-right">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">Your Vehicle</span>
              <img
                src={formData.vehiclePhotoUrl}
                alt="Vehicle"
                className="w-24 h-16 rounded-xl object-cover border border-border shadow-xs mx-auto sm:ml-auto"
              />
            </div>
          )}
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-card border border-border shadow-subtle space-y-6">
        
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
          Personal & Demographic Info
        </h3>

        {/* Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your full name"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 min-h-[40px] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98860 12345"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 min-h-[40px] transition-colors"
            />
          </div>
        </div>

        {/* Gender & Age */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: 'MALE' })}
                className={`py-2 px-2 rounded-lg text-xs font-medium border flex items-center justify-center min-h-[40px] transition-colors ${
                  formData.gender === 'MALE'
                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 border-zinc-900 dark:border-zinc-50 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                Male ♂
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: 'FEMALE' })}
                className={`py-2 px-2 rounded-lg text-xs font-medium border flex items-center justify-center min-h-[40px] transition-colors ${
                  formData.gender === 'FEMALE'
                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 border-zinc-900 dark:border-zinc-50 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                Female ♀
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: 'OTHER' })}
                className={`py-2 px-2 rounded-lg text-xs font-medium border flex items-center justify-center min-h-[40px] transition-colors ${
                  formData.gender === 'OTHER'
                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 border-zinc-900 dark:border-zinc-50 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                Other
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Age</label>
            <input
              type="number"
              min="18"
              max="90"
              required
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 25 })}
              placeholder="e.g. 25"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 min-h-[40px] transition-colors"
            />
          </div>
        </div>

        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 pt-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
          Vehicle & Travel Mode
        </h3>

        {/* Travel Mode & Vehicle Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Preferred Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, preferredMode: 'BIKE' })}
                className={`py-2 px-2 rounded-lg text-xs font-medium border flex items-center justify-center space-x-1.5 min-h-[40px] transition-colors ${
                  formData.preferredMode === 'BIKE'
                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 border-zinc-900 dark:border-zinc-50 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Biker</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, preferredMode: 'CAR' })}
                className={`py-2 px-2 rounded-lg text-xs font-medium border flex items-center justify-center space-x-1.5 min-h-[40px] transition-colors ${
                  formData.preferredMode === 'CAR'
                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 border-zinc-900 dark:border-zinc-50 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Driver</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Vehicle Model</label>
            <input
              type="text"
              value={formData.vehicleModel}
              onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
              placeholder="e.g. Himalayan 450 / Duke 390"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 min-h-[40px] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Vehicle Number</label>
            <input
              type="text"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
              placeholder="e.g. KA-03-AB-1234"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 min-h-[40px] transition-colors"
            />
          </div>
        </div>

        {/* Photo Uploads Section (Cloudinary) */}
        <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center space-x-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100">
            <Camera className="w-4 h-4 text-zinc-500" />
            <span>Upload Photos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Rider Avatar Photo */}
            <div>
              <label className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">Rider Avatar</label>
              <label className="flex items-center space-x-3 p-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 min-h-[58px] transition-colors">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-zinc-400" />
                  </div>
                )}
                <div className="text-xs">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 block">
                    {uploadingAvatar ? 'Uploading...' : (formData.avatarUrl ? 'Change Avatar' : 'Upload Avatar')}
                  </span>
                  <span className="text-[10px] text-zinc-400">PNG or JPG</span>
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>

            {/* Bike / Car Photo */}
            <div>
              <label className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">Motorcycle / Car Photo</label>
              <label className="flex items-center space-x-3 p-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 min-h-[58px] transition-colors">
                {formData.vehiclePhotoUrl ? (
                  <img src={formData.vehiclePhotoUrl} alt="Bike" className="w-10 h-10 rounded-md object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Bike className="w-5 h-5 text-zinc-400" />
                  </div>
                )}
                <div className="text-xs">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 block">
                    {uploadingVehicle ? 'Uploading...' : (formData.vehiclePhotoUrl ? 'Change Vehicle Pic' : 'Upload Vehicle Pic')}
                  </span>
                  <span className="text-[10px] text-zinc-400">PNG or JPG</span>
                </div>
                <input type="file" accept="image/*" onChange={handleVehiclePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Emergency Safety Contact */}
        <div className="p-4 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-3">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-red-700 dark:text-red-400">
            <Shield className="w-4 h-4" />
            <span>Emergency SOS Safety Contact (Family / Friend)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                placeholder="Family contact name"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[40px]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                placeholder="+91 98860 00000"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[40px]"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Rider Bio / Riding Style</label>
          <textarea
            rows={2}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="e.g. Weekend tourer, prefer highway breakfast rides and scenic mountain routes."
            className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300"
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 px-4 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-medium text-xs transition-all disabled:opacity-50 flex items-center justify-center space-x-2 min-h-[40px] shadow-sm active:scale-[0.99]"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isOnboarding ? 'Save & Continue to RideTribe' : 'Save Profile Changes'}</span>
            </>
          )}
        </button>

      </form>

    </div>
  );
}
