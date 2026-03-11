'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';

export default function IdeasPage() {
  return (
    <ProtectedRoute>
      <IdeasContent />
    </ProtectedRoute>
  );
}

function IdeasContent() {
  const { user } = useAuth();
  const [handle, setHandle] = useState('');
  const [struggle, setStruggle] = useState('');
  const [goals, setGoals] = useState('');
  const [channelData, setChannelData] = useState(null);
  const [ideas, setIdeas] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingChannel, setFetchingChannel] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = enter handle, 2 = channel loaded + context, 3 = results

  const fetchChannel = async () => {
    if (!handle.trim()) {
      setError('Enter a YouTube handle (e.g. @Spencerlberry)');
      return;
    }

    setFetchingChannel(true);
    setError('');
    setChannelData(null);

    try {
      const res = await fetch(`/api/youtube/channel?handle=${encodeURIComponent(handle.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Channel not found');
      }

      setChannelData(data);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetchingChannel(false);
    }
  };

  const generateIdeas = async () => {
    if (!channelData) return;

    setLoading(true);
    setError('');
    setIdeas('');

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelData, struggle, goals }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate ideas');
      }

      setIdeas(data.ideas);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setHandle('');
    setChannelData(null);
    setIdeas('');
    setStruggle('');
    setGoals('');
    setError('');
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return String(num);
  };

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Idea Engine</h1>
            <p className="text-neutral-400">
              Enter your YouTube channel. We&apos;ll analyze what&apos;s working and generate video ideas tailored to your audience.
            </p>
          </div>

          {/* Step 1: Enter Channel */}
          {step === 1 && (
            <section className="animate-fade-in">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-brand-green/15 flex items-center justify-center text-brand-green text-sm font-bold">1</div>
                <h2 className="text-lg font-semibold text-white">Find Your Channel</h2>
              </div>
              <div className="rounded-xl bg-surface-secondary border border-surface-border p-6">
                <label className="block text-sm text-neutral-400 mb-2">YouTube Channel Handle</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-neutral-500">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={handle}
                      onChange={e => setHandle(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') fetchChannel(); }}
                      placeholder="@channelhandle"
                      className="w-full pl-11 pr-4 py-3 rounded-lg bg-surface-tertiary border border-surface-border text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-brand-green/50 transition-colors"
                    />
                  </div>
                  <button
                    onClick={fetchChannel}
                    disabled={fetchingChannel}
                    className="px-6 py-3 rounded-lg bg-brand-green text-black font-bold text-sm transition-all hover:bg-brand-green-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    {fetchingChannel ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Fetching...
                      </>
                    ) : 'Fetch Channel'}
                  </button>
                </div>
                {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
                <p className="mt-3 text-xs text-neutral-600">Enter the exact YouTube handle — including the @ symbol.</p>
              </div>
            </section>
          )}

          {/* Step 2: Channel Loaded + Context */}
          {step === 2 && channelData && (
            <div className="space-y-6 animate-fade-in">
              {/* Channel Card */}
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-brand-green/15 flex items-center justify-center text-brand-green text-sm font-bold">✓</div>
                  <h2 className="text-lg font-semibold text-white">Channel Loaded</h2>
                  <button onClick={reset} className="ml-auto text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
                    Change channel
                  </button>
                </div>
                <div className="rounded-xl bg-surface-secondary border border-surface-border p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-brand-green">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{channelData.channelName}</h3>
                      <p className="text-neutral-500 text-sm">{formatNumber(channelData.subscribers)} subscribers · {channelData.totalVideos} videos</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Avg Views" value={formatNumber(channelData.avgViews)} />
                    <StatCard label="Upload Freq" value={`${channelData.uploadFrequency}/mo`} />
                    <StatCard label="Channel Age" value={`${channelData.channelAge} mo`} />
                    <StatCard label="Recent Videos" value={String(channelData.recentVideoCount || channelData.recentVideos?.length || 0)} />
                  </div>

                  {/* Top performers */}
                  {channelData.topPerformers && channelData.topPerformers.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-surface-border">
                      <p className="text-xs text-neutral-500 font-medium mb-2 uppercase tracking-wider">Top performers</p>
                      <div className="space-y-1.5">
                        {channelData.topPerformers.slice(0, 3).map((v, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-tertiary/50 text-xs">
                            <span className="text-neutral-300 truncate flex-1 mr-3">{v.title}</span>
                            <span className="text-brand-green whitespace-nowrap font-medium">{formatNumber(v.views)} views</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Context */}
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-brand-green/15 flex items-center justify-center text-brand-green text-sm font-bold">2</div>
                  <h2 className="text-lg font-semibold text-white">Add Context <span className="text-neutral-500 font-normal text-sm">(optional)</span></h2>
                </div>
                <div className="rounded-xl bg-surface-secondary border border-surface-border p-6 space-y-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1.5">What are you struggling with?</label>
                    <textarea
                      value={struggle}
                      onChange={e => setStruggle(e.target.value)}
                      placeholder="e.g. I can't get past 1K views, my audience isn't growing, I don't know what to post next"
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg bg-surface-tertiary border border-surface-border text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-brand-green/50 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1.5">What&apos;s your goal right now?</label>
                    <input
                      type="text"
                      value={goals}
                      onChange={e => setGoals(e.target.value)}
                      placeholder="e.g. grow subscribers, sell a product, build authority"
                      className="w-full px-4 py-2.5 rounded-lg bg-surface-tertiary border border-surface-border text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-brand-green/50 transition-colors"
                    />
                  </div>
                </div>
              </section>

              {/* Generate Button */}
              <div>
                {error && (
                  <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <button
                  onClick={generateIdeas}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-brand-green text-black font-bold text-base transition-all duration-200 hover:bg-brand-green-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing channel & generating ideas...
                    </span>
                  ) : 'Generate Video Ideas'}
                </button>
              </div>

              {loading && (
                <div className="space-y-4">
                  <div className="h-40 rounded-2xl loading-shimmer" />
                  <div className="h-64 rounded-2xl loading-shimmer" />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && ideas && (
            <div className="animate-fade-in">
              {/* Channel summary bar */}
              <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-surface-secondary border border-surface-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-brand-green">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{channelData?.channelName}</p>
                    <p className="text-neutral-500 text-xs">{formatNumber(channelData?.subscribers)} subs · {formatNumber(channelData?.avgViews)} avg views</p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-lg bg-surface-tertiary border border-surface-border text-sm text-neutral-400 hover:text-white hover:border-brand-green/30 transition-all"
                >
                  New Search
                </button>
              </div>

              {/* Ideas Output */}
              <div className="rounded-2xl bg-surface-secondary border border-surface-border p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-brand-green/15 flex items-center justify-center text-lg">💡</div>
                  <h2 className="text-lg font-semibold text-white">Your Video Ideas</h2>
                </div>
                <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {ideas}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="p-3 rounded-lg bg-surface-tertiary/50 text-center">
      <p className="text-white font-semibold text-lg">{value}</p>
      <p className="text-neutral-500 text-xs">{label}</p>
    </div>
  );
}
