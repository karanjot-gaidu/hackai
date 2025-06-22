import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching trending TikTok videos...');
    
    const url = 'https://api.apify.com/v2/acts/alien_force~tiktok-trending-videos-tracker/runs/last/dataset/items?token=apify_api_esjuilbkqgHGSg7cjZ3gLjdm5xOGMt3xRnW2';
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process and clean the video data
    const processedVideos = data.map((video: any) => ({
      video_id: video.video_id,
      title: video.title,
      duration_in_sec: video.duration_in_sec,
      url: video.url,
      thumbnail: video.thumbnail,
      region: video.region,
      country_code: video.country_code,
      author: {
        id: video.author?.id,
        uniqueId: video.author?.uniqueId,
        name: video.author?.name,
        profile_url: video.author?.profile_url,
        profile_picture_url: video.author?.profile_picture_url,
        bio: video.author?.bio,
        verifiedAccount: video.author?.verifiedAccount,
        privateAccount: video.author?.privateAccount
      },
      stats: {
        diggCount: video.stats?.diggCount,
        shareCount: video.stats?.shareCount,
        commentCount: video.stats?.commentCount,
        playCount: video.stats?.playCount,
        collectCount: video.stats?.collectCount
      }
    }));
    
    return NextResponse.json({ 
      success: true, 
      count: processedVideos.length,
      videos: processedVideos
    });
  } catch (error) {
    console.error('❌ Error fetching trending videos:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 