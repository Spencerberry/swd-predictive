import Anthropic from '@anthropic-ai/sdk';
import {
  PRE_PUBLISH_PROMPT,
  POST_PUBLISH_PROMPT,
  buildPrePublishUserMessage,
  buildPostPublishUserMessage,
} from '@/lib/prompts';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { mode, baseline, video, performance } = body;

    if (!mode || !baseline || !video) {
      return Response.json(
        { error: 'Missing required fields: mode, baseline, video' },
        { status: 400 }
      );
    }

    const isPrePublish = mode === 'pre-publish';

    const systemPrompt = isPrePublish ? PRE_PUBLISH_PROMPT : POST_PUBLISH_PROMPT;

    const userMessage = isPrePublish
      ? buildPrePublishUserMessage(baseline, video)
      : buildPostPublishUserMessage(baseline, video, performance);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const responseText = message.content[0]?.text || '';

    // Parse JSON response from Claude
    let prediction;
    try {
      // Strip any accidental markdown fences
      const cleaned = responseText
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      prediction = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return Response.json(
        { error: 'Failed to parse prediction response. Please try again.' },
        { status: 500 }
      );
    }

    return Response.json({ prediction, mode });

  } catch (error) {
    console.error('Prediction API error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
