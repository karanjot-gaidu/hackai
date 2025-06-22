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

    const prompt = `You are a professional TikTok content creator and script writer. Create a complete, engaging script for a TikTok video based on this content idea:

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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const script = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!script) {
      throw new Error("No script generated from Gemini API");
    }

    console.log("Script generated successfully");

    return NextResponse.json({
      success: true,
      script: script,
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