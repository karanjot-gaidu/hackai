import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';
dotenv.config();

interface TrendingCreator {
  tcm_id: string;
  user_id: string;
  nick_name: string;
  avatar_url: string;
  country_code: string;
  follower_cnt: number;
  liked_cnt: number;
  tt_link: string;
  tcm_link: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Fetching trending creators...');
    
    const apifyToken = process.env.APIFY_API_KEY;
    console.log('🚀 APIFY_API_KEY:', apifyToken);
    if (!apifyToken) {
      console.error('❌ APIFY_API_KEY not found');
      return NextResponse.json(
        { error: 'APIFY_API_KEY not found' },
        { status: 500 }
      );
    }

    const url = `https://api.apify.com/v2/acts/lexis-solutions~tiktok-trending-creators-scraper/runs/last/dataset/items?token=${apifyToken}`;
    
    console.log('📡 Fetching from Apify...');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Apify API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Apify API error: ${response.status}` },
        { status: response.status }
      );
    }

    const creators: TrendingCreator[] = await response.json();
    console.log('✅ Successfully fetched', creators.length, 'creators');

    // Sort creators by follower count (descending)
    const sortedCreators = creators.sort((a, b) => b.follower_cnt - a.follower_cnt);

    return NextResponse.json({
      success: true,
      creators: sortedCreators,
      total: sortedCreators.length
    });

  } catch (error) {
    console.error('❌ Error fetching trending creators:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 