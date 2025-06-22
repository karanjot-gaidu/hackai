import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, context } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Call Gemini to enhance the prompt and generate thumbnail ideas
    const enhancedPrompt = await enhancePrompt(prompt, context);
    const thumbnailIdeas = await generateThumbnailIdeas(enhancedPrompt);

    return NextResponse.json({
      success: true,
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt,
      thumbnailIdeas: thumbnailIdeas
    });

  } catch (error) {
    console.error("Thumbnail ideas generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate thumbnail ideas" },
      { status: 500 }
    );
  }
}

async function enhancePrompt(originalPrompt: string, context?: string): Promise<string> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Enhance this prompt for a short video thumbnail: "${originalPrompt}". Make it visually compelling with colors, NO text overlays, and composition details The image should be relevant to the prompt. Write in one paragraph.`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 70,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Unexpected Gemini API response structure:', data);
      return originalPrompt;
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error enhancing prompt with Gemini:', error);
    // Fallback to original prompt if Gemini enhancement fails
    return originalPrompt;
  }
}

async function generateThumbnailIdeas(enhancedPrompt: string): Promise<string[]> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Based on this prompt: "${enhancedPrompt}", give 3 thumbnail ideas in a JSON array format: ["idea 1", "idea 2", "idea 3"]`
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 300,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Unexpected Gemini API response structure:', data);
      return [
        "Bold text overlay with dramatic lighting",
        "Split-screen comparison with vibrant colors",
        "Close-up shot with emotional expression"
      ];
    }
    
    const content = data.candidates[0].content.parts[0].text;
    
    try {
      // Try to parse as JSON
      const ideas = JSON.parse(content);
      return Array.isArray(ideas) ? ideas.slice(0, 3) : [content];
    } catch {
      // If not valid JSON, split by lines and take first 3
      const lines = content.split('\n').filter((line: string) => line.trim());
      return lines.slice(0, 3);
    }
  } catch (error) {
    console.error('Error generating thumbnail ideas with Gemini:', error);
    // Fallback ideas
    return [
      "Bold text overlay with dramatic lighting",
      "Split-screen comparison with vibrant colors",
      "Close-up shot with emotional expression"
    ];
  }
} 