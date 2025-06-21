import { NextRequest, NextResponse } from 'next/server';
import { checkUsernameAvailability } from '../../queries/user-queries';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ 
        available: false, 
        error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores' 
      });
    }

    const { available, error } = await checkUsernameAvailability(username);

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking username:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ available });

  } catch (error) {
    console.error('Error in check-username API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 