'use client';

import Link from 'next/link';
import Nav from '@/components/Nav';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-16 flex items-center justify-center px-6">
        <div className="max-w-3xl w-full text-center">
          {/* Hero */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-sm font-medium mb-8">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Scale with Data
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Predict your video&apos;s<br />
              <span className="text-brand-green">performance</span>
            </h1>

            <p className="text-neutral-400 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed">
              Score your next YouTube video against your channel&apos;s own baseline. 
              Know whether it&apos;ll outperform before you hit publish — and what to fix if it won&apos;t.
            </p>
          </div>

          {/* Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
            <Link href="/pre-publish" className="group">
              <div className="rounded-2xl bg-surface-secondary border border-surface-border p-8 text-left transition-all duration-300 hover:border-brand-green/40 hover:bg-surface-tertiary">
                <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center mb-5 group-hover:bg-brand-green/20 transition-colors">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5fbc9a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Pre-Publish</h2>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Score a draft video before you upload. Get predictions based on your title, topic, format, and channel baseline.
                </p>
                <div className="mt-5 text-brand-green text-sm font-medium flex items-center gap-1.5 group-hover:gap-3 transition-all">
                  Score a draft →
                </div>
              </div>
            </Link>

            <Link href="/post-publish" className="group">
              <div className="rounded-2xl bg-surface-secondary border border-surface-border p-8 text-left transition-all duration-300 hover:border-brand-green/40 hover:bg-surface-tertiary">
                <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center mb-5 group-hover:bg-brand-green/20 transition-colors">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5fbc9a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Post-Publish</h2>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Already published? Feed in early performance data to get an updated prediction and action plan.
                </p>
                <div className="mt-5 text-brand-green text-sm font-medium flex items-center gap-1.5 group-hover:gap-3 transition-all">
                  Analyze live video →
                </div>
              </div>
            </Link>
          </div>

          {/* Footer note */}
          <p className="text-neutral-600 text-xs mt-12 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
            Powered by Scale with Data frameworks · Channel-relative prediction
          </p>
        </div>
      </main>
    </>
  );
}
