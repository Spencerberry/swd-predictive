export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');

    if (!handle) {
      return Response.json({ error: 'Missing channel handle' }, { status: 400 });
    }

    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) {
      return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    // Clean the handle — remove @ if present, trim whitespace
    const cleanHandle = handle.trim().replace(/^@/, '');

    // Step 1: Get channel by handle
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&forHandle=${encodeURIComponent(cleanHandle)}&key=${API_KEY}`
    );
    const channelData = await channelRes.json();

    if (!channelData.items || channelData.items.length === 0) {
      // Try as a channel ID or custom URL fallback
      const fallbackRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&forUsername=${encodeURIComponent(cleanHandle)}&key=${API_KEY}`
      );
      const fallbackData = await fallbackRes.json();

      if (!fallbackData.items || fallbackData.items.length === 0) {
        return Response.json({ error: 'Channel not found. Try using the exact YouTube handle (e.g. @Spencerlberry)' }, { status: 404 });
      }

      channelData.items = fallbackData.items;
    }

    const channel = channelData.items[0];
    const channelId = channel.id;
    const channelName = channel.snippet.title;
    const subscribers = parseInt(channel.statistics.subscriberCount) || 0;
    const totalVideos = parseInt(channel.statistics.videoCount) || 0;
    const channelCreated = channel.snippet.publishedAt;

    // Calculate channel age in months
    const createdDate = new Date(channelCreated);
    const now = new Date();
    const channelAgeMonths = Math.max(1,
      (now.getFullYear() - createdDate.getFullYear()) * 12 + (now.getMonth() - createdDate.getMonth())
    );

    // Step 2: Get recent videos (last 20)
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&order=date&type=video&maxResults=20&key=${API_KEY}`
    );
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) {
      return Response.json({
        channelName,
        subscribers,
        avgViews: 0,
        uploadFrequency: 0,
        channelAge: channelAgeMonths,
        totalVideos,
        recentVideoCount: 0,
        category: '',
      });
    }

    const videoIds = searchData.items.map(item => item.id.videoId).filter(Boolean).join(',');

    // Step 3: Get video details (views, publish dates, durations, categories)
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoIds}&key=${API_KEY}`
    );
    const videosData = await videosRes.json();

    if (!videosData.items || videosData.items.length === 0) {
      return Response.json({
        channelName,
        subscribers,
        avgViews: 0,
        uploadFrequency: 0,
        channelAge: channelAgeMonths,
        totalVideos,
        recentVideoCount: 0,
        category: '',
      });
    }

    const videos = videosData.items;

    // Calculate average views
    const viewCounts = videos.map(v => parseInt(v.statistics.viewCount) || 0);
    const avgViews = Math.round(viewCounts.reduce((sum, v) => sum + v, 0) / viewCounts.length);

    // Calculate upload frequency (videos per month based on date range of recent videos)
    const publishDates = videos
      .map(v => new Date(v.snippet.publishedAt))
      .sort((a, b) => a - b);

    let uploadFrequency = 4; // default
    if (publishDates.length >= 2) {
      const oldest = publishDates[0];
      const newest = publishDates[publishDates.length - 1];
      const daySpan = Math.max(1, (newest - oldest) / (1000 * 60 * 60 * 24));
      const monthSpan = daySpan / 30;
      uploadFrequency = Math.round(publishDates.length / Math.max(0.5, monthSpan));
    }

    // Get the most common category from recent videos
    const categoryCounts = {};
    videos.forEach(v => {
      const catId = v.snippet.categoryId;
      categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
    });
    const topCategoryId = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    // Map YouTube category IDs to our app categories
    const categoryMap = {
      '1': 'Entertainment & Commentary',
      '2': 'Entertainment & Commentary',
      '10': 'Entertainment & Commentary',
      '15': 'Entertainment & Commentary',
      '17': 'Entertainment & Commentary',
      '18': 'Entertainment & Commentary',
      '19': 'Lifestyle & Vlog',
      '20': 'Entertainment & Commentary',
      '22': 'Lifestyle & Vlog',
      '23': 'Entertainment & Commentary',
      '24': 'Entertainment & Commentary',
      '25': 'Education & How-To',
      '26': 'Education & How-To',
      '27': 'Education & How-To',
      '28': 'Technology & Software',
      '29': 'Entertainment & Commentary',
      '30': 'Entertainment & Commentary',
    };

    const mappedCategory = categoryMap[topCategoryId] || '';

    // Build recent videos summary for display
    const recentVideos = videos.slice(0, 10).map(v => ({
      title: v.snippet.title,
      views: parseInt(v.statistics.viewCount) || 0,
      likes: parseInt(v.statistics.likes) || 0,
      comments: parseInt(v.statistics.commentCount) || 0,
      publishedAt: v.snippet.publishedAt,
    }));

    return Response.json({
      channelName,
      subscribers,
      avgViews,
      uploadFrequency,
      channelAge: channelAgeMonths,
      totalVideos,
      recentVideoCount: videos.length,
      category: mappedCategory,
      recentVideos,
    });

  } catch (error) {
    console.error('YouTube API error:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch channel data' },
      { status: 500 }
    );
  }
}
