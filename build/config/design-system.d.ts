export interface UniversalDesignSystem {
    colors: {
        palettes: Record<string, string[]>;
        semantic: Record<string, string>;
    };
    typography: {
        fonts: string[];
        sizes: Record<string, number>;
        weights: Record<string, number>;
    };
    spacing: {
        units: Record<string, number>;
        grid: number;
    };
    animation: {
        durations: Record<string, number>;
        easings: Record<string, string>;
    };
    effects: {
        shadows: Record<string, string>;
        gradients: Record<string, string>;
    };
}
export declare const UNIVERSAL_DESIGN_SYSTEM: UniversalDesignSystem;
export declare class UniversalDesignUtils {
    /**
     * Get color palette by name - always returns valid colors
     */
    static getColorPalette(name: string): string[];
    /**
     * Get semantic color - always returns valid color
     */
    static getSemanticColor(name: string): string;
    /**
     * Get typography configuration - always returns valid font stack
     */
    static getFontFamily(type?: 'primary' | 'mono' | 'serif'): string;
    /**
     * Get font size - always returns valid number
     */
    static getFontSize(size: string): number;
    /**
     * Get spacing value - always returns valid number
     */
    static getSpacing(size: string): number;
    /**
     * Get animation duration - always returns valid number
     */
    static getDuration(speed: string): number;
    /**
     * Get easing function - always returns valid CSS easing
     */
    static getEasing(type: string): string;
    /**
     * Get shadow effect - always returns valid CSS shadow
     */
    static getShadow(size: string): string;
    /**
     * Get gradient effect - always returns valid CSS gradient
     */
    static getGradient(name: string): string;
    /**
     * Create responsive breakpoints - works on any screen size
     */
    static getBreakpoints(): {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        xxl: string;
    };
    /**
     * Generate accessible color contrast - meets WCAG standards
     */
    static ensureContrast(foreground: string, background: string): string;
    /**
     * Create animation-safe CSS properties - prevents layout thrashing
     */
    static getAnimationSafeStyles(properties: Record<string, any>): {
        willChange: string;
        backfaceVisibility: string;
        perspective: number;
    };
}
export declare const UNIVERSAL_PERFORMANCE_CONFIG: {
    targetFPS: number;
    deviceOptimization: {
        lowEnd: {
            particleCount: number;
            shadowQuality: string;
            animationComplexity: string;
        };
        midRange: {
            particleCount: number;
            shadowQuality: string;
            animationComplexity: string;
        };
        highEnd: {
            particleCount: number;
            shadowQuality: string;
            animationComplexity: string;
        };
    };
    memoryManagement: {
        maxCacheSize: number;
        cleanupInterval: number;
        preloadFrames: number;
    };
};
export default UNIVERSAL_DESIGN_SYSTEM;
//# sourceMappingURL=design-system.d.ts.map