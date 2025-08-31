#!/usr/bin/env node
/**
 * 🎭 Playwright MCP Setup Validator
 * 
 * Validates that all requirements are met for Playwright MCP to work
 * across different environments and Claude Code instances.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class MCPValidator {
  constructor() {
    this.results = [];
    this.warnings = [];
    this.errors = [];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  success(message) {
    this.log(`✅ ${message}`, 'green');
    this.results.push({ type: 'success', message });
  }

  warning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
    this.warnings.push(message);
    this.results.push({ type: 'warning', message });
  }

  error(message) {
    this.log(`❌ ${message}`, 'red');
    this.errors.push(message);
    this.results.push({ type: 'error', message });
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  async runCommand(command, options = {}) {
    try {
      const result = execSync(command, { 
        encoding: 'utf8', 
        timeout: 10000,
        stdio: 'pipe',
        ...options 
      });
      return result.trim();
    } catch (error) {
      return null;
    }
  }

  async validateProjectStructure() {
    this.log('\n🏗️  Validating Project Structure...', 'bold');

    // Check .mcp.json exists
    const mcpConfigPath = path.join(process.cwd(), '.mcp.json');
    if (fs.existsSync(mcpConfigPath)) {
      this.success('Project MCP configuration (.mcp.json) found');
      
      // Validate JSON format
      try {
        const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
        if (config.mcpServers && config.mcpServers.playwright) {
          this.success('Playwright MCP server configured in .mcp.json');
        } else {
          this.error('Playwright MCP server not found in .mcp.json');
        }
      } catch (error) {
        this.error('.mcp.json contains invalid JSON');
      }
    } else {
      this.error('Project MCP configuration (.mcp.json) not found');
    }

    // Check if we're in the RoughCut project
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.name && packageJson.name.includes('rough')) {
          this.success('In RoughCut MCP project directory');
        } else {
          this.warning('Not in expected RoughCut project directory');
        }
      } catch (error) {
        this.warning('Could not read package.json');
      }
    } else {
      this.warning('No package.json found - may not be in project root');
    }
  }

  async validateNodejsEnvironment() {
    this.log('\n🟢 Validating Node.js Environment...', 'bold');

    // Check Node.js version
    const nodeVersion = await this.runCommand('node --version');
    if (nodeVersion) {
      const version = nodeVersion.replace('v', '');
      const majorVersion = parseInt(version.split('.')[0]);
      if (majorVersion >= 16) {
        this.success(`Node.js ${nodeVersion} (compatible)`);
      } else {
        this.error(`Node.js ${nodeVersion} is too old (need v16+)`);
      }
    } else {
      this.error('Node.js not found or not accessible');
    }

    // Check npm/npx
    const npmVersion = await this.runCommand('npm --version');
    if (npmVersion) {
      this.success(`npm v${npmVersion} available`);
    } else {
      this.error('npm not found or not accessible');
    }

    const npxVersion = await this.runCommand('npx --version');
    if (npxVersion) {
      this.success(`npx v${npxVersion} available`);
    } else {
      this.error('npx not found or not accessible');
    }
  }

  async validatePlaywrightMCP() {
    this.log('\n🎭 Validating Playwright MCP...', 'bold');

    // Check if Playwright MCP package is accessible
    const mcpHelp = await this.runCommand('npx @playwright/mcp@latest --help');
    if (mcpHelp && mcpHelp.includes('--isolated')) {
      this.success('Playwright MCP package accessible via npx');
      this.success('--isolated flag supported');
    } else {
      this.error('Playwright MCP package not accessible or outdated');
    }

    // Check Playwright installation
    const playwrightVersion = await this.runCommand('npx playwright --version');
    if (playwrightVersion) {
      this.success(`Playwright ${playwrightVersion} installed`);
    } else {
      this.warning('Playwright not installed - run: npx playwright install');
    }

    // Check browsers
    const browserCheck = await this.runCommand('npx playwright install --dry-run');
    if (browserCheck && browserCheck.includes('chromium')) {
      if (browserCheck.includes('already downloaded')) {
        this.success('Playwright browsers already installed');
      } else {
        this.warning('Playwright browsers need installation - run: npx playwright install');
      }
    } else {
      this.warning('Could not verify browser installation status');
    }
  }

  async validateWSLEnvironment() {
    this.log('\n🐧 Validating WSL2 Environment...', 'bold');

    // Check if running in WSL
    const isWSL = process.env.WSL_DISTRO_NAME || 
                  process.env.NAME?.includes('Microsoft') || 
                  fs.existsSync('/proc/version') && 
                  fs.readFileSync('/proc/version', 'utf8').includes('Microsoft');

    if (isWSL) {
      this.success('Running in WSL2 environment');

      // Check WSL networking mode (if wslinfo available)
      const networkingMode = await this.runCommand('wslinfo --networking-mode 2>/dev/null');
      if (networkingMode === 'mirrored') {
        this.success('WSL2 mirrored networking mode enabled');
      } else if (networkingMode === 'nat') {
        this.warning('WSL2 using NAT mode - mirrored mode recommended for MCP');
      } else {
        this.info('Could not determine WSL2 networking mode');
      }

      // Check if .wslconfig exists (Windows side)
      const userProfile = process.env.USERPROFILE;
      if (userProfile) {
        const wslConfigPath = path.join('/mnt/c/Users', path.basename(userProfile), '.wslconfig');
        if (fs.existsSync(wslConfigPath)) {
          this.success('.wslconfig file found');
          
          try {
            const wslConfig = fs.readFileSync(wslConfigPath, 'utf8');
            if (wslConfig.includes('networkingMode=mirrored')) {
              this.success('networkingMode=mirrored configured in .wslconfig');
            } else {
              this.warning('networkingMode=mirrored not found in .wslconfig');
            }
          } catch (error) {
            this.warning('Could not read .wslconfig file');
          }
        } else {
          this.warning('.wslconfig file not found - may need WSL2 networking setup');
        }
      }
    } else {
      this.info('Not running in WSL2 - native environment detected');
      this.success('No WSL2-specific configuration needed');
    }
  }

  async validateNetworkConnectivity() {
    this.log('\n🌐 Validating Network Connectivity...', 'bold');

    // Test localhost connectivity
    const localhostTest = await this.runCommand('curl -s -I http://localhost:3333 --max-time 3');
    if (localhostTest && localhostTest.includes('200 OK')) {
      this.success('Server on localhost:3333 is accessible');
    } else {
      this.info('No server running on localhost:3333 (normal if not started)');
    }

    // Test external connectivity (for npx package downloads)
    const externalTest = await this.runCommand('curl -s -I https://registry.npmjs.org --max-time 5');
    if (externalTest && externalTest.includes('200')) {
      this.success('External package registry accessible');
    } else {
      this.warning('Cannot reach npm registry - may affect package downloads');
    }
  }

  async generateReport() {
    this.log('\n📊 Validation Summary', 'bold');
    this.log('='.repeat(50), 'blue');

    const successCount = this.results.filter(r => r.type === 'success').length;
    const warningCount = this.warnings.length;
    const errorCount = this.errors.length;

    this.log(`✅ Successful checks: ${successCount}`, 'green');
    if (warningCount > 0) {
      this.log(`⚠️  Warnings: ${warningCount}`, 'yellow');
    }
    if (errorCount > 0) {
      this.log(`❌ Errors: ${errorCount}`, 'red');
    }

    if (errorCount === 0) {
      this.log('\n🎉 MCP Setup Validation PASSED!', 'green');
      this.log('Playwright MCP should work in Claude Code.', 'green');
    } else {
      this.log('\n🔧 Setup Issues Detected', 'red');
      this.log('Please resolve the errors above before using MCP.', 'red');
    }

    if (warningCount > 0) {
      this.log('\n💡 Recommended Actions:', 'yellow');
      this.warnings.forEach(warning => {
        this.log(`   • ${warning}`, 'yellow');
      });
    }

    this.log('\n📖 For detailed setup instructions, see SETUP-MCP.md', 'blue');
  }

  async validate() {
    this.log('🎭 Playwright MCP Setup Validator', 'bold');
    this.log('Checking compatibility across environments...\n', 'blue');

    await this.validateProjectStructure();
    await this.validateNodejsEnvironment();
    await this.validatePlaywrightMCP();
    await this.validateWSLEnvironment();
    await this.validateNetworkConnectivity();
    await this.generateReport();

    // Exit with error code if there are errors
    process.exit(this.errors.length > 0 ? 1 : 0);
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new MCPValidator();
  validator.validate().catch(console.error);
}

module.exports = MCPValidator;