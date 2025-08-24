# 🧪 Testing Guide - RoughCut MCP Server

## Overview

This document describes the comprehensive testing framework for the RoughCut MCP Server. The testing suite includes unit tests, integration tests, end-to-end tests, performance benchmarks, and coverage reporting.

## Testing Architecture

### Test Categories

1. **Protocol Tests** - MCP protocol compliance and basic functionality
2. **Integration Tests** - Complete tool category testing 
3. **End-to-End Tests** - Full workflow validation
4. **Performance Tests** - Benchmarking and performance analysis
5. **Coverage Tests** - Code coverage reporting

### Test Directory Structure

```
tests/
├── test-mcp-protocol.js           # Basic MCP protocol compliance
├── test-mcp-end-to-end.js         # E2E workflow testing
├── integration-complete.js        # Comprehensive integration tests
├── performance-benchmarks.js      # Performance and load testing
├── coverage-runner.js             # Test coverage orchestration
└── e2e-comprehensive.js           # Complete E2E validation
```

## Quick Start

### Run All Tests
```bash
npm run test:all
```

### Run Individual Test Suites
```bash
# Basic protocol tests
npm test

# Integration tests (all tool categories)
npm run test:integration

# End-to-end workflow tests
npm run test:e2e

# Performance benchmarks
npm run test:performance

# Coverage analysis
npm run test:coverage
```

## Test Suite Details

### 1. Protocol Tests (`test-mcp-protocol.js`)

**Purpose**: Validates MCP protocol compliance and basic server functionality.

**What it tests**:
- Server initialization
- Tool listing and discovery
- Basic tool execution
- Error handling
- JSON-RPC compliance

**Runtime**: ~30 seconds

**Example**:
```bash
npm test
```

### 2. Integration Tests (`integration-complete.js`)

**Purpose**: Comprehensive testing of all tool categories and functionality.

**What it tests**:
- Tool discovery system (layered architecture)
- Project management tools
- Video creation workflows
- Studio management
- Asset management
- Performance metrics

**Runtime**: ~2-3 minutes

**Key Features**:
- Tests all tool categories individually
- Validates tool activation and deactivation
- Checks error handling and edge cases
- Measures operation performance
- Generates detailed test reports

**Example**:
```bash
npm run test:integration
```

### 3. End-to-End Tests (`test-mcp-end-to-end.js`)

**Purpose**: Validates complete user workflows from start to finish.

**What it tests**:
- Complete video creation workflow
- Project file generation and validation
- State management persistence
- Studio launch preparation
- Asset organization

**Runtime**: ~1-2 minutes

**Workflow tested**:
1. Create complete video project
2. Validate generated files
3. Check project structure
4. Verify state persistence
5. Prepare studio launch

### 4. Performance Benchmarks (`performance-benchmarks.js`)

**Purpose**: Measures performance under various conditions and loads.

**What it tests**:
- Server initialization performance
- Tool call latency and throughput
- Concurrent operation handling
- Memory usage patterns
- Sustained load performance

**Runtime**: ~30-60 seconds

**Metrics measured**:
- Average response times
- 95th percentile latencies  
- Memory consumption
- Operations per second
- Concurrency limits
- Error rates

**Performance Standards**:
- Initialization: <200ms target, <500ms max
- Tool calls: <50ms target, <100ms max  
- Throughput: >100 ops/sec target, >50 ops/sec min
- Memory growth: <0.005MB per operation

**Example**:
```bash
npm run test:performance
```

### 5. Coverage Tests (`coverage-runner.js`)

**Purpose**: Provides comprehensive code coverage analysis.

**What it does**:
- Runs all test suites with coverage instrumentation
- Generates HTML, LCOV, and JSON coverage reports
- Checks coverage thresholds
- Identifies untested code paths

**Coverage Thresholds**:
- Lines: 70%
- Functions: 70% 
- Branches: 60%
- Statements: 70%

**Reports generated**:
- `coverage/index.html` - Interactive HTML report
- `coverage/lcov.info` - LCOV format for CI/CD
- `coverage/coverage-final.json` - Machine-readable JSON

**Example**:
```bash
npm run test:coverage
```

## CI/CD Integration

### GitHub Actions Workflow

The project includes a comprehensive CI/CD pipeline (`.github/workflows/ci.yml`) that:

- Runs on multiple Node.js versions (18.x, 20.x, 22.x)
- Tests on multiple platforms (Windows, Ubuntu, macOS)
- Includes security scanning with CodeQL
- Generates and uploads coverage reports
- Creates release artifacts
- Runs performance benchmarks

### Coverage Integration

- Coverage reports are automatically uploaded to Codecov
- Coverage thresholds are enforced in CI
- Failed coverage checks block deployments

## Local Development Testing

### Pre-commit Testing
```bash
# Quick validation before commits
npm test

# Full test suite (recommended for major changes)
npm run test:all
```

### Debug Mode Testing
```bash
# Run with verbose output
DEBUG=* npm test

# Run specific test file directly
node tests/integration-complete.js
```

### Performance Profiling
```bash
# Enable garbage collection for memory testing
npm run test:performance

# Profile with Node.js inspector
node --inspect tests/performance-benchmarks.js
```

