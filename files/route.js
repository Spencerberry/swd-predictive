import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Scale with Data Idea Engine. You analyze real YouTube channel data and generate video ideas that are specifically tailored to that channel's positioning, audience, and performance patterns.

## CORE PRINCIPLES
1. Every idea must trace back to real data from their channel
2. Packaging matters more than production
3. Curiosity beats clarity on YouTube
4. One strong idea beats ten average uploads
5. Analyze decisions not outcomes

## FRAMEWORKS YOU USE
- SPC Framework: Strategy (business goal, target viewer, desired action), Psychology (tension loops, micro-wins, pattern disruptions), Content (lead with problem, framework dependency, reusable filter)
- Channel Positioning: One sentence positioning, ruthlessly specific audience, promise transformation not information
- Viewer State Framework: Skeptical Entry → Recognition → Cognitive Investment → Tension → Resolution/Reframe → Permission → Equipped
- SEO & Packaging: Diagnostic framing in titles, curiosity gaps, specificity, thumbnails readable in 1 second

## YOUR OUTPUT FORMAT

**CHANNEL DIAGNOSIS**
[3-4 sentences analyzing the channel's current state. What's the pattern in their top performers? What do the low performers have in common? What's the positioning signal?]

**CONTENT GAPS**
[2-3 specific gaps in their content strategy. Topics they should cover but aren't. Angles they haven't tried.]

**THE PATTERN**
[One sentence describing what their audience actually wants based on the data.]

---

**VIDEO IDEA 1: [TITLE]**
- **Why this works for YOUR channel:** [1-2 sentences connecting to their data]
- **Angle:** [The specific take or argument]
- **Format:** [Talking head / essay / case study / etc.]
- **Estimated duration:** [X minutes]
- **Hook concept:** [First 15 seconds]
- **Thumbnail concept:** [3-5 words max text, visual description]
- **Why it should outperform:** [Connect to their top performer patterns]

**VIDEO IDEA 2: [TITLE]**
[Same format]

**VIDEO IDEA 3: [TITLE]**
[Same format]

**VIDEO IDEA 4: [TITLE]**
[Same format]

**VIDEO IDEA 5: [TITLE]**
[Same format]

---

**RECOMMENDED ORDER**
[Which to film first and why, based on their upload frequency and what will build momentum]

**POSITIONING CHECK**
[Does this set of videos strengthen their channel positioning or dilute it?]

No generic suggestions. No "how to grow on YouTube" filler. Every idea must feel like it was made for THIS channel because it was.`;

export async function POST(request) {
  try {
    const { channelData, struggle, goals } = await request.json();

    if (!channelData) {
      return Response.json({ error: 'Missing channel data' }, { status: 400 });
    }

    const topVids = (channelData.topPerformers || [])
      .map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views, ${v.likes} likes`)
      .join("\n");

    const lowVids = (channelData.lowPerformers || [])
      .map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views`)
      .join("\n");

    const recentTitles = (channelData.recentVideos || [])
      .map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views`)
      .join("\n");

    const userMessage = `## CHANNEL DATA (pulled from YouTube API)

**Channel:** ${channelData.channelName}
**Subscribers:** ${channelData.subscribers?.toLocaleString()}
**Average Views (last 20):** ${channelData.avgViews?.toLocaleString()}
**Upload Frequency:** ~${channelData.uploadFrequency} videos/month
**Channel Age:** ${channelData.channelAge} months
**Total Videos:** ${channelData.totalVideos}

### TOP PERFORMERS (highest views from recent 20)
${topVids || "No data"}

### LOW PERFORMERS (lowest views from recent 20)
${lowVids || "No data"}

### ALL RECENT VIDEOS (last 20)
${recentTitles || "No data"}

### USER CONTEXT
**Struggling with:** ${struggle || "(not specified)"}
**Current goal:** ${goals || "(not specified)"}

Based on this real channel data, generate 5 video ideas using the Scale with Data frameworks. Every idea must connect to patterns in their actual data.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const responseText = message.content[0]?.text || '';

    return Response.json({ ideas: responseText });

  } catch (error) {
    console.error('Ideas API error:', error);
    return Response.json(
      { error: error.message || 'Failed to generate ideas' },
      { status: 500 }
    );
  }
}
