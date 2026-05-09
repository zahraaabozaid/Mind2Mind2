import { useState } from 'react';
import { X, Brain, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

interface Props {
  mode: 'signin' | 'signup';
  onClose: () => void;
  onSwitchMode: (mode: 'signin' | 'signup') => void;
}

export default function AuthModal({ mode, onClose, onSwitchMode }: Props) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) { setError('Please enter your name.'); setLoading(false); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
        const { error } = await signUp(email, password, displayName);
        if (error) setError(error.message);
        else { setSuccess('Account created! Welcome to Mind2Mind.'); setTimeout(onClose, 1500); }
      } else {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
        else {
          // Check if admin redirect is needed
          if (sessionStorage.getItem('m2m-admin-redirect') === 'true') {
            sessionStorage.removeItem('m2m-admin-redirect');
            onClose();
            // Redirect to admin page
            setTimeout(() => {
              window.location.hash = '#admin';
              window.location.reload();
            }, 100);
          } else {
            onClose();
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-slate-900 to-teal-900 px-8 pt-8 pb-10 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-teal-500/20 border border-teal-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-teal-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            {mode === 'signup' ? 'Join Mind2Mind' : 'Welcome Back'}
          </h2>
          <p className="text-slate-400 text-sm">
            {mode === 'signup'
              ? 'Start trading knowledge with experts worldwide.'
              : 'Sign in to your account to continue.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g., Alex Johnson"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                className="w-full pl-10 pr-11 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-800"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-teal-50 border border-teal-100 text-teal-700 text-sm px-4 py-3 rounded-xl">
              {success}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            {mode === 'signup' ? 'Create Free Account' : 'Sign In'}
          </Button>

          <p className="text-center text-sm text-slate-500">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => onSwitchMode(mode === 'signup' ? 'signin' : 'signup')}
              className="text-teal-600 font-medium hover:text-teal-700"
            >
              {mode === 'signup' ? 'Sign In' : 'Join Free'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
