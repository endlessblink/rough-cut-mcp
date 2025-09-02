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

// Animated code-like background
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
  
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {codeLines.map((line, index) => {
        const delay = index * 25;
        const opacity = interpolate(
          frame - delay,
          [0, 50, 200, 250],
          [0, 0.4, 0.4, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        
        const translateX = interpolate(
          frame - delay,
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
  
  const titleScale = interpolate(frame, [0, 60], [0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  
  const titleOpacity = interpolate(frame, [0, 40], [0, 1], {
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
          const monthOpacity = interpolate(frame, [60 + i * 5, 80 + i * 5], [0, 1], {
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
            const dayOpacity = interpolate(frame, [80 + i * 10, 100 + i * 10], [0, 1], {
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
                const delay = 120 + dataIndex * 2;
                
                const opacity = interpolate(
                  frame - delay,
                  [0, 30],
                  [0, 1],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp'
                  }
                );
                
                const scale = interpolate(
                  frame - delay,
                  [0, 20, 25],
                  [0, 1.2, 1],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                    easing: Easing.out(Easing.cubic)
                  }
                );
                
                const glow = intensity > 2 ? interpolate(
                  frame - delay,
                  [20, 40],
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
          opacity: interpolate(frame, [200, 220], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          })
        }}>
          Less
        </span>
        {[0, 1, 2, 3, 4].map(level => {
          const legendOpacity = interpolate(frame, [220 + level * 8, 240 + level * 8], [0, 1], {
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
          opacity: interpolate(frame, [260, 280], [0, 1], {
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

// GitHub Achievements Component
const GitHubAchievements = () => {
  const frame = useCurrentFrame();
  
  const achievements = [
    { name: 'Starstruck', emoji: '🤩', color: '#ffd33d' },
    { name: 'YOLO', emoji: '💖', color: '#ff69b4' },  
    { name: 'Public Sponsor', emoji: '🥇', color: '#ffa500' }
  ];
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px'
    }}>
      <h2 style={{
        background: 'linear-gradient(45deg, #f0f6fc, #ffd33d)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        fontFamily: 'SF Pro Display, -apple-system, sans-serif',
        fontSize: '36px',
        fontWeight: '900',
        margin: '0 0 40px 0',
        textShadow: '0 0 20px rgba(255, 211, 61, 0.3)'
      }}>
        Achievements
      </h2>
      
      <div style={{
        display: 'flex',
        gap: '30px',
        justifyContent: 'center'
      }}>
        {achievements.map((achievement, index) => {
          const delay = index * 15;
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
          
          const scale = interpolate(progress, [0, 1], [0, 1]);
          const rotation = interpolate(progress, [0, 1], [180, 0]);
          const opacity = interpolate(progress, [0, 1], [0, 1]);
          
          return (
            <div
              key={index}
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                opacity,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '25px',
                border: `2px solid ${achievement.color}40`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${achievement.color}20`,
                minWidth: '120px'
              }}
            >
              <div style={{
                fontSize: '48px',
                marginBottom: '12px',
                filter: `drop-shadow(0 0 10px ${achievement.color}60)`
              }}>
                {achievement.emoji}
              </div>
              <div style={{
                color: achievement.color,
                fontSize: '14px',
                fontFamily: 'SF Pro Text, -apple-system, sans-serif',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {achievement.name}
              </div>
            </div>
          );
        })}
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
  const rotation = animate ? interpolate(frame, [0, 900], [0, 360], {
    extrapolateRight: 'clamp'
  }) : 0;
  
  const pulse = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.9, 1.1]);
  
  return (
    <div style={{
      transform: `scale(${scale * pulse}) rotate(${rotation}deg)`,
      filter: 'drop-shadow(0 0 20px rgba(88, 166, 255, 0.6))',
      transition: 'transform 0.3s ease'
    }}>
      <svg width="60" height="60" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="githubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#58a6ff" />
            <stop offset="50%" stopColor="#79c0ff" />
            <stop offset="100%" stopColor="#a5a5a5" />
          </linearGradient>
        </defs>
        <path fill="url(#githubGradient)" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    </div>
  );
};

// Dynamic Background
const DynamicBackground = () => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill>
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `radial-gradient(ellipse at ${50 + Math.sin(frame * 0.02) * 20}% ${50 + Math.cos(frame * 0.03) * 20}%, #161b22 0%, #0d1117 40%, #000000 100%)`
      }} />
      
      <svg width="100%" height="100%" style={{ opacity: 0.1 }}>
        <defs>
          <pattern id="dynamicGrid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path 
              d="M 80 0 L 0 0 0 80" 
              fill="none" 
              stroke="#58a6ff" 
              strokeWidth="2" 
              opacity={interpolate(Math.sin(frame * 0.05), [-1, 1], [0.2, 0.6])}
            />
          </pattern>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="url(#dynamicGrid)"
          transform={`translate(${Math.sin(frame * 0.01) * 20}, ${Math.cos(frame * 0.015) * 20})`}
        />
      </svg>
    </AbsoluteFill>
  );
};

function VideoComposition() {
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
      
      {/* Contribution graph bubble sounds - 15 to 25 seconds */}
      <Sequence from={450} durationInFrames={300}>
        <Audio src={staticFile('audio/sfx-1756735240761.wav')} volume={0.5} />
      </Sequence>
      
      {/* Achievement unlock sounds - 25 to 28 seconds */}
      <Sequence from={750} durationInFrames={90}>
        <Audio src={staticFile('audio/sfx-1756735251841.wav')} volume={0.9} />
      </Sequence>
      
      {/* Repository slide sounds - 28 to 35 seconds */}
      <Sequence from={840} durationInFrames={210}>
        <Audio src={staticFile('audio/sfx-1756735262535.wav')} volume={0.7} />
      </Sequence>
      
      {/* Final logo sounds - 35 to 40 seconds */}
      <Sequence from={1050} durationInFrames={150}>
        <Audio src={staticFile('audio/sfx-1756735272025.wav')} volume={0.8} />
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
      
      {/* Contribution Graph - 15 to 25 seconds (300 frames) */}
      <Sequence from={450} durationInFrames={300}>
        <AbsoluteFill>
          <GitHubContributionGraph />
        </AbsoluteFill>
      </Sequence>
      
      {/* Achievements - 25 to 28 seconds (90 frames) */}
      <Sequence from={750} durationInFrames={90}>
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
          <GitHubLogo scale={4} />
          <div style={{
            background: 'linear-gradient(45deg, #f0f6fc, #58a6ff, #79c0ff)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontSize: '32px',
            fontWeight: '800',
            marginTop: '30px',
            fontFamily: 'SF Pro Display, -apple-system, sans-serif',
            textShadow: '0 0 20px rgba(88, 166, 255, 0.4)'
          }}>
            @endlessblink
          </div>
          <div style={{
            color: '#8b949e',
            fontSize: '18px',
            marginTop: '12px',
            fontFamily: 'SF Pro Text, -apple-system, sans-serif',
            fontWeight: '500'
          }}>
            Building AI-Enhanced Tools
          </div>
        </AbsoluteFill>
      </Sequence>
      
    </AbsoluteFill>
  );
};

export default VideoComposition;