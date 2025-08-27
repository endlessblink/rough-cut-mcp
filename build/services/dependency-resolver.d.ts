/**
 * Dependency Resolver for Tool and Layer Dependencies
 *
 * Handles automatic resolution of tool and layer dependencies,
 * including circular dependency detection and transitive resolution.
 */
/**
 * Dependency resolution result
 */
export interface DependencyResolutionResult {
    /** Ordered list of items to activate (dependencies first) */
    order: string[];
    /** Whether resolution succeeded */
    success: boolean;
    /** Circular dependencies detected */
    circularDependencies: Array<[string, string]>;
    /** Missing dependencies */
    missingDependencies: Map<string, string[]>;
    /** All dependencies (including transitive) */
    allDependencies: Map<string, Set<string>>;
    /** Warning messages */
    warnings: string[];
    /** Error messages */
    errors: string[];
}
/**
 * Dependency Resolver for managing complex dependency graphs
 */
export declare class DependencyResolver {
    private nodes;
    private logger;
    constructor();
    /**
     * Register a node with its dependencies
     */
    registerNode(id: string, dependencies?: string[], metadata?: any): void;
    /**
     * Remove a node from the graph
     */
    removeNode(id: string): void;
    /**
     * Resolve dependencies for a set of nodes
     */
    resolve(nodeIds: string[], availableNodes?: Set<string>): DependencyResolutionResult;
    /**
     * Get all transitive dependencies for a node
     */
    getTransitiveDependencies(nodeId: string): Set<string>;
    /**
     * Get all nodes that depend on a given node
     */
    getTransitiveDependents(nodeId: string): Set<string>;
    /**
     * Detect circular dependencies
     */
    private detectCircularDependencies;
    /**
     * Perform topological sort on nodes
     */
    private topologicalSort;
    /**
     * Check if adding a dependency would create a cycle
     */
    wouldCreateCycle(fromId: string, toId: string): boolean;
    /**
     * Get dependency statistics
     */
    getStatistics(): {
        totalNodes: number;
        totalEdges: number;
        averageDependencies: number;
        maxDependencies: {
            id: string;
            count: number;
        };
        maxDependents: {
            id: string;
            count: number;
        };
        isolatedNodes: string[];
    };
    /**
     * Visualize the dependency graph (returns DOT format)
     */
    toDOT(): string;
    /**
     * Clear all nodes
     */
    clear(): void;
}
//# sourceMappingURL=dependency-resolver.d.ts.map