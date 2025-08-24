#!/usr/bin/env node

/**
 * Performance Benchmarking Suite for RoughCut MCP Server
 * Tests performance under various load conditions and usage patterns
 */

import { RoughCutMCPServer } from '../build/index.js';
import { performance } from 'perf_hooks';
import { writeFileSync, existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';

class PerformanceBenchmark {
  constructor() {
    this.testDir = './test-performance-output';
    this.server = null;
    this.results = {
      initialization: {},
      toolCalls: {},
      concurrency: {},
      memory: {},
      throughput: {},
      scalability: {}
    };
    this.baselineMetrics = {};
  }

  async setup() {
    console.log('🚀 Setting up performance benchmarking environment...');
    
    // Clean up previous test runs
    if (existsSync(this.testDir)) {
      rmSync(this.testDir, { recursive: true, force: true });
    }
    mkdirSync(this.testDir, { recursive: true });
    
    // Set test environment
    process.env.REMOTION_ASSETS_DIR = this.testDir;
    process.env.NODE_ENV = 'production'; // Use production mode for realistic performance
    
    console.log('✅ Performance environment ready');
  }

  measureMemory() {
    const used = process.memoryUsage();
    return {
      rss: Math.round(used.rss / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(used.external / 1024 / 1024 * 100) / 100
    };
  }

  async benchmarkInitialization() {
    console.log('\n⚡ Benchmarking Server Initialization...');
    
    const runs = 10;
    const times = [];
    const memoryUsages = [];
    
    for (let i = 0; i < runs; i++) {
      // Force garbage collection if available
      if (global.gc) global.gc();
      
      const memBefore = this.measureMemory();
      const start = performance.now();
      
      const server = new RoughCutMCPServer();
      await new Promise(resolve => setTimeout(resolve, 10)); // Allow initialization to complete
      
      const end = performance.now();
      const memAfter = this.measureMemory();
      
      times.push(end - start);
      memoryUsages.push({
        before: memBefore,
        after: memAfter,
        delta: memAfter.heapUsed - memBefore.heapUsed
      });
    }
    
    this.results.initialization = {
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      stdDev: this.calculateStdDev(times),
      averageMemoryDelta: memoryUsages.reduce((sum, usage) => sum + usage.delta, 0) / memoryUsages.length,
      runs
    };
    
    console.log(`   Average initialization time: ${this.results.initialization.averageTime.toFixed(2)}ms`);
    console.log(`   Memory delta: ${this.results.initialization.averageMemoryDelta.toFixed(2)}MB`);
    
    // Keep one server for further tests
    this.server = new RoughCutMCPServer();
  }

  async benchmarkToolCalls() {
    console.log('\n🔧 Benchmarking Tool Call Performance...');
    
    const tools = [
      { name: 'list-video-projects', args: {} },
      { name: 'discover-capabilities', args: {} },
      { name: 'get-active-tools', args: {} },
      { name: 'get-asset-statistics', args: {} },
      { name: 'get-studio-status', args: {} }
    ];
    
    const runsPerTool = 100;
    const toolResults = {};
    
    for (const tool of tools) {
      const times = [];
      const memoryDeltas = [];
      
      for (let i = 0; i < runsPerTool; i++) {
        const memBefore = this.measureMemory();
        const start = performance.now();
        
        try {
          await this.server.callTool(tool.name, tool.args);
        } catch (error) {
          // Some tools might fail in test environment - that's OK for performance testing
        }
        
        const end = performance.now();
        const memAfter = this.measureMemory();
        
        times.push(end - start);
        memoryDeltas.push(memAfter.heapUsed - memBefore.heapUsed);
      }
      
      toolResults[tool.name] = {
        averageTime: times.reduce((a, b) => a + b, 0) / times.length,
        minTime: Math.min(...times),
        maxTime: Math.max(...times),
        p95Time: this.calculatePercentile(times, 95),
        stdDev: this.calculateStdDev(times),
        averageMemoryDelta: memoryDeltas.reduce((a, b) => a + b, 0) / memoryDeltas.length,
        runs: runsPerTool
      };
      
      console.log(`   ${tool.name}: ${toolResults[tool.name].averageTime.toFixed(2)}ms avg, ${toolResults[tool.name].p95Time.toFixed(2)}ms p95`);
    }
    
    this.results.toolCalls = toolResults;
  }

  async benchmarkConcurrency() {
    console.log('\n🔄 Benchmarking Concurrent Operations...');
    
    const concurrencyLevels = [1, 5, 10, 20, 50];
    const concurrencyResults = {};
    
    for (const level of concurrencyLevels) {
      console.log(`   Testing concurrency level: ${level}`);
      
      const promises = [];
      const start = performance.now();
      
      for (let i = 0; i < level; i++) {
        promises.push(
          this.server.callTool('discover-capabilities', {}).catch(() => {})
        );
      }
      
      await Promise.all(promises);
      const end = performance.now();
      
      concurrencyResults[level] = {
        totalTime: end - start,
        averageTimePerOperation: (end - start) / level,
        operationsPerSecond: (level / (end - start)) * 1000
      };
      
      console.log(`     ${level} ops: ${concurrencyResults[level].totalTime.toFixed(2)}ms total, ${concurrencyResults[level].operationsPerSecond.toFixed(2)} ops/sec`);
    }
    
    this.results.concurrency = concurrencyResults;
  }

  async benchmarkThroughput() {
    console.log('\n📊 Benchmarking Throughput...');
    
    const duration = 10000; // 10 seconds
    const start = performance.now();
    let operations = 0;
    let errors = 0;
    
    const interval = setInterval(async () => {
      try {
        await this.server.callTool('get-active-tools', {});
        operations++;
      } catch (error) {
        errors++;
      }
    }, 10); // Try to run every 10ms
    
    await new Promise(resolve => setTimeout(resolve, duration));
    clearInterval(interval);
    
    const end = performance.now();
    const actualDuration = end - start;
    
    this.results.throughput = {
      duration: actualDuration,
      operations,
      errors,
      operationsPerSecond: (operations / actualDuration) * 1000,
      errorRate: errors / (operations + errors)
    };
    
    console.log(`   ${operations} operations in ${actualDuration.toFixed(0)}ms`);
    console.log(`   Throughput: ${this.results.throughput.operationsPerSecond.toFixed(2)} ops/sec`);
    console.log(`   Error rate: ${(this.results.throughput.errorRate * 100).toFixed(2)}%`);
  }

  async benchmarkMemoryUsage() {
    console.log('\n🧠 Benchmarking Memory Usage Patterns...');
    
    const memorySnapshots = [];
    const operations = 1000;
    
    // Take initial snapshot
    memorySnapshots.push({
      operation: 0,
      memory: this.measureMemory(),
      timestamp: Date.now()
    });
    
    // Run operations and track memory
    for (let i = 0; i < operations; i++) {
      try {
        await this.server.callTool('list-video-projects', {});
      } catch (error) {
        // Continue even if some operations fail
      }
      
      // Take snapshot every 100 operations
      if (i % 100 === 0 && i > 0) {
        memorySnapshots.push({
          operation: i,
          memory: this.measureMemory(),
          timestamp: Date.now()
        });
      }
    }
    
    // Final snapshot
    memorySnapshots.push({
      operation: operations,
      memory: this.measureMemory(),
      timestamp: Date.now()
    });
    
    // Force garbage collection and take final snapshot
    if (global.gc) {
      global.gc();
      await new Promise(resolve => setTimeout(resolve, 100));
      memorySnapshots.push({
        operation: operations + 1,
        memory: this.measureMemory(),
        timestamp: Date.now(),
        afterGC: true
      });
    }
    
    this.results.memory = {
      snapshots: memorySnapshots,
      initialMemory: memorySnapshots[0].memory.heapUsed,
      finalMemory: memorySnapshots[memorySnapshots.length - 1].memory.heapUsed,
      peakMemory: Math.max(...memorySnapshots.map(s => s.memory.heapUsed)),
      memoryGrowth: memorySnapshots[memorySnapshots.length - 1].memory.heapUsed - memorySnapshots[0].memory.heapUsed,
      operations
    };
    
    console.log(`   Memory growth: ${this.results.memory.memoryGrowth.toFixed(2)}MB over ${operations} operations`);
    console.log(`   Peak memory: ${this.results.memory.peakMemory.toFixed(2)}MB`);
  }

  calculateStdDev(values) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }

  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  generatePerformanceReport() {
    const timestamp = new Date().toISOString();
    
    console.log('\n📈 PERFORMANCE BENCHMARK REPORT');
    console.log('='.repeat(60));
    
    // System Information
    console.log('\n💻 System Information:');
    console.log(`  Node.js: ${process.version}`);
    console.log(`  Platform: ${process.platform} ${process.arch}`);
    console.log(`  Memory: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB RSS`);
    
    // Performance Standards (expected values)
    const standards = {
      initialization: { max: 500, target: 200 }, // ms
      toolCallAverage: { max: 100, target: 50 }, // ms
      throughput: { min: 50, target: 100 }, // ops/sec
      memoryGrowthPerOp: { max: 0.01, target: 0.005 } // MB per operation
    };
    
    // Initialization Performance
    console.log('\n⚡ Initialization Performance:');
    const initTime = this.results.initialization.averageTime;
    const initStatus = initTime <= standards.initialization.target ? '🟢' : 
                      initTime <= standards.initialization.max ? '🟡' : '🔴';
    console.log(`  ${initStatus} Average time: ${initTime.toFixed(2)}ms (target: <${standards.initialization.target}ms)`);
    console.log(`     Memory delta: ${this.results.initialization.averageMemoryDelta.toFixed(2)}MB`);
    console.log(`     Std deviation: ${this.results.initialization.stdDev.toFixed(2)}ms`);
    
    // Tool Call Performance
    console.log('\n🔧 Tool Call Performance:');
    let totalToolCallTime = 0;
    let toolCallCount = 0;
    
    Object.entries(this.results.toolCalls).forEach(([toolName, metrics]) => {
      const avgTime = metrics.averageTime;
      const status = avgTime <= standards.toolCallAverage.target ? '🟢' : 
                     avgTime <= standards.toolCallAverage.max ? '🟡' : '🔴';
      console.log(`  ${status} ${toolName}: ${avgTime.toFixed(2)}ms avg, ${metrics.p95Time.toFixed(2)}ms p95`);
      totalToolCallTime += avgTime;
      toolCallCount++;
    });
    
    const overallToolCallTime = totalToolCallTime / toolCallCount;
    console.log(`     Overall average: ${overallToolCallTime.toFixed(2)}ms`);
    
    // Concurrency Performance
    console.log('\n🔄 Concurrency Performance:');
    Object.entries(this.results.concurrency).forEach(([level, metrics]) => {
      const opsPerSec = metrics.operationsPerSecond;
      console.log(`     ${level} concurrent: ${opsPerSec.toFixed(2)} ops/sec`);
    });
    
    // Throughput Performance
    console.log('\n📊 Throughput Performance:');
    const throughput = this.results.throughput.operationsPerSecond;
    const throughputStatus = throughput >= standards.throughput.target ? '🟢' : 
                            throughput >= standards.throughput.min ? '🟡' : '🔴';
    console.log(`  ${throughputStatus} Sustained throughput: ${throughput.toFixed(2)} ops/sec (target: >${standards.throughput.target})`);
    console.log(`     Error rate: ${(this.results.throughput.errorRate * 100).toFixed(2)}%`);
    
    // Memory Performance
    console.log('\n🧠 Memory Performance:');
    const memoryGrowthPerOp = this.results.memory.memoryGrowth / this.results.memory.operations;
    const memoryStatus = memoryGrowthPerOp <= standards.memoryGrowthPerOp.target ? '🟢' : 
                        memoryGrowthPerOp <= standards.memoryGrowthPerOp.max ? '🟡' : '🔴';
    console.log(`  ${memoryStatus} Memory growth: ${this.results.memory.memoryGrowth.toFixed(2)}MB total`);
    console.log(`     Growth per operation: ${memoryGrowthPerOp.toFixed(4)}MB`);
    console.log(`     Peak memory: ${this.results.memory.peakMemory.toFixed(2)}MB`);
    
    // Overall Assessment
    const issues = [
      initTime > standards.initialization.max,
      overallToolCallTime > standards.toolCallAverage.max,
      throughput < standards.throughput.min,
      memoryGrowthPerOp > standards.memoryGrowthPerOp.max
    ].filter(Boolean).length;
    
    console.log('\n🎯 Overall Performance Assessment:');
    if (issues === 0) {
      console.log('  🟢 EXCELLENT - All performance targets met');
    } else if (issues <= 2) {
      console.log('  🟡 GOOD - Minor performance concerns');
    } else {
      console.log('  🔴 NEEDS ATTENTION - Multiple performance issues detected');
    }
    
    // Save detailed results
    const reportData = {
      timestamp,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage()
      },
      results: this.results,
      standards,
      assessment: {
        issues,
        overallRating: issues === 0 ? 'excellent' : issues <= 2 ? 'good' : 'needs-attention'
      }
    };
    
    const reportPath = join(this.testDir, `performance-report-${Date.now()}.json`);
    writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
    
    return issues === 0;
  }

  async run() {
    console.log('🏃‍♂️ Starting Performance Benchmark Suite');
    console.log('='.repeat(60));
    
    await this.setup();
    
    // Run all benchmarks
    await this.benchmarkInitialization();
    await this.benchmarkToolCalls();
    await this.benchmarkConcurrency();
    await this.benchmarkThroughput();
    await this.benchmarkMemoryUsage();
    
    // Generate comprehensive report
    const success = this.generatePerformanceReport();
    
    console.log('\n🏁 Performance benchmarking complete');
    
    return success;
  }
}

// Run performance benchmarks
const benchmark = new PerformanceBenchmark();

// Enable garbage collection for memory testing if available
if (process.argv.includes('--expose-gc')) {
  console.log('🗑️ Garbage collection enabled for memory testing');
}

benchmark.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Performance benchmark failed:', error);
  process.exit(1);
});