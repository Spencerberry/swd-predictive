-- =============================================
-- SWD Predictive Tool — Database Schema
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor → New Query)
-- =============================================

-- 1. Channel Profiles — stores saved channel baselines
create table channel_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  channel_name text not null,
  subscribers integer not null,
  avg_views integer not null,
  avg_ctr numeric(5,2) not null,
  avg_retention numeric(5,2) not null,
  upload_frequency integer,
  category text,
  channel_age integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Predictions — stores every prediction result
create table predictions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  channel_profile_id uuid references channel_profiles(id) on delete set null,
  mode text not null check (mode in ('pre-publish', 'post-publish')),
  
  -- Video inputs
  video_title text not null,
  video_topic text,
  video_duration numeric(6,1),
  video_format text,
  publish_day text,
  publish_time text,
  thumbnail_description text,
  is_new_topic boolean default false,
  confidence integer,

  -- Post-publish performance inputs (null for pre-publish)
  checkpoint text,
  perf_views integer,
  perf_ctr numeric(5,2),
  perf_avg_view_duration numeric(5,2),
  perf_top_traffic_source text,
  perf_top_traffic_percent numeric(5,2),
  perf_sub_conversion numeric(5,2),
  perf_likes integer,
  perf_comments integer,

  -- Prediction output
  prediction text not null check (prediction in ('outperform', 'normal', 'underperform')),
  confidence_score integer,
  trajectory text,
  predicted_low integer,
  predicted_high integer,
  channel_average integer,
  
  -- Full JSON response for detailed display
  full_response jsonb not null,

  -- Actual results (filled in later manually)
  actual_views_7d integer,
  actual_outcome text check (actual_outcome in ('outperform', 'normal', 'underperform', null)),

  created_at timestamptz default now()
);

-- 3. Row Level Security — users can only see their own data
alter table channel_profiles enable row level security;
alter table predictions enable row level security;

create policy "Users can view own profiles"
  on channel_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profiles"
  on channel_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profiles"
  on channel_profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete own profiles"
  on channel_profiles for delete
  using (auth.uid() = user_id);

create policy "Users can view own predictions"
  on predictions for select
  using (auth.uid() = user_id);

create policy "Users can insert own predictions"
  on predictions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own predictions"
  on predictions for update
  using (auth.uid() = user_id);

-- 4. Index for fast lookups
create index idx_channel_profiles_user on channel_profiles(user_id);
create index idx_predictions_user on predictions(user_id);
create index idx_predictions_created on predictions(created_at desc);
