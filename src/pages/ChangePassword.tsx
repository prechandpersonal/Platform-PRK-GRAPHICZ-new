import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, Eye, EyeOff, Check, X, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/storage';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Real-time checks
  const has8Chars = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const isStrong = has8Chars && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (!isStrong) {
      setError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.');
      setLoading(false);
      return;
    }

    try {
      const token = storage.get('token');
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });
      
      const dataResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(dataResponse.error || 'Failed to change password');
      }
      
      setSuccess(true);
      // Reset fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setError(err.message || 'An error occurred while changing password.');
    } finally {
      setLoading(false);
    }
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin' || user?.email === 'prkgraphicz@gmail.com') {
      return '/admin';
    }
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6 relative">
      <div className="absolute top-8 left-8 z-50">
        <Link 
          to={getDashboardPath()} 
          className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-brand-secondary rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 hover:shadow-brand-primary/30 transition-all group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
      </div>

      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white p-10 rounded-3xl border border-black/5 shadow-2xl shadow-black/5"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Logo />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Change Password
          </h1>
          <p className="text-sm font-medium text-black/40">
            Secure your administrator or client account credentials
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm font-bold rounded-xl border bg-red-50 text-red-500 border-red-100">
            {error}
          </div>
        )}

        {success ? (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6 text-center"
          >
            <div className="p-6 bg-green-50/50 border border-green-100 rounded-2xl">
              <ShieldCheck size={48} className="mx-auto text-green-500 mb-4" />
              <h2 className="text-xl font-bold text-green-900 mb-1">Success!</h2>
              <p className="text-sm font-medium text-green-700/80">
                Your password has been changed securely and is active immediately.
              </p>
            </div>
            <Link
              to={getDashboardPath()}
              className="w-full py-4 bg-brand-primary text-brand-secondary rounded-2xl font-bold text-lg hover:bg-brand-secondary hover:text-brand-primary transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-primary/10"
            >
              Return to Dashboard
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest text-black/40 mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={20} />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-black/5 border border-transparent rounded-2xl focus:border-black/10 focus:bg-white transition-all outline-none font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20 hover:text-black/40 transition-colors"
                >
                  {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-widest text-black/40 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={20} />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-black/5 border border-transparent rounded-2xl focus:border-black/10 focus:bg-white transition-all outline-none font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20 hover:text-black/40 transition-colors"
                >
                  {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Checklist of Password Strength */}
            <div className="p-5 bg-black/5 rounded-2xl space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-black/40">Password Requirements</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {has8Chars ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <X size={14} className="text-black/20" />
                  )}
                  <span className={has8Chars ? 'text-green-600' : 'text-black/40'}>Min 8 characters</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold">
                  {hasUppercase ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <X size={14} className="text-black/20" />
                  )}
                  <span className={hasUppercase ? 'text-green-600' : 'text-black/40'}>At least 1 uppercase</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold">
                  {hasLowercase ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <X size={14} className="text-black/20" />
                  )}
                  <span className={hasLowercase ? 'text-green-600' : 'text-black/40'}>At least 1 lowercase</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold">
                  {hasNumber ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <X size={14} className="text-black/20" />
                  )}
                  <span className={hasNumber ? 'text-green-600' : 'text-black/40'}>At least 1 number</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold sm:col-span-2">
                  {hasSpecial ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <X size={14} className="text-black/20" />
                  )}
                  <span className={hasSpecial ? 'text-green-600' : 'text-black/40'}>At least 1 special character (!@#$% etc.)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-widest text-black/40 mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={20} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-black/5 border border-transparent rounded-2xl focus:border-black/10 focus:bg-white transition-all outline-none font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20 hover:text-black/40 transition-colors"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-primary text-brand-secondary rounded-2xl font-bold text-lg hover:bg-brand-secondary hover:text-brand-primary transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-primary/10 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Change Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ChangePassword;
