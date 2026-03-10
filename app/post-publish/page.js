'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';
import ProtectedRoute from '@/components/ProtectedRoute';
import ChannelBaseline from '@/components/ChannelBaseline';
import PostPredictionResult from '@/components/PostPredictionResult';
import { useAuth } from '@/components/AuthProvider';
import { savePrediction, getActiveProfileId } from '@/lib/db';
import { FORMAT_TYPES, CHECKPOINT_OPTIONS, TRAFFIC_SOURCES, CONTENT_CATEGORIES } from '@/lib/constants';

const DEFAULT_BASELINE = {
  channelName: '', subscribers: '', avgViews: '', avgCTR: '',
  avgRetention: '', uploadFrequency: '', category: CONTENT_CATEGORIES[0], channelAge: '',
};

const DEFAULT_VIDEO = {
  title: '',
  topic: '',
  duration: '',
  format: FORMAT_TYPES[0].value,
};

const DEFAULT_PERFORMANCE = {
  checkpoint: '24h',
  views: '',
  ctr: '',
  avgViewDuration: '',
  topTrafficSource: TRAFFIC_SOURCES[0],
  topTrafficPercent: '',
  subConversion: '',
  likes: '',
  comments: '',
};

export default function PostPublishPage() {
  return (
    <ProtectedRoute>
      <PostPublishContent />
    </ProtectedRoute>
  );
}

function PostPublishContent() {
  const { user } = useAuth();
  const [baseline, setBaseline] = useState(DEFAULT_BASELINE);
  const [video, setVideo] = useState(DEFAULT_VIDEO);
  const [performance, setPerformance] = useState(DEFAULT_PERFORMANCE);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateVideo = (field, value) => setVideo(prev => ({ ...prev, [field]: value }));
  const updatePerformance = (field, value) => setPerformance(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError('');
    setResult(null);

    if (!baseline.channelName || !baseline.subscribers || !baseline.avgViews || !baseline.avgCTR || !baseline.avgRetention) {
      setError('Please fill in all channel baseline fields.');
      return;
    }
    if (!video.title || !video.topic) {
      setError('Please enter the video title and topic.');
      return;
    }
    if (!performance.views || !performance.ctr) {
      setError('Please enter at least views and CTR from your analytics.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'post-publish', baseline, video, performance }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Prediction failed');

      setResult(data.prediction);

      // Save to database
      if (user) {
        const profileId = await getActiveProfileId(user.id);
        await savePrediction({
          userId: user.id,
          channelProfileId: profileId,
          mode: 'post-publish',
          video,
          performance,
          prediction: data.prediction,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Post-Publish Prediction</h1>
            <p className="text-neutral-400">
              Feed in your early performance data to get an updated prediction and action plan.
            </p>
          </div>

          {/* Channel Baseline — with save/load */}
          <ChannelBaseline baseline={baseline} setBaseline={setBaseline} />

          {/* Video Details */}
          <section className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-brand-green/15 flex items-center justify-center text-brand-green text-sm font-bold">2</div>
              <h2 className="text-lg font-semibold text-white">Video Details</h2>
            </div>
            <div className="rounded-xl bg-surface-secondary border border-surface-border p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <InputField label="Title (as published)" value={video.title} onChange={v => updateVideo('title', v)} placeholder="The actual title on YouTube" />
                </div>
                <div className="md:col-span-2">
                  <TextAreaField label="Topic / Angle" value={video.topic} onChange={v => updateVideo('topic', v)} placeholder="What is this video about?" rows={2} />
                </div>
                <InputField label="Duration (minutes)" value={video.duration} onChange={v => updateVideo('duration', v)} placeholder="e.g. 12" type="number" />
                <SelectField label="Format" value={video.format} onChange={v => updateVideo('format', v)} options={FORMAT_TYPES} />
              </div>
            </div>
          </section>

          {/* Early Performance Data */}
          <section className="mb-8 animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-brand-green/15 flex items-center justify-center text-brand-green text-sm font-bold">3</div>
              <h2 className="text-lg font-semibold text-white">Early Performance Data</h2>
            </div>
            <div className="rounded-xl bg-surface-secondary border border-surface-border p-6">
              <div className="mb-5">
                <label className="block text-sm text-neutral-400 mb-2">Time Since Publish</label>
                <div className="flex gap-2">
                  {CHECKPOINT_OPTIONS.map(cp => (
                    <button
                      key={cp.value}
                      onClick={() => updatePerformance('checkpoint', cp.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        performance.checkpoint === cp.value
                          ? 'bg-brand-green/15 text-brand-green border border-brand-green/30'
                          : 'bg-surface-tertiary text-neutral-400 border border-surface-border hover:border-neutral-600'
                      }`}
                    >
                      {cp.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Views at Checkpoint" value={performance.views} onChange={v => updatePerformance('views', v)} placeholder="e.g. 350" type="number" />
                <InputField label="CTR (%)" value={performance.ctr} onChange={v => updatePerformance('ctr', v)} placeholder="e.g. 6.2" type="number" step="0.1" />
                <InputField label="Avg View Duration (%)" value={performance.avgViewDuration} onChange={v => updatePerformance('avgViewDuration', v)} placeholder="e.g. 38" type="number" step="0.1" />
                <InputField label="Subscriber Conversion (%)" value={performance.subConversion} onChange={v => updatePerformance('subConversion', v)} placeholder="e.g. 2.1" type="number" step="0.1" />
                <SelectField label="Top Traffic Source" value={performance.topTrafficSource} onChange={v => updatePerformance('topTrafficSource', v)} options={TRAFFIC_SOURCES.map(s => ({ value: s, label: s }))} />
                <InputField label="Top Source % of Traffic" value={performance.topTrafficPercent} onChange={v => updatePerformance('topTrafficPercent', v)} placeholder="e.g. 45" type="number" />
                <InputField label="Likes" value={performance.likes} onChange={v => updatePerformance('likes', v)} placeholder="e.g. 42" type="number" />
                <InputField label="Comments" value={performance.comments} onChange={v => updatePerformance('comments', v)} placeholder="e.g. 8" type="number" />
              </div>
            </div>
          </section>

          {/* Submit */}
          <div>
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-brand-green text-black font-bold text-base transition-all duration-200 hover:bg-brand-green-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing...
                </span>
              ) : 'Get Updated Prediction'}
            </button>
          </div>

          {loading && (
            <div className="mt-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-40 rounded-2xl loading-shimmer" />
                <div className="h-40 rounded-2xl loading-shimmer" />
              </div>
              <div className="h-48 rounded-xl loading-shimmer" />
            </div>
          )}

          {result && !loading && (
            <div className="mt-10">
              <PostPredictionResult data={result} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}


/* ─── Form Components ─── */

function InputField({ label, value, onChange, placeholder, type = 'text', step }) {
  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1.5">{label}</label>
      <input type={type} step={step} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg bg-surface-tertiary border border-surface-border text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-brand-green/50 transition-colors" />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1.5">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full px-4 py-2.5 rounded-lg bg-surface-tertiary border border-surface-border text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-brand-green/50 transition-colors resize-none" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1.5">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg bg-surface-tertiary border border-surface-border text-white text-sm focus:outline-none focus:border-brand-green/50 transition-colors appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
        {options.map(opt => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lab = typeof opt === 'string' ? opt : opt.label;
          return <option key={val} value={val}>{lab}</option>;
        })}
      </select>
    </div>
  );
}
