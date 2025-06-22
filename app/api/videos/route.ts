import { NextRequest, NextResponse } from "next/server";
import { readdir, stat, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET() {
  try {
    const videosDir = join(process.cwd(), 'public', 'videos');
    
    // Create videos directory if it doesn't exist
    if (!existsSync(videosDir)) {
      console.log('Creating videos directory:', videosDir);
      await mkdir(videosDir, { recursive: true });
      return NextResponse.json({
        success: true,
        videos: [],
        count: 0,
        message: 'Videos directory created'
      });
    }
    
    // Read all files in the videos directory
    const files = await readdir(videosDir);
    
    // Get file stats for each video file
    const videoFiles = await Promise.all(
      files
        .filter(file => file.endsWith('.mp4'))
        .map(async (filename) => {
          const filePath = join(videosDir, filename);
          const stats = await stat(filePath);
          return {
            filename,
            url: `/videos/${filename}`,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
          };
        })
    );

    // Sort by creation date (newest first)
    videoFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      videos: videoFiles,
      count: videoFiles.length
    });

  } catch (error) {
    console.error('Error reading videos directory:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        videos: [],
        count: 0
      },
      { status: 500 }
    );
  }
} 