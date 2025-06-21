import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createUser } from '../../queries/user-queries';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clerk_id, email, username } = body;

    // Validate required fields
    if (!clerk_id || !email || !username) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Construct full_name from firstName and lastName
    const full_name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

    // Create user in database
    const { data: newUser, error: createError } = await createUser({
      clerk_id,
      email,
      username,
      full_name,
      is_onboarded: false
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json({ 
        error: 'Failed to create user' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      user: newUser,
      message: 'User created successfully' 
    });

  } catch (error) {
    console.error('Error in create-user API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 