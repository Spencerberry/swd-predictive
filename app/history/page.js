'use client';

import { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';
import { getPredictions, updateActualOutcome } from '@/lib/db';

const PREDICTION_COLORS = {
  outperform: { color: '#5fbc9a', bg: 'rgba(95, 188, 154, 0.1)', border: 'rgba(95, 188, 154, 0.25)' },
  normal: { color: '#f5c542', bg: 'rgba(245, 197, 66, 0.1)', border: 'rgba(245, 197, 66, 0.25)' },
  underperform: { color: '#e55a5a', bg: 'rgba(229, 90, 90, 0.1)', border: 'rgba(229, 90, 90, 0.25)' },
};

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}

function HistoryContent() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (user) loadPredictions();
  }, [user]);

  const loadPredictions = async () => {
    setLoading(true);
    const data = await getPredictions(user.id);
    setPredictions(data);
    setLoading(false);
  };

  const handleUpdateActual = async (predictionId, views, outcome) => {
    const success = await updateActualOutcome(predictionId, parseInt(views), outcome);
    if (success) loadPredictions();
  };

  // Stats
  const total = predictions.length;
  const withActual = predictions.filter(p => p.actual_outcome);
  const correct = withActual.filter(p => p.prediction === p.actual_outcome);
  const accuracy = withActual.length > 0 ? Math.round((correct.length / withActual.length) * 100) : null;

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Prediction History</h1>
            <p className="text-neutral-400">
              Every prediction you&apos;ve run, with the ability to log actual results and track accuracy.
            </p>
          </div>

          {/* Stats Bar */}
          {total > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.05s', animationFillMode: 'backwards' }}>
              <StatCard label="Total Predictions" value={total} />
              <StatCard label="Results Logged" value={withActual.length} />
              <StatCard label="Accuracy" value={accuracy !== null ? `${accuracy}%` : '—'} highlight={accuracy !== null && accuracy >= 60} />
            </div>
          )}

          {/* Predictions List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-xl loading-shimmer" />
              ))}
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-surface-secondary border border-surface-border flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">No predictions yet</h2>
              <p className="text-neutral-500 text-sm">Run your first prediction from Pre-Publish or Post-Publish to see it here.</p>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
              {predictions.map(pred => (
                <PredictionCard
                  key={pred.id}
                  prediction={pred}
                  isExpanded={expandedId === pred.id}
                  onToggle={() => setExpandedId(expandedId === pred.id ? null : pred.id)}
                  onUpdateActual={handleUpdateActual}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}


function StatCard({ label, value, highlight }) {
  return (
    <div className="rounded-xl bg-surface-secondary border border-surface-border p-5 text-center">
      <div className={`text-2xl font-bold mb-1 ${highlight ? 'text-brand-green' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-xs text-neutral-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}


function PredictionCard({ prediction: pred, isExpanded, onToggle, onUpdateActual }) {
  const [actualViews, setActualViews] = useState(pred.actual_views_7d || '');
  const [actualOutcome, setActualOutcome] = useState(pred.actual_outcome || '');
  const config = PREDICTION_COLORS[pred.prediction] || PREDICTION_COLORS.normal;
  const date = new Date(pred.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  const isAccurate = pred.actual_outcome && pred.prediction === pred.actual_outcome;
  const hasActual = !!pred.actual_outcome;

  return (
    <div className="rounded-xl bg-surface-secondary border border-surface-border overflow-hidden transition-all">
      {/* Header Row */}
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-surface-tertiary/50 transition-colors"
      >
        {/* Prediction Badge */}
        <div
          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase"
          style={{ color: config.color, background: config.bg, border: `1px solid ${config.border}` }}
        >
          {pred.prediction}
        </div>

        {/* Title & Meta */}
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium text-sm truncate">{pred.video_title}</div>
          <div className="text-neutral-500 text-xs mt-0.5">
            {pred.mode === 'pre-publish' ? 'Pre-Publish' : `Post-Publish (${pred.checkpoint})`} · {date}
          </div>
        </div>

        {/* Confidence */}
        <div className="shrink-0 text-right">
          <div className="text-white text-sm font-medium">{pred.confidence_score}%</div>
          <div className="text-neutral-500 text-xs">conf.</div>
        </div>

        {/* Accuracy indicator */}
        {hasActual && (
          <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            isAccurate ? 'bg-brand-green/20 text-brand-green' : 'bg-red-500/20 text-red-400'
          }`}>
            {isAccurate ? '✓' : '✗'}
          </div>
        )}

        {/* Expand Arrow */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"
          className={`shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-surface-border pt-4 space-y-4">
          {/* Prediction Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MiniStat label="Predicted Low" value={pred.predicted_low?.toLocaleString() || '—'} />
            <MiniStat label="Predicted High" value={pred.predicted_high?.toLocaleString() || '—'} />
            <MiniStat label="Channel Avg" value={pred.channel_average?.toLocaleString() || '—'} />
            {pred.trajectory && <MiniStat label="Trajectory" value={pred.trajectory} />}
          </div>

          {/* Summary from full response */}
          {pred.full_response?.summary && (
            <div className="p-3 rounded-lg bg-surface-tertiary">
              <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Summary</div>
              <p className="text-neutral-300 text-sm">{pred.full_response.summary}</p>
            </div>
          )}

          {/* Log Actual Results */}
          <div className="p-4 rounded-lg bg-surface-tertiary border border-surface-border">
            <div className="text-xs text-neutral-500 uppercase tracking-wider mb-3">
              {hasActual ? 'Actual Results (logged)' : 'Log Actual Results (after 7 days)'}
            </div>
            <div className="flex items-end gap-3 flex-wrap">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Actual 7-Day Views</label>
                <input
                  type="number"
                  value={actualViews}
                  onChange={e => setActualViews(e.target.value)}
                  placeholder="e.g. 1500"
                  disabled={hasActual}
                  className="px-3 py-2 rounded-lg bg-surface-secondary border border-surface-border text-white text-sm w-32 focus:outline-none focus:border-brand-green/50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Actual Outcome</label>
                <select
                  value={actualOutcome}
                  onChange={e => setActualOutcome(e.target.value)}
                  disabled={hasActual}
                  className="px-3 py-2 rounded-lg bg-surface-secondary border border-surface-border text-white text-sm focus:outline-none focus:border-brand-green/50 disabled:opacity-50 appearance-none"
                >
                  <option value="">Select...</option>
                  <option value="outperform">Outperform</option>
                  <option value="normal">Normal</option>
                  <option value="underperform">Underperform</option>
                </select>
              </div>
              {!hasActual && (
                <button
                  onClick={() => {
                    if (actualOutcome) onUpdateActual(pred.id, actualViews, actualOutcome);
                  }}
                  disabled={!actualOutcome}
                  className="px-4 py-2 rounded-lg bg-brand-green/15 text-brand-green text-sm font-medium border border-brand-green/30 hover:bg-brand-green/25 transition-colors disabled:opacity-30"
                >
                  Save Result
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function MiniStat({ label, value }) {
  return (
    <div className="p-3 rounded-lg bg-surface-tertiary">
      <div className="text-xs text-neutral-500 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-white font-medium text-sm">{value}</div>
    </div>
  );
}
