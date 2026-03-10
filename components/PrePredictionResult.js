'use client';

const PREDICTION_CONFIG = {
  outperform: {
    color: '#5fbc9a',
    bg: 'rgba(95, 188, 154, 0.1)',
    border: 'rgba(95, 188, 154, 0.3)',
    label: 'OUTPERFORM',
    icon: '↑',
  },
  normal: {
    color: '#f5c542',
    bg: 'rgba(245, 197, 66, 0.1)',
    border: 'rgba(245, 197, 66, 0.3)',
    label: 'NORMAL',
    icon: '→',
  },
  underperform: {
    color: '#e55a5a',
    bg: 'rgba(229, 90, 90, 0.1)',
    border: 'rgba(229, 90, 90, 0.3)',
    label: 'UNDERPERFORM',
    icon: '↓',
  },
};

const IMPACT_COLORS = {
  high: '#e55a5a',
  medium: '#f5c542',
  low: '#5fbc9a',
};

export default function PrePredictionResult({ data }) {
  if (!data) return null;

  const config = PREDICTION_CONFIG[data.prediction] || PREDICTION_CONFIG.normal;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Main Score Card */}
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: config.bg,
          border: `1px solid ${config.border}`,
        }}
      >
        <div className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-3">
          Prediction
        </div>
        <div
          className="text-5xl font-bold mb-2 flex items-center justify-center gap-3"
          style={{ color: config.color }}
        >
          <span className="text-3xl">{config.icon}</span>
          {config.label}
        </div>
        <div className="text-neutral-400 text-lg">
          {data.confidence}% confidence
        </div>
      </div>

      {/* View Range */}
      {data.predicted_view_range && (
        <div className="rounded-xl bg-surface-secondary border border-surface-border p-6">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-4">
            Predicted View Range (7 Days)
          </h3>
          <div className="flex items-end justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Number(data.predicted_view_range.low).toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 mt-1">Low</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-neutral-500 mb-1">Channel Avg</div>
              <div className="text-lg font-semibold text-neutral-300">
                {Number(data.predicted_view_range.channel_average).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Number(data.predicted_view_range.high).toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 mt-1">High</div>
            </div>
          </div>
          {data.multiplier_range && (
            <div className="text-center mt-4 text-sm text-neutral-400">
              {data.multiplier_range.low}x – {data.multiplier_range.high}x your average
            </div>
          )}
        </div>
      )}

      {/* Factors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positive Factors */}
        <div className="rounded-xl bg-surface-secondary border border-surface-border p-6">
          <h3 className="text-sm font-medium text-brand-green uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-green"></span>
            Working For You
          </h3>
          <div className="space-y-3">
            {data.positive_factors?.map((item, i) => (
              <div key={i} className="border-l-2 border-brand-green/30 pl-4">
                <div className="text-white font-medium text-sm">{item.factor}</div>
                <div className="text-neutral-400 text-sm mt-0.5">{item.explanation}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Factors */}
        <div className="rounded-xl bg-surface-secondary border border-surface-border p-6">
          <h3 className="text-sm font-medium text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            Risk Factors
          </h3>
          <div className="space-y-3">
            {data.risk_factors?.map((item, i) => (
              <div key={i} className="border-l-2 border-red-400/30 pl-4">
                <div className="text-white font-medium text-sm">{item.factor}</div>
                <div className="text-neutral-400 text-sm mt-0.5">{item.explanation}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-xl bg-surface-secondary border border-surface-border p-6">
        <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-4">
          Recommendations
        </h3>
        <div className="space-y-3">
          {data.recommendations?.map((rec, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-surface-tertiary">
              <div
                className="shrink-0 mt-0.5 px-2 py-0.5 rounded text-xs font-bold uppercase"
                style={{
                  color: IMPACT_COLORS[rec.impact],
                  background: `${IMPACT_COLORS[rec.impact]}15`,
                }}
              >
                {rec.impact}
              </div>
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                  {rec.type}
                </div>
                <div className="text-white text-sm">{rec.action}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
