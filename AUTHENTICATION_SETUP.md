# Authentication Setup with Clerk

This project uses Clerk's built-in authentication components with automatic user creation in the database.

## Setup Instructions

### 1. Clerk Dashboard Configuration

1. Go to your Clerk Dashboard
2. Navigate to **User & Authentication** > **Email, Phone, Username**
3. Enable **Username** as a required field during sign-up
4. Configure username requirements (3-20 characters, alphanumeric + underscores)

### 2. Environment Variables

Make sure you have these environment variables set:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### 3. Google AI Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the API key to your environment variables as `GOOGLE_AI_API_KEY`
4. The app uses Gemini's `embedding-001` model for generating embeddings

### 4. Database Migration

If you have an existing database, run the migration script:

```sql
-- Run the migration-add-username.sql file
-- If you have existing OpenAI embeddings, also run migration-gemini-embeddings.sql
```

## Authentication Flow

1. **Sign Up**: Users use Clerk's built-in SignUp component at `/signup`
2. **Dashboard Check**: When users visit `/dashboard`, the app checks if they exist in the database
3. **User Creation**: If user doesn't exist in database, they are automatically created
4. **Onboarding**: New users are redirected to `/onboarding` to complete their profile
5. **Dashboard Access**: After onboarding, users can access the dashboard

## API Endpoints

- `/api/auth/check-user` - Check if user exists and is onboarded
- `/api/auth/create-user` - Create new user in database
- `/api/auth/check-username` - Check username availability
- `/api/onboarding/save` - Save onboarding data

## Pages

- `/signup` - Clerk's SignUp component
- `/sign-in` - Clerk's SignIn component  
- `/onboarding` - Custom onboarding flow
- `/dashboard` - Main dashboard (handles user creation and onboarding checks)

## Features

✅ **Clerk Authentication**: Built-in sign-up/sign-in with email verification  
✅ **Username Support**: Unique usernames stored in database  
✅ **Automatic User Creation**: Users created in database on first dashboard visit  
✅ **Onboarding Flow**: Separate onboarding process after sign-up  
✅ **Database Sync**: Users automatically created in Supabase  
✅ **Authentication Guards**: Protected routes and redirects  
✅ **No Webhooks Required**: Simple setup without webhook configuration  

## How It Works

1. **User signs up** with Clerk at `/signup`
2. **User visits dashboard** at `/dashboard`
3. **App checks database** - if user doesn't exist, creates them
4. **App checks onboarding** - if not onboarded, redirects to `/onboarding`
5. **User completes onboarding** and gets full dashboard access

This approach eliminates the need for webhooks and works perfectly for local development! 