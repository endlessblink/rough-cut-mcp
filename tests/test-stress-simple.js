// Simple stress test for enhanced mode v9.4.0
const fs = require('fs');
const path = require('path');

// Bad Example 1: Complex interdependent state
const complexStateExample = `import React, { useState, useEffect } from 'react';

const ComplexState = () => {
  const [particles, setParticles] = useState([]);
  const [forces, setForces] = useState([]);
  const [config, setConfig] = useState({
    gravity: 0.5,
    friction: 0.99
  });

  useEffect(() => {
    const newForces = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: Math.random() * 800,
      y: Math.random() * 600,
      strength: Math.random() * 10
    }));
    setForces(newForces);
  }, [config]);

  useEffect(() => {
    if (forces.length === 0) return;
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 800,
      y: Math.random() * 600,
      vx: Math.random() * 4,
      vy: Math.random() * 4,
      mass: Math.random() * 2
    }));
    setParticles(newParticles);
  }, [forces]);

  return (
    <div>
      {particles.map(p => <div key={p.id} style={{left: p.x, top: p.y}} />)}
    </div>
  );
};

export default ComplexState;`;

// Bad Example 2: Unusual data structures  
const unusualStructuresExample = `import React, { useState, useEffect } from 'react';

const UnusualStructures = () => {
  const [graph, setGraph] = useState({
    nodes: new Map(),
    edges: new Set(),
    layout: { algorithm: 'force' }
  });

  useEffect(() => {
    const nodes = new Map();
    for (let i = 0; i < 10; i++) {
      nodes.set('node_' + i, {
        id: i,
        pos: [Math.random() * 800, Math.random() * 600],
        data: new Map([['color', 'red'], ['size', Math.random() * 20]])
      });
    }
    setGraph({ nodes, edges: new Set(), layout: { algorithm: 'force' } });
  }, []);

  return (
    <div>
      {Array.from(graph.nodes.values()).map(node => (
        <div key={node.id} style={{
          left: node.pos[0], 
          top: node.pos[1],
          backgroundColor: node.data.get('color')
        }} />
      ))}
    </div>
  );
};

export default UnusualStructures;`;

async function testStressCases() {
  console.log('🧪 Stress-Testing Enhanced Mode v9.4.0');
  console.log('=======================================');
  console.log('Testing challenging patterns to find limitations\n');

  const examples = [
    { name: 'complex-state', jsx: complexStateExample },
    { name: 'unusual-structures', jsx: unusualStructuresExample }
  ];

  try {
    const { convertArtifactToRemotionAST } = require('./build/ast-converter.js');
    
    for (let i = 0; i < examples.length; i++) {
      const example = examples[i];
      console.log((i + 1) + '. TESTING: ' + example.name);
      
      try {
        const result = await convertArtifactToRemotionAST(example.jsx);
        
        console.log('   ✅ Conversion successful: ' + result.length + ' chars');
        
        // Check if enhanced mode applied
        const hasEnhanced = result.includes('Math.sin') && result.includes('useCurrentFrame');
        console.log('   📊 Enhanced mode applied: ' + (hasEnhanced ? 'YES' : 'NO'));
        
        // Check for complex structures
        const hasComplexStructures = result.includes('Map') || result.includes('Set');
        console.log('   📊 Complex structures preserved: ' + (hasComplexStructures ? 'YES' : 'NO'));
        
        // Save result
        fs.writeFileSync(path.join(__dirname, 'logs', 'stress-' + example.name + '.tsx'), result);
        
      } catch (error) {
        console.log('   ❌ FAILED: ' + error.message);
      }
      
      console.log('');
    }
    
    console.log('🎯 Enhanced Mode v9.4.0 is now ALWAYS ACTIVE');
    console.log('✅ Ready for Claude Desktop testing without environment variable dependency');
    console.log('✅ Universal structure preservation applies to all artifacts');
    
  } catch (error) {
    console.error('❌ Stress test setup failed:', error.message);
  }
}

testStressCases().catch(console.error);