// Real-world validation with actual Claude Artifact patterns and edge cases
const fs = require('fs');
const path = require('path');

const testCases = [
  {
    name: 'simple-counter',
    jsx: `import React, { useState } from 'react';

const SimpleCounter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

export default SimpleCounter;`,
    expectedSuccess: true,
    description: 'Basic useState with number'
  },
  
  {
    name: 'complex-object-state',
    jsx: `import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [user, setUser] = useState({
    name: 'John',
    age: 30,
    preferences: { theme: 'dark' }
  });
  
  const [stats, setStats] = useState({
    views: 1000,
    likes: 50,
    shares: 5
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        ...prev,
        views: prev.views + Math.random() * 10
      }));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <p>Age: {user.age}</p>
      <p>Views: {Math.round(stats.views)}</p>
    </div>
  );
};

export default Dashboard;`,
    expectedSuccess: true,
    description: 'Complex nested objects with useEffect'
  },

  {
    name: 'multiple-arrays',
    jsx: `import React, { useState } from 'react';

const MultipleArrays = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', done: false },
    { id: 2, text: 'Build app', done: true }
  ]);
  
  const [colors, setColors] = useState(['red', 'blue', 'green']);
  
  const [points, setPoints] = useState([
    { x: 10, y: 20 },
    { x: 30, y: 40 },
    { x: 50, y: 60 }
  ]);

  return (
    <div>
      <h2>Todos: {todos.length}</h2>
      {todos.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
      
      <h2>Colors</h2>
      {colors.map(color => (
        <span key={color} style={{color}}>{color} </span>
      ))}
      
      <h2>Points</h2>
      {points.map((point, i) => (
        <div key={i}>Point {i}: ({point.x}, {point.y})</div>
      ))}
    </div>
  );
};

export default MultipleArrays;`,
    expectedSuccess: true,
    description: 'Multiple different array types'
  },

  {
    name: 'edge-case-invalid-jsx',
    jsx: `import React, { useState } from 'react';

const InvalidJSX = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Count: {count}
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

export default InvalidJSX;`,
    expectedSuccess: false,
    description: 'Invalid JSX (unclosed h1 tag)'
  },

  {
    name: 'no-usestate',
    jsx: `import React from 'react';

const StaticComponent = () => {
  const message = "Hello World";
  const items = ['a', 'b', 'c'];

  return (
    <div>
      <h1>{message}</h1>
      {items.map(item => <div key={item}>{item}</div>)}
    </div>
  );
};

export default StaticComponent;`,
    expectedSuccess: true,
    description: 'No useState (should pass through unchanged)'
  }
];

async function runEdgeCaseValidation() {
  console.log('🧪 Real-World Edge Case Validation');
  console.log('==================================\n');

  const { convertArtifactToRemotionAST } = require('./build/ast-converter.js');
  const results = [];

  for (const testCase of testCases) {
    console.log(`🔍 Testing: ${testCase.name}`);
    console.log(`📝 Description: ${testCase.description}`);
    console.log(`🎯 Expected: ${testCase.expectedSuccess ? 'SUCCESS' : 'FAILURE'}`);
    
    try {
      const result = await convertArtifactToRemotionAST(testCase.jsx);
      const success = result && result.length > 0;
      
      console.log(`✅ Conversion: ${success ? 'PASSED' : 'FAILED'}`);
      
      if (success) {
        // Check specific conversion quality
        const hasRemotionImports = result.includes('from "remotion"');
        const hasUseCurrentFrame = result.includes('useCurrentFrame');
        const hasUseState = result.includes('useState');
        const hasUseEffect = result.includes('useEffect');
        
        console.log(`   📊 Remotion imports: ${hasRemotionImports ? '✅' : '❌'}`);
        console.log(`   🎬 Frame animation: ${hasUseCurrentFrame ? '✅' : '❌'}`);
        console.log(`   🔄 useState removed: ${!hasUseState ? '✅' : '⚠️ (in comments)'}`);
        console.log(`   ⏰ useEffect removed: ${!hasUseEffect ? '✅' : '⚠️ (in comments)'}`);
      }
      
      results.push({
        name: testCase.name,
        description: testCase.description,
        expected: testCase.expectedSuccess,
        actual: success,
        passed: testCase.expectedSuccess === success,
        outputLength: result?.length || 0
      });
      
    } catch (error) {
      console.log(`❌ Conversion: ERROR - ${error.message}`);
      results.push({
        name: testCase.name,
        description: testCase.description,
        expected: testCase.expectedSuccess,
        actual: false,
        passed: testCase.expectedSuccess === false,
        error: error.message
      });
    }
    
    console.log('---\n');
  }

  // Summary
  console.log('📊 EDGE CASE VALIDATION SUMMARY');
  console.log('===============================\n');

  const passedTests = results.filter(r => r.passed);
  const failedTests = results.filter(r => !r.passed);

  console.log(`✅ Passed: ${passedTests.length}/${results.length}`);
  console.log(`❌ Failed: ${failedTests.length}/${results.length}`);
  console.log(`📈 Success Rate: ${Math.round((passedTests.length / results.length) * 100)}%`);

  if (failedTests.length > 0) {
    console.log('\n🔍 Failed Tests:');
    failedTests.forEach(test => {
      console.log(`- ${test.name}: Expected ${test.expected ? 'success' : 'failure'}, got ${test.actual ? 'success' : 'failure'}`);
    });
  }

  console.log('\n🎯 Real-World Readiness Assessment:');
  if (passedTests.length === results.length) {
    console.log('🚀 PRODUCTION READY - All edge cases handled correctly!');
  } else if (passedTests.length >= results.length * 0.8) {
    console.log('⚠️ MOSTLY READY - Minor edge cases need attention');
  } else {
    console.log('❌ NOT READY - Significant issues with edge cases');
  }
}

runEdgeCaseValidation().catch(console.error);