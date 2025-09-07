// Comprehensive Tailwind-to-Remotion CSS Conversion System (Fixed)
// Handles typography, layout, animations, effects, spacing for professional video quality

export class TailwindConverter {
  private name = 'TailwindConverter';

  convertClassesToInlineStyles(classes: string): Record<string, string> {
    console.error(`[${this.name}] Converting comprehensive Tailwind classes: ${classes}`);
    
    const styles: Record<string, string> = {};
    const classArray = classes.split(/\s+/).filter(Boolean);
    let conversionsApplied = 0;
    
    for (const cls of classArray) {
      // Typography conversion
      const typography = this.convertTypography(cls);
      if (typography) {
        Object.assign(styles, typography);
        conversionsApplied++;
      }
      
      // Layout conversion
      const layout = this.convertLayout(cls);
      if (layout) {
        Object.assign(styles, layout);
        conversionsApplied++;
      }
      
      // Spacing conversion
      const spacing = this.convertSpacing(cls);
      if (spacing) {
        Object.assign(styles, spacing);
        conversionsApplied++;
      }
      
      // Effects conversion
      const effects = this.convertEffects(cls);
      if (effects) {
        Object.assign(styles, effects);
        conversionsApplied++;
      }
      
      // Color conversion
      const colors = this.convertColors(cls);
      if (colors) {
        Object.assign(styles, colors);
        conversionsApplied++;
      }
      
      // Animation detection (for frame-based system)
      const animation = this.detectAnimation(cls);
      if (animation) {
        styles['data-animation'] = animation;
        conversionsApplied++;
      }
    }
    
    console.error(`[${this.name}] Applied ${conversionsApplied} conversions from ${classArray.length} classes`);
    
    // Apply video-specific optimizations
    const optimizedStyles = this.enhanceForVideo(styles);
    console.error(`[${this.name}] Applied video optimizations to ${Object.keys(optimizedStyles).length} properties`);
    
    return optimizedStyles;
  }

  private enhanceForVideo(styles: Record<string, string>): Record<string, string> {
    const enhanced: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(styles)) {
      switch (key) {
        case 'fontSize':
          // Enhance font sizes for video visibility (10% larger)
          const sizeMatch = value.match(/(\d+)px/);
          if (sizeMatch) {
            const originalSize = parseInt(sizeMatch[1]);
            const enhancedSize = Math.round(originalSize * 1.1);
            enhanced[key] = `${enhancedSize}px`;
          } else {
            enhanced[key] = value;
          }
          break;
          
        case 'fontWeight':
          // Enhance font weights for better video contrast
          const weightMap: Record<string, string> = {
            '100': '200', '200': '300', '300': '400', '400': '500',
            '500': '600', '600': '700', '700': '800', '800': '900', '900': '900'
          };
          enhanced[key] = weightMap[value] || value;
          break;
          
        case 'color':
          // Enhance text contrast for video visibility
          enhanced[key] = this.enhanceTextContrast(value);
          break;
          
        case 'boxShadow':
          // Enhance shadows for video visibility
          enhanced[key] = this.enhanceShadowForVideo(value);
          break;
          
        case 'backgroundColor':
          // Enhance background opacity for video cards
          if (value.includes('rgba')) {
            enhanced[key] = this.enhanceBackgroundOpacity(value);
          } else {
            enhanced[key] = value;
          }
          break;
          
        default:
          enhanced[key] = value;
      }
    }
    
