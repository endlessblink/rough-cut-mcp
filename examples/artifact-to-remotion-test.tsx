import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

const TechStartupShowcase = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Tech startup data for showcase
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

  // Smooth animation controller
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationProgress(prev => prev + 0.02);
    }, 50);

    const sceneInterval = setInterval(() => {
      setCurrentScene(prev => (prev + 1) % 4);
    }, 8000); // 8 seconds per scene

    return () => {
      clearInterval(interval);
      clearInterval(sceneInterval);
    };
  }, []);

  // Floating tech particles
  const TechParticles = () => {
    const particles = Array.from({length: 15}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      speed: Math.random() * 1.5 + 0.5,
      color: ['#00ff88', '#58a6ff', '#ffd33d', '#f85149'][Math.floor(Math.random() * 4)],
      shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)]
    }));

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className={`absolute ${particle.shape === 'circle' ? 'rounded-full' : particle.shape === 'square' ? 'rounded-sm' : ''} opacity-40`}
            style={{
              left: `${particle.x + Math.sin((animationProgress + particle.id * 5) * 0.015) * 2}%`,
              top: `${particle.y + Math.cos((animationProgress + particle.id * 8) * 0.012) * 1.5}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 4}px ${particle.color}50`,
              transform: `translate(-50%, -50%) scale(${1 + Math.sin((animationProgress + particle.id * 3) * 0.02) * 0.3}) ${particle.shape === 'triangle' ? 'rotate(45deg)' : ''}`
            }}
          />
        ))}
      </div>
    );
  };

  // Product showcase cards
  const ProductCard = ({ product, index }) => {
    const isActive = currentScene === 1;
    
    return (
      <div 
        className="relative group transition-all duration-1000 ease-out"
        style={{
          transform: `translateY(${isActive ? 0 : 80}px) scale(${isActive ? 1 : 0.9})`,
          opacity: isActive ? 1 : 0,
          transitionDelay: `${index * 400}ms`
        }}
      >
        {/* Glassmorphism glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/60 rounded-3xl p-8 hover:border-blue-400/60 transition-all duration-300 hover:scale-105">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {product.name}
              </h3>
              <span className={`px-3 py-1 text-sm rounded-full ${
                product.status === 'Launched' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {product.status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-400">{product.users}</div>
              <div className="text-sm text-gray-400">Users</div>
            </div>
          </div>
          
          <p className="text-gray-300 text-base leading-relaxed mb-6">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium">
              {product.category}
            </span>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
          </div>
        </div>
      </div>
    );
  };

  // Metrics dashboard
  const MetricsDashboard = () => {
    const isActive = currentScene === 2;
    
    return (
      <div 
        className="grid grid-cols-2 gap-8 w-full max-w-4xl transition-all duration-1000 ease-out"
        style={{
          transform: `translateY(${isActive ? 0 : 60}px)`,
          opacity: isActive ? 1 : 0
        }}
      >
        {startupData.metrics.map((metric, index) => (
          <div 
            key={metric.label}
            className="relative group"
            style={{ transitionDelay: `${index * 300}ms` }}
          >
            {/* Animated glow */}
            <div 
              className="absolute inset-0 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"
              style={{ backgroundColor: `${metric.color}40` }}
            />
            
            <div className="relative bg-gray-900/90 backdrop-blur-xl border border-gray-700/60 rounded-3xl p-8 text-center group-hover:scale-105 transition-all duration-300">
              <div 
                className="text-5xl font-black mb-4"
                style={{ 
                  color: metric.color,
                  textShadow: `0 0 30px ${metric.color}80`,
                  filter: `brightness(${1.2 + Math.sin((animationProgress + index * 10) * 0.03) * 0.1})`
                }}
              >
                {metric.value}
              </div>
              <div className="text-gray-300 text-lg font-semibold mb-2">
                {metric.label}
              </div>
              <div 
                className="text-sm font-bold"
                style={{ color: metric.color }}
              >
                {metric.trend} growth
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-black overflow-hidden">
      {/* Dynamic tech background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(circle at ${30 + Math.sin(animationProgress * 0.008) * 5}% ${25 + Math.cos(animationProgress * 0.012) * 4}%, #00ff8820 0%, transparent 60%),
            radial-gradient(circle at ${70 + Math.sin(animationProgress * 0.010) * 6}% ${75 + Math.cos(animationProgress * 0.006) * 5}%, #58a6ff20 0%, transparent 60%),
            radial-gradient(circle at ${50 + Math.cos(animationProgress * 0.009) * 4}% ${50 + Math.sin(animationProgress * 0.011) * 3}%, #ffd33d15 0%, transparent 60%)
          `
        }}
      />

      {/* Tech particles */}
      <TechParticles />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-12 text-white">
        
        {/* Scene 0: Company Introduction */}
        {currentScene === 0 && (
          <div className="text-center transition-all duration-1000 ease-out">
            <h1 
              className="text-9xl font-black mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent"
              style={{
                filter: `brightness(${1.1 + Math.sin(animationProgress * 0.015) * 0.08})`,
                textShadow: '0 0 60px rgba(88, 166, 255, 0.4)'
              }}
            >
              {startupData.company.name}
            </h1>
            <p className="text-3xl text-gray-300 font-bold mb-12 max-w-4xl leading-relaxed">
              {startupData.company.tagline}
            </p>
            <div className="flex items-center justify-center gap-12 text-xl text-gray-400">
              <span>Founded {startupData.company.founded}</span>
              <span>•</span>
              <span>{startupData.company.team} Team Members</span>
              <span>•</span>
              <span>{startupData.company.products} Products</span>
            </div>
          </div>
        )}

        {/* Scene 1: Product Showcase */}
        {currentScene === 1 && (
          <div className="text-center max-w-7xl w-full">
            <h2 className="text-5xl font-bold mb-16 text-blue-400">
              🚀 Product Portfolio
            </h2>
            <div className="grid lg:grid-cols-2 gap-12">
              {startupData.products.map((product, index) => (
                <ProductCard key={product.name} product={product} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Scene 2: Metrics Dashboard */}
        {currentScene === 2 && (
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-16 text-purple-400">
              📊 Growth Metrics
            </h2>
            <MetricsDashboard />
          </div>
        )}

        {/* Scene 3: Call to Action */}
        {currentScene === 3 && (
          <div className="text-center transition-all duration-1000 ease-out">
            <h2 className="text-6xl font-bold mb-8 text-green-400">
              Ready to Scale?
            </h2>
            <p className="text-2xl text-gray-300 mb-12 max-w-3xl leading-relaxed">
              Join thousands of developers building the future with AI-powered tools
            </p>
            <div className="flex items-center justify-center gap-8">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/30">
                Get Started
              </button>
              <button className="px-8 py-4 border-2 border-gray-600 rounded-2xl text-xl font-bold hover:border-blue-400 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        )}

        {/* Scene indicators */}
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 flex gap-4">
          {Array.from({length: 4}).map((_, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-300 cursor-pointer ${
                currentScene === index 
                  ? 'bg-blue-400 scale-125 shadow-lg shadow-blue-400/60' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              onClick={() => setCurrentScene(index)}
            />
          ))}
        </div>

        {/* Tech branding */}
        <div className="fixed top-8 right-8 text-gray-400 text-lg font-medium">
          <span className="flex items-center gap-3">
            <Camera className="w-6 h-6" />
            TechStartup Showcase v1.0
          </span>
        </div>
      </div>

      <style jsx>{`
        .group:hover .group-hover\\:opacity-80 {
          opacity: 0.8;
        }
        
        .group:hover .group-hover\\:scale-105 {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default TechStartupShowcase;