import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { saveOnboardingData } from '../../queries';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Keep OpenAI import for potential future use
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// });

// Initialize Gemini for embeddings
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { passion, comfort_level, time_available, main_goal } = body;

    // Validate required fields
    if (!passion || !comfort_level || !time_available || !main_goal) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Generate embedding for passion using Gemini
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    const embeddingResult = await embeddingModel.embedContent(passion);
    const passion_embedding = embeddingResult.embedding.values;

    // Save onboarding data using the stored procedure
    const { data, error } = await saveOnboardingData({
      p_user_id: user.id,
      p_passion: passion,
      p_comfort_level: comfort_level,
      p_time_available: time_available,
      p_main_goal: main_goal,
      p_passion_embedding: passion_embedding
    });

    if (error) {
      console.error('Error saving onboarding data:', error);
      return NextResponse.json({ 
        error: 'Failed to save onboarding data' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding data saved successfully' 
    });

  } catch (error) {
    console.error('Error in onboarding save API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 