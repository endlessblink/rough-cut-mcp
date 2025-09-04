import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile,
} from 'remotion';

// Animated code-like background with looping
const CodeBackground = () => {
  const frame = useCurrentFrame();
  
  const codeLines = [
    'const developer = "endlessblink";',
    'import { AI, MCP } from "tools";',
    'export class Innovation {',
    '  async buildTools() {',
    '    return await this.create();',
    '  }',
    '}',
    '// Building the future...',
    'git commit -m "Amazing work"',
    'npm install creativity',
    'function deploy() {',
    '  return "success";',
    '}',
    'const projects = ["MCP", "AI"];',
    '// Code never sleeps',
    'while(coding) { innovate(); }',
    'git push origin main',
    'docker build -t innovation .',
    'kubectl apply -f deployment.yaml',
    'echo "Deployed successfully!"'
  ];
  
  const cycleLength = 500; // Total cycle duration in frames
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {codeLines.map((line, index) => {
        const delay = index * 25;
        
        // Create looping by using modulo
        const currentFrame = frame % cycleLength;
        
        const opacity = interpolate(
          currentFrame - delay,
          [0, 50, 200, 250],
          [0, 0.4, 0.4, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        
        const translateX = interpolate(
          currentFrame - delay,
          [0, 400],
          [-400, 1920],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 80 + index * 70,
              left: translateX,
              opacity,
              color: '#30363d',
              fontSize: '22px',
              fontFamily: 'Monaco, Consolas, monospace',
              whiteSpace: 'nowrap'
            }}
          >
            {line}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Enhanced GitHub-style Contribution Graph
const GitHubContributionGraph = () => {
  const frame = useCurrentFrame();
  
  const contributionData = [
    // September - light activity
    0,1,0,1,2,1,0, 0,1,2,1,0,1,2, 1,0,2,3,1,0,1, 2,1,0,1,3,2,0,
    // October - moderate activity  
    1,2,1,0,2,1,3, 0,1,2,4,1,0,2, 3,1,0,2,1,3,0, 2,1,4,0,1,2,1,
    // November - high activity
    2,3,1,4,2,0,1, 3,2,4,1,0,3,2, 1,4,2,0,3,1,2, 4,1,0,2,3,1,4,
    // December - very high activity
    3,4,2,1,4,3,0, 2,4,3,1,0,4,2, 3,1,4,2,0,3,4, 1,2,4,3,0,1,2,
    // January - high activity continues
    4,2,3,1,0,4,2, 1,3,4,0,2,1,3, 4,0,2,3,1,4,0, 2,3,1,4,2,0,3,
    // February - moderate
    2,1,3,0,2,4,1, 0,3,2,1,4,0,2, 1,3,4,0,2,1,3, 0,2,4,1,3,0,2,
    // March - increasing
    1,2,4,0,3,1,2, 4,0,1,3,2,0,4, 2,1,0,3,4,1,2, 0,3,1,4,2,0,1,
    // April - peak activity
    4,3,2,1,4,0,3, 2,4,1,0,3,2,4, 1,0,4,2,3,1,0, 4,2,1,3,0,4,2,
    // May - sustained high
    3,4,1,2,0,3,4, 1,2,4,0,3,1,2, 4,0,1,3,2,4,0, 1,3,2,4,1,0,3,
    // June - continuing
    2,3,4,0,1,2,3, 4,0,2,1,3,4,0, 2,1,4,0,3,2,1, 4,0,3,1,2,4,0,
    // July - high summer activity
    3,2,4,1,0,3,2, 4,1,0,2,3,4,1, 0,2,3,1,4,0,2, 3,4,0,1,2,3,4,
    // August - current month, tapering
    1,2,3,0,4,1,2, 3,0,1,4,2,0,3, 1,4,0,2,3,1,0, 4,2,0,1,3,0,2
  ];
  
  const weeks = 53;
  const daysPerWeek = 7;
  
  const titleScale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px',
      height: '100vh',
      justifyContent: 'center'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '50px',
        transform: `scale(${titleScale})`,
        opacity: titleOpacity
      }}>
        <h2 style={{
          background: 'linear-gradient(45deg, #f0f6fc, #56d364)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          fontFamily: 'SF Pro Display, -apple-system, sans-serif',
          fontSize: '48px',
          fontWeight: '900',
          margin: '0',
          textShadow: '0 0 30px rgba(86, 211, 100, 0.4)'
        }}>
          693 contributions in the last year
        </h2>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '900px',
        marginBottom: '15px',
        paddingLeft: '40px'
      }}>
        {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((month, i) => {
          const monthOpacity = interpolate(frame, [30 + i * 2, 40 + i * 2], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          });
          
          return (
            <div key={month} style={{
              color: '#7d8590',
              fontSize: '14px',
              fontFamily: 'SF Pro Text, -apple-system, sans-serif',
              opacity: monthOpacity,
              transform: `translateY(${interpolate(monthOpacity, [0, 1], [10, 0])}px)`
            }}>
              {month}
            </div>
          );
        })}
      </div>
      
      <div style={{
        display: 'flex',
        gap: '25px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          height: '140px'
        }}>
          {['Mon', 'Wed', 'Fri'].map((day, i) => {
            const dayOpacity = interpolate(frame, [40 + i * 5, 50 + i * 5], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp'
            });
            
            return (
              <div key={day} style={{
                color: '#7d8590',
                fontSize: '14px',
                fontFamily: 'SF Pro Text, -apple-system, sans-serif',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                opacity: dayOpacity
              }}>
                {day}
              </div>
            );
          })}
        </div>
        
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'rgba(255,255,255,0.05)',
          padding: '25px',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(15px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          {Array.from({ length: weeks }).map((_, weekIndex) => (
            <div key={weekIndex} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {Array.from({ length: daysPerWeek }).map((_, dayIndex) => {
                const dataIndex = weekIndex * daysPerWeek + dayIndex;
                const intensity = contributionData[dataIndex] || 0;
                
                // Spread the animation across the full sequence duration
                // Start at frame 60, spread over 90 frames (150 total - 60 start)
                const delay = 60 + dataIndex * 0.25; // Even faster progression
                
                const opacity = interpolate(
                  frame - delay,
                  [0, 15], // Faster fade-in
                  [0, 1],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp'
                  }
                );
                
                const scale = interpolate(
                  frame - delay,
                  [0, 10, 15], // Faster scale animation
                  [0, 1.2, 1],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                    easing: Easing.out(Easing.cubic)
                  }
                );
                
                const glow = intensity > 2 ? interpolate(
                  frame - delay,
                  [10, 20], // Faster glow
                  [0, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                ) : 0;
                
                const getColor = (level) => {
                  switch(level) {
                    case 0: return '#161b22';
                    case 1: return '#0e4429';
                    case 2: return '#006d32';
                    case 3: return '#26a641';
                    case 4: return '#39d353';
                    default: return '#161b22';
                  }
                };
                
                return (
                  <div
                    key={dayIndex}
                    style={{
                      width: '13px',
                      height: '13px',
                      backgroundColor: getColor(intensity),
                      borderRadius: '3px',
                      opacity,
                      transform: `scale(${scale})`,
                      transition: 'all 0.3s ease',
                      border: intensity > 0 ? `1px solid ${getColor(Math.min(intensity + 1, 4))}60` : 'none',
                      boxShadow: intensity > 2 ? `0 0 ${8 * glow}px ${getColor(intensity)}80` : 'none'
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginTop: '30px'
      }}>
        <span style={{
          color: '#7d8590',
          fontSize: '14px',
          fontFamily: 'SF Pro Text, -apple-system, sans-serif',
          opacity: interpolate(frame, [100, 110], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          })
        }}>
          Less
        </span>
        {[0, 1, 2, 3, 4].map(level => {
          const legendOpacity = interpolate(frame, [110 + level * 4, 120 + level * 4], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          });
          
          return (
            <div
              key={level}
              style={{
                width: '13px',
                height: '13px',
                backgroundColor: level === 0 ? '#161b22' : 
                               level === 1 ? '#0e4429' :
                               level === 2 ? '#006d32' :
                               level === 3 ? '#26a641' : '#39d353',
                borderRadius: '3px',
                opacity: legendOpacity,
                transform: `scale(${interpolate(legendOpacity, [0, 1], [0.5, 1])})`
              }}
            />
          );
        })}
        <span style={{
          color: '#7d8590',
          fontSize: '14px',
          fontFamily: 'SF Pro Text, -apple-system, sans-serif',
          opacity: interpolate(frame, [130, 140], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          })
        }}>
          More
        </span>
      </div>
    </div>
  );
};

// Enhanced GitHub Achievements Component with Sequential Storytelling
const GitHubAchievements = () => {
  const frame = useCurrentFrame();
  
  const achievements = [
    { 
      name: 'Starstruck', 
      emoji: '🤩', 
      color: '#ffd33d',
      description: 'Created a repository that others starred',
      unlockDate: 'Unlocked March 2024',
      progress: '100%'
    },
    { 
      name: 'YOLO', 
      emoji: '💖', 
      color: '#ff69b4',
      description: 'Merged pull request without review',
      unlockDate: 'Unlocked April 2024', 
      progress: '100%'
    },
    { 
      name: 'Public Sponsor', 
      emoji: '🥇', 
      color: '#ffa500',
      description: 'Sponsored open source projects',
      unlockDate: 'Unlocked June 2024',
      progress: '100%'
    }
  ];
  
  // Enhanced title animation with gradient morphing
  const titleScale = interpolate(frame, [0, 60], [0.5, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  
  const titleOpacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  
  // Animated gradient colors for title
  const gradientShift = interpolate(frame, [0, 300], [0, 360]);
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px',
      height: '100vh',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Enhanced Prominent Title */}
      <div style={{
        transform: `scale(${titleScale})`,
        opacity: titleOpacity,
        marginBottom: '80px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <h1 style={{
          background: `linear-gradient(${gradientShift}deg, #ffd33d 0%, #ff69b4 33%, #ffa500 66%, #58a6ff 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          fontFamily: 'SF Pro Display, -apple-system, sans-serif',
          fontSize: '64px',
          fontWeight: '900',
          margin: '0',
          textShadow: '0 0 40px rgba(255, 211, 61, 0.4)',
          letterSpacing: '-2px'
        }}>
          🏆 Achievements Unlocked
        </h1>
        <p style={{
          color: '#8b949e',
          fontSize: '24px',
          fontFamily: 'SF Pro Text, -apple-system, sans-serif',
          fontWeight: '500',
          margin: '16px 0 0 0',
          opacity: interpolate(frame, [40, 80], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          })
        }}>
          Celebrating coding milestones and contributions
        </p>
      </div>
      
      {/* Achievement Cards with Sequential Storytelling */}
      <div style={{
        display: 'flex',
        gap: '60px',
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'relative'
      }}>
        {achievements.map((achievement, index) => {
          const delay = 80 + index * 60; // Staggered entrance
          const progress = interpolate(
            frame - delay,
            [0, 50],
            [0, 1],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.out(Easing.cubic)
            }
          );
          
          const scale = interpolate(progress, [0, 0.7, 1], [0, 1.3, 1]);
          const rotation = interpolate(progress, [0, 0.8, 1], [45, -10, 0]);
          const opacity = interpolate(progress, [0, 0.3, 1], [0, 0.7, 1]);
          
          // Hover-like growth effect over time
          const growthEffect = interpolate(
            Math.sin(frame * 0.03 + index * 2),
            [-1, 1],
            [1, 1.05]
          );
          
          // Connection lines between achievements
          const connectionOpacity = interpolate(
            frame - delay - 30,
            [0, 20],
            [0, 0.6],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          
          return (
            <div key={index} style={{ position: 'relative' }}>
              {/* Connection line to next achievement */}
              {index < achievements.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  right: '-30px',
                  width: '60px',
                  height: '2px',
                  background: `linear-gradient(90deg, ${achievement.color}80, ${achievements[index + 1].color}80)`,
                  opacity: connectionOpacity,
                  transform: 'translateY(-50%)',
                  zIndex: 1
                }}>
                  <div style={{
                    position: 'absolute',
                    right: '-5px',
                    top: '-3px',
                    width: '0',
                    height: '0',
                    borderLeft: '8px solid',
                    borderTop: '4px solid transparent',
                    borderBottom: '4px solid transparent',
                    borderLeftColor: `${achievements[index + 1].color}80`
                  }} />
                </div>
              )}
              
              {/* Enhanced Achievement Card */}
              <div
                style={{
                  transform: `scale(${scale * growthEffect}) rotate(${rotation}deg)`,
                  opacity,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: `linear-gradient(135deg, ${achievement.color}20 0%, ${achievement.color}10 50%, rgba(255,255,255,0.05) 100%)`,
                  backdropFilter: 'blur(15px)',
                  borderRadius: '24px',
                  padding: '40px 30px',
                  border: `3px solid ${achievement.color}40`,
                  boxShadow: `
                    0 20px 60px rgba(0,0,0,0.4), 
                    0 0 40px ${achievement.color}30,
                    inset 0 1px 0 rgba(255,255,255,0.2)
                  `,
                  minWidth: '200px',
                  maxWidth: '220px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Animated background glow */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `radial-gradient(circle, ${achievement.color}15 0%, transparent 70%)`,
                  opacity: interpolate(Math.sin(frame * 0.02 + index), [-1, 1], [0.3, 0.8]),
                  pointerEvents: 'none'
                }} />
                
                {/* Enhanced Emoji with glow */}
                <div style={{
                  fontSize: '72px',
                  marginBottom: '20px',
                  filter: `drop-shadow(0 0 20px ${achievement.color}80)`,
                  transform: `scale(${interpolate(Math.sin(frame * 0.04 + index * 1.5), [-1, 1], [0.9, 1.1])})`,
                  zIndex: 2
                }}>
                  {achievement.emoji}
                </div>
                
                {/* Achievement Name */}
                <div style={{
                  color: achievement.color,
                  fontSize: '20px',
                  fontFamily: 'SF Pro Display, -apple-system, sans-serif',
                  fontWeight: '800',
                  textAlign: 'center',
                  marginBottom: '12px',
                  textShadow: `0 0 10px ${achievement.color}60`,
                  zIndex: 2
                }}>
                  {achievement.name}
                </div>
                
                {/* Achievement Description */}
                <div style={{
                  color: '#c9d1d9',
                  fontSize: '14px',
                  fontFamily: 'SF Pro Text, -apple-system, sans-serif',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.4',
                  marginBottom: '16px',
                  opacity: interpolate(frame - delay - 20, [0, 30], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp'
                  }),
                  zIndex: 2
                }}>
                  {achievement.description}
                </div>
                
                {/* Progress Indicator */}
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  marginBottom: '8px',
                  opacity: interpolate(frame - delay - 40, [0, 20], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp'
                  }),
                  zIndex: 2
                }}>
                  <div style={{
                    color: achievement.color,
                    fontSize: '12px',
                    fontFamily: 'SF Pro Text, -apple-system, sans-serif',
                    fontWeight: '700',
                    textAlign: 'center'
                  }}>
                    {achievement.progress}
                  </div>
                </div>
                
                {/* Unlock Date */}
                <div style={{
                  color: '#7d8590',
                  fontSize: '11px',
                  fontFamily: 'SF Pro Text, -apple-system, sans-serif',
                  fontWeight: '500',
                  textAlign: 'center',
                  opacity: interpolate(frame - delay - 50, [0, 20], [0, 0.8], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp'
                  }),
                  zIndex: 2
                }}>
                  {achievement.unlockDate}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Sequential Story Text */}
      <div style={{
        marginTop: '60px',
        textAlign: 'center',
        opacity: interpolate(frame, [200, 250], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp'
        })
      }}>
        <p style={{
          color: '#8b949e',
          fontSize: '18px',
          fontFamily: 'SF Pro Text, -apple-system, sans-serif',
          fontStyle: 'italic',
          maxWidth: '600px'
        }}>
          "Each achievement tells a story of growth, contribution, and community impact in the developer ecosystem"
        </p>
      </div>
    </div>
  );
};

// Stats Component
const GitHubStats = ({ repositories, followers, following, commits }) => {
  const frame = useCurrentFrame();
  
  const stats = [
    { label: 'Repositories', value: repositories, color: '#58a6ff', icon: '📚' },
    { label: 'Commits', value: commits, color: '#56d364', icon: '🔥' },
    { label: 'Followers', value: followers, color: '#f85149', icon: '👥' },
    { label: 'Following', value: following, color: '#a5a5a5', icon: '👁️' }
  ];
  
  return (
    <div style={{
      display: 'flex',
      gap: '60px',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      perspective: '1000px'
    }}>
      {stats.map((stat, index) => {
        const delay = index * 8;
        const progress = interpolate(
          frame - delay,
          [0, 30],
          [0, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic)
          }
        );
        
        const slideUp = interpolate(progress, [0, 1], [100, 0]);
        const scale = interpolate(progress, [0, 1], [0.5, 1]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);
        const rotateX = interpolate(progress, [0, 1], [45, 0]);
        
        const numberValue = Math.floor(stat.value * progress);
        
        return (
          <div
            key={index}
            style={{
              textAlign: 'center',
              transform: `translateY(${slideUp}px) scale(${scale}) rotateX(${rotateX}deg)`,
              opacity,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '30px 25px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              minWidth: '180px'
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>
              {stat.icon}
            </div>
            <div style={{
              fontSize: '56px',
              fontWeight: '900',
              background: `linear-gradient(45deg, ${stat.color}, #ffffff)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontFamily: 'SF Pro Display, -apple-system, sans-serif',
              marginBottom: '12px',
              textShadow: `0 0 20px ${stat.color}40`
            }}>
              {numberValue.toLocaleString()}
            </div>
            <div style={{
              fontSize: '16px',
              color: '#c9d1d9',
              fontFamily: 'SF Pro Text, -apple-system, sans-serif',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Repository Component
const Repository = ({ name, description, language, stars, delay = 0 }) => {
  const frame = useCurrentFrame();
  
  const slideIn = interpolate(
    frame - delay,
    [0, 40],
    [-500, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic)
    }
  );
  
  const opacity = interpolate(
    frame - delay,
    [0, 25],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );
  
  const rotateY = interpolate(
    frame - delay,
    [0, 40],
    [15, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );
  
  const languageColors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572a5',
    React: '#61dafb',
    HTML: '#e34c26',
    CSS: '#1572b6',
    Java: '#b07219',
    Vue: '#4fc08d',
    Swift: '#fa7343',
    Kotlin: '#7f52ff'
  };
  
  return (
    <div style={{
      transform: `translateX(${slideIn}px) rotateY(${rotateY}deg)`,
      opacity,
      background: 'linear-gradient(135deg, rgba(33, 38, 45, 0.9) 0%, rgba(22, 27, 34, 0.9) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(88, 166, 255, 0.2)',
      borderRadius: '16px',
      padding: '28px',
      margin: '16px 0',
      width: '100%',
      maxWidth: '650px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
      perspective: '1000px',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{
          background: 'linear-gradient(45deg, #58a6ff, #79c0ff)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          fontFamily: 'SF Pro Display, -apple-system, sans-serif',
          fontSize: '24px',
          fontWeight: '700',
          margin: 0,
          textShadow: '0 0 10px rgba(88, 166, 255, 0.3)'
        }}>
          {name}
        </h3>
        {stars > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            padding: '8px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span style={{ fontSize: '16px' }}>⭐</span>
            <span style={{
              color: '#f0f6fc',
              fontSize: '14px',
              fontWeight: '600'
            }}>{stars}</span>
          </div>
        )}
      </div>
      
      <p style={{
        color: '#8b949e',
        fontFamily: 'SF Pro Text, -apple-system, sans-serif',
        fontSize: '16px',
        lineHeight: '1.6',
        margin: '0 0 20px 0'
      }}>
        {description}
      </p>
      
      {language && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: languageColors[language] || '#8b949e',
            boxShadow: `0 0 10px ${languageColors[language] || '#8b949e'}40`
          }} />
          <span style={{
            color: '#c9d1d9',
            fontSize: '14px',
            fontFamily: 'SF Pro Text, -apple-system, sans-serif',
            fontWeight: '500'
          }}>
            {language}
          </span>
        </div>
      )}
    </div>
  );
};

// Profile Header
const EnhancedProfileHeader = ({ username, name, bio }) => {
  const frame = useCurrentFrame();
  
  const fadeIn = interpolate(frame, [0, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  
  const slideUp = interpolate(frame, [0, 80], [150, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  
  const scaleAvatar = interpolate(frame, [30, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  
  const pulseEffect = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.95, 1.05]
  );
  
  return (
    <div style={{
      opacity: fadeIn,
      transform: `translateY(${slideUp}px)`,
      textAlign: 'center',
      padding: '80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh'
    }}>
      <div style={{
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        background: 'linear-gradient(45deg, #58a6ff, #79c0ff)',
        margin: '0 auto 50px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${scaleAvatar * pulseEffect})`,
        boxShadow: '0 0 80px rgba(88, 166, 255, 0.6), inset 0 4px 0 rgba(255,255,255,0.3)',
        border: '6px solid rgba(255,255,255,0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4a90e2 0%, #7b68ee 30%, #87ceeb 60%, #98fb98 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '64px' }}>👨‍💻</div>
          </div>
          
          <div style={{
            position: 'absolute',
            top: '30px',
            right: '40px',
            fontSize: '48px',
            transform: `scale(${interpolate(Math.sin(frame * 0.2), [-1, 1], [0.8, 1.2])})`,
            filter: 'drop-shadow(0 0 20px rgba(255, 255, 0, 0.8))'
          }}>💡</div>
          
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
        </div>
      </div>
      
      <h1 style={{
        background: 'linear-gradient(45deg, #f0f6fc, #58a6ff, #79c0ff)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        fontFamily: 'SF Pro Display, -apple-system, sans-serif',
        fontSize: '84px',
        fontWeight: '900',
        margin: '0 0 20px 0',
        textShadow: '0 0 40px rgba(240, 246, 252, 0.4)',
        letterSpacing: '-2px'
      }}>{name}</h1>
      
      <p style={{
        background: 'linear-gradient(45deg, #58a6ff, #79c0ff)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        fontFamily: 'SF Pro Text, -apple-system, sans-serif',
        fontSize: '36px',
        margin: '0 0 40px 0',
        fontWeight: '600'
      }}>@{username}</p>
      
      <p style={{
        color: '#c9d1d9',
        fontFamily: 'SF Pro Text, -apple-system, sans-serif',
        fontSize: '24px',
        lineHeight: '1.6',
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center'
      }}>{bio}</p>
    </div>
  );
};

// GitHub Logo
const GitHubLogo = ({ scale = 1, animate = true }) => {
  const frame = useCurrentFrame();
  
  // Elegant breathing/pulsing animation instead of rotation
  const breathingScale = animate ? interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.95, 1.05]
  ) : 1;
  
  // Gentle glow intensity animation
  const glowIntensity = animate ? interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [0.4, 0.8]
  ) : 0.6;
  
  // Subtle floating animation
  const floatY = animate ? interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [-8, 8]
  ) : 0;
  
  return (
    <div style={{
      transform: `scale(${scale * breathingScale}) translateY(${floatY}px)`,
      filter: `drop-shadow(0 0 ${20 * glowIntensity}px rgba(88, 166, 255, ${glowIntensity}))`,
      transition: 'transform 0.3s ease'
    }}>
      <svg width="60" height="60" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="githubGradient" x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor="#58a6ff" />
            <stop offset='50%' stopColor="#79c0ff" />
            <stop offset='100%' stopColor="#a5a5a5" />
          </linearGradient>
        </defs>
        <path 
          fill="url(#githubGradient)"
          d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
        />
      </svg>
    </div>
  );
};

// Enhanced Animated Gradient Background with Floating Orbs
const DynamicBackground = () => {
  const frame = useCurrentFrame();
  
  // Create multiple floating orbs with different patterns
  const orbs = [
    { id: 1, size: 400, speed: 0.005, offsetX: 20, offsetY: 15, color: 'rgba(88, 166, 255, 0.1)' },
    { id: 2, size: 300, speed: 0.008, offsetX: -30, offsetY: 25, color: 'rgba(121, 192, 255, 0.08)' },
    { id: 3, size: 250, speed: 0.012, offsetX: 40, offsetY: -20, color: 'rgba(86, 211, 100, 0.06)' },
    { id: 4, size: 180, speed: 0.015, offsetX: -25, offsetY: -30, color: 'rgba(255, 211, 61, 0.05)' },
    { id: 5, size: 320, speed: 0.007, offsetX: 35, offsetY: 40, color: 'rgba(248, 81, 73, 0.04)' },
  ];
  
  return (
    <AbsoluteFill>
      {/* Base gradient background */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(ellipse at ${50 + Math.sin(frame * 0.01) * 15}% ${50 + Math.cos(frame * 0.012) * 15}%, 
            rgba(22, 27, 34, 0.95) 0%, 
            rgba(13, 17, 23, 0.98) 40%, 
            rgba(0, 0, 0, 1) 80%),
          linear-gradient(135deg, 
            rgba(88, 166, 255, 0.03) 0%, 
            rgba(121, 192, 255, 0.02) 25%,
            rgba(86, 211, 100, 0.02) 50%,
            rgba(255, 211, 61, 0.015) 75%,
            rgba(248, 81, 73, 0.01) 100%)
        `
      }} />
      
      {/* Animated floating orbs */}
      {orbs.map((orb) => {
        const x = 50 + Math.sin(frame * orb.speed + orb.offsetX) * 25;
        const y = 50 + Math.cos(frame * orb.speed * 0.8 + orb.offsetY) * 20;
        const scale = 1 + Math.sin(frame * orb.speed * 2) * 0.1;
        const opacity = 0.3 + Math.sin(frame * orb.speed * 1.5) * 0.2;
        
        return (
          <div
            key={orb.id}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              borderRadius: '50%',
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity: opacity,
              filter: 'blur(2px)',
              pointerEvents: 'none',
            }}
          />
        );
      })}
      
      {/* Additional moving gradient overlay */}
      <div style={{
        position: 'absolute',
        width: '120%',
        height: '120%',
        background: `
          conic-gradient(from ${frame * 0.2}deg at 50% 50%, 
            transparent 0deg,
            rgba(88, 166, 255, 0.02) 60deg,
            transparent 120deg,
            rgba(121, 192, 255, 0.015) 180deg,
            transparent 240deg,
            rgba(86, 211, 100, 0.01) 300deg,
            transparent 360deg)
        `,
        transform: `translate(-10%, -10%) rotate(${frame * 0.1}deg)`,
        opacity: 0.6,
      }} />
      
      {/* Dynamic grid pattern */}
      <svg width='100%' height='100%' style={{ opacity: 0.08 }}>
        <defs>
          <pattern id="enhancedGrid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path 
              d="M 100 0 L 0 0 0 100" 
              fill="none" 
              stroke="url(#gridGradient)" 
              strokeWidth="1" 
            />
          </pattern>
          <linearGradient id="gridGradient" x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor="#58a6ff" stopOpacity={interpolate(Math.sin(frame * 0.03), [-1, 1], [0.1, 0.4])} />
            <stop offset='50%' stopColor="#79c0ff" stopOpacity={interpolate(Math.cos(frame * 0.025), [-1, 1], [0.05, 0.3])} />
            <stop offset='100%' stopColor="#56d364" stopOpacity={interpolate(Math.sin(frame * 0.04), [-1, 1], [0.02, 0.2])} />
          </linearGradient>
        </defs>
        <rect 
          width='100%' 
          height='100%' 
          fill="url(#enhancedGrid)"
          transform={`translate(${Math.sin(frame * 0.008) * 30}, ${Math.cos(frame * 0.012) * 25})`}
        />
      </svg>
      
      {/* Subtle particle effect */}
      {Array.from({ length: 8 }).map((_, i) => {
        const particleX = 10 + (i * 12) + Math.sin(frame * 0.01 + i) * 5;
        const particleY = 20 + Math.cos(frame * 0.015 + i * 2) * 60;
        const particleOpacity = interpolate(
          Math.sin(frame * 0.02 + i * 0.5),
          [-1, 1],
          [0, 0.3]
        );
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${particleX}%`,
              top: `${particleY}%`,
              width: '2px',
              height: '2px',
              background: '#58a6ff',
              borderRadius: '50%',
              opacity: particleOpacity,
              boxShadow: `0 0 4px #58a6ff`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

function VideoComposition() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  const profileData = {
    username: 'endlessblink',
    name: 'endlessblink',
    bio: 'GitHub developer focused on MCP servers and AI-enhanced tools for LLM workflows',
    repositories: [
      {
        name: 'Like-I-Said-memory-mcp-server',
        description: 'Like-I-Said v2 - Advanced MCP Memory and Task Management for LLMs with AI Enhancement and React Dashboard',
        language: 'JavaScript',
        stars: 0
      },
      {
        name: 'Comfy-Guru',
        description: 'Comfy-Guru is an MCP that connects Claude Desktop to your ComfyUI logs - to squash those errors (peacefully)',
        language: 'Python',
        stars: 4
      }
    ],
    stats: {
      repositories: 2,
      commits: 693,
      followers: 6,
      following: 13
    }
  };
  
  return (
    <AbsoluteFill style={{ 
      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      
      {/* Audio Elements - Each positioned at appropriate timing */}
      
      {/* Profile Header typing/coding sounds - 0 to 10 seconds */}
      <Sequence from={0} durationInFrames={300}>
        <Audio src={staticFile('audio/sfx-1756735219079.wav')} volume={0.6} />
      </Sequence>
      
      {/* Stats notification sounds - 10 to 15 seconds */}
      <Sequence from={300} durationInFrames={150}>
        <Audio src={staticFile('audio/sfx-1756735230717.wav')} volume={0.8} />
      </Sequence>
      
      {/* Contribution graph bubble sounds - 15 to 20 seconds */}
      <Sequence from={450} durationInFrames={150}>
        <Audio src={staticFile('audio/sfx-1756735240761.wav')} volume={0.5} />
      </Sequence>
      
      {/* Achievement unlock sounds - 20 to 28 seconds with unique sounds */}
      <Sequence from={600} durationInFrames={30}>
        <Audio src={staticFile('audio/sfx-1756735251841.wav')} volume={0.9} />
      </Sequence>
      <Sequence from={660} durationInFrames={30}>
        <Audio src={staticFile('audio/sfx-1756735230717.wav')} volume={0.8} />
      </Sequence>
      <Sequence from={720} durationInFrames={30}>
        <Audio src={staticFile('audio/sfx-1756735272025.wav')} volume={0.85} />
      </Sequence>
      
      {/* Repository slide sounds - 28 to 35 seconds */}
      <Sequence from={840} durationInFrames={210}>
        <Audio src={staticFile('audio/sfx-1756735262535.wav')} volume={0.7} />
      </Sequence>
      
      {/* Final logo sounds - 35 to 40 seconds */}
      <Sequence from={1050} durationInFrames={150}>
        <Audio src={staticFile('audio/sfx-1756735219079.wav')} volume={0.8} />
      </Sequence>
      
      {/* Background elements run for full 40 seconds */}
      <Sequence from={0} durationInFrames={1200}>
        <DynamicBackground />
      </Sequence>
      
      <Sequence from={0} durationInFrames={1200}>
        <CodeBackground />
      </Sequence>
      
      {/* Profile Header - 0 to 10 seconds (300 frames) */}
      <Sequence from={0} durationInFrames={300}>
        <AbsoluteFill>
          <EnhancedProfileHeader 
            username={profileData.username}
            name={profileData.name}
            bio={profileData.bio}
          />
        </AbsoluteFill>
      </Sequence>
      
      {/* Stats Section - 10 to 15 seconds (150 frames) */}
      <Sequence from={300} durationInFrames={150}>
        <AbsoluteFill>
          <div style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center'
          }}>
            <h2 style={{
              background: 'linear-gradient(45deg, #f0f6fc, #79c0ff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontFamily: 'SF Pro Display, -apple-system, sans-serif',
              fontSize: '42px',
              fontWeight: '900',
              margin: '0 0 80px 0',
              textShadow: '0 0 20px rgba(121, 192, 255, 0.3)'
            }}>
              GitHub Activity
            </h2>
          </div>
          
          <GitHubStats 
            repositories={profileData.stats.repositories}
            commits={profileData.stats.commits}
            followers={profileData.stats.followers}
            following={profileData.stats.following}
          />
        </AbsoluteFill>
      </Sequence>
      
      {/* Contribution Graph - 15 to 20 seconds (150 frames) */}
      <Sequence from={450} durationInFrames={150}>
        <AbsoluteFill>
          <GitHubContributionGraph />
        </AbsoluteFill>
      </Sequence>
      
      {/* Achievements - 20 to 28 seconds (240 frames) */}
      <Sequence from={600} durationInFrames={240}>
        <AbsoluteFill>
          <GitHubAchievements />
        </AbsoluteFill>
      </Sequence>
      
      {/* Repositories - 28 to 35 seconds (210 frames) */}
      <Sequence from={840} durationInFrames={210}>
        <AbsoluteFill style={{
          padding: '40px',
          overflowY: 'hidden'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '50px'
          }}>
            <h2 style={{
              background: 'linear-gradient(45deg, #f0f6fc, #58a6ff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontFamily: 'SF Pro Display, -apple-system, sans-serif',
              fontSize: '42px',
              fontWeight: '900',
              margin: '40px 0 0 0',
              textShadow: '0 0 20px rgba(88, 166, 255, 0.3)'
            }}>
              Pinned Projects
            </h2>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}>
            {profileData.repositories.map((repo, index) => (
              <Repository
                key={index}
                name={repo.name}
                description={repo.description}
                language={repo.language}
                stars={repo.stars}
                delay={index * 25}
              />
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      
      {/* Final Logo - 35 to 40 seconds (150 frames) */}
      <Sequence from={1050} durationInFrames={150}>
        <AbsoluteFill style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          {/* Elegant entrance animation for the entire group */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '30px', // Reduced gap to bring elements closer
            transform: `translateY(${interpolate(
              frame - 1050,
              [0, 80],
              [100, 0],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic)
              }
            )}px) scale(${interpolate(
              frame - 1050,
              [0, 60],
              [0.8, 1],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic)
              }
            )})`,
            opacity: interpolate(
              frame - 1050,
              [0, 40],
              [0, 1],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp'
              }
            )
          }}>
            
            {/* GitHub Logo with elegant animations */}
            <div style={{
              position: 'relative'
            }}>
              <GitHubLogo scale={3.2} /> {/* Slightly smaller for better proportion */}
              
              {/* Elegant glow ring around logo */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                border: '2px solid rgba(88, 166, 255, 0.3)',
                opacity: interpolate(
                  Math.sin(frame * 0.03),
                  [-1, 1],
                  [0.2, 0.6]
                ),
                pointerEvents: 'none'
              }} />
              
              {/* Subtle pulse rings */}
              {[1, 2, 3].map((ring) => {
                const delay = ring * 20;
                const ringOpacity = interpolate(
                  (frame - 1050 - delay) % 120,
                  [0, 60, 120],
                  [0.4, 0, 0],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );
                
                return (
                  <div
                    key={ring}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: `${220 + ring * 40}px`,
                      height: `${220 + ring * 40}px`,
                      borderRadius: '50%',
                      border: '1px solid rgba(88, 166, 255, 0.2)',
                      opacity: ringOpacity,
                      pointerEvents: 'none'
                    }}
                  />
                );
              })}
            </div>
            
            {/* Text content with refined typography */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px' // Tighter spacing between text elements
            }}>
              {/* Username with enhanced styling */}
              <div style={{
                background: 'linear-gradient(45deg, #f0f6fc, #58a6ff, #79c0ff)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: '42px', // Larger for better proportion
                fontWeight: '800',
                fontFamily: 'SF Pro Display, -apple-system, sans-serif',
                textShadow: '0 0 30px rgba(88, 166, 255, 0.4)',
                textAlign: 'center',
                letterSpacing: '-1px',
                transform: `translateY(${interpolate(
                  frame - 1070,
                  [0, 50],
                  [30, 0],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                    easing: Easing.out(Easing.cubic)
                  }
                )}px)`,
                opacity: interpolate(
                  frame - 1070,
                  [0, 30],
                  [0, 1],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp'
                  }
                )
              }}>
                @endlessblink
              </div>
              
              {/* Tagline with elegant entrance */}
              <div style={{
                color: '#8b949e',
                fontSize: '20px',
                fontFamily: 'SF Pro Text, -apple-system, sans-serif',
                fontWeight: '500',
                textAlign: 'center',
                transform: `translateY(${interpolate(
                  frame - 1090,
                  [0, 40],
                  [20, 0],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                    easing: Easing.out(Easing.cubic)
                  }
                )}px)`,
                opacity: interpolate(
                  frame - 1090,
                  [0, 25],
                  [0, 0.9],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp'
                  }
                )
              }}>
                Building AI-Enhanced Tools
              </div>
              
              {/* Elegant accent line */}
              <div style={{
                width: interpolate(
                  frame - 1110,
                  [0, 40],
                  [0, 200],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                    easing: Easing.out(Easing.cubic)
                  }
                ),
                height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(88, 166, 255, 0.6), transparent)',
                borderRadius: '1px',
                marginTop: '8px',
                opacity: interpolate(
                  frame - 1110,
                  [0, 30],
                  [0, 1],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp'
                  }
                )
              }} />
            </div>
            
            {/* Subtle floating particles around the entire composition */}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i * 60) * (Math.PI / 180);
              const radius = 180 + Math.sin(frame * 0.01 + i) * 20;
              const x = Math.cos(angle + frame * 0.005) * radius;
              const y = Math.sin(angle + frame * 0.005) * radius;
              
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    width: '4px',
                    height: '4px',
                    background: '#58a6ff',
                    borderRadius: '50%',
                    opacity: interpolate(
                      Math.sin(frame * 0.02 + i * 1.2),
                      [-1, 1],
                      [0.1, 0.4]
                    ),
                    boxShadow: '0 0 8px #58a6ff',
                    pointerEvents: 'none'
                  }}
                />
              );
            })}
          </div>
        </AbsoluteFill>
      </Sequence>
      
    </AbsoluteFill>
  );
};

export default VideoComposition;