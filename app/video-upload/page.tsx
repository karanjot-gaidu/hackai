'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TrendingVideos from '../components/trending-videos';
import DashboardNavbar from '../components/DashboardNavbar';

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

export default function VideoUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGeneratingSubtitles, setIsGeneratingSubtitles] = useState(false);
  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const [processingPhase, setProcessingPhase] = useState<string>('');
  const [generatedSubtitles, setGeneratedSubtitles] = useState<string>('');
  const [generatedVideo, setGeneratedVideo] = useState<string>('');
  const [videoFilename, setVideoFilename] = useState<string>('');
  const [trendingVideos, setTrendingVideos] = useState<TrendingVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [savedVideos, setSavedVideos] = useState<any[]>([]);
  const [isLoadingSavedVideos, setIsLoadingSavedVideos] = useState(false);

  useEffect(() => {
    fetchTrendingVideos();
    fetchSavedVideos();
  }, []);

  const fetchTrendingVideos = async () => {
    try {
      const response = await fetch('/api/trending-videos');
      if (response.ok) {
        const data = await response.json();
        setTrendingVideos(data.videos || []);
      } else {
        console.error('Failed to fetch trending videos');
      }
    } catch (error) {
      console.error('Error fetching trending videos:', error);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const fetchSavedVideos = async () => {
    setIsLoadingSavedVideos(true);
    try {
      const response = await fetch('/api/videos');
      if (response.ok) {
        const data = await response.json();
        setSavedVideos(data.videos || []);
      } else {
        console.error('Failed to fetch saved videos');
      }
    } catch (error) {
      console.error('Error fetching saved videos:', error);
    } finally {
      setIsLoadingSavedVideos(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        // Clear previous results when new file is dropped
        setGeneratedSubtitles('');
        setGeneratedVideo('');
        setVideoFilename('');
        setUploadProgress(0);
        setProcessingPhase('');
        setIsUploading(false);
        setIsGeneratingSubtitles(false);
        setIsRenderingVideo(false);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Clear previous results when new file is selected
      setGeneratedSubtitles('');
      setGeneratedVideo('');
      setVideoFilename('');
      setUploadProgress(0);
      setProcessingPhase('');
      setIsUploading(false);
      setIsGeneratingSubtitles(false);
      setIsRenderingVideo(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

  const uploadVideo = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setProcessingPhase('Uploading video to ZapCap...');
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('video', selectedFile);

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 25) {
            clearInterval(uploadInterval);
            return 25;
          }
          return prev + 5;
        });
      }, 200);

      console.log('Uploading video to ZapCap API...');
      
      const response = await fetch('/api/video-subtitles', {
        method: 'POST',
        body: formData,
      });

      clearInterval(uploadInterval);
      setUploadProgress(25);
      setProcessingPhase('Video uploaded! Generating transcript...');
      setIsGeneratingSubtitles(true);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process video');
      }

      // Simulate transcript generation progress
      const transcriptInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 60) {
            clearInterval(transcriptInterval);
            return 60;
          }
          return prev + 3;
        });
      }, 300);

      const data = await response.json();
      
      clearInterval(transcriptInterval);
      setUploadProgress(60);
      setProcessingPhase('Transcript generated! Rendering video with subtitles...');
      setIsGeneratingSubtitles(false);
      setIsRenderingVideo(true);

      if (data.success) {
        // Simulate rendering progress
        const renderInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) {
              clearInterval(renderInterval);
              return 100;
            }
            return prev + 4;
          });
        }, 200);

        // Set the generated transcript
        setGeneratedSubtitles(data.transcript || 'No transcript available');
        
        // Store the generated video URL and filename if available
        if (data.videoUrl) {
          setGeneratedVideo(data.videoUrl);
          setVideoFilename(data.filename || 'video_with_subtitles.mp4');
        }
        
        console.log('Video processed successfully:', data);
        
        // Refresh the saved videos list
        await fetchSavedVideos();

        clearInterval(renderInterval);
        setUploadProgress(100);
        setProcessingPhase('Complete! Video with subtitles ready.');
        setIsRenderingVideo(false);
      } else {
        throw new Error(data.error || 'Failed to process video');
      }
      
    } catch (error) {
      console.error('Error uploading video:', error);
      setGeneratedSubtitles('Error processing video. Please try again.');
      setProcessingPhase('Error occurred during processing.');
    } finally {
      setIsUploading(false);
      setIsGeneratingSubtitles(false);
      setIsRenderingVideo(false);
    }
  };

  const downloadSubtitles = () => {
    if (!generatedSubtitles) return;
    
    const blob = new Blob([generatedSubtitles], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles.srt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadVideo = () => {
    if (!generatedVideo) return;
    
    // Create a link to download the video file
    const a = document.createElement('a');
    a.href = generatedVideo;
    a.download = videoFilename || 'video_with_subtitles.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]">
      {/* Navigation */}
      <DashboardNavbar 
        title="Video Upload & Subtitle Generation"
        showBackButton={true}
        showUserInfo={false}
        showSignOut={false}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Video Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">🎬 Upload Your Video</h2>
            
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : selectedFile 
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!selectedFile ? (
                <div>
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Drop your video here</h3>
                  <p className="text-gray-400 mb-4">or click to browse files</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  >
                    Choose Video File
                  </button>
                  <p className="text-gray-500 text-sm mt-4">Supports MP4, MOV, AVI up to 500MB</p>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">File Selected</h3>
                  <p className="text-gray-400 mb-2">{selectedFile.name}</p>
                  <p className="text-gray-500 text-sm mb-4">{formatFileSize(selectedFile.size)}</p>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Choose Different File
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Progress */}
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6"
              >
                <div className="bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-xl p-6 border border-gray-600/50">
                  {/* Phase Indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {isGeneratingSubtitles ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </motion.div>
                      ) : isRenderingVideo ? (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </motion.div>
                      ) : (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </motion.div>
                      )}
                      <span className="text-white font-medium text-sm">
                        {processingPhase}
                      </span>
                    </div>
                    <span className="text-gray-400 font-bold">{uploadProgress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-600 rounded-full h-3 mb-4 overflow-hidden">
                    <motion.div
                      className="h-3 rounded-full relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 rounded-full opacity-50 animate-pulse" />
                    </motion.div>
                  </div>

                  {/* Phase Steps */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className={`flex items-center space-x-1 ${uploadProgress >= 25 ? 'text-green-400' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${uploadProgress >= 25 ? 'bg-green-400' : 'bg-gray-500'}`} />
                      <span>Upload</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${uploadProgress >= 60 ? 'text-blue-400' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${uploadProgress >= 60 ? 'bg-blue-400' : 'bg-gray-500'}`} />
                      <span>Transcript</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${uploadProgress >= 100 ? 'text-purple-400' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${uploadProgress >= 100 ? 'bg-purple-400' : 'bg-gray-500'}`} />
                      <span>Render</span>
                    </div>
                  </div>

                  {/* Processing Details */}
                  {isGeneratingSubtitles && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse">
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <span className="text-blue-300 text-sm">Analyzing audio and generating transcript...</span>
                      </div>
                    </motion.div>
                  )}

                  {isRenderingVideo && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-purple-900/20 rounded-lg border border-purple-700/30"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-purple-300 text-sm">Rendering video with embedded subtitles...</span>
                      </div>
                    </motion.div>
                  )}

                  {uploadProgress === 100 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 p-3 bg-green-900/20 rounded-lg border border-green-700/30"
                    >
                      <div className="flex items-center space-x-2">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                        <span className="text-green-300 text-sm">Processing complete! Your video is ready.</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={uploadVideo}
                disabled={!selectedFile || isUploading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Processing...' : 'Generate Subtitles'}
              </button>
            </div>

            {/* Generated Subtitles */}
            {generatedSubtitles && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-700/30 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Generated Subtitles</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={downloadSubtitles}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                      >
                        Download SRT
                      </button>
                      {generatedVideo && (
                        <button
                          onClick={downloadVideo}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          Download Video
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-green-100 text-sm whitespace-pre-line">{generatedSubtitles}</pre>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Video Preview */}
            {generatedVideo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-xl border border-blue-700/30 p-6">
                  <h3 className="text-white font-semibold mb-4">Video with Subtitles</h3>
                  <div className="bg-gray-900/50 rounded-lg overflow-hidden">
                    <video
                      controls
                      className="w-full h-auto"
                      src={generatedVideo}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Saved Videos Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8"
            >
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">📁 Saved Videos</h2>
                  <button
                    onClick={fetchSavedVideos}
                    disabled={isLoadingSavedVideos}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {isLoadingSavedVideos ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
                
                {isLoadingSavedVideos ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">Loading saved videos...</p>
                  </div>
                ) : savedVideos.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedVideos.map((video, index) => (
                      <motion.div
                        key={video.filename}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-gray-700/30 rounded-xl border border-gray-600/50 overflow-hidden hover:border-gray-500 transition-all duration-300"
                      >
                        <div className="p-4">
                          <h3 className="text-white font-medium mb-2 text-sm truncate">
                            {video.filename}
                          </h3>
                          <div className="text-gray-400 text-xs mb-3">
                            <p>Size: {formatFileSize(video.size)}</p>
                            <p>Created: {new Date(video.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex space-x-2">
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                            >
                              View
                            </a>
                            <button
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = video.url;
                                a.download = video.filename;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                              }}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-400">No saved videos yet</p>
                    <p className="text-gray-500 text-sm">Upload a video to get started!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Trending Videos Section */}
        <TrendingVideos 
          trendingVideos={trendingVideos} 
          isLoadingVideos={isLoadingVideos} 
        />
      </div>
    </div>
  );
} 
