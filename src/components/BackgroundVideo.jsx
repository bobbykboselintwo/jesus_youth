import { useState, useEffect } from 'react';

const DESKTOP_VIDEO_ID = 'dF7ftfKxowM'; // 16:9 Landscape Video for Desktop
const MOBILE_VIDEO_ID = 'MlTNP2gAr00';   // 9:16 Vertical Shorts Video for Mobile

export default function BackgroundVideo() {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeVideoId = isMobile ? MOBILE_VIDEO_ID : DESKTOP_VIDEO_ID;

  return (
    <div className="bg-video-wrapper">
      {videoEnabled && (
        <div className={`bg-video-container ${isMobile ? 'mobile-video' : 'desktop-video'}`}>
          <iframe
            key={activeVideoId}
            src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&mute=1&loop=1&playlist=${activeVideoId}&controls=0&showinfo=0&autohide=1&modestbranding=1&rel=0&enablejsapi=1`}
            title="KCYM VITAMIN C PAROPPADY Background Video"
            allow="autoplay; encrypted-media"
            className="bg-video-iframe"
          />
        </div>
      )}
      
      {/* Red Gradient Overlay for Brand Identity & Contrast */}
      <div className="bg-video-overlay" />

      {/* Video Toggle Switch */}
      <button
        type="button"
        className="bg-video-toggle"
        onClick={() => setVideoEnabled(!videoEnabled)}
        title={videoEnabled ? "Turn video background off" : "Turn video background on"}
      >
        {videoEnabled ? '🎬 Video BG: ON' : '📽️ Video BG: OFF'}
      </button>
    </div>
  );
}
