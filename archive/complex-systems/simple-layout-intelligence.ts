// Simple Layout Intelligence - Practical Solutions for Layout Disasters
// Prevents text overflow, overlapping elements, and basic layout failures

interface TextMeasurement {
  width: number;
  height: number;
  fitsInSafeArea: boolean;
  recommendedFontSize: number;
}

interface LayoutBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ElementPosition {
  x: number;
  y: number; 
  width: number;
  height: number;
  element: string;
  priority: number;
}

/**
 * Simple Layout Intelligence System
 * Solves 90% of layout disasters with 10% of the complexity
 */
export class SimpleLayoutIntelligence {
  
  // Professional video safe areas (SMPTE standards)
  static readonly VIDEO_BOUNDS = {
    width: 1920,
    height: 1080,
    safeTitle: { width: 1728, height: 972 }, // 90% safe title area
    safeAction: { width: 1786, height: 1004 }  // 93% safe action area
  };
  
  static readonly POSITION_GRID = [
    { x: 960, y: 200, width: 1400, height: 100, name: 'top-center', reserved: false },
    { x: 960, y: 400, width: 1400, height: 100, name: 'upper-middle', reserved: false },
    { x: 960, y: 540, width: 1400, height: 100, name: 'center', reserved: false },
    { x: 960, y: 680, width: 1400, height: 100, name: 'lower-middle', reserved: false },
    { x: 960, y: 880, width: 1400, height: 100, name: 'bottom-center', reserved: false }
  ];
  
  /**
   * Smart Font Sizing - Prevents text overflow disasters
   */
  static calculateSmartFontSize(text: string, targetFontSize: number = 84): number {
    // SIMPLE RULE: Longer text = smaller font
    const textLength = text.length;
    
    if (textLength <= 20) {
      return Math.min(targetFontSize, 84);  // Short text: up to 84px
    } else if (textLength <= 35) {
      return Math.min(targetFontSize, 64);  // Medium text: max 64px  
    } else if (textLength <= 50) {
      return Math.min(targetFontSize, 48);  // Long text: max 48px
    } else {
      return Math.min(targetFontSize, 36);  // Very long text: max 36px
    }
  }
  
  /**
   * Text Width Measurement - Canvas-based accurate calculation
   */
  static measureText(text: string, fontSize: number, fontFamily: string = 'SF Pro Display'): TextMeasurement {
    // Create virtual canvas for measurement (works in Node.js with canvas package)
    const canvas = typeof document !== 'undefined' 
      ? document.createElement('canvas')
      : null;
    
    if (!canvas) {
      // Fallback estimation for server-side
      const charWidth = fontSize * 0.6; // Approximate character width
      const estimatedWidth = text.length * charWidth;
      return {
        width: estimatedWidth,
        height: fontSize * 1.2,
        fitsInSafeArea: estimatedWidth <= this.VIDEO_BOUNDS.safeTitle.width,
        recommendedFontSize: estimatedWidth > this.VIDEO_BOUNDS.safeTitle.width 
          ? this.calculateSmartFontSize(text, fontSize) 
          : fontSize
      };
    }
    
    const ctx = canvas.getContext('2d')!;
    ctx.font = `${fontSize}px ${fontFamily}`;
    
    const metrics = ctx.measureText(text);
    const width = metrics.width;
    const height = fontSize * 1.2; // Approximate line height
    
    return {
      width,
      height, 
      fitsInSafeArea: width <= this.VIDEO_BOUNDS.safeTitle.width,
      recommendedFontSize: width > this.VIDEO_BOUNDS.safeTitle.width 
        ? this.calculateSmartFontSize(text, fontSize)
        : fontSize
    };
  }
  
  /**
   * Safe Bounds Validation - Ensures content fits within video dimensions
   */
  static validateSafeBounds(element: ElementPosition): { isValid: boolean; corrections: string[] } {
    const corrections: string[] = [];
    let isValid = true;
    
    // Check if element exceeds safe title area
    const safeBounds = this.VIDEO_BOUNDS.safeTitle;
    const elementRight = element.x + (element.width / 2);
    const elementLeft = element.x - (element.width / 2);
    const elementBottom = element.y + (element.height / 2);
    const elementTop = element.y - (element.height / 2);
    
    if (elementRight > safeBounds.width) {
      corrections.push(`Element extends ${elementRight - safeBounds.width}px beyond safe right edge`);
      isValid = false;
    }
    
    if (elementLeft < (1920 - safeBounds.width) / 2) {
      corrections.push(`Element extends beyond safe left edge`);
      isValid = false;
    }
    
    if (elementBottom > safeBounds.height) {
      corrections.push(`Element extends ${elementBottom - safeBounds.height}px beyond safe bottom edge`);
      isValid = false;
    }
    
    if (elementTop < (1080 - safeBounds.height) / 2) {
      corrections.push(`Element extends beyond safe top edge`);
      isValid = false;
    }
    
    return { isValid, corrections };
  }
  
