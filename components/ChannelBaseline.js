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
      // Auto-load the most recent profile
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
      // Update existing
      ({ error } = await supabase
        .from('channel_profiles')
        .update(profileData)
        .eq('id', activeProfileId));
    } else {
      // Insert new
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

  const updateField = (field, value) => {
    setBaseline(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-brand-green/15 flex items-center justify-center text-brand-green text-sm font-bold">1</div>
        <h2 className="text-lg font-semibold text-white">Channel Baseline</h2>
      </div>

      <div className="rounded-xl bg-surface-secondary border border-surface-border p-6">
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
              <InputField label="Avg CTR (%)" value={baseline.avgCTR} onChange={v => updateField('avgCTR', v)} placeholder="e.g. 5.5" type="number" step="0.1" />
              <InputField label="Avg Retention / AVD (%)" value={baseline.avgRetention} onChange={v => updateField('avgRetention', v)} placeholder="e.g. 42" type="number" step="0.1" />
              <InputField label="Upload Frequency (videos/month)" value={baseline.uploadFrequency} onChange={v => updateField('uploadFrequency', v)} placeholder="e.g. 4" type="number" />
              <SelectField label="Primary Category" value={baseline.category} onChange={v => updateField('category', v)} options={CONTENT_CATEGORIES.map(c => ({ value: c, label: c }))} />
              <InputField label="Channel Age (months)" value={baseline.channelAge} onChange={v => updateField('channelAge', v)} placeholder="e.g. 18" type="number" />
            </div>

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