## Test Environment Setup

### Prerequisites
- Node.js 18+ 
- Windows environment (for full MCP compatibility)
- Sufficient disk space (~500MB for test artifacts)

### Environment Variables
```bash
# Test mode
NODE_ENV=test

# Test output directory
REMOTION_ASSETS_DIR=./test-output

# Coverage tools
NYC_SILENT=true
```

### Test Data Cleanup

Tests automatically clean up after themselves, but you can manually clean:

```bash
# Remove all test output
rm -rf test-*-output/
rm -rf coverage/
rm -rf .nyc_output/

# Reset to clean state
npm run clean
npm run build
```

## Test Results and Reports

### Test Output Locations

- **Test results**: Console output + `test-*-output/` directories
- **Coverage reports**: `coverage/` directory  
- **Performance reports**: `test-performance-output/performance-report-*.json`
- **Integration reports**: `test-integration-output/integration-test-report.json`

### Understanding Test Results

#### ✅ Success Indicators
- All tests pass with 0 failures
- Coverage thresholds met
- Performance within acceptable ranges
- No memory leaks detected

#### ⚠️ Warning Indicators  
- Some tests pass but with warnings
- Coverage below targets but above minimums
- Performance slightly degraded
- Minor memory growth

#### ❌ Failure Indicators
- Test failures or errors
- Coverage below minimum thresholds  
- Performance significantly degraded
- Memory leaks or excessive growth

### Performance Interpretation

**Good Performance** (🟢):
- Initialization <200ms
- Tool calls <50ms average
- >100 ops/sec throughput
- <0.005MB memory growth per operation

**Acceptable Performance** (🟡):
- Initialization <500ms
- Tool calls <100ms average
- >50 ops/sec throughput
- <0.01MB memory growth per operation

**Needs Attention** (🔴):
- Initialization >500ms
- Tool calls >100ms average
- <50 ops/sec throughput
- >0.01MB memory growth per operation

## Troubleshooting

### Common Issues

1. **"Process exited with code 1"**
   - Ensure running on Windows (not WSL2)
   - Check that project was built on Windows
   - Verify all paths use Windows format

2. **"Module not found" errors**
   - Run `npm run build` to compile TypeScript
   - Check that dependencies are installed: `npm install`
   - Verify Node.js version compatibility (>=18.0.0)

3. **Coverage tools not working**
   - Install coverage dependencies: `npm install --save-dev nyc c8`
   - Clear coverage cache: `rm -rf .nyc_output coverage`
   - Rebuild project: `npm run build`

4. **Performance tests failing**
   - Close other applications to free resources
   - Ensure sufficient memory available
   - Check for background processes affecting performance

5. **Integration tests timing out**
   - Increase test timeouts in test files
   - Check network connectivity for API-dependent tests
   - Verify test environment has proper permissions

### Debug Commands

```bash
# Verbose test output
DEBUG=* npm run test:integration

# Run single test with full output  
node tests/performance-benchmarks.js --verbose

# Check test environment
node -e "console.log(process.env)"

# Validate build
npm run build && node build/index.js --version
```

## Contributing to Tests

### Adding New Tests

1. **Create test file** in `tests/` directory
2. **Follow naming convention**: `test-feature-name.js`  
3. **Include proper cleanup** and error handling
4. **Add npm script** in `package.json`
5. **Update this documentation**

### Test Structure Template

```javascript
#!/usr/bin/env node

/**
 * Test Description - What this test validates
 */

import { RoughCutMCPServer } from '../build/index.js';
import { /* other imports */ } from 'node:fs';

class MyTestSuite {
  constructor() {
    this.testDir = './test-my-feature-output';
    this.server = null;
    this.results = {};
  }

  async setup() {
    // Test environment setup
  }

  async testFeature() {
    // Individual test implementation
  }

  async cleanup() {
    // Resource cleanup
  }

  async run() {
    await this.setup();
    // Run tests
    await this.cleanup();
    return success;
  }
}

const test = new MyTestSuite();
test.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
```

### Test Quality Standards

- **Self-contained**: Tests should not depend on external state
- **Repeatable**: Tests should pass consistently  
- **Fast**: Individual tests should complete in <30 seconds
- **Clear**: Test names and output should be descriptive
- **Cleanup**: Tests should clean up all resources

## Advanced Testing

### Load Testing

For production deployments, consider additional load testing:

```bash
# Extended performance test
timeout 300 npm run test:performance

# Stress test with high concurrency  
CONCURRENCY=100 npm run test:performance
```

### Memory Profiling

```bash
# Enable memory debugging
node --max-old-space-size=8192 --expose-gc tests/performance-benchmarks.js

# Heap snapshots
node --inspect tests/integration-complete.js
# Open chrome://inspect in Chrome browser
```

### Security Testing

```bash
# Dependency security audit
npm audit

# Code security scan  
npm run build && node --check build/index.js
```

---

## Summary

This comprehensive testing framework ensures the RoughCut MCP Server maintains high quality, performance, and reliability standards. The multi-layered approach validates everything from basic protocol compliance to complex end-to-end workflows and performance characteristics.

For questions or issues with testing, please refer to the troubleshooting section or create an issue in the project repository.