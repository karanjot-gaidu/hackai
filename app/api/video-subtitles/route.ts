import { NextRequest, NextResponse } from "next/server";
import { ZapCap } from 'zapcap';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ZAPCAP_API_KEY) {
      return NextResponse.json(
        { error: 'ZAPCAP_API_KEY not found in environment variables' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Initialize ZapCap
    const zapcap = new ZapCap({
      apiKey: process.env.ZAPCAP_API_KEY,
    });

    console.log('Uploading video to ZapCap...');
    
    // Upload video to ZapCap - use the File object directly
    const { data: { id: videoId } } = await zapcap.uploadVideo(videoFile);

    console.log('Video uploaded with ID:', videoId);

    // Get available templates
    const { data: templates } = await zapcap.getTemplates();
    const templateId = templates[0].id; // Use the first available template

    console.log('Creating video task with template:', templateId);

    // Create a video task with auto-approve enabled
    const { data: { taskId } } = await zapcap.createVideoTask(videoId, templateId, true);

    console.log('Video task created with ID:', taskId);

    // Poll for transcript completion
    console.log('Polling for transcript completion...');
    const transcript = await zapcap.helpers.pollForTranscript(videoId, taskId, {
      retryFrequencyMs: 5000, // Poll every 5 seconds
      timeoutMs: 300000, // Timeout after 5 minutes
    });

    console.log('Transcript completed');

    // Poll for render completion
    console.log('Polling for render completion...');
    const stream = await zapcap.helpers.pollForRender(videoId, taskId, {
      retryFrequencyMs: 5000, // Poll every 5 seconds
      timeoutMs: 600000, // Timeout after 10 minutes
    });

    console.log('Render completed, downloading video...');

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const videoBufferWithSubtitles = Buffer.concat(chunks);

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = videoFile.name.replace(/\.[^/.]+$/, ''); // Remove extension
    const filename = `${originalName}_with_subtitles_${timestamp}.mp4`;
    const videosDir = join(process.cwd(), 'public', 'videos');
    const filePath = join(videosDir, filename);

    // Create videos directory if it doesn't exist
    if (!existsSync(videosDir)) {
      console.log('Creating videos directory:', videosDir);
      await mkdir(videosDir, { recursive: true });
    }

    // Save video locally
    console.log('Saving video locally:', filePath);
    await writeFile(filePath, videoBufferWithSubtitles);

    // Return the public URL for the video
    const videoUrl = `/videos/${filename}`;

    return NextResponse.json({
      success: true,
      videoId,
      taskId,
      transcript: transcript.words?.map(word => word.text).join(' ') || 'No transcript available',
      videoUrl: videoUrl,
      filename: filename,
      message: 'Video processed successfully with subtitles and saved locally'
    });

  } catch (error) {
    console.error('Error processing video with ZapCap:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!process.env.ZAPCAP_API_KEY) {
      return NextResponse.json(
        { error: 'ZAPCAP_API_KEY not found in environment variables' },
        { status: 500 }
      );
    }

    const zapcap = new ZapCap({
      apiKey: process.env.ZAPCAP_API_KEY,
    });

    // Get available templates
    const { data: templates } = await zapcap.getTemplates();

    return NextResponse.json({
      success: true,
      templates,
      message: 'ZapCap API is working correctly'
    });

  } catch (error) {
    console.error('Error checking ZapCap API:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
