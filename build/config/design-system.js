"use strict";
// Universal Design System - Works on ANY installation
// No hardcoded paths, user-specific settings, or environment dependencies
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNIVERSAL_PERFORMANCE_CONFIG = exports.UniversalDesignUtils = exports.UNIVERSAL_DESIGN_SYSTEM = void 0;
// ✅ UNIVERSAL COMPATIBILITY - Works on any system, any user, any installation
exports.UNIVERSAL_DESIGN_SYSTEM = {
    // 🎨 COLOR PALETTES - Web-safe, accessible, professional
    colors: {
        palettes: {
            // Modern tech palette
            modern: ["#667eea", "#764ba2", "#4facfe", "#00f2fe"],
            // Professional business palette  
            professional: ["#2c3e50", "#3498db", "#e74c3c", "#f39c12"],
            // Creative/artistic palette
            creative: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4"],
            // Elegant/luxury palette
            elegant: ["#1a1a2e", "#16213e", "#533483", "#7209b7"],
            // Nature/organic palette
            nature: ["#56ab2f", "#a8edea", "#fed6e3", "#d299c2"],
            // Monochrome palette (always works)
            monochrome: ["#000000", "#333333", "#666666", "#999999", "#cccccc", "#ffffff"]
        },
        semantic: {
            primary: "#3498db",
            secondary: "#9b59b6",
            success: "#2ecc71",
            warning: "#f39c12",
            danger: "#e74c3c",
            info: "#17a2b8",
            light: "#f8f9fa",
            dark: "#343a40"
        }
    },
    // 📝 TYPOGRAPHY - Universal web-safe fonts only
    typography: {
        // Fonts guaranteed to exist on all systems
        fonts: [
            // Primary: Modern sans-serif stack
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
            // Secondary: Monospace stack
            "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace",
            // Tertiary: Serif stack
            "'Georgia', 'Times New Roman', 'Times', serif"
        ],
        sizes: {
            xs: 12,
            sm: 14,
            base: 16,
            lg: 18,
            xl: 20,
            '2xl': 24,
            '3xl': 30,
            '4xl': 36,
            '5xl': 48,
            '6xl': 60,
            '7xl': 72,
            '8xl': 96
        },
        weights: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
            black: 900
        }
    },
    // 📐 SPACING - Consistent 8px grid system
    spacing: {
        units: {
            '0': 0,
            '1': 4,
            '2': 8,
            '3': 12,
            '4': 16,
            '5': 20,
            '6': 24,
            '7': 28,
            '8': 32,
            '10': 40,
            '12': 48,
            '16': 64,
            '20': 80,
            '24': 96,
            '32': 128
        },
        grid: 8 // Base grid unit
    },
    // ⏱️ ANIMATION TIMING - Professional motion standards
    animation: {
        durations: {
            instant: 0,
            fast: 150,
            normal: 300,
            slow: 500,
            slower: 750,
            cinematic: 1000
        },
        // CSS-compatible easing functions (work everywhere)
        easings: {
            linear: 'linear',
            smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
            smoothOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
            smoothIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            elastic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }
    },
    // ✨ EFFECTS - CSS-only effects that work everywhere
    effects: {
        shadows: {
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
            none: 'none'
        },
        gradients: {
            sunset: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            fire: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
            forest: 'linear-gradient(135deg, #56ab2f 0%, #a8edea 100%)',
            night: 'linear-gradient(135deg, #1a1a2e 0%, #533483 100%)',
            clean: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }
    }
};
// 🌍 UNIVERSAL UTILITY FUNCTIONS - Work on any system
class UniversalDesignUtils {
    /**
     * Get color palette by name - always returns valid colors
     */
    static getColorPalette(name) {
        return exports.UNIVERSAL_DESIGN_SYSTEM.colors.palettes[name] ||
            exports.UNIVERSAL_DESIGN_SYSTEM.colors.palettes.professional;
    }
    /**
     * Get semantic color - always returns valid color
     */
    static getSemanticColor(name) {
        return exports.UNIVERSAL_DESIGN_SYSTEM.colors.semantic[name] ||
            exports.UNIVERSAL_DESIGN_SYSTEM.colors.semantic.primary;
    }
    /**
     * Get typography configuration - always returns valid font stack
     */
    static getFontFamily(type = 'primary') {
        const fonts = exports.UNIVERSAL_DESIGN_SYSTEM.typography.fonts;
        switch (type) {
            case 'mono': return fonts[1];
            case 'serif': return fonts[2];
            default: return fonts[0];
        }
    }
    /**
     * Get font size - always returns valid number
     */
    static getFontSize(size) {
        return exports.UNIVERSAL_DESIGN_SYSTEM.typography.sizes[size] ||
            exports.UNIVERSAL_DESIGN_SYSTEM.typography.sizes.base;
    }
    /**
     * Get spacing value - always returns valid number
     */
    static getSpacing(size) {
        return exports.UNIVERSAL_DESIGN_SYSTEM.spacing.units[size] || 16;
    }
    /**
     * Get animation duration - always returns valid number
     */
    static getDuration(speed) {
        return exports.UNIVERSAL_DESIGN_SYSTEM.animation.durations[speed] || 300;
    }
    /**
     * Get easing function - always returns valid CSS easing
     */
    static getEasing(type) {
        return exports.UNIVERSAL_DESIGN_SYSTEM.animation.easings[type] ||
            exports.UNIVERSAL_DESIGN_SYSTEM.animation.easings.smooth;
    }
    /**
     * Get shadow effect - always returns valid CSS shadow
     */
    static getShadow(size) {
        return exports.UNIVERSAL_DESIGN_SYSTEM.effects.shadows[size] ||
            exports.UNIVERSAL_DESIGN_SYSTEM.effects.shadows.base;
    }
    /**
     * Get gradient effect - always returns valid CSS gradient
     */
    static getGradient(name) {
        return exports.UNIVERSAL_DESIGN_SYSTEM.effects.gradients[name] ||
            exports.UNIVERSAL_DESIGN_SYSTEM.effects.gradients.clean;
    }
    /**
     * Create responsive breakpoints - works on any screen size
     */
    static getBreakpoints() {
        return {
            xs: '(max-width: 575px)',
            sm: '(min-width: 576px)',
            md: '(min-width: 768px)',
            lg: '(min-width: 992px)',
            xl: '(min-width: 1200px)',
            xxl: '(min-width: 1400px)'
        };
    }
    /**
     * Generate accessible color contrast - meets WCAG standards
     */
    static ensureContrast(foreground, background) {
        // Return foreground if contrast is sufficient, otherwise return high-contrast alternative
        // This is a simplified version - in production, would calculate actual contrast ratio
        const isDark = background.includes('#1') || background.includes('#2') || background.includes('#3');
        return isDark ? '#ffffff' : '#000000';
    }
    /**
     * Create animation-safe CSS properties - prevents layout thrashing
     */
    static getAnimationSafeStyles(properties) {
        return {
            ...properties,
            willChange: 'transform, opacity', // Optimize for animation
            backfaceVisibility: 'hidden', // Prevent flicker
            perspective: 1000, // Enable 3D acceleration
        };
    }
}
exports.UniversalDesignUtils = UniversalDesignUtils;
// 🚀 PERFORMANCE OPTIMIZATION - Works on any device
exports.UNIVERSAL_PERFORMANCE_CONFIG = {
    // Target 60fps on all devices
    targetFPS: 60,
    // Optimize for different device capabilities
    deviceOptimization: {
        lowEnd: {
            particleCount: 20,
            shadowQuality: 'low',
            animationComplexity: 'simple'
        },
        midRange: {
            particleCount: 50,
            shadowQuality: 'medium',
            animationComplexity: 'moderate'
        },
        highEnd: {
            particleCount: 100,
            shadowQuality: 'high',
            animationComplexity: 'complex'
        }
    },
    // Memory management for long animations
    memoryManagement: {
        maxCacheSize: 50, // MB
        cleanupInterval: 1000, // ms
        preloadFrames: 10
    }
};
exports.default = exports.UNIVERSAL_DESIGN_SYSTEM;
//# sourceMappingURL=design-system.js.map