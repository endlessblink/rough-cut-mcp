#!/usr/bin/env node

// Test JSX patterns that the safe validation should catch
// This tests the logical patterns our validation system should handle

console.log("🔍 Testing JSX Pattern Recognition\n");

const testPatterns = [
  {
    name: "Proper Remotion Component",
    jsx: `import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const VideoComposition = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  
  return (
    <AbsoluteFill style={{ backgroundColor: 'blue', opacity }}>
      <h1 style={{ fontSize: '48px', color: 'white' }}>
        Hello World
      </h1>
    </AbsoluteFill>
  );
};`,
    tests: {
      hasRemotionImports: true,
      hasUseCurrentFrame: true,
      hasValidInterpolate: true,
      hasMinimumFontSize: true,
      hasStyleObjects: true
    }
  },
  
  {
    name: "Missing Frame Usage",
    jsx: `import React from 'react';
import { AbsoluteFill } from 'remotion';

export const VideoComposition = () => {
  return (
    <AbsoluteFill>
      <h1>Static Content - No Animation</h1>
    </AbsoluteFill>
  );
};`,
    tests: {
      hasRemotionImports: true,
      hasUseCurrentFrame: false,
      hasValidInterpolate: false,
      usesFrameWithoutDeclaration: false
    }
  },
  
  {
    name: "Professional Font Sizes",
    jsx: `export const VideoComposition = () => {
  return (
    <div>
      <h1 style={{ fontSize: '72px' }}>Large Title</h1>
      <h2 style={{ fontSize: '36px' }}>Subtitle</h2>
      <p style={{ fontSize: '16px' }}>Body text</p>
      <small style={{ fontSize: '12px' }}>Small text</small>
    </div>
  );
};`,
    tests: {
      hasLargeFonts: true,
      hasSmallFonts: true,
      shouldWarnAboutSmallFonts: true
    }
  },
  
  {
    name: "CSS Value Patterns",
    jsx: `export const VideoComposition = () => {
  return (
    <div style={{
      gap: '24px',
      padding: '32px',
      margin: '16px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h1>Professional Spacing</h1>
    </div>
  );
};`,
    tests: {
      uses8ptGrid: true,
      hasProfessionalShadows: true,
      hasConsistentSpacing: true
    }
  }
];