  /**
   * Simple Overlap Detection - Basic rectangle intersection
   */
  static checkOverlap(element1: ElementPosition, element2: ElementPosition): boolean {
    // Simple bounding box intersection test
    const left1 = element1.x - element1.width / 2;
    const right1 = element1.x + element1.width / 2;
    const top1 = element1.y - element1.height / 2;
    const bottom1 = element1.y + element1.height / 2;
    
    const left2 = element2.x - element2.width / 2;
    const right2 = element2.x + element2.width / 2;
    const top2 = element2.y - element2.height / 2;
    const bottom2 = element2.y + element2.height / 2;
    
    // Check if rectangles DON'T overlap (easier logic)
    const noOverlap = (right1 < left2) || (left1 > right2) || (bottom1 < top2) || (top1 > bottom2);
    
    return !noOverlap; // Return true if they DO overlap
  }
  
  /**
   * Auto-Position Elements - Prevents overlaps with simple grid system
   */
  static autoPositionElement(element: ElementPosition, existingElements: ElementPosition[]): ElementPosition {
    // Try each position in the grid until we find one that doesn't overlap
    for (const position of this.POSITION_GRID) {
      const testElement = { ...element, x: position.x, y: position.y };
      
      // Check if this position overlaps with existing elements
      const hasOverlap = existingElements.some(existing => 
        this.checkOverlap(testElement, existing)
      );
      
      if (!hasOverlap && this.validateSafeBounds(testElement).isValid) {
        return testElement; // Found safe position
      }
    }
    
    // Fallback: Use original position but log warning
    console.warn('[LAYOUT-INTELLIGENCE] Could not find safe position for element:', element.element);
    return element;
  }
  
  /**
   * Animation Timing Validation - Prevents sequence conflicts
   */
  static validateAnimationTiming(sequences: Array<{start: number, duration: number, name: string}>): {
    isValid: boolean;
    conflicts: string[];
    suggestions: string[];
  } {
    const conflicts: string[] = [];
    const suggestions: string[] = [];
    
    // Sort sequences by start time
    const sortedSequences = [...sequences].sort((a, b) => a.start - b.start);
    
    for (let i = 0; i < sortedSequences.length - 1; i++) {
      const current = sortedSequences[i];
      const next = sortedSequences[i + 1];
      
      const currentEnd = current.start + current.duration;
      const gap = next.start - currentEnd;
      
      // Minimum 30 frame gap between sequences (1 second at 30fps)
      if (gap < 30) {
        conflicts.push(`${current.name} (ends frame ${currentEnd}) overlaps with ${next.name} (starts frame ${next.start}) by ${30 - gap} frames`);
        suggestions.push(`Move ${next.name} to start at frame ${currentEnd + 30} for proper spacing`);
      }
    }
    
    return {
      isValid: conflicts.length === 0,
      conflicts,
      suggestions
    };
  }
  
