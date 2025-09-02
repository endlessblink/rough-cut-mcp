import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';

// Matrix Rain Component
const MatrixRain = ({ opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  const columns = 20;
  const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  
  const drops = Array.from({ length: columns }, (_, i) => ({
    x: (i * width) / columns,
    speed: 2 + (i % 3),
    offset: (i * 137.5) % 100,
  }));
  
  return (
    <AbsoluteFill style={{ opacity }}>
      {drops.map((drop, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: drop.x,
            top: ((frame * drop.speed + drop.offset) % (height + 200)) - 200,
            color: '#00ff41',
            fontFamily: 'monospace',
            fontSize: 14,
            textShadow: '0 0 5px #00ff41',
          }}
        >
          {characters[Math.floor((frame + i) / 10) % characters.length]}
        </div>
      ))}
    </AbsoluteFill>
  );
};

// GitHub Logo Component
const GitHubLogo = ({ size = 60, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

// Typewriter Effect Component
const TypewriterText = ({ text, delay = 0, style = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const startFrame = delay * fps;
  const progress = Math.max(0, (frame - startFrame) / (2 * fps));
  const charactersToShow = Math.floor(progress * text.length);
  
  return (
    <span style={{ fontFamily: 'Monaco, monospace', ...style }}>
      {text.substring(0, charactersToShow)}
      <span style={{ 
        opacity: Math.sin(frame * 0.5) > 0 ? 1 : 0,
        color: '#00ff41'
      }}>
        |
      </span>
    </span>
  );
};

// Project Card Component
const ProjectCard = ({ title, description, delay = 0, color = '#00D9FF' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const startFrame = delay * fps;
  const slideProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  
  const translateX = interpolate(slideProgress, [0, 1], [300, 0]);
  const opacity = interpolate(slideProgress, [0, 1], [0, 1]);
  
  return (
    <div
      style={{
        transform: `translateX(${translateX}px)`,
        opacity,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: `2px solid ${color}`,
        borderRadius: 8,
        padding: 20,
        margin: 10,
        minHeight: 100,
        boxShadow: `0 0 20px ${color}40`,
      }}
    >
      <h3 style={{ 
        color: color, 
        margin: 0, 
        marginBottom: 8,
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
      }}>
        {title}
      </h3>
      <p style={{ 
        color: 'white', 
        margin: 0,
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        lineHeight: 1.4,
      }}>
        {description}
      </p>
    </div>
  );
};

// Stats Grid Component
const StatsGrid = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const startFrame = delay * fps;
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  
  const scale = interpolate(progress, [0, 1], [0.8, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  
  const stats = [
    { label: 'Repositories', value: '12+', color: '#00D9FF' },
    { label: 'MCP Servers', value: '3', color: '#F38BA8' },
    { label: 'Languages', value: '8+', color: '#A6E3A1' },
    { label: 'Active Projects', value: '5', color: '#F9E2AF' },
  ];
  
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: `2px solid ${stat.color}`,
            borderRadius: 8,
            padding: 15,
            textAlign: 'center',
            boxShadow: `0 0 15px ${stat.color}40`,
          }}
        >
          <div style={{ 
            color: stat.color, 
            fontSize: 24, 
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
            marginBottom: 5,
          }}>
            {stat.value}
          </div>
          <div style={{ 
            color: 'white', 
            fontSize: 12,
            fontFamily: 'Arial, sans-serif',
          }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Video Composition
export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // Background gradient animation
  const gradientRotation = interpolate(frame, [0, 900], [0, 360]);
  const backgroundOpacity = interpolate(frame, [0, 30, 870, 900], [0.8, 1, 1, 0]);
  
  return (
    <AbsoluteFill>
      {/* Animated Background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${gradientRotation}deg, #0a0a0a, #1a1a2e, #16213e)`,
          opacity: backgroundOpacity,
        }}
      />
      
      {/* Matrix Rain Effect - appears at 1s and continues */}
      <Sequence from={30} durationInFrames={870}>
        <MatrixRain opacity={0.3} />
      </Sequence>
      
      {/* Title Scene (0-5s) */}
      <Sequence from={0} durationInFrames={150}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: 30 }}>
            <GitHubLogo size={80} color="#00ff41" />
          </div>
          
          <h1 style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: 'white',
            margin: 0,
            marginBottom: 10,
            textShadow: '0 0 20px #00ff41',
            fontFamily: 'Arial, sans-serif',
          }}>
            <TypewriterText text="endlessblink" delay={0.5} />
          </h1>
          
          <h2 style={{
            fontSize: 24,
            color: '#00ff41',
            margin: 0,
            fontFamily: 'monospace',
            textShadow: '0 0 10px #00ff41',
          }}>
            <TypewriterText text="MCP Server Innovations" delay={2} />
          </h2>
        </AbsoluteFill>
      </Sequence>
      
      {/* Stats Scene (5-17s) */}
      <Sequence from={150} durationInFrames={360}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
          }}
        >
          <h2 style={{
            fontSize: 32,
            color: '#00D9FF',
            textAlign: 'center',
            marginBottom: 40,
            textShadow: '0 0 15px #00D9FF',
            fontFamily: 'Arial, sans-serif',
          }}>
            Like-I-Said v2: Advanced MCP Memory
          </h2>
          
          <StatsGrid delay={0.5} />
          
          <div style={{
            marginTop: 30,
            padding: 20,
            backgroundColor: 'rgba(0, 217, 255, 0.1)',
            border: '2px solid #00D9FF',
            borderRadius: 10,
            textAlign: 'center',
            maxWidth: 600,
          }}>
            <p style={{
              color: 'white',
              fontSize: 16,
              margin: 0,
              fontFamily: 'Arial, sans-serif',
              lineHeight: 1.5,
            }}>
              Persistent memory system with advanced task management,
              real-time dashboard interface, and intelligent context tracking
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>
      
      {/* Projects Scene (17-29s) */}
      <Sequence from={510} durationInFrames={360}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
          }}
        >
          <h2 style={{
            fontSize: 32,
            color: '#F38BA8',
            textAlign: 'center',
            marginBottom: 40,
            textShadow: '0 0 15px #F38BA8',
            fontFamily: 'Arial, sans-serif',
          }}>
            Comfy-Guru: Peaceful ComfyUI Debugging
          </h2>
          
          <div style={{ maxWidth: 800, width: '100%' }}>
            <ProjectCard
              title="Error Analysis Interface"
              description="Advanced ComfyUI error categorization with intelligent debugging suggestions and real-time status tracking"
              delay={0.5}
              color="#F38BA8"
            />
            
            <ProjectCard
              title="Peaceful Debugging Visualization"
              description="Zen-like approach to workflow debugging with clear visual indicators and step-by-step resolution guidance"
              delay={1}
              color="#F38BA8"
            />
          </div>
        </AbsoluteFill>
      </Sequence>
      
      {/* Call to Action (29-30s) */}
      <Sequence from={870} durationInFrames={30}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <GitHubLogo size={60} color="white" />
          </div>
          
          <h2 style={{
            fontSize: 28,
            color: 'white',
            margin: 0,
            marginBottom: 10,
            fontFamily: 'Arial, sans-serif',
          }}>
            ⭐ Star the repos!
          </h2>
          
          <p style={{
            fontSize: 18,
            color: '#00ff41',
            margin: 0,
            fontFamily: 'monospace',
          }}>
            github.com/endlessblink
          </p>
        </AbsoluteFill>
      </Sequence>
      
      {/* Progress Bar */}
      <Sequence from={0} durationInFrames={900}>
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 40,
            right: 40,
            height: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(frame / 900) * 100}%`,
              background: 'linear-gradient(90deg, #00D9FF, #F38BA8)',
              borderRadius: 2,
              transition: 'width 0.1s ease-out',
            }}
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

// Compatibility exports for both import patterns
export default VideoComposition;