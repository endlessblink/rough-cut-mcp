// Stress-test universal structure preservation with challenging artifacts
const fs = require('fs');
const path = require('path');

const badExamples = [
  {
    name: 'complex-state-dependencies',
    description: 'Multiple interdependent useState with complex relationships',
    jsx: `import React, { useState, useEffect } from 'react';

const ComplexStateDependencies = () => {
  const [particles, setParticles] = useState([]);
  const [forceFields, setForceFields] = useState([]);
  const [collisions, setCollisions] = useState(new Set());
  const [config, setConfig] = useState({
    gravity: 0.5,
    friction: 0.99,
    maxSpeed: 5,
    bounds: { width: 800, height: 600 }
  });

  // Complex interdependent effects
  useEffect(() => {
    const newForceFields = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: Math.random() * config.bounds.width,
      y: Math.random() * config.bounds.height,
      strength: Math.random() * 10 + 5,
      radius: Math.random() * 100 + 50,
      type: ['attract', 'repel', 'vortex'][Math.floor(Math.random() * 3)]
    }));
    setForceFields(newForceFields);
  }, [config]);

  useEffect(() => {
    if (forceFields.length === 0) return;
    
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * config.bounds.width,
      y: Math.random() * config.bounds.height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      mass: Math.random() * 2 + 1,
      charge: Math.random() > 0.5 ? 1 : -1,
      trail: [],
      energy: Math.random() * 100
    }));
    setParticles(newParticles);
  }, [forceFields, config]);

  // Complex animation with interdependencies
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => {
        const newCollisions = new Set();
        
        const updated = prev.map(particle => {
          let fx = 0, fy = 0;
          
          // Apply force fields
          forceFields.forEach(field => {
            const dx = field.x - particle.x;
            const dy = field.y - particle.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < field.radius) {
              const force = field.strength / (distance * distance + 1);
              fx += (dx / distance) * force * particle.charge;
              fy += (dy / distance) * force * particle.charge;
            }
          });
          
          // Update velocity with forces and friction
          const newVx = (particle.vx + fx) * config.friction;
          const newVy = (particle.vy + fy + config.gravity) * config.friction;
          
          // Limit max speed
          const speed = Math.sqrt(newVx*newVx + newVy*newVy);
          const limitedVx = speed > config.maxSpeed ? (newVx/speed) * config.maxSpeed : newVx;
          const limitedVy = speed > config.maxSpeed ? (newVy/speed) * config.maxSpeed : newVy;
          
          // Update position
          const newX = particle.x + limitedVx;
          const newY = particle.y + limitedVy;
          
          // Bounce off boundaries
          const finalX = newX < 0 ? 0 : newX > config.bounds.width ? config.bounds.width : newX;
          const finalY = newY < 0 ? 0 : newY > config.bounds.height ? config.bounds.height : newY;
          
          // Update trail
          const newTrail = [...particle.trail, { x: finalX, y: finalY }].slice(-10);
          
          return {
            ...particle,
            x: finalX,
            y: finalY,
            vx: finalX !== newX ? -limitedVx * 0.8 : limitedVx,
            vy: finalY !== newY ? -limitedVy * 0.8 : limitedVy,
            trail: newTrail,
            energy: Math.max(0, particle.energy - 0.1)
          };
        });
        
        setCollisions(newCollisions);
        return updated.filter(p => p.energy > 0);
      });
    }, 16);
    
    return () => clearInterval(interval);
  }, [forceFields, config]);

  return (
    <div className="w-full h-screen bg-black relative">
      <svg width="100%" height="100%">
        {particles.map(particle => (
          <g key={particle.id}>
            {/* Trail */}
            <polyline
              points={particle.trail.map(p => \`\${p.x},\${p.y}\`).join(' ')}
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
            />
            {/* Particle */}
            <circle
              cx={particle.x}
              cy={particle.y}
              r={particle.mass * 3}
              fill={particle.charge > 0 ? "#ff4444" : "#4444ff"}
              opacity={particle.energy / 100}
            />
          </g>
        ))}
        {forceFields.map(field => (
          <circle
            key={field.id}
            cx={field.x}
            cy={field.y}
            r={field.radius}
            fill="none"
            stroke={field.type === 'attract' ? '#00ff00' : field.type === 'repel' ? '#ff0000' : '#ffff00'}
            strokeWidth="2"
            opacity="0.3"
          />
        ))}
      </svg>
    </div>
  );
};

export default ComplexStateDependencies;`
  },
  
  {
    name: 'heavy-computation-pattern',
    description: 'Performance-heavy animations with large arrays and complex calculations',
    jsx: `import React, { useState, useEffect } from 'react';

const HeavyComputationPattern = () => {
  const [fluidGrid, setFluidGrid] = useState([]);
  const [temperature, setTemperature] = useState(0);
  const [pressure, setPressure] = useState(1);

  useEffect(() => {
    // Initialize massive grid
    const gridSize = 50; // 2500 elements
    const newGrid = Array.from({ length: gridSize * gridSize }, (_, index) => {
      const x = index % gridSize;
      const y = Math.floor(index / gridSize);
      return {
        id: index,
        x: x,
        y: y,
        density: Math.random(),
        velocity: { x: 0, y: 0 },
        temperature: Math.random() * 100,
        pressure: Math.random() * 2,
        viscosity: Math.random() * 0.1,
        color: \`hsl(\${Math.random() * 360}, 70%, 50%)\`,
        neighbors: [],
        forces: { gravity: 0, magnetic: 0, thermal: 0 }
      };
    });
    setFluidGrid(newGrid);
  }, []);

  // Heavy computation simulation
  useEffect(() => {
    if (fluidGrid.length === 0) return;
    
    const interval = setInterval(() => {
      setTemperature(prev => prev + 0.1);
      setPressure(prev => prev + Math.sin(temperature) * 0.01);
      
      setFluidGrid(prevGrid => {
        // Extremely heavy computation - 2500 elements with complex physics
        return prevGrid.map((cell, index) => {
          const gridSize = 50;
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          
          // Find neighbors (expensive operation)
          const neighbors = [];
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && (dx !== 0 || dy !== 0)) {
                const neighborIndex = ny * gridSize + nx;
                if (prevGrid[neighborIndex]) {
                  neighbors.push(prevGrid[neighborIndex]);
                }
              }
            }
          }
          
          // Complex fluid dynamics calculations
          let newDensity = cell.density;
          let newVelocity = { ...cell.velocity };
          let newTemperature = cell.temperature;
          let newPressure = cell.pressure;
          
          // Density diffusion
          neighbors.forEach(neighbor => {
            const densityDiff = neighbor.density - cell.density;
            newDensity += densityDiff * 0.01;
          });
          
          // Velocity calculations with Navier-Stokes approximation
          neighbors.forEach(neighbor => {
            const vxDiff = neighbor.velocity.x - cell.velocity.x;
            const vyDiff = neighbor.velocity.y - cell.velocity.y;
            newVelocity.x += vxDiff * cell.viscosity;
            newVelocity.y += vyDiff * cell.viscosity;
          });
          
          // Apply pressure gradient
          const pressureGradientX = neighbors.reduce((sum, n) => sum + (n.pressure - cell.pressure), 0) / neighbors.length || 0;
          const pressureGradientY = neighbors.reduce((sum, n) => sum + (n.pressure - cell.pressure), 0) / neighbors.length || 0;
          
          newVelocity.x -= pressureGradientX * 0.1;
          newVelocity.y -= pressureGradientY * 0.1;
          
          // Thermal effects
          newTemperature += neighbors.reduce((sum, n) => sum + (n.temperature - cell.temperature), 0) * 0.001;
          
          // Update pressure based on density and temperature
          newPressure = newDensity * newTemperature * 0.1;
          
          // Apply global forces
          newVelocity.y += cell.density * 0.01; // Gravity
          newVelocity.x *= 0.999; // Air resistance
          newVelocity.y *= 0.999;
          
          return {
            ...cell,
            neighbors: neighbors.slice(0, 3), // Limit stored neighbors
            density: Math.max(0, Math.min(2, newDensity)),
            velocity: newVelocity,
            temperature: Math.max(0, Math.min(200, newTemperature)),
            pressure: Math.max(0, Math.min(5, newPressure)),
            color: \`hsl(\${(newTemperature * 2) % 360}, 70%, \${Math.min(80, 30 + newDensity * 25)}%)\`
          };
        });
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [fluidGrid, temperature, pressure]);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <div className="absolute top-4 left-4 text-white text-sm">
        <div>Temperature: {temperature.toFixed(1)}</div>
        <div>Pressure: {pressure.toFixed(2)}</div>
        <div>Cells: {fluidGrid.length}</div>
      </div>
      
      <svg width="100%" height="100%">
        {fluidGrid.filter((_, i) => i % 5 === 0).map(cell => (
          <g key={cell.id}>
            {/* Velocity vector */}
            <line
              x1={cell.x * 12}
              y1={cell.y * 12}
              x2={cell.x * 12 + cell.velocity.x * 20}
              y2={cell.y * 12 + cell.velocity.y * 20}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
            {/* Cell */}
            <rect
              x={cell.x * 12}
              y={cell.y * 12}
              width="10"
              height="10"
              fill={cell.color}
              opacity={cell.density}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default HeavyComputationPattern;`
  },

  {
    name: 'unusual-data-structures',  
    description: 'Complex data structures with Maps, Sets, and nested objects',
    jsx: `import React, { useState, useEffect } from 'react';

const UnusualDataStructures = () => {
  const [entityGraph, setEntityGraph] = useState({
    nodes: new Map(),
    edges: new Set(),
    layout: { algorithm: 'force', iterations: 0 }
  });
  
  const [systemState, setSystemState] = useState({
    activeConnections: new Map(),
    historicalData: [],
    metadata: {
      performance: { fps: 0, memory: 0 },
      settings: new Map([
        ['quality', 'high'],
        ['debug', false]
      ])
    }
  });

  useEffect(() => {
    // Initialize complex graph structure
    const nodes = new Map();
    const edges = new Set();
    
    // Create nodes with complex properties
    for (let i = 0; i < 20; i++) {
      nodes.set(\`node_\${i}\`, {
        id: \`node_\${i}\`,
        position: [Math.random() * 800, Math.random() * 600],
        data: {
          type: ['hub', 'leaf', 'relay'][Math.floor(Math.random() * 3)],
          weight: Math.random() * 10,
          connections: new Set(),
          properties: new Map([
            ['color', \`hsl(\${Math.random() * 360}, 70%, 60%)\`],
            ['size', Math.random() * 20 + 10],
            ['energy', Math.random() * 100]
          ])
        },
        behavior: {
          movement: \`function(t) { return Math.sin(t * \${Math.random()}) * 5; }\`,
          interaction: 'passive'
        }
      });
    }
    
    // Create edges between random nodes
    const nodeIds = Array.from(nodes.keys());
    for (let i = 0; i < 40; i++) {
      const from = nodeIds[Math.floor(Math.random() * nodeIds.length)];
      const to = nodeIds[Math.floor(Math.random() * nodeIds.length)];
      if (from !== to) {
        edges.add(\`\${from}->\${to}\`);
      }
    }
    
    setEntityGraph({ nodes, edges, layout: { algorithm: 'force', iterations: 0 } });
  }, []);

  return (
    <div className="w-full h-screen bg-gray-900 relative">
      <svg width="100%" height="100%">
        {/* Render edges */}
        {Array.from(entityGraph.edges).map(edge => {
          const [fromId, toId] = edge.split('->');
          const fromNode = entityGraph.nodes.get(fromId);
          const toNode = entityGraph.nodes.get(toId);
          
          if (fromNode && toNode) {
            return (
              <line
                key={edge}
                x1={fromNode.position[0]}
                y1={fromNode.position[1]}
                x2={toNode.position[0]}
                y2={toNode.position[1]}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
            );
          }
          return null;
        })}
        
        {/* Render nodes */}
        {Array.from(entityGraph.nodes.values()).map(node => (
          <circle
            key={node.id}
            cx={node.position[0]}
            cy={node.position[1]}
            r={node.data.properties.get('size') || 10}
            fill={node.data.properties.get('color') || '#ffffff'}
            opacity={node.data.properties.get('energy') / 100 || 0.5}
          />
        ))}
      </svg>
      
      <div className="absolute top-4 left-4 text-white text-xs">
        <div>Nodes: {entityGraph.nodes.size}</div>
        <div>Edges: {entityGraph.edges.size}</div>
        <div>Algorithm: {entityGraph.layout.algorithm}</div>
      </div>
    </div>
  );
};

export default UnusualDataStructures;`
  },

  {
    name: 'dynamic-properties',
    description: 'Dynamic object properties and runtime-generated structures', 
    jsx: `import React, { useState, useEffect } from 'react';

const DynamicProperties = () => {
  const [entities, setEntities] = useState([]);
  const [behaviorRegistry, setBehaviorRegistry] = useState(new Map());

  useEffect(() => {
    // Create entities with dynamic properties
    const newEntities = Array.from({ length: 15 }, (_, i) => {
      const entity = {
        id: i,
        base: {
          x: Math.random() * 800,
          y: Math.random() * 600,
          type: \`type_\${Math.floor(Math.random() * 5)}\`
        }
      };
      
      // Add dynamic properties based on type
      const dynamicPropertyCount = Math.floor(Math.random() * 5) + 3;
      for (let j = 0; j < dynamicPropertyCount; j++) {
        const propName = \`dynamic_\${j}_\${Math.random().toString(36).substr(2, 5)}\`;
        entity[\`runtime_\${propName}\`] = {
          value: Math.random() * 100,
          updateRate: Math.random() * 0.1,
          bounds: [Math.random() * 50, Math.random() * 100 + 50],
          behavior: \`sin_wave_\${Math.floor(Math.random() * 3)}\`
        };
      }
      
      // Add behavior arrays  
      entity.behaviors = [];
      for (let k = 0; k < Math.floor(Math.random() * 3) + 1; k++) {
        entity.behaviors.push({
          name: \`behavior_\${k}_\${Math.random().toString(36).substr(2, 4)}\`,
          params: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => Math.random()),
          active: Math.random() > 0.5
        });
      }
      
      return entity;
    });
    
    setEntities(newEntities);
  }, []);

  // Complex behavior update system
  useEffect(() => {
    const interval = setInterval(() => {
      setEntities(prevEntities => {
        return prevEntities.map(entity => {
          const updatedEntity = { ...entity };
          
          // Update all dynamic properties
          Object.keys(entity).forEach(key => {
            if (key.startsWith('runtime_')) {
              const prop = entity[key];
              if (prop.behavior === 'sin_wave_0') {
                prop.value = prop.bounds[0] + (prop.bounds[1] - prop.bounds[0]) * (Math.sin(Date.now() * prop.updateRate) + 1) / 2;
              } else if (prop.behavior === 'sin_wave_1') {
                prop.value = prop.value + Math.cos(Date.now() * prop.updateRate) * prop.updateRate;
              }
              updatedEntity[key] = prop;
            }
          });
          
          // Update behaviors
          updatedEntity.behaviors = entity.behaviors.map(behavior => ({
            ...behavior,
            params: behavior.params.map((param, i) => 
              param + Math.sin(Date.now() * 0.001 + i) * 0.1
            )
          }));
          
          return updatedEntity;
        });
      });
    }, 33); // ~30fps
    
    return () => clearInterval(interval);
  }, [entities]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 to-black relative">
      {entities.map(entity => {
        // Compute visual properties from dynamic data
        const dynamicProps = Object.keys(entity).filter(k => k.startsWith('runtime_'));
        const avgDynamicValue = dynamicProps.reduce((sum, prop) => sum + (entity[prop]?.value || 0), 0) / dynamicProps.length || 50;
        
        return (
          <div
            key={entity.id}
            className="absolute"
            style={{
              left: entity.base.x + avgDynamicValue,
              top: entity.base.y + avgDynamicValue * 0.5,
              width: 10 + avgDynamicValue * 0.2,
              height: 10 + avgDynamicValue * 0.2,
              backgroundColor: \`hsl(\${avgDynamicValue * 3.6}, 70%, 60%)\`,
              opacity: Math.min(1, avgDynamicValue / 100),
              transform: \`rotate(\${avgDynamicValue * 3.6}deg) scale(\${0.5 + avgDynamicValue / 200})\`,
              borderRadius: entity.behaviors.length > 2 ? '50%' : '0%'
            }}
          >
            {/* Render behavior indicators */}
            {entity.behaviors.filter(b => b.active).map((behavior, i) => (
              <div
                key={behavior.name}
                className="absolute w-1 h-1 bg-white"
                style={{
                  left: \`\${i * 25}%\`,
                  top: \`\${i * 25}%\`,
                  opacity: behavior.params[0] || 0.5
                }}
              />
            ))}
          </div>
        );
      })}
      
      <div className="absolute bottom-4 left-4 text-white text-xs">
        <div>Entities: {entities.length}</div>
        <div>Avg Dynamic Props: {entities.length > 0 ? (entities.reduce((sum, e) => sum + Object.keys(e).filter(k => k.startsWith('runtime_')).length, 0) / entities.length).toFixed(1) : 0}</div>
        <div>Temperature: {temperature.toFixed(1)}</div>
      </div>
    </div>
  );
};

export default DynamicProperties;`
  }
];

