import { supabase } from './supabase';

export async function savePrediction({ userId, channelProfileId, mode, video, performance, prediction }) {
  const record = {
    user_id: userId,
    channel_profile_id: channelProfileId || null,
    mode,
    video_title: video.title,
    video_topic: video.topic,
    video_duration: parseFloat(video.duration) || null,
    video_format: video.format,
    publish_day: video.publishDay || null,
    publish_time: video.publishTime || null,
    thumbnail_description: video.thumbnailDescription || null,
    is_new_topic: video.isNewTopic || false,
    confidence: parseInt(video.confidence) || null,

    // Post-publish fields
    checkpoint: performance?.checkpoint || null,
    perf_views: performance?.views ? parseInt(performance.views) : null,
    perf_ctr: performance?.ctr ? parseFloat(performance.ctr) : null,
    perf_avg_view_duration: performance?.avgViewDuration ? parseFloat(performance.avgViewDuration) : null,
    perf_top_traffic_source: performance?.topTrafficSource || null,
    perf_top_traffic_percent: performance?.topTrafficPercent ? parseFloat(performance.topTrafficPercent) : null,
    perf_sub_conversion: performance?.subConversion ? parseFloat(performance.subConversion) : null,
    perf_likes: performance?.likes ? parseInt(performance.likes) : null,
    perf_comments: performance?.comments ? parseInt(performance.comments) : null,

    // Prediction output
    prediction: prediction.prediction,
    confidence_score: prediction.confidence,
    trajectory: prediction.trajectory || null,
    predicted_low: prediction.predicted_view_range?.low || prediction.predicted_7day_views?.low || null,
    predicted_high: prediction.predicted_view_range?.high || prediction.predicted_7day_views?.high || null,
    channel_average: prediction.predicted_view_range?.channel_average || prediction.predicted_7day_views?.channel_average || null,
    full_response: prediction,
  };

  const { data, error } = await supabase
    .from('predictions')
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error('Failed to save prediction:', error);
    return null;
  }

  return data;
}

export async function getPredictions(userId) {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load predictions:', error);
    return [];
  }

  return data;
}

export async function updateActualOutcome(predictionId, actualViews, actualOutcome) {
  const { error } = await supabase
    .from('predictions')
    .update({
      actual_views_7d: actualViews,
      actual_outcome: actualOutcome,
    })
    .eq('id', predictionId);

  return !error;
}

export async function getActiveProfileId(userId) {
  const { data } = await supabase
    .from('channel_profiles')
    .select('id')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  return data?.id || null;
}
