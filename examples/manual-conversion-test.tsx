import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Sequence } from 'remotion';

const TechStartupShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Convert time-based animations to frame-based (following Frame 289 pattern)
  const time = frame * 0.033; // Approximate the React version's 50ms intervals
  
  // Convert scene management to frame-based (8 seconds per scene = 240 frames at 30fps)
  const currentScene = Math.floor((frame / 240) % 4);

  // Tech startup data (from original Artifact)
  const startupData = {
    company: {
      name: "TechFlow",
      tagline: "AI-Powered Developer Tools",
      founded: "2024",
      team: 5,
      products: 3
    },
    products: [
      {
        name: "CodeGen AI",
        description: "Intelligent code generation that understands context and delivers production-ready solutions",
        category: "Development",
        users: "10K+",
        status: "Launched"
      },
      {
        name: "DeployMaster",
        description: "Automated deployment pipeline with intelligent rollback and monitoring capabilities",
        category: "DevOps", 
        users: "5K+",
        status: "Beta"
      }
    ],
    metrics: [
      { label: "Active Users", value: "15K+", color: "#00ff88", trend: "+127%" },
      { label: "Revenue Growth", value: "340%", color: "#58a6ff", trend: "+89%" },
      { label: "Product Lines", value: "3", color: "#ffd33d", trend: "+200%" },
      { label: "Team Size", value: "5", color: "#f85149", trend: "+67%" }
    ]
  };

  // Floating tech particles (converted from Tailwind to inline styles)
  const TechParticles = () => {
    // Fixed particle positions (deterministic for video)
    const particles = Array.from({length: 15}, (_, i) => ({
      id: i,
      x: (i * 23.7 + 15) % 100, // Deterministic spread
      y: (i * 17.3 + 10) % 100,
      size: 2 + (i % 3),
      color: ['#00ff88', '#58a6ff', '#ffd33d', '#f85149'][i % 4],
      shape: ['circle', 'square', 'triangle'][i % 3]
    }));

    return (
      <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
        {particles.map(particle => {
          // Convert React animation to frame-based (following Frame 289 pattern)
          const driftX = particle.x + Math.sin(time * 0.015 + particle.id * 5) * 2;
          const driftY = particle.y + Math.cos(time * 0.012 + particle.id * 8) * 1.5;
          const scale = 1 + Math.sin(time * 0.02 + particle.id * 3) * 0.3;
          
          return (
            <div
              key={particle.id}
              style={{
                position: 'absolute',
                left: `${driftX}%`,
                top: `${driftY}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                opacity: 0.4,
                boxShadow: `0 0 ${particle.size * 4}px ${particle.color}50`,
                transform: `translate(-50%, -50%) scale(${scale}) ${particle.shape === 'triangle' ? 'rotate(45deg)' : ''}`,
                borderRadius: particle.shape === 'circle' ? '50%' : particle.shape === 'square' ? '2px' : '0'
              }}
            />
          );
        })}
      </AbsoluteFill>
    );
  };

  // Rich animated background (converted from Tailwind classes)
  const AnimatedBackground = () => (
    <AbsoluteFill style={{
      background: `
        linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #000000 100%),
        radial-gradient(circle at ${30 + Math.sin(time * 0.008) * 5}% ${25 + Math.cos(time * 0.012) * 4}%, rgba(0, 255, 136, 0.08) 0%, transparent 60%),
        radial-gradient(circle at ${70 + Math.sin(time * 0.010) * 6}% ${75 + Math.cos(time * 0.006) * 5}%, rgba(88, 166, 255, 0.08) 0%, transparent 60%),
        radial-gradient(circle at ${50 + Math.cos(time * 0.009) * 4}% ${50 + Math.sin(time * 0.011) * 3}%, rgba(255, 211, 61, 0.06) 0%, transparent 60%)
      `,
      opacity: 0.2 + Math.sin(time * 0.1) * 0.05
    }} />
  );

  // Product showcase cards (converted from Tailwind to inline styles)
  const ProductCard = ({ product, index }: { product: any, index: number }) => {
    const isActive = currentScene === 1;
    const cardFrame = frame - 240; // Start at 8 seconds
    
    return (
      <div style={{
        position: 'relative',
        transform: `translateY(${isActive ? 0 : 80}px) scale(${isActive ? 1 : 0.9})`,
        opacity: isActive ? interpolate(cardFrame, [index * 15, index * 15 + 30], [0, 1]) : 0,
        transition: 'all 1s ease-out'
      }}>
        {/* Glassmorphism background effect (converted from Tailwind) */}
        <div style={{
          position: 'absolute',
          top: '-10px', left: '-10px', right: '-10px', bottom: '-10px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
          borderRadius: '24px',
          filter: 'blur(20px)',
          opacity: 0.6
        }} />
        
        <div style={{
          position: 'relative',
          background: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(75, 85, 99, 0.6)', 
          borderRadius: '24px',
          padding: '32px',
          transform: `scale(${1 + Math.sin((time + index) * 0.5) * 0.02})` // Gentle hover effect
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#ffffff',
                margin: '0 0 8px 0'
              }}>
                {product.name}
              </h3>
              <span style={{
                padding: '4px 12px',
                fontSize: '12px',
                borderRadius: '20px',
                backgroundColor: product.status === 'Launched' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                color: product.status === 'Launched' ? 'rgb(134, 239, 172)' : 'rgb(253, 224, 71)'
              }}>
                {product.status}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#60a5fa' }}>{product.users}</div>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>Users</div>
            </div>
          </div>
          
          <p style={{
            color: '#d1d5db',
            fontSize: '16px',
            margin: '0 0 24px 0',
            lineHeight: '1.6'
          }}>
            {product.description}
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: 'rgb(147, 197, 253)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {product.category}
            </span>
            <div style={{
              width: '64px',
              height: '4px',
              background: 'linear-gradient(to right, rgb(59, 130, 246), rgb(139, 92, 246))',
              borderRadius: '2px'
            }} />
          </div>
        </div>
      </div>
    );
  };

  // Metrics dashboard (converted from Tailwind to inline styles) 
  const MetricsDashboard = () => {
    const isActive = currentScene === 2;
    const metricsFrame = frame - 480; // Start at 16 seconds
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '32px',
        width: '100%',
        maxWidth: '800px',
        transform: `translateY(${isActive ? 0 : 60}px)`,
        opacity: isActive ? 1 : 0
      }}>
        {startupData.metrics.map((metric, index) => (
          <div 
            key={metric.label}
            style={{
              position: 'relative',
              opacity: interpolate(metricsFrame, [index * 20, index * 20 + 40], [0, 1])
            }}
          >
            {/* Glowing background effect */}
            <div style={{
              position: 'absolute',
              top: '-10px', left: '-10px', right: '-10px', bottom: '-10px',
              borderRadius: '24px',
              filter: 'blur(30px)',
              opacity: 0.4,
              backgroundColor: `${metric.color}40`
            }} />
            
            <div style={{
              position: 'relative',
              background: 'rgba(17, 24, 39, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(75, 85, 99, 0.6)',
              borderRadius: '24px',
              padding: '32px',
              textAlign: 'center',
              transform: `scale(${1 + Math.sin((time + index * 10) * 0.03) * 0.02})` // Gentle pulse
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: '900',
                marginBottom: '16px',
                color: metric.color,
                textShadow: `0 0 30px ${metric.color}80`,
                filter: `brightness(${1.2 + Math.sin((time + index * 10) * 0.03) * 0.1})`
              }}>
                {metric.value}
              </div>
              <div style={{
                color: '#d1d5db',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                {metric.label}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: metric.color
              }}>
                {metric.trend} growth
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #000000 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      overflow: 'hidden'
    }}>

      {/* Rich Animated Background Layer */}
      <AnimatedBackground />
      
      {/* Floating Particles */}
      <TechParticles />

      {/* Scene 0: Company Introduction (0-240 frames / 0-8 seconds) */}
      <Sequence from={0} durationInFrames={240}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '48px'
        }}>
          <h1 style={{
            fontSize: '96px', // Rich 96px like Frame 289 standard
            fontWeight: '900',
            background: 'linear-gradient(135deg, #60a5fa, #a855f7, #34d399)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            margin: '0 0 32px 0',
            letterSpacing: '-2px',
            filter: `brightness(${1.1 + Math.sin(time * 0.015) * 0.08})`,
            textShadow: '0 0 60px rgba(88, 166, 255, 0.4)',
            opacity: interpolate(frame, [10, 40], [0, 1], { easing: Easing.out }),
            transform: `translateY(${interpolate(frame, [10, 40], [30, 0], { easing: Easing.out })}px)`
          }}>
            {startupData.company.name}
          </h1>
          <p style={{
            fontSize: '28px',
            color: '#d1d5db',
            fontWeight: '700',
            margin: '0 0 48px 0',
            maxWidth: '800px',
            lineHeight: '1.5',
            opacity: interpolate(frame, [40, 70], [0, 1], { easing: Easing.out })
          }}>
            {startupData.company.tagline}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '48px',
            fontSize: '20px',
            color: '#9ca3af',
            opacity: interpolate(frame, [70, 100], [0, 1], { easing: Easing.out })
          }}>
            <span>Founded {startupData.company.founded}</span>
            <span>•</span>
            <span>{startupData.company.team} Team Members</span>
            <span>•</span>
            <span>{startupData.company.products} Products</span>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 1: Product Showcase (240-480 frames / 8-16 seconds) */}
      <Sequence from={240} durationInFrames={240}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px'
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '64px',
            color: '#60a5fa',
            opacity: interpolate(frame - 240, [0, 30], [0, 1])
          }}>
            🚀 Product Portfolio
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 450px)',
            gap: '48px',
            maxWidth: '1000px'
          }}>
            {startupData.products.map((product, index) => (
              <ProductCard key={product.name} product={product} index={index} />
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Metrics Dashboard (480-720 frames / 16-24 seconds) */}
      <Sequence from={480} durationInFrames={240}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '64px',
            color: '#a855f7',
            opacity: interpolate(frame - 480, [0, 30], [0, 1])
          }}>
            📊 Growth Metrics
          </h2>
          <MetricsDashboard />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Call to Action (720+ frames / 24+ seconds) */}
      <Sequence from={720}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '60px',
            fontWeight: '700',
            marginBottom: '32px',
            color: '#34d399',
            opacity: interpolate(frame - 720, [0, 30], [0, 1], { easing: Easing.out }),
            transform: `translateY(${interpolate(frame - 720, [0, 30], [20, 0], { easing: Easing.out })}px)`
          }}>
            Ready to Scale?
          </h2>
          <p style={{
            fontSize: '24px',
            color: '#d1d5db',
            margin: '0 0 48px 0',
            maxWidth: '600px',
            lineHeight: '1.6',
            opacity: interpolate(frame - 720, [30, 60], [0, 1])
          }}>
            Join thousands of developers building the future with AI-powered tools
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            opacity: interpolate(frame - 720, [60, 90], [0, 1])
          }}>
            <div style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(139, 92, 246))',
              borderRadius: '16px',
              fontSize: '20px',
              fontWeight: '700',
              color: 'white',
              transform: `scale(${1 + Math.sin(time * 0.2) * 0.05})`,
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
            }}>
              Get Started
            </div>
            <div style={{
              padding: '16px 32px',
              border: '2px solid #4b5563',
              borderRadius: '16px',
              fontSize: '20px',
              fontWeight: '700',
              color: '#d1d5db',
              transform: `scale(${1 + Math.sin((time + 1) * 0.2) * 0.03})`
            }}>
              Learn More
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene indicators (like Frame 289) */}
      <AbsoluteFill style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: '48px'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px'
        }}>
          {Array.from({length: 4}).map((_, index) => (
            <div
              key={index}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: currentScene === index ? '#60a5fa' : '#4b5563',
                transform: currentScene === index ? 'scale(1.25)' : 'scale(1)',
                boxShadow: currentScene === index ? '0 0 20px rgba(96, 165, 250, 0.6)' : 'none',
                transition: 'all 0.3s ease-out'
              }}
            />
          ))}
        </div>
      </AbsoluteFill>

      {/* Tech branding (like Frame 289) */}
      <div style={{
        position: 'absolute',
        top: '32px',
        right: '32px',
        color: '#9ca3af',
        fontSize: '16px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        📷 TechStartup Showcase v2.0 - Frame: {frame}
      </div>

    </AbsoluteFill>
  );
};

export default TechStartupShowcase;