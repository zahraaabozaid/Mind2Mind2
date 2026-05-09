/**
 * Supabase Edge Function: generate-session-summary
 *
 * Calls the Anthropic Claude API to generate a structured AI summary
 * for a completed session (exchange or masterclass), then stores it in
 * the session_summaries table.
 *
 * Environment variables required:
 *   ANTHROPIC_API_KEY
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SummaryRequest {
  sessionId: string;
  sessionType: 'exchange' | 'masterclass';
  sessionTitle: string;
  sessionTopic: string;
  expertName: string;
  learnerName: string;
  durationMinutes: number;
  sessionNotes?: string;
}

interface SessionSummary {
  summary: string;
  key_takeaways: string[];
  action_items_for_learner: string[];
  action_items_for_expert: string[];
  recommended_next_topics: string[];
  session_rating_suggestion: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: SummaryRequest = await req.json();
    const {
      sessionId,
      sessionType,
      sessionTitle,
      sessionTopic,
      expertName,
      learnerName,
      durationMinutes,
      sessionNotes = 'No notes provided',
    } = body;

    // Validate required fields
    if (!sessionId || !sessionType || !sessionTitle || !expertName || !learnerName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the prompt for Claude
    const prompt = `You are an expert learning coach. Generate a structured session summary in JSON format only (no markdown, no extra text, no code blocks) for this session:

Title: ${sessionTitle}
Topic: ${sessionTopic}
Expert: ${expertName}
Learner: ${learnerName}
Duration: ${durationMinutes} minutes
Session Type: ${sessionType === 'masterclass' ? 'Group Masterclass' : '1-on-1 Exchange'}
Notes: ${sessionNotes}

Return ONLY valid JSON matching this exact schema (no other text):
{
  "summary": "3-5 sentence overview of what was covered",
  "key_takeaways": ["point 1", "point 2", "point 3"],
  "action_items_for_learner": ["task 1", "task 2"],
  "action_items_for_expert": ["follow up 1"],
  "recommended_next_topics": ["topic A", "topic B"],
  "session_rating_suggestion": "brief note on session quality"
}`;

    // Call Anthropic Claude API (claude-sonnet-4-20250514 as specified)
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate summary from Claude API' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const claudeData = await claudeResponse.json();
    const rawContent = claudeData.content?.[0]?.text ?? '';

    // Parse the JSON response from Claude
    let parsedSummary: SessionSummary;
    try {
      parsedSummary = JSON.parse(rawContent);
    } catch {
      console.error('Failed to parse Claude response as JSON:', rawContent);
      return new Response(
        JSON.stringify({ error: 'Claude returned invalid JSON', raw: rawContent }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store the summary in Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: savedSummary, error: dbError } = await supabaseAdmin
      .from('session_summaries')
      .upsert({
        session_id: sessionId,
        session_type: sessionType,
        generated_summary: parsedSummary,
        generated_by_ai: true,
      }, { onConflict: 'session_id' })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving summary to database:', dbError);
      // Still return the summary even if DB save fails
      return new Response(
        JSON.stringify({ summary: parsedSummary, saved: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ summary: parsedSummary, saved: true, id: savedSummary.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
