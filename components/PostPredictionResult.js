'use client';

const PREDICTION_CONFIG = {
  outperform: {
    color: '#5fbc9a',
    bg: 'rgba(95, 188, 154, 0.1)',
    border: 'rgba(95, 188, 154, 0.3)',
    label: 'OUTPERFORM',
  },
  normal: {
    color: '#f5c542',
    bg: 'rgba(245, 197, 66, 0.1)',
    border: 'rgba(245, 197, 66, 0.3)',
    label: 'NORMAL',
  },
  underperform: {
    color: '#e55a5a',
    bg: 'rgba(229, 90, 90, 0.1)',
    border: 'rgba(229, 90, 90, 0.3)',
    label: 'UNDERPERFORM',
  },
};

const TRAJECTORY_CONFIG = {
  accelerating: { icon: '🚀', color: '#5fbc9a', label: 'Accelerating' },
  steady: { icon: '→', color: '#f5c542', label: 'Steady' },
  decelerating: { icon: '📉', color: '#e5955a', label: 'Decelerating' },
  stalled: { icon: '⛔', color: '#e55a5a', label: 'Stalled' },
};

const SIGNAL_CONFIG = {
  strong: { color: '#5fbc9a', bg: 'rgba(95, 188, 154, 0.12)' },
  normal: { color: '#f5c542', bg: 'rgba(245, 197, 66, 0.12)' },
  weak: { color: '#e55a5a', bg: 'rgba(229, 90, 90, 0.12)' },
};

const URGENCY_COLORS = {
  immediate: '#e55a5a',
  soon: '#f5c542',
  next_video: '#5fbc9a',
};

export default function PostPredictionResult({ data }) {
  if (!data) return null;

  const config = PREDICTION_CONFIG[data.prediction] || PREDICTION_CONFIG.normal;
  const trajectory = TRAJECTORY_CONFIG[data.trajectory] || TRAJECTORY_CONFIG.steady;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Main Score + Trajectory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: config.bg, border: `1px solid ${config.border}` }}
        >
          <div className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-3">
            Updated Prediction
          </div>
          <div className="text-4xl font-bold mb-2" style={{ color: config.color }}>
            {config.label}
          </div>
          <div className="text-neutral-400">
            {data.confidence}% confidence
          </div>
        </div>

        <div className="rounded-2xl p-8 text-center bg-surface-secondary border border-surface-border">
          <div className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-3">
            Trajectory
          </div>
          <div className="text-4xl font-bold mb-2" style={{ color: trajectory.color }}>
            {trajectory.icon} {trajectory.label}
          </div>
          {data.current_multiplier && (
            <div className="text-neutral-400">
              Currently at {data.current_multiplier}x channel average
            </div>
          )}
        </div>
      </div>

      {/* Projected 7-Day Views */}
      {data.predicted_7day_views && (
        <div className="rounded-xl bg-surface-secondary border border-surface-border p-6">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-4">
            Projected 7-Day Views
          </h3>
          <div className="flex items-end justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Number(data.predicted_7day_views.low).toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 mt-1">Low</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-neutral-500 mb-1">Channel Avg</div>
              <div className="text-lg font-semibold text-neutral-300">
                {Number(data.predicted_7day_views.channel_average).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Number(data.predicted_7day_views.high).toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 mt-1">High</div>
            </div>
          </div>
          {data.projected_multiplier && (
            <div className="text-center mt-4 text-sm text-neutral-400">
              Projected: {data.projected_multiplier.low}x – {data.projected_multiplier.high}x your average
            </div>
          )}
        </div>
      )}

      {/* Performance Signals */}
      {data.performance_signals && (
        <div className="rounded-xl bg-surface-secondary border border-surface-border p-6">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-4">
            Performance Signals
          </h3>
          <div className="space-y-3">
            {data.performance_signals.map((signal, i) => {
              const sc = SIGNAL_CONFIG[signal.status] || SIGNAL_CONFIG.normal;
              return (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg" style={{ background: sc.bg }}>
                  <div
                    className="shrink-0 mt-0.5 px-2.5 py-1 rounded text-xs font-bold uppercase"
                    style={{ color: sc.color, border: `1px solid ${sc.color}30` }}
                  >
                    {signal.status}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{signal.signal}</div>
                    <div className="text-neutral-400 text-sm mt-0.5">{signal.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Diagnosis */}
      {data.diagnosis && (
        <div className="rounded-xl bg-surface-secondary border border-surface-border p-6">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-4">
            Diagnosis
          </h3>
          <div className="flex gap-4 mb-4">
            <DiagBadge label="Packaging" working={data.diagnosis.packaging_working} />
            <DiagBadge label="Content" working={data.diagnosis.content_working} />
            <DiagBadge label="Algorithm" working={data.diagnosis.algorithm_pushing} />
          </div>
          <p className="text-neutral-300 text-sm leading-relaxed">{data.diagnosis.explanation}</p>
        </div>
      )}

      {/* Actions */}
      {data.actions && (
        <div className="rounded-xl bg-surface-secondary border border-surface-border p-6">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-4">
            What To Do Now
          </h3>
          <div className="space-y-3">
            {data.actions.map((action, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-surface-tertiary">
                <div
                  className="shrink-0 mt-0.5 px-2 py-0.5 rounded text-xs font-bold uppercase whitespace-nowrap"
                  style={{
                    color: URGENCY_COLORS[action.urgency],
                    background: `${URGENCY_COLORS[action.urgency]}15`,
                  }}
                >
                  {action.urgency?.replace('_', ' ')}
                </div>
                <div className="text-white text-sm">{action.action}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {data.summary && (
        <div className="rounded-xl bg-surface-tertiary border border-surface-border p-6">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-3">
            Bottom Line
          </h3>
          <p className="text-white text-base leading-relaxed">{data.summary}</p>
        </div>
      )}
    </div>
  );
}

function DiagBadge({ label, working }) {
  return (
    <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
      working
        ? 'bg-brand-green/10 text-brand-green border border-brand-green/20'
        : 'bg-red-500/10 text-red-400 border border-red-500/20'
    }`}>
      {working ? '✓' : '✗'} {label}
    </div>
  );
}
