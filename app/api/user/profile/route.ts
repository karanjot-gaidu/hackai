import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserByClerkId, getOnboardingData, getUserPreferences } from '../../queries';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: userProfile, error: userError } = await getUserByClerkId(user.id);

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get onboarding data if user is onboarded
    let onboardingData = null;
    if (userProfile.is_onboarded) {
      const { data: onboarding, error: onboardingError } = await getOnboardingData(user.id);

      if (!onboardingError) {
        onboardingData = onboarding;
      }
    }

    // Get user preferences
    const { data: preferences, error: preferencesError } = await getUserPreferences(user.id);

    return NextResponse.json({
      user: userProfile,
      onboardingData,
      preferences: preferencesError ? null : preferences
    });

  } catch (error) {
    console.error('Error in get-user-profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 