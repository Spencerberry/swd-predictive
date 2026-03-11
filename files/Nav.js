'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-surface-border"
      style={{
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-brand-green/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5fbc9a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            SWD <span className="text-brand-green">Predictive</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/ideas"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === '/ideas'
                ? 'bg-brand-green/15 text-brand-green'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Ideas
          </Link>
          <Link
            href="/pre-publish"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === '/pre-publish'
                ? 'bg-brand-green/15 text-brand-green'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Pre-Publish
          </Link>
          <Link
            href="/post-publish"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === '/post-publish'
                ? 'bg-brand-green/15 text-brand-green'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Post-Publish
          </Link>
          <Link
            href="/history"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === '/history'
                ? 'bg-brand-green/15 text-brand-green'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            History
          </Link>

          {user && (
            <button
              onClick={handleSignOut}
              className="ml-3 px-4 py-2 rounded-lg text-sm font-medium text-neutral-500 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
