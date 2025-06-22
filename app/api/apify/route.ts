import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.APIFY_API_KEY) {
      return NextResponse.json(
        { error: 'APIFY_API_KEY not found in environment variables' },
        { status: 500 }
      );
    }
    
    // Try different approaches to get more hashtags
    const urls = [
      `https://api.apify.com/v2/acts/lexis-solutions~tiktok-trending-hashtags-scraper/runs/last/dataset/items?token=${process.env.APIFY_API_KEY}&limit=100`,
      `https://api.apify.com/v2/acts/lexis-solutions~tiktok-trending-hashtags-scraper/runs/last/dataset/items?token=${process.env.APIFY_API_KEY}&limit=1000`,
      `https://api.apify.com/v2/acts/lexis-solutions~tiktok-trending-hashtags-scraper/runs/last/dataset/items?token=${process.env.APIFY_API_KEY}`
    ];
    
    let data: any[] = [];
    let response;
    
    for (const url of urls) {
      try {
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          data = await response.json();
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    if (!response || !response.ok) {
      throw new Error(`HTTP error! status: ${response?.status}`);
    }
    
    const processedHashtags = data.map((item: any) => ({
      hashtag_name: item.hashtag_name,
      rank: item.rank,
      publish_cnt: item.publish_cnt,
      video_views: item.video_views,
      country: item.country_info?.value,
      industry: item.industry_info?.value,
      is_promoted: item.is_promoted,
      rank_diff: item.rank_diff,
      rank_diff_type: item.rank_diff_type
    }));
    
    return NextResponse.json({ 
      success: true, 
      count: processedHashtags.length,
      hashtags: processedHashtags,
      note: processedHashtags.length <= 10 ? 'Only 10 hashtags available in dataset. This may be a limitation of the Apify actor configuration.' : null
    });
  } catch (error) {
    console.error('❌ Error fetching dataset items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('🔍 Checking API endpoint and fetching trending hashtags...');
    
    if (!process.env.APIFY_API_KEY) {
      return NextResponse.json({ 
        message: 'Apify API endpoint is working',
        apiKeyAvailable: false,
        error: 'APIFY_API_KEY not found'
      });
    }
    
    const response = await fetch(
      `https://api.apify.com/v2/acts/lexis-solutions~tiktok-trending-hashtags-scraper/runs/last/dataset/items?token=${process.env.APIFY_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      return NextResponse.json({ 
        message: 'Apify API endpoint is working',
        apiKeyAvailable: true,
        error: `HTTP ${response.status}: ${response.statusText}`
      });
    }
    
    const data = await response.json();
    
    return NextResponse.json({ 
      message: 'Apify API endpoint is working',
      apiKeyAvailable: true,
      hashtagCount: data.length,
      topHashtags: data.slice(0, 5).map((item: any) => ({
        name: item.hashtag_name,
        rank: item.rank,
        views: item.video_views,
        posts: item.publish_cnt
      }))
    });
  } catch (error) {
    return NextResponse.json({ 
      message: 'Apify API endpoint is working',
      apiKeyAvailable: !!process.env.APIFY_API_KEY,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 