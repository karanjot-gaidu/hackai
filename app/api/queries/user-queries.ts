import { supabase } from '@/lib/supabase';

export interface UserProfile {
  clerk_id: string;
  email: string;
  username: string;
  full_name: string;
  is_onboarded: boolean;
  last_login_at?: string;
}

export interface OnboardingData {
  user_id: string;
  passion: string;
  comfort_level: string;
  time_available: string;
  main_goal: string;
  passion_embedding: number[]; // Gemini embedding (768 dimensions)
}

export interface UserPreferences {
  user_id: string;
  // Add other preference fields as needed
}

// User queries
export const getUserByClerkId = async (clerkId: string) => {
  return await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();
};

export const createUser = async (userData: {
  clerk_id: string;
  email: string;
  username: string;
  full_name: string;
  is_onboarded: boolean;
}) => {
  return await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();
};

export const updateUserLastLogin = async (clerkId: string) => {
  return await supabase
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('clerk_id', clerkId);
};

export const checkUsernameAvailability = async (username: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .single();
  
  return {
    available: !data && !error,
    error
  };
};

// Onboarding queries
export const getOnboardingData = async (userId: string) => {
  return await supabase
    .from('onboarding_data')
    .select('*')
    .eq('user_id', userId)
    .single();
};

export const saveOnboardingData = async (params: {
  p_user_id: string;
  p_passion: string;
  p_comfort_level: string;
  p_time_available: string;
  p_main_goal: string;
  p_passion_embedding: number[];
}) => {
  return await supabase.rpc('save_onboarding_data', params);
};

// User preferences queries
export const getUserPreferences = async (userId: string) => {
  return await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
}; 