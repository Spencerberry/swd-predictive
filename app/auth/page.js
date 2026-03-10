'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setIsSignUp(false);
        setPassword('');
      } else {
        await signIn(email, password);
        router.push('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-green/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5fbc9a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="text-white font-semibold text-xl tracking-tight">
              SWD <span className="text-brand-green">Predictive</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-neutral-400 text-sm">
            {isSignUp ? 'Start predicting video performance' : 'Sign in to your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-brand-green/10 border border-brand-green/20 text-brand-green text-sm">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="w-full px-4 py-3 rounded-lg bg-surface-tertiary border border-surface-border text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-brand-green/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg bg-surface-tertiary border border-surface-border text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-brand-green/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-green text-black font-bold text-sm transition-all duration-200 hover:bg-brand-green-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center mt-6 text-sm text-neutral-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
            className="text-brand-green font-medium hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </main>
  );
}