async function testBadExamples() {
  console.log('🧪 Stress-Testing Universal Structure Preservation');
  console.log('=================================================');
  console.log('Testing challenging artifacts to identify limitations and failure modes\n');

  const { convertArtifactToRemotionAST } = require('./build/ast-converter.js');
  const results = [];

  for (let i = 0; i < badExamples.length; i++) {
    const example = badExamples[i];
    console.log(\`\${i + 1}. TESTING: \${example.name}\`);
    console.log(\`   Description: \${example.description}\`);
    console.log(\`   Input: \${example.jsx.length} characters\`);

    try {
      const startTime = Date.now();
      const result = await convertArtifactToRemotionAST(example.jsx);
      const duration = Date.now() - startTime;

      console.log(\`   ✅ Conversion completed: \${result.length} chars in \${duration}ms\`);
      
      // Quality analysis
      const hasRemotionImports = result.includes('from "remotion"');
      const hasUseCurrentFrame = result.includes('useCurrentFrame');
      const hasComplexStructures = result.includes('Map') || result.includes('Set');
      const preservationRatio = result.length / example.jsx.length;
      
      console.log(\`   📊 Remotion imports: \${hasRemotionImports ? '✅' : '❌'}\`);
      console.log(\`   📊 Frame animation: \${hasUseCurrentFrame ? '✅' : '❌'}\`);
      console.log(\`   📊 Complex structures: \${hasComplexStructures ? '⚠️' : '✅'}\`);
      console.log(\`   📊 Content preservation: \${(preservationRatio * 100).toFixed(1)}%\`);
      
      // Save result for analysis
      fs.writeFileSync(path.join(__dirname, 'logs', \`bad-example-\${example.name}.tsx\`), result);
      
      results.push({
        name: example.name,
        success: true,
        duration,
        preservationRatio,
        hasRemotionImports,
        hasUseCurrentFrame,
        complexStructuresRemaining: hasComplexStructures,
        outputLength: result.length
      });

    } catch (error) {
      console.log(\`   ❌ CONVERSION FAILED: \${error.message}\`);
      
      results.push({
        name: example.name,
        success: false,
        error: error.message,
        failureType: categorizeError(error)
      });
    }
    
    console.log('---\\n');
  }

  // Overall assessment
  console.log('📊 STRESS TEST SUMMARY');
  console.log('======================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(\`✅ Successful conversions: \${successful.length}/\${results.length}\`);
  console.log(\`❌ Failed conversions: \${failed.length}/\${results.length}\`);
  console.log(\`📈 Success rate: \${(successful.length / results.length * 100).toFixed(1)}%\`);
  
  if (successful.length > 0) {
    const avgPreservation = successful.reduce((sum, r) => sum + (r.preservationRatio || 0), 0) / successful.length;
    const avgDuration = successful.reduce((sum, r) => sum + (r.duration || 0), 0) / successful.length;
    
    console.log(\`📊 Average content preservation: \${(avgPreservation * 100).toFixed(1)}%\`);
    console.log(\`⚡ Average conversion time: \${avgDuration.toFixed(0)}ms\`);
  }
  
  if (failed.length > 0) {
    console.log('\\n🔍 Failure Analysis:');
    failed.forEach(failure => {
      console.log(\`- \${failure.name}: \${failure.failureType} - \${failure.error}\`);
    });
  }
  
  // Robustness assessment
  const robustnessScore = successful.length / results.length;
  console.log(\`\\n🎯 Robustness Assessment:\`);
  if (robustnessScore >= 0.9) {
    console.log('🚀 EXCELLENT: System handles complex patterns robustly');
  } else if (robustnessScore >= 0.7) {
    console.log('✅ GOOD: System handles most patterns with some limitations');
  } else if (robustnessScore >= 0.5) {
    console.log('⚠️  MODERATE: System needs improvement for complex patterns');
  } else {
    console.log('❌ POOR: System struggles with complex patterns - needs major improvements');
  }
}

function categorizeError(error) {
  const message = error.message.toLowerCase();
  
  if (message.includes('parse') || message.includes('syntax')) {
    return 'PARSING_ERROR';
  } else if (message.includes('traverse') || message.includes('scope')) {
    return 'AST_TRAVERSAL_ERROR';
  } else if (message.includes('memory') || message.includes('timeout')) {
    return 'PERFORMANCE_ERROR';
  } else if (message.includes('map') || message.includes('set')) {
    return 'DATA_STRUCTURE_ERROR';
  } else {
    return 'UNKNOWN_ERROR';
  }
}

testBadExamples().catch(console.error);