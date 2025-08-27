#!/usr/bin/env node

// Test script to verify compositionCode handling
console.log("Testing RoughCut MCP composition code generation...\n");

// Test 1: With compositionCode provided
const testWithCode = {
  animationDesc: "bouncing red ball on blue background",
  compositionCode: `
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const bounce = interpolate(frame % 30, [0, 15, 30], [0, -100, 0]);
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#87CEEB' }}>
      <div style={{
        width: 50, height: 50, borderRadius: '50%',
        backgroundColor: '#FF6B6B', position: 'absolute',
        left: '50%', top: '70%',
        transform: \`translate(-50%, \${bounce}px)\`
      }} />
    </AbsoluteFill>
  );
};`,
  duration: 5
};

// Test 2: Without compositionCode (should fail)
const testWithoutCode = {
  animationDesc: "car driving on the road",
  duration: 5
};

console.log("Test 1 - With compositionCode:");
console.log("- Description:", testWithCode.animationDesc);
console.log("- Has code:", !!testWithCode.compositionCode);
console.log("- Code length:", testWithCode.compositionCode?.length || 0);

console.log("\nTest 2 - Without compositionCode:");
console.log("- Description:", testWithoutCode.animationDesc);
console.log("- Has code:", !!testWithoutCode.compositionCode);
console.log("- Expected result: Should return error asking for code");

console.log("\n✅ Test script complete. Use these test cases to verify the MCP server behavior.");
console.log("\nTo test with Claude Desktop:");
console.log("1. Ask: 'Create a 5 second animation of a bouncing red ball on blue background'");
console.log("2. Claude should generate complete Remotion code before calling the tool");
console.log("3. The video should render with actual animation, not fallback text");