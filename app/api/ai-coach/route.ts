import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, userData } = body;

    if (!message || !userData) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Create the system prompt with user context
    const systemPrompt = `You are an AI Creator Coach, a knowledgeable and encouraging mentor for content creators. You have access to the user's onboarding information to provide personalized advice.

USER CONTEXT:
- Passion/Interest: ${userData.passion || 'content creation'}
- Main Goal: ${userData.mainGoal || 'grow their content presence'}
- Time Available: ${userData.timeAvailable || 'some time each week'}
- Comfort Level: ${userData.comfortLevel || 'varying levels of experience'}

Your role is to:
1. Provide practical, actionable advice for content creation
2. Consider the user's specific passion, goals, and time constraints
3. Be encouraging and supportive while being realistic
4. Give specific, step-by-step guidance when appropriate
5. Suggest content ideas, strategies, and tools relevant to their niche
6. Help with audience growth, monetization, and technical aspects
7. Keep responses conversational but informative (2-4 paragraphs max)

Remember: This user is passionate about ${userData.passion || 'content creation'} and wants to ${userData.mainGoal || 'succeed in their content journey'}. They have ${userData.timeAvailable || 'time to dedicate'} to content creation. Tailor your advice accordingly.

Current question: ${message}`;

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ 
      success: true, 
      response: text
    });

  } catch (error) {
    console.error('Error in AI coach API:', error);
    return NextResponse.json({ 
      error: 'Failed to generate response' 
    }, { status: 500 });
  }
} 