    return enhanced;
  }

  private enhanceTextContrast(color: string): string {
    // Enhance text colors for better video visibility
    const contrastMap: Record<string, string> = {
      '#d1d5db': '#e5e7eb', // gray-300 → gray-200 (lighter)
      '#9ca3af': '#d1d5db', // gray-400 → gray-300 (lighter)
      '#6b7280': '#9ca3af'  // gray-500 → gray-400 (lighter)
    };
    return contrastMap[color] || color;
  }

  private enhanceShadowForVideo(shadow: string): string {
    // Increase shadow opacity and blur for video visibility
    return shadow.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/g, 
      (match, r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${Math.min(parseFloat(a) * 1.5, 1)})`
    );
  }

  private enhanceBackgroundOpacity(bgColor: string): string {
    // Enhance card background opacity for video visibility
    return bgColor.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/g,
      (match, r, g, b, a) => {
        const enhancedOpacity = Math.min(parseFloat(a) * 1.2, 0.3); // Cap at 0.3 for readability
        return `rgba(${r}, ${g}, ${b}, ${enhancedOpacity})`;
      }
    );
  }

  private convertTypography(cls: string): Record<string, string> | null {
    const typographyMap: Record<string, Record<string, string>> = {
      // Font sizes (optimized for video visibility)
      'text-xs': { fontSize: '12px', lineHeight: '16px' },
      'text-sm': { fontSize: '14px', lineHeight: '20px' },
      'text-base': { fontSize: '18px', lineHeight: '28px' }, // Enhanced for video
      'text-lg': { fontSize: '20px', lineHeight: '32px' },
      'text-xl': { fontSize: '24px', lineHeight: '36px' },
      'text-2xl': { fontSize: '28px', lineHeight: '40px' },
      'text-3xl': { fontSize: '36px', lineHeight: '44px' },
      'text-4xl': { fontSize: '44px', lineHeight: '52px' },
      'text-5xl': { fontSize: '56px', lineHeight: '64px' },
      'text-6xl': { fontSize: '68px', lineHeight: '76px' }, // Enhanced for video headers
      'text-7xl': { fontSize: '84px', lineHeight: '92px' },
      
      // Font weights (enhanced contrast for video)
      'font-thin': { fontWeight: '200' }, // Minimum for video visibility
      'font-extralight': { fontWeight: '300' },
      'font-light': { fontWeight: '400' }, // Enhanced from 300
      'font-normal': { fontWeight: '500' }, // Enhanced from 400
      'font-medium': { fontWeight: '600' },
      'font-semibold': { fontWeight: '700' },
      'font-bold': { fontWeight: '800' }, // Enhanced from 700
      'font-extrabold': { fontWeight: '900' },
      'font-black': { fontWeight: '900' },
      
      // Text alignment
      'text-left': { textAlign: 'left' },
      'text-center': { textAlign: 'center' },
      'text-right': { textAlign: 'right' },
      
      // Letter spacing (enhanced for video readability)
      'tracking-wide': { letterSpacing: '0.05em' },
      'tracking-wider': { letterSpacing: '0.1em' },
      'tracking-widest': { letterSpacing: '0.15em' }
    };

    return typographyMap[cls] || null;
  }

  private convertLayout(cls: string): Record<string, string> | null {
    // Layout system conversion (Grid, Flexbox, positioning)
    if (cls === 'grid') {
      return { display: 'grid' };
    }
    
    // Grid columns
    if (cls.startsWith('grid-cols-')) {
      const cols = parseInt(cls.split('-')[2]);
      return { 
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
      };
    }
    
    // Flexbox system
    const flexMap: Record<string, Record<string, string>> = {
      'flex': { display: 'flex' },
      'flex-col': { flexDirection: 'column' },
      'flex-row': { flexDirection: 'row' },
      'justify-start': { justifyContent: 'flex-start' },
      'justify-end': { justifyContent: 'flex-end' },
      'justify-center': { justifyContent: 'center' },
      'justify-between': { justifyContent: 'space-between' },
      'items-start': { alignItems: 'flex-start' },
      'items-end': { alignItems: 'flex-end' },
      'items-center': { alignItems: 'center' },
      'items-stretch': { alignItems: 'stretch' },
      
      // Positioning
      'relative': { position: 'relative' },
      'absolute': { position: 'absolute' },
      'fixed': { position: 'fixed' },
      
      // Size utilities
      'w-full': { width: '100%' },
      'h-full': { height: '100%' },
      'w-screen': { width: '100vw' },
      'h-screen': { height: '100vh' },
      'min-h-screen': { minHeight: '100vh' }
    };

    return flexMap[cls] || null;
  }

  private convertSpacing(cls: string): Record<string, string> | null {
    const spacingScale: Record<string, string> = {
      '0': '0px', '1': '4px', '2': '8px', '3': '12px', '4': '16px', '5': '20px',
      '6': '24px', '7': '28px', '8': '32px', '10': '40px', '12': '48px',
      '16': '64px', '20': '80px', '24': '96px', '32': '128px'
    };

    // Padding patterns
    if (cls.startsWith('p-')) {
      const value = cls.split('-')[1];
      const spacing = spacingScale[value];
      if (spacing) return { padding: spacing };
    }
    
    if (cls.startsWith('px-')) {
      const value = cls.split('-')[1];
      const spacing = spacingScale[value];
      if (spacing) return { paddingLeft: spacing, paddingRight: spacing };
    }
    
    if (cls.startsWith('py-')) {
      const value = cls.split('-')[1];  
      const spacing = spacingScale[value];
      if (spacing) return { paddingTop: spacing, paddingBottom: spacing };
    }
    
    // Margin patterns
    if (cls.startsWith('mb-')) {
      const value = cls.split('-')[1];
      const spacing = spacingScale[value];
      if (spacing) return { marginBottom: spacing };
    }
    
    if (cls.startsWith('mt-')) {
      const value = cls.split('-')[1];
      const spacing = spacingScale[value];
      if (spacing) return { marginTop: spacing };
    }
    
    // Gap patterns
    if (cls.startsWith('gap-')) {
      const value = cls.split('-')[1];
      const spacing = spacingScale[value];
      if (spacing) return { gap: spacing };
    }
    
    if (cls.startsWith('space-x-')) {
      const value = cls.split('-')[2];
      const spacing = spacingScale[value];
      if (spacing) return { gap: spacing }; // Approximate space-x
    }

    return null;
  }

  private convertEffects(cls: string): Record<string, string> | null {
    const effectsMap: Record<string, Record<string, string>> = {
      // Professional background effects
      'bg-white/10': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
      'bg-white/20': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
      'bg-black/20': { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
      'bg-black/30': { backgroundColor: 'rgba(0, 0, 0, 0.3)' },
      
      // Glass morphism simulation for video
      'backdrop-blur-sm': { 
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      },
      'backdrop-blur-lg': { 
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      },
      
      // Professional rounded corners
      'rounded': { borderRadius: '4px' },
      'rounded-lg': { borderRadius: '8px' },
      'rounded-xl': { borderRadius: '12px' },
      'rounded-2xl': { borderRadius: '16px' },
      'rounded-full': { borderRadius: '50%' },
      
      // Enhanced shadows for video visibility
      'shadow': { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)' }, // Enhanced opacity
      'shadow-lg': { boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)' },
      'shadow-xl': { boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)' },
      'shadow-2xl': { boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)' },
      
      // Borders for professional cards
      'border': { border: '1px solid rgba(255, 255, 255, 0.1)' },
      'border-white/20': { border: '1px solid rgba(255, 255, 255, 0.2)' },
      'border-purple-500/30': { border: '1px solid rgba(168, 85, 247, 0.3)' }
    };

    return effectsMap[cls] || null;
  }

  private convertColors(cls: string): Record<string, string> | null {
    const colorMap: Record<string, Record<string, string>> = {
      // Enhanced text colors for video contrast
      'text-white': { color: '#ffffff' },
      'text-gray-200': { color: '#e5e7eb' },
      'text-gray-300': { color: '#d1d5db' },
      'text-blue-300': { color: '#93c5fd' },
      'text-blue-400': { color: '#60a5fa' },
      'text-purple-300': { color: '#d8b4fe' },
      'text-green-400': { color: '#4ade80' },
      'text-yellow-400': { color: '#facc15' },
      'text-orange-400': { color: '#fb923c' },
      'text-cyan-400': { color: '#22d3ee' }
    };

    return colorMap[cls] || null;
  }

  private detectAnimation(cls: string): string | null {
    const animationMap: Record<string, string> = {
      'animate-fade-in': 'fadeIn',
      'animate-fadeIn': 'fadeIn',
      'animate-slide-up': 'slideUp',
      'animate-slideUp': 'slideUp',
      'animate-bounce': 'bounce',
      'animate-pulse': 'pulse',
      'transition-all': 'transition',
      'duration-1000': 'slow',
      'delay-200': 'delay2',
      'delay-400': 'delay4'
    };

    return animationMap[cls] || null;
  }
}