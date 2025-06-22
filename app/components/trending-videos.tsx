import { motion } from "framer-motion";
import { useState } from "react";

interface TrendingVideo {
  video_id: string;
  title: string;
  duration_in_sec: number;
  url: string;
  thumbnail: string;
  region: string;
  country_code: string;
  author: {
    id: string;
    uniqueId: string;
    name: string;
    profile_url: string;
    profile_picture_url: string;
    bio: string;
    verifiedAccount: boolean;
    privateAccount: boolean;
  };
  stats: {
    diggCount: string;
    shareCount: string;
    commentCount: string;
    playCount: string;
    collectCount: string;
  };
}

interface TrendingVideosProps {
  trendingVideos: TrendingVideo[];
  isLoadingVideos: boolean;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatNumber = (num: string) => {
  const number = parseInt(num);
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  return number.toString();
};

export default function TrendingVideos({ trendingVideos, isLoadingVideos }: TrendingVideosProps) {
    const [displayCount, setDisplayCount] = useState(18); // Show 18 videos initially (6 rows of 3)
    const videosToShow = trendingVideos.slice(0, displayCount);
    const hasMoreVideos = displayCount < trendingVideos.length;

    const loadMore = () => {
      setDisplayCount(prev => Math.min(prev + 18, trendingVideos.length));
    };

    return (
        <>
        {/* Trending Videos Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">🔥 Trending TikTok Videos</h2>
            <span className="text-gray-400 text-sm">
              Showing {videosToShow.length} of {trendingVideos.length} videos
            </span>
          </div>
          
          {isLoadingVideos ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading trending videos...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videosToShow.map((video, index) => (
                  <motion.div
                    key={video.video_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 overflow-hidden hover:border-gray-600 transition-all duration-300"
                  >
                    {/* Video Thumbnail */}
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {formatDuration(video.duration_in_sec)}
                      </div>
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        🔥 Trending
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2 line-clamp-2 text-sm">
                        {video.title}
                      </h3>
                      
                      {/* Author Info */}
                      <div className="flex items-center mb-3">
                        <img
                          src={video.author.profile_picture_url}
                          alt={video.author.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span className="text-gray-400 text-xs">@{video.author.uniqueId}</span>
                        {video.author.verifiedAccount && (
                          <svg className="w-4 h-4 text-blue-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span>👁️ {formatNumber(video.stats.playCount)}</span>
                          <span>❤️ {formatNumber(video.stats.diggCount)}</span>
                          <span>💬 {formatNumber(video.stats.commentCount)}</span>
                        </div>
                        <span>📤 {formatNumber(video.stats.shareCount)}</span>
                      </div>

                      {/* View on TikTok Button */}
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-pink-600 hover:to-red-600 transition-all duration-300 text-center block"
                      >
                        View on TikTok
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMoreVideos && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8 text-center"
                >
                  <button
                    onClick={loadMore}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  >
                    Load More Videos ({trendingVideos.length - displayCount} remaining)
                  </button>
                </motion.div>
              )}

              {/* Show All Videos Message */}
              {!hasMoreVideos && trendingVideos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8 text-center"
                >
                  <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-700/30 p-4">
                    <p className="text-green-300 text-sm">
                      🎉 All {trendingVideos.length} trending videos are now displayed!
                    </p>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
        </>
    );
}