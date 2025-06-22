import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contentIdea, hashtag, userPassion, tone = 'educational' } = body;

    if (!contentIdea) {
      return NextResponse.json({ error: "Content idea is required" }, { status: 400 });
    }

    console.log("Generating script for:", { contentIdea, hashtag, userPassion, tone });

    // Use Google's Gemini API to generate the script
    const geminiApiKey = process.env.GOOGLE_AI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const toneInstructions = {
      educational: "educational, informative, and helpful tone with clear explanations and actionable tips",
      funny: "humorous, entertaining, and relatable tone with jokes, funny anecdotes, and light-hearted approach",
      motivational: "inspiring, empowering, and motivational tone with powerful statements and emotional impact"
    };

    const scriptPrompt = `You are a professional TikTok content creator and script writer. Create a complete, engaging script for a TikTok video based on this content idea:

Content Idea: ${contentIdea}
${hashtag ? `Hashtag: #${hashtag}` : ''}
${userPassion ? `Creator's Passion: ${userPassion}` : ''}
Tone: ${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.educational}

Create a complete script that includes:
1. A strong hook (first 3-5 seconds to grab attention)
2. Main content (engaging and informative, 30-45 seconds)
3. Call to action (encourage likes, follows, comments)
4. Relevant hashtags (3-5 hashtags)

Make it conversational, authentic, and optimized for TikTok's short-form format. The total script should be around 60 seconds when spoken.

Write a complete, ready-to-use script with actual content, not templates or placeholders. Make it specific to the content idea provided.

Format your response as a complete script that someone can immediately use to record their TikTok video.`;

    const thumbnailPrompt = `You are a professional thumbnail designer. Create a SHORT, compelling thumbnail prompt for a TikTok video based on this content idea:

Content Idea: ${contentIdea}
${hashtag ? `Hashtag: #${hashtag}` : ''}
${userPassion ? `Creator's Passion: ${userPassion}` : ''}
Tone: ${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.educational}

Create a SHORT thumbnail prompt (maximum 70 characters) that will generate an eye-catching, clickable thumbnail. The prompt should:
1. Be visually descriptive but concise
2. Include key visual elements (people, objects, backgrounds)
3. Match the tone and style of the content
4. Be optimized for TikTok's thumbnail format
5. Be short enough to work in URLs

Write a SHORT, visual prompt that an AI image generator can use. Focus on the most important visual elements only.

IMPORTANT: Keep your response under 70 characters. Format as a single, short thumbnail prompt.`;

    // Generate script
    const scriptResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: scriptPrompt
          }]
        }]
      })
    });

    if (!scriptResponse.ok) {
      const errorText = await scriptResponse.text();
      console.error("Gemini API error for script:", errorText);
      throw new Error(`Gemini API error: ${scriptResponse.status}`);
    }

    const scriptData = await scriptResponse.json();
    const script = scriptData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!script) {
      throw new Error("No script generated from Gemini API");
    }

    // Generate thumbnail prompt
    const thumbnailResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: thumbnailPrompt,
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 70,
        }
      })
    });

    if (!thumbnailResponse.ok) {
      const errorText = await thumbnailResponse.text();
      console.error("Gemini API error for thumbnail:", errorText);
      throw new Error(`Gemini API error: ${thumbnailResponse.status}`);
    }

    const thumbnailData = await thumbnailResponse.json();
    const thumbnailPromptResult = thumbnailData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!thumbnailPromptResult) {
      throw new Error("No thumbnail prompt generated from Gemini API");
    }

    // Truncate thumbnail prompt to 70 characters if it's too long
    const truncatedPrompt = thumbnailPromptResult.length > 70 
      ? thumbnailPromptResult.substring(0, 67) + '...' 
      : thumbnailPromptResult;

    console.log("Script and thumbnail prompt generated successfully");
    console.log("Script length:", script?.length);
    console.log("Thumbnail prompt length:", truncatedPrompt?.length);
    console.log("Thumbnail prompt preview:", truncatedPrompt?.substring(0, 100));

    return NextResponse.json({
      success: true,
      script: script,
      prompt: truncatedPrompt,
      contentIdea: contentIdea,
      hashtag: hashtag,
      userPassion: userPassion,
      tone: tone
    });

  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to generate script" },
      { status: 500 }
    );
  }
} 