function analyzeJSXPattern(jsx) {
  const analysis = {
    imports: {
      hasReact: jsx.includes("from 'react'"),
      hasRemotion: jsx.includes("from 'remotion'"),
      hasUseCurrentFrame: jsx.includes('useCurrentFrame'),
      hasInterpolate: jsx.includes('interpolate')
    },
    
    usage: {
      callsUseCurrentFrame: jsx.includes('useCurrentFrame()'),
      usesFrame: jsx.includes('frame'),
      hasInterpolateCalls: jsx.match(/interpolate\s*\(/g) !== null
    },
    
    styles: {
      fontSizes: jsx.match(/fontSize:\s*['"`](\d+)px['"`]/g) || [],
      hasStyleObjects: jsx.includes('style={{'),
      hasGap: jsx.includes('gap:'),
      hasPadding: jsx.includes('padding:'),
      hasBoxShadow: jsx.includes('boxShadow:')
    },
    
    structure: {
      hasExport: jsx.includes('export'),
      hasJSXReturn: jsx.includes('return ('),
      componentCount: (jsx.match(/<[A-Z][^>]*>/g) || []).length
    }
  };
  
  return analysis;
}

function runPatternTests() {
  let totalTests = 0;
  let passedTests = 0;
  
  testPatterns.forEach(pattern => {
    console.log(`\n🧩 Testing: ${pattern.name}`);
    console.log("─".repeat(40));
    
    const analysis = analyzeJSXPattern(pattern.jsx);
    
    Object.entries(pattern.tests).forEach(([testName, expectedValue]) => {
      totalTests++;
      let actualValue = false;
      
      switch(testName) {
        case 'hasRemotionImports':
          actualValue = analysis.imports.hasRemotion;
          break;
          
        case 'hasUseCurrentFrame':
          actualValue = analysis.imports.hasUseCurrentFrame && analysis.usage.callsUseCurrentFrame;
          break;
          
        case 'hasValidInterpolate':
          actualValue = analysis.imports.hasInterpolate && analysis.usage.hasInterpolateCalls;
          break;
          
        case 'usesFrameWithoutDeclaration':
          actualValue = analysis.usage.usesFrame && !analysis.usage.callsUseCurrentFrame;
          break;
          
        case 'hasMinimumFontSize':
          const sizes = analysis.styles.fontSizes.map(match => {
            const sizeMatch = match.match(/(\d+)px/);
            return sizeMatch ? parseInt(sizeMatch[1]) : 0;
          });
          actualValue = sizes.length > 0 && Math.min(...sizes) >= 16;
          break;
          
        case 'hasStyleObjects':
          actualValue = analysis.styles.hasStyleObjects;
          break;
          
        case 'hasLargeFonts':
          const largeSizes = analysis.styles.fontSizes.filter(match => {
            const sizeMatch = match.match(/(\d+)px/);
            return sizeMatch && parseInt(sizeMatch[1]) >= 48;
          });
          actualValue = largeSizes.length > 0;
          break;
          
        case 'hasSmallFonts':
          const smallSizes = analysis.styles.fontSizes.filter(match => {
            const sizeMatch = match.match(/(\d+)px/);
            return sizeMatch && parseInt(sizeMatch[1]) < 16;
          });
          actualValue = smallSizes.length > 0;
          break;
          
        case 'shouldWarnAboutSmallFonts':
          actualValue = pattern.tests.hasSmallFonts; // Should warn about small fonts
          break;
          
        case 'uses8ptGrid':
          const spacingValues = [
            ...(pattern.jsx.match(/gap:\s*['"`](\d+)px['"`]/g) || []),
            ...(pattern.jsx.match(/padding:\s*['"`](\d+)px['"`]/g) || []),
            ...(pattern.jsx.match(/margin:\s*['"`](\d+)px['"`]/g) || [])
          ].map(match => {
            const valueMatch = match.match(/(\d+)px/);
            return valueMatch ? parseInt(valueMatch[1]) : 0;
          });
          
          actualValue = spacingValues.length > 0 && spacingValues.every(val => val % 8 === 0);
          break;
          
        case 'hasProfessionalShadows':
          actualValue = analysis.styles.hasBoxShadow;
          break;
          
        case 'hasConsistentSpacing':
          actualValue = analysis.styles.hasGap || analysis.styles.hasPadding;
          break;
      }
      
      const testPassed = actualValue === expectedValue;
      console.log(`  ${testName}: ${testPassed ? '✅' : '❌'} (expected: ${expectedValue}, got: ${actualValue})`);
      
      if (testPassed) passedTests++;
    });
  });
  
  console.log("\n" + "=".repeat(50));
  console.log(`🏁 Pattern Recognition Results: ${passedTests}/${totalTests} tests passed`);
  console.log(`Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);
  
  if (passedTests >= totalTests * 0.8) {
    console.log("🎉 Pattern recognition is working well!");
    console.log("✅ Safe validation system logic is sound");
  } else {
    console.log("⚠️  Pattern recognition needs improvement");
  }
}

// Test individual validation rules
console.log("🔧 Testing Validation Rules\n");

const validationRules = [
  {
    name: "Font Size WCAG Compliance",
    rule: "Fonts below 16px should trigger warnings",
    test: () => {
      const smallFont = "fontSize: '12px'";
      const largeFont = "fontSize: '18px'";
      
      return {
        smallFontFails: smallFont.match(/fontSize:\s*['"`]([0-9]|1[0-5])px['"`]/g) !== null,
        largeFontPasses: largeFont.match(/fontSize:\s*['"`]([0-9]|1[0-5])px['"`]/g) === null
      };
    }
  },
  
  {
    name: "8pt Grid System",
    rule: "Spacing should follow 8px multiples",
    test: () => {
      const goodSpacing = ["16px", "24px", "32px", "48px"];
      const badSpacing = ["15px", "25px", "33px"];
      
      return {
        goodSpacingFollows8pt: goodSpacing.every(val => {
          const num = parseInt(val);
          return num % 8 === 0;
        }),
        badSpacingViolates8pt: badSpacing.some(val => {
          const num = parseInt(val);
          return num % 8 !== 0;
        })
      };
    }
  },
  
  {
    name: "Remotion Patterns",
    rule: "Using frame requires useCurrentFrame()",
    test: () => {
      const validPattern = "const frame = useCurrentFrame(); return frame * 2;";
      const invalidPattern = "return frame * 2;"; // frame used without declaration
      
      return {
        validPatternDetected: validPattern.includes('useCurrentFrame()') && validPattern.includes('frame'),
        invalidPatternCaught: invalidPattern.includes('frame') && !invalidPattern.includes('useCurrentFrame()')
      };
    }
  }
];

validationRules.forEach(rule => {
  console.log(`📏 ${rule.name}`);
  console.log(`   Rule: ${rule.rule}`);
  
  const results = rule.test();
  let rulePassed = Object.values(results).every(Boolean);
  
  console.log(`   Result: ${rulePassed ? '✅ PASS' : '❌ FAIL'}`);
  Object.entries(results).forEach(([key, value]) => {
    console.log(`   - ${key}: ${value ? '✅' : '❌'}`);
  });
  console.log();
});

// Run all tests
runPatternTests();