  /**
   * Quick Layout Disaster Detection
   */
  static detectLayoutDisasters(jsx: string): {
    disasters: string[];
    severity: 'critical' | 'high' | 'medium' | 'low';
    autoFixable: boolean;
  } {
    const disasters: string[] = [];
    
    // Detect long text with large fonts (main disaster from screenshot)
    const largeFontPattern = /fontSize:\s*['"](\d+)px['"]/g;
    const longTextPattern = /<h1[^>]*>([^<]{35,})</g;
    
    const fontMatches = jsx.match(largeFontPattern);
    const textMatches = jsx.match(longTextPattern);
    
    if (fontMatches && textMatches) {
      fontMatches.forEach(fontMatch => {
        const fontSize = parseInt(fontMatch.match(/(\d+)/)?.[1] || '0');
        if (fontSize > 60) {
          textMatches.forEach(textMatch => {
            const textContent = textMatch.match(/>([^<]+)</)?.[1] || '';
            if (textContent.length > 35) {
              disasters.push(`${fontSize}px font with ${textContent.length} character text "${textContent.substring(0, 30)}..." will overflow`);
            }
          });
        }
      });
    }
    
    // Detect multiple absolute positioned elements (overlap risk)
    const absoluteElements = jsx.match(/position:\s*['"]absolute['"]/g);
    if (absoluteElements && absoluteElements.length > 3) {
      disasters.push(`${absoluteElements.length} absolutely positioned elements - high overlap risk`);
    }
    
    // Detect very long titles without proper handling
    const titlePattern = /<h1[^>]*>([^<]{50,})</g;
    const longTitles = jsx.match(titlePattern);
    if (longTitles) {
      longTitles.forEach(title => {
        const text = title.match(/>([^<]+)</)?.[1] || '';
        disasters.push(`Very long title (${text.length} chars): "${text.substring(0, 40)}..." needs smart sizing`);
      });
    }
    
    const severity = disasters.length > 2 ? 'critical' : 
                    disasters.length > 1 ? 'high' : 
                    disasters.length > 0 ? 'medium' : 'low';
    
    return {
      disasters,
      severity,
      autoFixable: disasters.length > 0 && disasters.length <= 3
    };
  }
  
  /**
   * Apply Simple Layout Fixes - Directly fixes the disasters we've seen
   */
  static applySimpleLayoutFixes(jsx: string): { 
    fixedJSX: string; 
    appliedFixes: string[]; 
    remainingIssues: string[] 
  } {
    const appliedFixes: string[] = [];
    const remainingIssues: string[] = [];
    let fixedJSX = jsx;
    
    // Fix 1: Smart font sizing for long titles
    fixedJSX = fixedJSX.replace(
      /(fontSize:\s*['"])(\d+)(px['"][^>]*>)([^<]{35,})(<)/g,
      (match, prefix, fontSize, suffix, text, closing) => {
        const originalSize = parseInt(fontSize);
        const smartSize = this.calculateSmartFontSize(text, originalSize);
        
        if (smartSize !== originalSize) {
          appliedFixes.push(`Reduced font size from ${originalSize}px to ${smartSize}px for long text (${text.length} chars)`);
          return `${prefix}${smartSize}${suffix}${text}${closing}`;
        }
        return match;
      }
    );
    
    // Fix 2: Add safe margin to titles
    fixedJSX = fixedJSX.replace(
      /(fontSize:\s*['"])(\d+)(px['"][^}]*)(margin:\s*\d+)/g,
      (match, prefix, fontSize, middle, marginPart) => {
        appliedFixes.push('Added safe margin for title positioning');
        return `${prefix}${fontSize}${middle}margin: 'auto', maxWidth: '${this.VIDEO_BOUNDS.safeTitle.width}px'`;
      }
    );
    
    // Fix 3: Add text overflow protection
    if (jsx.includes('fontSize') && jsx.includes('h1')) {
      fixedJSX = fixedJSX.replace(
        /(<h1[^>]*style={{[^}]*)(}>)/g,
        (match, styleStart, closing) => {
          if (!styleStart.includes('textOverflow')) {
            appliedFixes.push('Added text overflow protection');
            return `${styleStart}, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'${closing}`;
          }
          return match;
        }
      );
    }
    
    return {
      fixedJSX,
      appliedFixes,
      remainingIssues
    };
  }
  
  /**
   * Quick validation for common layout disasters
   */
  static quickValidateLayout(jsx: string): {
    isValid: boolean;
    issues: string[];
    severity: 'ok' | 'warning' | 'critical';
    canAutoFix: boolean;
  } {
    const disasters = this.detectLayoutDisasters(jsx);
    
    return {
      isValid: disasters.disasters.length === 0,
      issues: disasters.disasters,
      severity: disasters.severity === 'low' ? 'ok' : 
                disasters.severity === 'medium' ? 'warning' : 'critical',
      canAutoFix: disasters.autoFixable
    };
  }
}

/**
 * Export convenience functions
 */
export function validateLayoutQuickly(jsx: string) {
  return SimpleLayoutIntelligence.quickValidateLayout(jsx);
}

export function applyLayoutFixes(jsx: string) {
  return SimpleLayoutIntelligence.applySimpleLayoutFixes(jsx);
}

export function measureTextSafely(text: string, fontSize: number, fontFamily?: string) {
  return SimpleLayoutIntelligence.measureText(text, fontSize, fontFamily);
}

export function calculateSmartFontSize(text: string, targetSize?: number) {
  return SimpleLayoutIntelligence.calculateSmartFontSize(text, targetSize);
}