#!/usr/bin/env node

/**
 * COMPREHENSIVE SECURITY VULNERABILITY TEST SUITE
 * Tests the rough-cut-mcp vulnerability detection system across multiple projects
 * Demonstrates different types of security and quality issues the scanner detects
 */

async function runComprehensiveSecurityTest() {
  console.log('🔒 ROUGH-CUT-MCP SECURITY VULNERABILITY TEST SUITE');
  console.log('='.repeat(70));
  console.log('Testing security scanning capabilities across multiple projects...\n');
  
  try {
    // Import the compiled utils module
    const utils = require('./build/utils.js');
    
    // Test projects to scan
    const testProjects = [
      { name: 'bouncing-ball', description: 'Simple animation project (baseline)' },
      { name: 'e2e-test-creative-bold', description: 'Complex animation with particles and effects' },
      { name: 'e2e-test-tech-minimal', description: 'Tech-focused minimal design' },
      { name: 'endlessblink-showcase', description: 'Professional showcase project' }
    ];
    
    const results = [];
    
    for (const project of testProjects) {
      console.log(`🔍 SCANNING PROJECT: ${project.name}`);
      console.log(`📝 Description: ${project.description}`);
      console.log('-'.repeat(50));
      
      try {
        // Run vulnerability scan
        const report = await utils.detectProjectVulnerabilities(project.name);
        
        // Count issues by severity
        const severityCounts = {
          CRITICAL: report.issues.filter(i => i.severity === 'CRITICAL').length,
          HIGH: report.issues.filter(i => i.severity === 'HIGH').length,
          MEDIUM: report.issues.filter(i => i.severity === 'MEDIUM').length,
          LOW: report.issues.filter(i => i.severity === 'LOW').length
        };
        
        const totalIssues = report.issues.length;
        
        // Display summary
        console.log(`📊 Issues Found: ${totalIssues}`);
        console.log(`🚨 Critical: ${severityCounts.CRITICAL} | 🔴 High: ${severityCounts.HIGH} | 🟠 Medium: ${severityCounts.MEDIUM} | 🟨 Low: ${severityCounts.LOW}`);
        
        if (totalIssues > 0) {
          console.log('\n📋 DETAILED FINDINGS:');
          report.issues.forEach((issue, index) => {
            const icon = { 'CRITICAL': '🚨', 'HIGH': '🔴', 'MEDIUM': '🟠', 'LOW': '🟨' }[issue.severity] || '⚪';
            console.log(`${index + 1}. ${icon} ${issue.severity} - ${issue.description}`);
            console.log(`   📍 ${issue.location}`);
            if (issue.suggestedFix) {
              console.log(`   💡 Fix: ${issue.suggestedFix}`);
            }
          });
        } else {
          console.log('✅ NO SECURITY ISSUES DETECTED');
        }
        
        // Store results for final summary
        results.push({
          project: project.name,
          description: project.description,
          totalIssues,
          severityCounts,
          report,
          success: true
        });
        
      } catch (error) {
        console.log(`❌ SCAN FAILED: ${error.message}`);
        results.push({
          project: project.name,
          description: project.description,
          error: error.message,
          success: false
        });
      }
      
      console.log('\n');
    }
    
    // Generate comprehensive security report
    console.log('📋 COMPREHENSIVE SECURITY ANALYSIS REPORT');
    console.log('='.repeat(70));
    
    const successfulScans = results.filter(r => r.success);
    const failedScans = results.filter(r => !r.success);
    
    console.log(`✅ Successful Scans: ${successfulScans.length}`);
    console.log(`❌ Failed Scans: ${failedScans.length}`);
    console.log('');
    
    // Security metrics
    const totalIssuesAcrossProjects = successfulScans.reduce((sum, r) => sum + r.totalIssues, 0);
    const totalCriticalIssues = successfulScans.reduce((sum, r) => sum + r.severityCounts.CRITICAL, 0);
    const totalHighIssues = successfulScans.reduce((sum, r) => sum + r.severityCounts.HIGH, 0);
    
    console.log('🛡️ SECURITY METRICS:');
    console.log('-'.repeat(30));
    console.log(`Total Security Issues: ${totalIssuesAcrossProjects}`);
    console.log(`Critical Issues: ${totalCriticalIssues}`);
    console.log(`High-Priority Issues: ${totalHighIssues}`);
    console.log('');
    
    // Most secure project
    const mostSecureProject = successfulScans.reduce((prev, curr) => 
      prev.totalIssues < curr.totalIssues ? prev : curr
    );
    
    console.log(`🏆 MOST SECURE PROJECT: ${mostSecureProject.project}`);
    console.log(`   Issues: ${mostSecureProject.totalIssues}`);
    console.log('');
    
    // Project requiring attention
    const projectNeedingAttention = successfulScans.reduce((prev, curr) => 
      prev.severityCounts.CRITICAL + prev.severityCounts.HIGH > 
      curr.severityCounts.CRITICAL + curr.severityCounts.HIGH ? prev : curr
    );
    
    if (projectNeedingAttention.severityCounts.CRITICAL + projectNeedingAttention.severityCounts.HIGH > 0) {
      console.log(`⚠️  ATTENTION REQUIRED: ${projectNeedingAttention.project}`);
      console.log(`   Critical/High Issues: ${projectNeedingAttention.severityCounts.CRITICAL + projectNeedingAttention.severityCounts.HIGH}`);
      console.log('');
    }
    
    // Vulnerability categories detected
    const allCategories = new Set();
    successfulScans.forEach(result => {
      if (result.report && result.report.issues) {
        result.report.issues.forEach(issue => {
          allCategories.add(issue.category);
        });
      }
    });
    
    if (allCategories.size > 0) {
      console.log('🔍 VULNERABILITY CATEGORIES DETECTED:');
      console.log('-'.repeat(30));
      Array.from(allCategories).forEach(category => {
        console.log(`• ${category}`);
      });
      console.log('');
    }
    
    // Final assessment
    console.log('📊 FINAL SECURITY ASSESSMENT:');
    console.log('-'.repeat(30));
    
    if (totalCriticalIssues > 0) {
      console.log('🚨 CRITICAL: Immediate action required before deployment!');
    } else if (totalHighIssues > 0) {
      console.log('⚠️  HIGH PRIORITY: Address security issues before production use.');
    } else if (totalIssuesAcrossProjects > 0) {
      console.log('✅ ACCEPTABLE: Minor issues detected, address when possible.');
    } else {
      console.log('✅ EXCELLENT: No security vulnerabilities detected across projects.');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('[TEST] Comprehensive security test completed successfully!');
    console.log(`[SUMMARY] Scanned ${testProjects.length} projects, found ${totalIssuesAcrossProjects} total issues`);
    
    return results;
    
  } catch (error) {
    console.error('[ERROR] Security test suite failed:', error);
    return null;
  }
}

// Run the comprehensive test
runComprehensiveSecurityTest().catch(console.error);