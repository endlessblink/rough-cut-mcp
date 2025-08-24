#!/usr/bin/env node

/**
 * Test Coverage Runner for RoughCut MCP Server
 * Runs all tests with comprehensive coverage reporting
 */

import { spawn } from 'child_process';
import { existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';

class CoverageRunner {
  constructor() {
    this.projectRoot = process.cwd();
    this.coverageDir = join(this.projectRoot, 'coverage');
    this.nycOutput = join(this.projectRoot, '.nyc_output');
  }

  async setup() {
    console.log('🧪 Setting up coverage testing environment...');
    
    // Clean up previous coverage runs
    if (existsSync(this.coverageDir)) {
      rmSync(this.coverageDir, { recursive: true, force: true });
    }
    if (existsSync(this.nycOutput)) {
      rmSync(this.nycOutput, { recursive: true, force: true });
    }
    
    mkdirSync(this.coverageDir, { recursive: true });
    mkdirSync(this.nycOutput, { recursive: true });
    
    console.log('✅ Coverage environment ready');
  }

  async runWithCoverage(testScript, description) {
    return new Promise((resolve) => {
      console.log(`\n📊 Running ${description} with coverage...`);
      
      const nyc = spawn('npx', [
        'nyc',
        '--silent',
        '--no-clean',
        'node',
        testScript
      ], {
        stdio: 'pipe',
        cwd: this.projectRoot
      });

      let output = '';
      let errorOutput = '';

      nyc.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stdout.write(text);
      });

      nyc.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        process.stderr.write(text);
      });

      nyc.on('close', (code) => {
        console.log(`\n${description} completed with exit code: ${code}`);
        resolve({
          success: code === 0,
          output,
          errorOutput,
          exitCode: code
        });
      });
    });
  }

  async generateCoverageReport() {
    return new Promise((resolve) => {
      console.log('\n📈 Generating comprehensive coverage report...');
      
      const report = spawn('npx', ['nyc', 'report'], {
        stdio: 'inherit',
        cwd: this.projectRoot
      });

      report.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Coverage report generated successfully');
          console.log(`📁 HTML report: file://${join(this.coverageDir, 'index.html')}`);
          console.log(`📄 LCOV report: ${join(this.coverageDir, 'lcov.info')}`);
          console.log(`📊 JSON report: ${join(this.coverageDir, 'coverage-final.json')}`);
        } else {
          console.log('\n❌ Coverage report generation failed');
        }
        resolve(code === 0);
      });
    });
  }

  async checkCoverageThresholds() {
    return new Promise((resolve) => {
      console.log('\n🎯 Checking coverage thresholds...');
      
      const check = spawn('npx', ['nyc', 'check-coverage'], {
        stdio: 'inherit',
        cwd: this.projectRoot
      });

      check.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ All coverage thresholds met');
        } else {
          console.log('\n⚠️  Some coverage thresholds not met (see thresholds in .nycrc.json)');
        }
        resolve(code === 0);
      });
    });
  }

  async runComprehensiveTests() {
    console.log('🔬 Starting Comprehensive Test Coverage Analysis');
    console.log('='.repeat(60));

    await this.setup();

    const testSuites = [
      {
        script: 'tests/test-mcp-protocol.js',
        description: 'MCP Protocol Tests'
      },
      {
        script: 'tests/test-mcp-end-to-end.js',
        description: 'End-to-End Tests'
      },
      {
        script: 'tests/integration-complete.js',
        description: 'Integration Tests'
      }
    ];

    let allTestsPassed = true;
    const results = {};

    // Run each test suite with coverage
    for (const suite of testSuites) {
      if (existsSync(join(this.projectRoot, suite.script))) {
        const result = await this.runWithCoverage(suite.script, suite.description);
        results[suite.description] = result;
        if (!result.success) {
          allTestsPassed = false;
        }
      } else {
        console.log(`⚠️  Test script not found: ${suite.script}`);
        results[suite.description] = { success: false, missing: true };
        allTestsPassed = false;
      }
    }

    // Generate combined coverage report
    const reportGenerated = await this.generateCoverageReport();
    
    // Check coverage thresholds
    const thresholdsMet = await this.checkCoverageThresholds();

    // Summary
    console.log('\n📋 COVERAGE TEST SUMMARY');
    console.log('='.repeat(60));

    Object.entries(results).forEach(([name, result]) => {
      if (result.missing) {
        console.log(`  ⚠️  ${name}: Test file not found`);
      } else {
        console.log(`  ${result.success ? '✅' : '❌'} ${name}: ${result.success ? 'PASSED' : 'FAILED'}`);
      }
    });

    console.log(`\n📊 Coverage Report: ${reportGenerated ? 'Generated' : 'Failed'}`);
    console.log(`🎯 Thresholds: ${thresholdsMet ? 'Met' : 'Not met'}`);
    console.log(`🎪 Overall: ${allTestsPassed && reportGenerated ? 'SUCCESS' : 'NEEDS ATTENTION'}`);

    if (reportGenerated) {
      console.log(`\n🌐 View coverage report: file://${join(this.coverageDir, 'index.html')}`);
    }

    return allTestsPassed && reportGenerated && thresholdsMet;
  }
}

// Run coverage tests
const runner = new CoverageRunner();
runner.runComprehensiveTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Coverage runner failed:', error);
  process.exit(1);
});