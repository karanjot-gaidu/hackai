import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results: any = {};

    // Test 1: Check if we can connect to Supabase
    try {
      const { data, error } = await supabase.from('users').select('clerk_id').limit(1);
      if (error) {
        results.connection = { error: error.message };
      } else {
        results.connection = { success: true, data };
      }
    } catch (e) {
      results.connection = { error: e instanceof Error ? e.message : 'Unknown error' };
    }

    // Test 2: Check storage bucket
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        results.storage = { error: error.message };
      } else {
        results.storage = { success: true, buckets: buckets.map(b => b.name) };
      }
    } catch (e) {
      results.storage = { error: e instanceof Error ? e.message : 'Unknown error' };
    }

    // Test 3: Check if ai-generated-images bucket exists
    try {
      const { data: files, error } = await supabase.storage
        .from('ai-generated-images')
        .list('', { limit: 1 });
      
      if (error) {
        results.aiGeneratedImagesBucket = { error: error.message };
      } else {
        results.aiGeneratedImagesBucket = { success: true, filesCount: files?.length || 0 };
      }
    } catch (e) {
      results.aiGeneratedImagesBucket = { error: e instanceof Error ? e.message : 'Unknown error' };
    }

    // Test 4: Check database functions
    try {
      const { data, error } = await supabase
        .from('image_generations')
        .select('*')
        .eq('user_id', userId)
        .limit(1);
      
      if (error) {
        results.databaseFunctions = { error: error.message };
      } else {
        results.databaseFunctions = { success: true, recordsCount: data?.length || 0 };
      }
    } catch (e) {
      results.databaseFunctions = { error: e instanceof Error ? e.message : 'Unknown error' };
    }

    // Test 5: Check user exists in database
    try {
      const { data, error } = await supabase
        .from('users')
        .select('clerk_id, email, full_name')
        .eq('clerk_id', userId)
        .single();
      
      if (error) {
        results.userExists = { error: error.message };
      } else {
        results.userExists = { success: true, user: data };
      }
    } catch (e) {
      results.userExists = { error: e instanceof Error ? e.message : 'Unknown error' };
    }

    return NextResponse.json({
      success: true,
      userId,
      results
    });

  } catch (error) {
    console.error("Supabase test error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to test Supabase" },
      { status: 500 }
    );
  }
} 