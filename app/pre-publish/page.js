'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';
import ProtectedRoute from '@/components/ProtectedRoute';
import ChannelBaseline from '@/components/ChannelBaseline';
import PrePredictionResult from '@/components/PrePredictionResult';
import { useAuth } from '@/components/AuthProvider';
import { savePrediction, getActiveProfileId } from '@/lib/db';
import { FORMAT_TYPES, PUBLISH_DAYS, PUBLISH_TIMES, CONTENT_CATEGORIES } from '@/lib/constants';

const DEFAULT_BASELINE = {
  channelName: '', subscribers: '', avgViews: '', avgCTR: '',
  avgRetention: '', uploadFrequency: '', category: CONTENT_CATEGORIES[0], channelAge: '',
};

const DEFAULT_VIDEO = {
  title: '',
  topic: '',
  duration: '',
  format: FORMAT_TYPES[0].value,
  publishDay: PUBLISH_DAYS[1],
  publishTime: PUBLISH_TIMES[4],
  thumbnailDescription: '',
  isNewTopic: false,
  confidence: 3,
};

export default function PrePublishPage() {
  return (
    <ProtectedRoute>
      <PrePublishContent />
    </ProtectedRoute>
  );
}

function PrePublishContent() {
  const { user } = useAuth();
  const [baseline, setBaseline] = useState(DEFAULT_BASELINE);
  const [video, setVideo] = useState(DEFAULT_VIDEO);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateVideo = (field, value) => setVideo(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError('');
    setResult(null);

    if (!baseline.channelName || !baseline.subscribers || !baseline.avgViews || !baseline.avgCTR || !baseline.avgRetention) {
      setError('Please fill in all channel baseline fields.');
      return;
    }
    if (!video.title || !video.topic) {
      setError('Please enter a title and topic for your video.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'pre-publish', baseline, video }),
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
          mode: 'pre-publish',
          video,
          performance: null,
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
            <h1 className="text-3xl font-bold text-white mb-2">Pre-Publish Prediction</h1>
            <p className="text-neutral-400">
              Enter your channel baseline and draft video details to get a performance prediction.
            </p>
          </div>

          {/* Channel Baseline — now with save/load */}
          <ChannelBaseline baseline={baseline} setBaseline={setBaseline} />

          {/* Draft Video */}
          <section className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-brand-green/15 flex items-center justify-center text-brand-green text-sm font-bold">2</div>
              <h2 className="text-lg font-semibold text-white">Draft Video</h2>
            </div>
            <div className="rounded-xl bg-surface-secondary border border-surface-border p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <InputField label="Title" value={video.title} onChange={v => updateVideo('title', v)} placeholder="Your draft title" />
                </div>
                <div className="md:col-span-2">
                  <TextAreaField label="Topic / Angle" value={video.topic} onChange={v => updateVideo('topic', v)} placeholder="What is this video about? What's the core angle or argument?" rows={2} />
                </div>
                <InputField label="Planned Duration (minutes)" value={video.duration} onChange={v => updateVideo('duration', v)} placeholder="e.g. 12" type="number" />
                <SelectField label="Format" value={video.format} onChange={v => updateVideo('format', v)} options={FORMAT_TYPES} />
                <SelectField label="Publish Day" value={video.publishDay} onChange={v => updateVideo('publishDay', v)} options={PUBLISH_DAYS.map(d => ({ value: d, label: d }))} />
                <SelectField label="Publish Time" value={video.publishTime} onChange={v => updateVideo('publishTime', v)} options={PUBLISH_TIMES.map(t => ({ value: t, label: t }))} />
                <div className="md:col-span-2">
                  <TextAreaField label="Thumbnail Concept" value={video.thumbnailDescription} onChange={v => updateVideo('thumbnailDescription', v)} placeholder="Describe your thumbnail idea — colors, text, imagery, expressions" rows={2} />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-neutral-400">New topic for your channel?</label>
                  <button
                    onClick={() => updateVideo('isNewTopic', !video.isNewTopic)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${video.isNewTopic ? 'bg-brand-green' : 'bg-surface-border'}`}
                  >
                    <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
                      style={{ left: video.isNewTopic ? 'auto' : '2px', right: video.isNewTopic ? '2px' : 'auto' }}
                    />
                  </button>
                  <span className="text-sm text-white">{video.isNewTopic ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">
                    Confidence in this idea: <span className="text-white font-medium">{video.confidence}/5</span>
                  </label>
                  <input
                    type="range" min="1" max="5" step="1" value={video.confidence}
                    onChange={e => updateVideo('confidence', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
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
              ) : 'Get Prediction'}
            </button>
          </div>

          {loading && (
            <div className="mt-8 space-y-4">
              <div className="h-40 rounded-2xl loading-shimmer" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-48 rounded-xl loading-shimmer" />
                <div className="h-48 rounded-xl loading-shimmer" />
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="mt-10">
              <PrePredictionResult data={result} />
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
