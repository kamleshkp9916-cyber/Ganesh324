
"use client";

import { useMiniPlayer } from '@/context/MiniPlayerContext';
import { Button } from './ui/button';
import { X, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MiniPlayer() {
  const { minimizedStream, closeMinimizedStream } = useMiniPlayer();
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const [isPaused, setIsPaused] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (video && minimizedStream) {
      const onPlay = () => setIsPaused(false);
      const onPause = () => setIsPaused(true);

      video.addEventListener('play', onPlay);
      video.addEventListener('pause', onPause);

      video.muted = isMuted; // Start muted
      video.play().catch(() => setIsPaused(true));

      return () => {
        video.removeEventListener('play', onPlay);
        video.removeEventListener('pause', onPause);
      };
    }
  }, [minimizedStream, isMuted]);

  if (!minimizedStream) {
    return null;
  }

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().catch(console.error);
      } else {
        video.pause();
      }
    }
  };

  const handleExpand = () => {
    const streamId = minimizedStream.id;
    closeMinimizedStream(); // Close mini player before navigating
    router.push(`/stream/${streamId}`);
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 h-auto bg-card border rounded-lg shadow-2xl z-50 group animate-in fade-in-0 slide-in-from-bottom-5">
      <div className="aspect-video bg-black rounded-t-lg relative">
        <video ref={videoRef} src={minimizedStream.streamUrl} className="w-full h-full object-cover rounded-t-lg" loop />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button variant="ghost" size="icon" className="text-white" onClick={handlePlayPause}>
                {isPaused ? <Play className="h-6 w-6 fill-white" /> : <Pause className="h-6 w-6 fill-white" />}
            </Button>
        </div>
      </div>
      <div className="p-2">
        <div className="flex items-center justify-between">
            <div className="flex-grow overflow-hidden">
                 <p className="text-sm font-semibold truncate cursor-pointer hover:underline" onClick={handleExpand}>{minimizedStream.title}</p>
            </div>
             <div className="flex items-center flex-shrink-0">
                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMuted(prev => !prev)}>
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleExpand}>
                    <Maximize className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closeMinimizedStream}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
