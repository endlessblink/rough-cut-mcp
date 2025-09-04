import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

// Clean, professional animated background
const ProfessionalBackground = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill>
      <div style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: `linear-gradient(135deg, #0d1117 0%, #161b22 25%, #21262d 50%, #161b22 75%, #0d1117 100%)`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderRadius: '8px'
    }} />
      
      <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `radial-gradient(ellipse at ${50 + Math.sin(frame * 0.008) * 10}% ${50 + Math.cos(frame * 0.012) * 8}%, rgba(88, 166, 255, 0.08) 0%, transparent 50%)`,
      opacity: 0.6
    }} />
    </AbsoluteFill>;
};

// GitHub Logo Component  
const GitHubLogo = ({
  size = 120
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(Math.sin(frame * 0.04), [-1, 1], [0.95, 1.05], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  return <div style={{
    transform: `scale(${scale})`,
    filter: 'drop-shadow(0 0 20px rgba(88, 166, 255, 0.4))'
  }}>
      <svg width={size} height={size} viewBox="0 0 24 24">
        <defs>
          <linearGradient id="logoGradient" x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor="#58a6ff" />
            <stop offset='50%' stopColor="#79c0ff" />
            <stop offset='100%' stopColor="#f0f6fc" />
          </linearGradient>
        </defs>
        <path fill="url(#logoGradient)" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    </div>;
};

// Professional Stats Card Component
const StatsCard = ({
  icon,
  value,
  label,
  delay = 0,
  color = '#58a6ff'
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - delay, [0, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  const slideUp = interpolate(progress, [0, 1], [80, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  const opacity = interpolate(progress, [0, 1], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  const scale = interpolate(progress, [0, 0.8, 1], [0, 1.1, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  const animatedValue = Math.floor(value * progress);
  return <div style={{
    transform: `translateY(${slideUp}px) scale(${scale})`,
    opacity,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '32px 24px',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    textAlign: 'center',
    minWidth: '140px'
  }}>
      <div style={{
      fontSize: '42px',
      marginBottom: '16px',
      filter: `drop-shadow(0 0 8px ${color})`
    }}>
        {icon}
      </div>
      <div style={{
      fontSize: '48px',
      fontWeight: '900',
      color: '#f0f6fc',
      fontFamily: 'Inter, SF Pro Display, -apple-system, sans-serif',
      marginBottom: '8px',
      textShadow: `0 0 10px ${color}40`
    }}>
        {animatedValue.toLocaleString()}
      </div>
      <div style={{
      fontSize: '16px',
      color: '#8b949e',
      fontFamily: 'Inter, SF Pro Text, -apple-system, sans-serif',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}>
        {label}
      </div>
    </div>;
};
function VideoComposition() {
  const frame = useCurrentFrame();
  const {
    fps,
    durationInFrames
  } = useVideoConfig();
  return <AbsoluteFill>
      {/* Background */}
      <Sequence from={0} durationInFrames={750}>
        <ProfessionalBackground />
      </Sequence>
      
      {/* Opening Logo & Title - 0 to 5 seconds */}
      <Sequence from={0} durationInFrames={150}>
        <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: "24px"
      }}>
          <div style={{
          transform: `translateY(${interpolate(frame, [0, 60], [100, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic)
          })}px)`,
          opacity: interpolate(frame, [0, 40], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          })
        }}>
            <GitHubLogo size={160} />
          </div>
          
          <div style={{
          marginTop: '48px',
          transform: `translateY(${interpolate(frame, [20, 80], [50, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic)
          })}px)`,
          opacity: interpolate(frame, [20, 60], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          })
        }}>
            <h1 style={{
            fontSize: '62px',
            fontWeight: '900',
            color: '#f0f6fc',
            fontFamily: 'Inter, SF Pro Display, -apple-system, sans-serif',
            margin: '0 0 16px 0',
            textShadow: '0 0 20px rgba(240, 246, 252, 0.3)',
            letterSpacing: '-2px'
          }}>
              @endlessblink
            </h1>
            <p style={{
            fontSize: '24px',
            color: '#8b949e',
            fontFamily: 'Inter, SF Pro Text, -apple-system, sans-serif',
            fontWeight: '500',
            margin: '0'
          }}>
              Building AI-Enhanced Tools
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>
      
      {/* GitHub Stats - 5 to 15 seconds */}
      <Sequence from={150} durationInFrames={300}>
        <AbsoluteFill>
          <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
          gap: "24px"
        }}>
            <h2 style={{
            fontSize: '48px',
            fontWeight: '800',
            color: '#f0f6fc',
            fontFamily: 'Inter, SF Pro Display, -apple-system, sans-serif',
            marginBottom: '80px',
            textShadow: '0 0 15px rgba(240, 246, 252, 0.2)',
            opacity: interpolate(frame - 150, [0, 30], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp'
            })
          }}>
              GitHub Activity
            </h2>
            
            <div style={{
            display: 'flex',
            gap: '48px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
              <StatsCard icon="📚" value={2} label="Repositories" delay={180} color="#58a6ff" />
              <StatsCard icon="🔥" value={693} label="Commits" delay={200} color="#56d364" />
              <StatsCard icon="👥" value={6} label="Followers" delay={220} color="#f85149" />
              <StatsCard icon="👁️" value={13} label="Following" delay={240} color="#a5a5a5" />
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      
      {/* Final Branding - 15 to 25 seconds */}
      <Sequence from={450} durationInFrames={300}>
        <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: "24px"
      }}>
          <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '64px',
          transform: `translateY(${interpolate(frame - 450, [0, 80], [100, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic)
          })}px)`,
          opacity: interpolate(frame - 450, [0, 40], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          })
        }}>
            
            <div style={{
            background: 'radial-gradient(circle, rgba(88, 166, 255, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            padding: '40px',
            border: '2px solid rgba(88, 166, 255, 0.2)'
          }}>
              <GitHubLogo size={180} />
            </div>
            
            <div style={{
            textAlign: 'center'
          }}>
              <h1 style={{
              fontSize: '56px',
              fontWeight: '900',
              color: '#f0f6fc',
              fontFamily: 'Inter, SF Pro Display, -apple-system, sans-serif',
              margin: '0 0 16px 0',
              textShadow: '0 0 20px rgba(240, 246, 252, 0.4)',
              letterSpacing: '-1px'
            }}>
                @endlessblink
              </h1>
              
              <p style={{
              fontSize: '24px',
              color: '#8b949e',
              fontFamily: 'Inter, SF Pro Text, -apple-system, sans-serif',
              fontWeight: '500',
              margin: '0',
              opacity: 0.9
            }}>
                Building AI-Enhanced Tools
              </p>
              
              <div style={{
              width: interpolate(frame - 480, [0, 60], [0, 300], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic)
              }),
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(88, 166, 255, 0.6), transparent)',
              borderRadius: '1px',
              marginTop: '24px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }} />
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>;
}
export default VideoComposition;