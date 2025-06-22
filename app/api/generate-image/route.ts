import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Text prompt is required" }, { status: 400 });
    }

    console.log("Generating image for prompt:", text);
    const modalUrl = process.env.MODAL_URL || "";
    
    if (!modalUrl) {
      console.error("MODAL_URL environment variable is not set");
      return NextResponse.json({ error: "Modal URL not configured" }, { status: 500 });
    }

    const url = new URL(modalUrl);
    url.searchParams.set("prompt", text);
    const startTime = new Date();
    console.log("Requesting URL:", url.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "image/jpeg",
      },
    });

    console.log("Modal response status:", response.status);
    console.log("Modal response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Modal API Response error:", errorText);
      throw new Error(
        `Modal API error! status: ${response.status}, message: ${errorText}`
      );
    }

    const imageBuffer = await response.arrayBuffer();
    console.log("Image buffer size:", imageBuffer.byteLength, "bytes");

    if (imageBuffer.byteLength === 0) {
      throw new Error("Received empty image buffer from Modal API");
    }

    // Convert buffer to base64 for direct display
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    const endTime = new Date();
    const generationTime = (endTime.getTime() - startTime.getTime()) / 1000;

    console.log('Attempting to store in database:', {
      userId: userId,
      prompt: text,
      imageUrl: dataUrl,
      filePath: 'base64-storage',
      generationTime: generationTime
    });

    // Store image generation record in database directly (no RLS)
    const { data: dbData, error: dbError } = await supabase
      .from('image_generations')
      .insert({
        user_id: userId,
        prompt: text,
        image_url: dataUrl,
        image_path: 'base64-storage',
        generation_time_seconds: generationTime,
        model_used: 'stable-diffusion-3.5-large',
        metadata: {
          modal_url: modalUrl,
          response_status: response.status,
          file_size: imageBuffer.byteLength,
          storage_type: 'base64'
        }
      })
      .select('id')
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Continue without database storage
    } else {
      console.log("Database storage successful:", dbData);
    }

    // Get image history for the user directly (no RLS)
    const { data: historyData, error: historyError } = await supabase
      .from('image_generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (historyError) {
      console.error("History fetch error:", historyError);
    } else {
      console.log("History fetch successful, records:", historyData?.length || 0);
    }

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      imagePath: 'base64-storage',
      generationId: dbData?.id,
      generationTime: generationTime,
      records: historyData || [],
      fallback: true
    });

  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve image history
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await supabase
      .from('image_generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("History fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch image history" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      records: data || []
    });

  } catch (error) {
    console.error("Image history error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch image history" },
      { status: 500 }
    );
  }
} 