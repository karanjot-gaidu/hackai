import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserByClerkId, createUser, updateUserLastLogin, getOnboardingData } from '../../queries';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists in Supabase
    const { data: existingUser, error: fetchError } = await getUserByClerkId(user.id);

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching user:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (existingUser) {
      // User exists, update last login
      const { error: updateError } = await updateUserLastLogin(user.id);

      if (updateError) {
        console.error('Error updating last login:', updateError);
      }

      // If user is onboarded, fetch onboarding data
      let onboardingData = null;
      if (existingUser.is_onboarded) {
        const { data: onboarding, error: onboardingError } = await getOnboardingData(user.id);
        if (!onboardingError) {
          onboardingData = onboarding;
        }
      }

      return NextResponse.json({
        user: existingUser,
        onboardingData: onboardingData,
        exists: true,
        isOnboarded: existingUser.is_onboarded
      });
    }

    // User doesn't exist in database
    return NextResponse.json({
      user: null,
      onboardingData: null,
      exists: false,
      isOnboarded: false
    });

  } catch (error) {
    console.error('Error in check-user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 