import React, { useEffect, useRef } from 'react';
import introVideo from './12000.mp4';

interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  durationMs = 5000 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Fallback timer matching the video duration
    const timer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [onComplete, durationMs]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#E3F2FD] w-screen h-screen overflow-hidden">
      <video
        ref={videoRef}
        src={introVideo}
        autoPlay
        muted
        playsInline
        onEnded={onComplete}
        className="w-full h-full object-cover"
      />
    </div>
  );
};