import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const fetchTrendingHashtags = async () => {
  try {
    console.log('🚀 Fetching last run dataset items...');
    console.log('🔑 API Key available:', !!process.env.APIFY_API_KEY);
    
    if (!process.env.APIFY_API_KEY) {
      throw new Error('APIFY_API_KEY not found in environment variables');
    }
    
    console.log('📡 Making request to Apify API...');
    
    const response = await fetch(
      `https://api.apify.com/v2/acts/lexis-solutions~tiktok-trending-hashtags-scraper/runs/last/dataset/items?token=${process.env.APIFY_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Success! Received', data.length, 'hashtag items');
    
    // Display top 10 trending hashtags
    console.log('\n🔥 Top 10 Trending Hashtags:');
    console.log('='.repeat(80));
    
    data.slice(0, 10).forEach((item: any, index: number) => {
      console.log(`${index + 1}. #${item.hashtag_name}`);
      console.log(`   Rank: ${item.rank} | Views: ${item.video_views.toLocaleString()} | Posts: ${item.publish_cnt.toLocaleString()}`);
      console.log(`   Country: ${item.country_info?.value || 'N/A'} | Industry: ${item.industry_info?.value || 'N/A'}`);
      console.log(`   Rank Change: ${item.rank_diff > 0 ? '+' : ''}${item.rank_diff || 0}`);
      console.log('');
    });
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching dataset items:', error);
    throw error;
  }
};

// Run the function and handle the result
fetchTrendingHashtags()
  .then((data) => {
    console.log('🎉 Successfully fetched trending hashtags!');
    console.log('📋 Data summary:', {
      totalHashtags: data.length,
      dataType: typeof data,
      hasData: !!data
    });
  })
  .catch((error) => {
    console.error('💥 Failed to fetch hashtags:', error.message);
    process.exit(1);
  });
