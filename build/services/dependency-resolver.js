"use strict";
/**
 * Dependency Resolver for Tool and Layer Dependencies
 *
 * Handles automatic resolution of tool and layer dependencies,
 * including circular dependency detection and transitive resolution.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyResolver = void 0;
const logger_js_1 = require("../utils/logger.js");
/**
 * Dependency Resolver for managing complex dependency graphs
 */
class DependencyResolver {
    nodes;
    logger;
    constructor() {
        this.nodes = new Map();
        this.logger = (0, logger_js_1.getLogger)().service('DependencyResolver');
    }
    /**
     * Register a node with its dependencies
     */
    registerNode(id, dependencies = [], metadata) {
        let node = this.nodes.get(id);
        if (!node) {
            node = {
                id,
                dependencies: new Set(dependencies),
                dependents: new Set(),
                metadata,
            };
            this.nodes.set(id, node);
        }
        else {
            // Update existing node
            dependencies.forEach(dep => node.dependencies.add(dep));
            if (metadata) {
                node.metadata = { ...node.metadata, ...metadata };
            }
        }
        // Update dependents for each dependency
        for (const depId of dependencies) {
            let depNode = this.nodes.get(depId);
            if (!depNode) {
                depNode = {
                    id: depId,
                    dependencies: new Set(),
                    dependents: new Set(),
                };
                this.nodes.set(depId, depNode);
            }
            depNode.dependents.add(id);
        }
        this.logger.debug('Node registered', {
            id,
            dependencies,
            dependents: Array.from(node.dependents),
        });
    }
    /**
     * Remove a node from the graph
     */
    removeNode(id) {
        const node = this.nodes.get(id);
        if (!node)
            return;
        // Remove from dependents' dependency lists
        for (const depId of node.dependencies) {
            const depNode = this.nodes.get(depId);
            if (depNode) {
                depNode.dependents.delete(id);
            }
        }
        // Remove from dependencies' dependent lists
        for (const dependentId of node.dependents) {
            const dependentNode = this.nodes.get(dependentId);
            if (dependentNode) {
                dependentNode.dependencies.delete(id);
            }
        }
        this.nodes.delete(id);
        this.logger.debug('Node removed', { id });
    }
    /**
     * Resolve dependencies for a set of nodes
     */
    resolve(nodeIds, availableNodes) {
        const result = {
            order: [],
            success: false,
            circularDependencies: [],
            missingDependencies: new Map(),
            allDependencies: new Map(),
            warnings: [],
            errors: [],
        };
        try {
            // Check if all requested nodes exist
            const missingNodes = nodeIds.filter(id => !this.nodes.has(id));
            if (missingNodes.length > 0) {
                result.errors.push(`Nodes not found: ${missingNodes.join(', ')}`);
                return result;
            }
            // Build complete dependency map
            for (const nodeId of nodeIds) {
                const allDeps = this.getTransitiveDependencies(nodeId);
                result.allDependencies.set(nodeId, allDeps);
            }
            // Check for missing dependencies
            if (availableNodes) {
                for (const [nodeId, deps] of result.allDependencies) {
                    const missing = Array.from(deps).filter(dep => !availableNodes.has(dep) && !nodeIds.includes(dep));
                    if (missing.length > 0) {
                        result.missingDependencies.set(nodeId, missing);
                    }
                }
            }
            if (result.missingDependencies.size > 0) {
                result.warnings.push('Some dependencies are not available');
            }
            // Detect circular dependencies
            const circulars = this.detectCircularDependencies(nodeIds);
            if (circulars.length > 0) {
                result.circularDependencies = circulars;
                result.errors.push(`Circular dependencies detected: ${circulars
                    .map(([a, b]) => `${a} <-> ${b}`)
                    .join(', ')}`);
                return result;
            }
            // Perform topological sort
            const sorted = this.topologicalSort(nodeIds);
            if (!sorted) {
                result.errors.push('Failed to sort dependencies');
                return result;
            }
            result.order = sorted;
            result.success = true;
            this.logger.info('Dependencies resolved', {
                requested: nodeIds,
                order: result.order,
                totalDependencies: result.order.length - nodeIds.length,
            });
        }
        catch (error) {
            result.errors.push(`Resolution failed: ${error instanceof Error ? error.message : String(error)}`);
            this.logger.error('Dependency resolution failed', { error, nodeIds });
        }
        return result;
    }
    /**
     * Get all transitive dependencies for a node
     */
    getTransitiveDependencies(nodeId) {
        const dependencies = new Set();
        const visited = new Set();
        const traverse = (id) => {
            if (visited.has(id))
                return;
            visited.add(id);
            const node = this.nodes.get(id);
            if (!node)
                return;
            for (const depId of node.dependencies) {
                dependencies.add(depId);
                traverse(depId);
            }
        };
        traverse(nodeId);
        return dependencies;
    }
    /**
     * Get all nodes that depend on a given node
     */
    getTransitiveDependents(nodeId) {
        const dependents = new Set();
        const visited = new Set();
        const traverse = (id) => {
            if (visited.has(id))
                return;
            visited.add(id);
            const node = this.nodes.get(id);
            if (!node)
                return;
            for (const dependentId of node.dependents) {
                dependents.add(dependentId);
                traverse(dependentId);
            }
        };
        traverse(nodeId);
        return dependents;
    }
    /**
     * Detect circular dependencies
     */
    detectCircularDependencies(nodeIds) {
        const circulars = [];
        const visited = new Set();
        const recursionStack = new Set();
        const detectCycle = (nodeId, path = []) => {
            visited.add(nodeId);
            recursionStack.add(nodeId);
            path.push(nodeId);
            const node = this.nodes.get(nodeId);
            if (node) {
                for (const depId of node.dependencies) {
                    if (!visited.has(depId)) {
                        if (detectCycle(depId, [...path])) {
                            return true;
                        }
                    }
                    else if (recursionStack.has(depId)) {
                        // Found a cycle
                        const cycleStart = path.indexOf(depId);
                        if (cycleStart >= 0) {
                            for (let i = cycleStart; i < path.length; i++) {
                                const a = path[i];
                                const b = path[i + 1] || depId;
                                if (!circulars.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
                                    circulars.push([a, b]);
                                }
                            }
                        }
                        return true;
                    }
                }
            }
            recursionStack.delete(nodeId);
            return false;
        };
        // Check all nodes and their dependencies
        const allNodes = new Set(nodeIds);
        for (const nodeId of nodeIds) {
            const deps = this.getTransitiveDependencies(nodeId);
            deps.forEach(dep => allNodes.add(dep));
        }
        for (const nodeId of allNodes) {
            if (!visited.has(nodeId)) {
                detectCycle(nodeId);
            }
        }
        return circulars;
    }
    /**
     * Perform topological sort on nodes
     */
    topologicalSort(nodeIds) {
        // Build subgraph with all required nodes
        const requiredNodes = new Set(nodeIds);
        for (const nodeId of nodeIds) {
            const deps = this.getTransitiveDependencies(nodeId);
            deps.forEach(dep => requiredNodes.add(dep));
        }
        // Calculate in-degree for each node
        const inDegree = new Map();
        const adjList = new Map();
        for (const nodeId of requiredNodes) {
            inDegree.set(nodeId, 0);
            adjList.set(nodeId, new Set());
        }
        for (const nodeId of requiredNodes) {
            const node = this.nodes.get(nodeId);
            if (node) {
                for (const depId of node.dependencies) {
                    if (requiredNodes.has(depId)) {
                        adjList.get(depId).add(nodeId);
                        inDegree.set(nodeId, inDegree.get(nodeId) + 1);
                    }
                }
            }
        }
        // Find nodes with no dependencies
        const queue = [];
        for (const [nodeId, degree] of inDegree) {
            if (degree === 0) {
                queue.push(nodeId);
            }
        }
        const sorted = [];
        while (queue.length > 0) {
            const nodeId = queue.shift();
            sorted.push(nodeId);
            // Reduce in-degree for dependent nodes
            const dependents = adjList.get(nodeId) || new Set();
            for (const dependentId of dependents) {
                const newDegree = inDegree.get(dependentId) - 1;
                inDegree.set(dependentId, newDegree);
                if (newDegree === 0) {
                    queue.push(dependentId);
                }
            }
        }
        // Check if all nodes were processed (no cycles)
        if (sorted.length !== requiredNodes.size) {
            this.logger.error('Topological sort failed - cycle detected', {
                sorted: sorted.length,
                required: requiredNodes.size,
            });
            return null;
        }
        return sorted;
    }
    /**
     * Check if adding a dependency would create a cycle
     */
    wouldCreateCycle(fromId, toId) {
        // Check if toId depends on fromId (directly or transitively)
        const toDependencies = this.getTransitiveDependencies(toId);
        return toDependencies.has(fromId);
    }
    /**
     * Get dependency statistics
     */
    getStatistics() {
        let totalEdges = 0;
        let maxDeps = { id: '', count: 0 };
        let maxDependents = { id: '', count: 0 };
        const isolated = [];
        for (const [id, node] of this.nodes) {
            const depCount = node.dependencies.size;
            const dependentCount = node.dependents.size;
            totalEdges += depCount;
            if (depCount > maxDeps.count) {
                maxDeps = { id, count: depCount };
            }
            if (dependentCount > maxDependents.count) {
                maxDependents = { id, count: dependentCount };
            }
            if (depCount === 0 && dependentCount === 0) {
                isolated.push(id);
            }
        }
        return {
            totalNodes: this.nodes.size,
            totalEdges,
            averageDependencies: this.nodes.size > 0 ? totalEdges / this.nodes.size : 0,
            maxDependencies: maxDeps,
            maxDependents,
            isolatedNodes: isolated,
        };
    }
    /**
     * Visualize the dependency graph (returns DOT format)
     */
    toDOT() {
        const lines = ['digraph Dependencies {'];
        lines.push('  rankdir=LR;');
        lines.push('  node [shape=box];');
        for (const [id, node] of this.nodes) {
            for (const depId of node.dependencies) {
                lines.push(`  "${depId}" -> "${id}";`);
            }
        }
        lines.push('}');
        return lines.join('\n');
    }
    /**
     * Clear all nodes
     */
    clear() {
        this.nodes.clear();
        this.logger.info('Dependency graph cleared');
    }
}
exports.DependencyResolver = DependencyResolver;
//# sourceMappingURL=dependency-resolver.js.map