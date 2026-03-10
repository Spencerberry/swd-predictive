'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { CONTENT_CATEGORIES } from '@/lib/constants';

export default function ChannelBaseline({ baseline, setBaseline }) {
  const { user } = useAuth();
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [activeProfileId, setActiveProfileId] = useState(null);

  // YouTube fetch state
  const [ytHandle, setYtHandle] = useState('');
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState('');
  const [ytSuccess, setYtSuccess] = useState('');
  const [recentVideos, setRecentVideos] = useState(null);
  const [showVideos, setShowVideos] = useState(false);

  // Load saved profiles on mount
  useEffect(() => {
    if (!user) return;
    loadProfiles();
  }, [user]);

  const loadProfiles = async () => {
    setLoadingProfiles(true);
    const { data, error } = await supabase
      .from('channel_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setSavedProfiles(data);
      if (data.length > 0 && !activeProfileId) {
        selectProfile(data[0]);
      }
    }
    setLoadingProfiles(false);
  };

  const selectProfile = (profile) => {
    setActiveProfileId(profile.id);
    setBaseline({
      channelName: profile.channel_name,
      subscribers: String(profile.subscribers),
      avgViews: String(profile.avg_views),
      avgCTR: String(profile.avg_ctr),
      avgRetention: String(profile.avg_retention),
      uploadFrequency: String(profile.upload_frequency || ''),
      category: profile.category || CONTENT_CATEGORIES[0],
      channelAge: String(profile.channel_age || ''),
    });
  };

  const saveProfile = async () => {
    if (!baseline.channelName || !baseline.subscribers || !baseline.avgViews) {
      setSaveMsg('Fill in at least channel name, subscribers, and avg views.');
      return;
    }

    setSaving(true);
    setSaveMsg('');

    const profileData = {
      user_id: user.id,
      channel_name: baseline.channelName,
      subscribers: parseInt(baseline.subscribers),
      avg_views: parseInt(baseline.avgViews),
      avg_ctr: parseFloat(baseline.avgCTR) || 0,
      avg_retention: parseFloat(baseline.avgRetention) || 0,
      upload_frequency: parseInt(baseline.uploadFrequency) || null,
      category: baseline.category,
      channel_age: parseInt(baseline.channelAge) || null,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (activeProfileId) {
      ({ error } = await supabase
        .from('channel_profiles')
        .update(profileData)
        .eq('id', activeProfileId));
    } else {
      const { data, error: insertError } = await supabase
        .from('channel_profiles')
        .insert(profileData)
        .select()
        .single();
      error = insertError;
      if (data) setActiveProfileId(data.id);
    }

    if (error) {
      setSaveMsg('Failed to save: ' + error.message);
    } else {
      setSaveMsg('Saved!');
      loadProfiles();
      setTimeout(() => setSaveMsg(''), 2000);
    }

    setSaving(false);
  };

  const fetchFromYouTube = async () => {
    if (!ytHandle.trim()) {
      setYtError('Enter a YouTube handle (e.g. @Spencerlberry)');
      return;
    }

    setYtLoading(true);
    setYtError('');
    setYtSuccess('');
    setRecentVideos(null);

    try {
      const res = await fetch(`/api/youtube/channel?handle=${encodeURIComponent(ytHandle.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch channel data');
      }

      // Auto-fill the baseline fields
      setBaseline(prev => ({
        ...prev,
        channelName: data.channelName || prev.channelName,
        subscribers: String(data.subscribers || prev.subscribers),
        avgViews: String(data.avgViews || prev.avgViews),
        uploadFrequency: String(data.uploadFrequency || prev.uploadFrequency),
        channelAge: String(data.channelAge || prev.channelAge),
        category: data.category || prev.category,
      }));

      if (data.recentVideos) {
        setRecentVideos(data.recentVideos);
      }

      const filled = ['Channel name', 'subscribers', 'avg views', 'upload frequency', 'channel age'].join(', ');
      setYtSuccess(`Pulled data for ${data.channelName} — auto-filled ${filled}. Add your CTR and retention manually from YouTube Studio.`);

      // Clear the active profile since this is new data
      setActiveProfileId(null);

    } catch (err) {
      setYtError(err.message);
    } finally {
      setYtLoading(false);
    }
  };

  const handleYtKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchFromYouTube();
    }
  };

  const updateField = (field, value) => {
    setBaseline(prev => ({ ...prev, [field]: value }));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return String(num);
  };

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-brand-green/15 flex items-center justify-center text-brand-green text-sm font-bold">1</div>
        <h2 className="text-lg font-semibold text-white">Channel Baseline</h2>
      </div>

      <div className="rounded-xl bg-surface-secondary border border-surface-border p-6">

        {/* YouTube Auto-Fetch */}
        <div className="mb-5 pb-5 border-b border-surface-border">
          <label className="block text-sm text-neutral-400 mb-2">
            Import from YouTube
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-neutral-500">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
              <input
                type="text"
                value={ytHandle}
                onChange={e => setYtHandle(e.target.value)}
                onKeyDown={handleYtKeyDown}
                placeholder="@channelhandle"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-tertiary border border-surface-border text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-brand-green/50 transition-colors"
              />
            </div>
            <button
              onClick={fetchFromYouTube}
              disabled={ytLoading}
              className="px-5 py-2.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-600/30 hover:border-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {ytLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Fetching...
                </>
              ) : (
                'Fetch Channel'
              )}
            </button>
          </div>

          {ytError && (
            <p className="mt-2 text-sm text-red-400">{ytError}</p>
          )}
          {ytSuccess && (
            <p className="mt-2 text-sm text-brand-green">{ytSuccess}</p>
          )}

          {/* Recent Videos Preview */}
          {recentVideos && recentVideos.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowVideos(!showVideos)}
                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1"
              >
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`transition-transform ${showVideos ? 'rotate-90' : ''}`}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                {showVideos ? 'Hide' : 'Show'} recent videos ({recentVideos.length})
              </button>

              {showVideos && (
                <div className="mt-2 space-y-1.5 max-h-60 overflow-y-auto">
                  {recentVideos.map((v, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-tertiary/50 text-xs">
                      <span className="text-neutral-300 truncate flex-1 mr-3">{v.title}</span>
                      <span className="text-neutral-500 whitespace-nowrap">{formatNumber(v.views)} views</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Saved Profiles Selector */}
        {savedProfiles.length > 0 && (
          <div className="mb-5 pb-5 border-b border-surface-border">
            <label className="block text-sm text-neutral-400 mb-2">Saved Channels</label>
            <div className="flex flex-wrap gap-2">
              {savedProfiles.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => selectProfile(profile)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeProfileId === profile.id
                      ? 'bg-brand-green/15 text-brand-green border border-brand-green/30'
                      : 'bg-surface-tertiary text-neutral-400 border border-surface-border hover:border-neutral-600'
                  }`}
                >
                  {profile.channel_name}
                </button>
              ))}
              <button
                onClick={() => {
                  setActiveProfileId(null);
                  setBaseline({
                    channelName: '', subscribers: '', avgViews: '', avgCTR: '',
                    avgRetention: '', uploadFrequency: '', category: CONTENT_CATEGORIES[0], channelAge: '',
                  });
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-surface-tertiary text-neutral-500 border border-surface-border hover:border-neutral-600 transition-all"
              >
                + New Channel
              </button>
            </div>
          </div>
        )}

        {loadingProfiles ? (
          <div className="h-32 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Channel Name" value={baseline.channelName} onChange={v => updateField('channelName', v)} placeholder="e.g. Grow with Spencer" />
              <InputField label="Subscribers" value={baseline.subscribers} onChange={v => updateField('subscribers', v)} placeholder="e.g. 5000" type="number" />
              <InputField label="Avg Views / Video (last 20)" value={baseline.avgViews} onChange={v => updateField('avgViews', v)} placeholder="e.g. 1200" type="number" />
              <InputField label="Avg CTR (%)" value={baseline.avgCTR} onChange={v => updateField('avgCTR', v)} placeholder="e.g. 5.5 — from YouTube Studio" type="number" step="0.1" />
              <InputField label="Avg Retention / AVD (%)" value={baseline.avgRetention} onChange={v => updateField('avgRetention', v)} placeholder="e.g. 42 — from YouTube Studio" type="number" step="0.1" />
              <InputField label="Upload Frequency (videos/month)" value={baseline.uploadFrequency} onChange={v => updateField('uploadFrequency', v)} placeholder="e.g. 4" type="number" />
              <SelectField label="Primary Category" value={baseline.category} onChange={v => updateField('category', v)} options={CONTENT_CATEGORIES.map(c => ({ value: c, label: c }))} />
              <InputField label="Channel Age (months)" value={baseline.channelAge} onChange={v => updateField('channelAge', v)} placeholder="e.g. 18" type="number" />
            </div>

            {/* Note about manual fields */}
            <p className="mt-3 text-xs text-neutral-600">
              CTR and Retention can only be found in YouTube Studio → Analytics → Advanced. The YouTube API cannot access these.
            </p>

            {/* Save Button */}
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-surface-tertiary border border-surface-border text-sm font-medium text-white hover:border-brand-green/40 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : activeProfileId ? 'Update Profile' : 'Save Channel'}
              </button>
              {saveMsg && (
                <span className={`text-sm ${saveMsg === 'Saved!' ? 'text-brand-green' : 'text-red-400'}`}>
                  {saveMsg}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}


/* ─── Form Components ─── */

function InputField({ label, value, onChange, placeholder, type = 'text', step }) {
  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1.5">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg bg-surface-tertiary border border-surface-border text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-brand-green/50 transition-colors"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg bg-surface-tertiary border border-surface-border text-white text-sm focus:outline-none focus:border-brand-green/50 transition-colors appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
      >
        {options.map(opt => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lab = typeof opt === 'string' ? opt : opt.label;
          return <option key={val} value={val}>{lab}</option>;
        })}
      </select>
    </div>
  );
}
