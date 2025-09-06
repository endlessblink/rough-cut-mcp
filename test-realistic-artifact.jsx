import React, { useState, useEffect } from 'react';

const InteractiveDataVisualization = () => {
  // Complex useState patterns that would break without enhanced AST converter
  const [data, setData] = useState([
    { id: 1, value: 45, category: 'A', color: '#FF6B6B' },
    { id: 2, value: 78, category: 'B', color: '#4ECDC4' },
    { id: 3, value: 23, category: 'C', color: '#45B7D1' },
    { id: 4, value: 92, category: 'D', color: '#96CEB4' },
    { id: 5, value: 56, category: 'E', color: '#FFEAA7' }
  ]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  // Complex useEffect with state updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => ({
        ...item,
        value: Math.max(10, Math.min(100, item.value + (Math.random() - 0.5) * 10))
      })));
      
      setAnimationPhase(prev => (prev + 1) % 360);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Interactive handlers that should be removed
  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleMouseMove = (e) => {
    setHoverPosition({ x: e.clientX, y: e.clientY });
  };

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div 
      className="w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8 animate-pulse">
          Data Visualization Dashboard
        </h1>
        
        {/* SVG Chart - This will test complex JSX references to useState variables */}
        <svg width="600" height="400" className="bg-black/20 rounded-lg">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Data bars - These reference complex useState variables */}
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * 300;
            const x = 50 + index * 100;
            const y = 350 - barHeight;
            
            return (
              <g key={item.id}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width="80"
                  height={barHeight}
                  fill={item.color}
                  onClick={() => handleItemClick(item)}
                  className="cursor-pointer transition-all duration-300 hover:opacity-80"
                  style={{
                    transform: `rotate(${Math.sin(animationPhase * Math.PI / 180) * 2}deg)`,
                    transformOrigin: `${x + 40}px ${y + barHeight}px`
                  }}
                />
                
                {/* Value label */}
                <text
                  x={x + 40}
                  y={y - 10}
                  textAnchor="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {Math.round(item.value)}
                </text>
                
                {/* Category label */}
                <text
                  x={x + 40}
                  y={370}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                >
                  {item.category}
                </text>
              </g>
            );
          })}
          
          {/* Selection indicator */}
          {selectedItem && (
            <circle
              cx={50 + data.findIndex(d => d.id === selectedItem.id) * 100 + 40}
              cy={30}
              r="15"
              fill="yellow"
              opacity="0.7"
              className="animate-ping"
            />
          )}
          
          {/* Hover effect */}
          <circle
            cx={hoverPosition.x % 600}
            cy={hoverPosition.y % 400}
            r="20"
            fill="rgba(255,255,255,0.2)"
            pointerEvents="none"
          />
        </svg>
        
        {/* Stats panel - More useState variable references */}
        <div className="mt-8 grid grid-cols-3 gap-6 text-white">
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold">{data.length}</div>
            <div className="text-sm opacity-70">Data Points</div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold">{Math.round(maxValue)}</div>
            <div className="text-sm opacity-70">Max Value</div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold">{selectedItem?.category || 'None'}</div>
            <div className="text-sm opacity-70">Selected</div>
          </div>
        </div>
        
        {/* Animation phase indicator */}
        <div className="mt-4 text-white/50 text-sm">
          Animation Phase: {Math.round(animationPhase)}°
        </div>
      </div>
    </div>
  );
};

export default InteractiveDataVisualization;