"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  duration: string;
}

interface VideoSectionProps {
  mainVideo: Video;
  testimonials: Video[];
}

export function VideoSection({ mainVideo, testimonials }: VideoSectionProps) {
  const [currentVideo, setCurrentVideo] = useState<Video>(mainVideo);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const playVideo = (video: Video) => {
    setCurrentVideo(video);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  if (!isMounted) {
    return (
      <div className="bg-zinc-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="relative pb-[56.25%] rounded-xl overflow-hidden bg-black">
                <Image
                  src={currentVideo.thumbnail}
                  alt={currentVideo.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Section */}
          <div className="lg:col-span-2">
            <div className="relative pb-[56.25%] rounded-xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                src={currentVideo.url}
                className="absolute inset-0 w-full h-full"
                controls
                onEnded={handleVideoEnd}
                poster={currentVideo.thumbnail}
              />
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-white">{currentVideo.title}</h2>
              <p className="mt-2 text-gray-400">{currentVideo.description}</p>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">Vidéos recommandées</h3>
            <div className="space-y-4">
              {testimonials.map((video) => (
                <div
                  key={video.id}
                  className="cursor-pointer group"
                  onClick={() => playVideo(video)}
                >
                  <div className="relative pb-[56.25%] rounded-lg overflow-hidden bg-black">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:opacity-75 transition-opacity"
                      unoptimized
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center group-hover:bg-red-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-75 rounded text-white text-sm">
                      {video.duration}
                    </div>
                  </div>
                  <h4 className="mt-2 text-white font-medium group-hover:text-red-500 transition-colors">{video.title}</h4>
                  <p className="text-sm text-gray-400">{video.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
