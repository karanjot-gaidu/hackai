import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

interface ContentIdea {
  title: string;
  description: string;
  type: 'video' | 'post' | 'story' | 'reel';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  trendingContext?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting hashtag insights generation...');
    
    const { hashtag, userPassion } = await request.json();
    console.log('📝 Received hashtag:', hashtag, 'userPassion:', userPassion);

    if (!hashtag) {
      return NextResponse.json(
        { error: 'Hashtag is required' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('❌ GOOGLE_AI_API_KEY not found');
      return NextResponse.json(
        { error: 'GOOGLE_AI_API_KEY not found' },
        { status: 500 }
      );
    }

    console.log('✅ API key found, length:', process.env.GOOGLE_AI_API_KEY.length);

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

    // Generate content ideas based on the hashtag and user passion
    console.log('💡 Generating content ideas...');
    
    const prompt = `You are a TikTok content creation expert. The hashtag #${hashtag} is currently trending on TikTok. 

Creator's passion: ${userPassion || 'general content creation'}

Based on this hashtag and the creator's passion, generate 3 creative, specific, and actionable content ideas. Consider:
- Why this hashtag might be trending
- How to make content that's relevant and engaging
- Different content types and difficulty levels
- Ways to stand out while using the trending hashtag

Generate 3 content ideas in this exact JSON format:
[
  {
    "title": "Creative title for the content",
    "description": "Detailed description of what to create and how to execute it",
    "type": "video|post|story|reel",
    "difficulty": "beginner|intermediate|advanced"
  }
]

Make the ideas specific, actionable, and relevant to the trending hashtag. Include different content types and difficulty levels.`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    console.log('✅ Content ideas generated');
    const responseText = response.text;

    // Parse the JSON response
    let contentIdeas: ContentIdea[] = [];
    try {
      // Extract JSON from the response
      const jsonMatch = responseText?.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        contentIdeas = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed', contentIdeas.length, 'content ideas');
      } else {
        console.warn('⚠️ Could not extract JSON, using fallback ideas');
        contentIdeas = [
          {
            title: `Creative #${hashtag} Content`,
            description: `Create engaging content using the trending hashtag #${hashtag}. Focus on what makes this hashtag special and how you can add your unique perspective.`,
            type: 'video',
            difficulty: 'beginner'
          }
        ];
      }
    } catch (parseError) {
      console.error('❌ Error parsing JSON:', parseError);
      // Fallback content ideas
      contentIdeas = [
        {
          title: `Creative #${hashtag} Content`,
          description: `Create engaging content using the trending hashtag #${hashtag}. Focus on what makes this hashtag special and how you can add your unique perspective.`,
          type: 'video',
          difficulty: 'beginner'
        }
      ];
    }

    return NextResponse.json({
      success: true,
      hashtag,
      trendingContext: `The hashtag #${hashtag} is currently trending on TikTok. Create content that's authentic to your style while leveraging this trending topic.`,
      contentIdeas
    });

  } catch (error) {
    console.error('❌ Error generating hashtag insights:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 