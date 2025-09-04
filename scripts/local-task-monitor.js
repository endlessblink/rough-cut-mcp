#!/usr/bin/env node

/**
 * Local Task Monitor - Reads from current project's task files
 * Self-contained script that doesn't depend on external systems
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(__dirname); // Go up from scripts/ to project root

// Configuration and state
const config = {
  refreshInterval: 3000,
  filter: 'active',
  sort: 'priority' // Default: sort by status then priority
};

let updateCounter = 0;
let lastTaskCount = 0;

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  args.forEach(arg => {
    if (arg.startsWith('--filter=')) {
      config.filter = arg.split('=')[1];
    } else if (arg.startsWith('--refresh=')) {
      const interval = arg.split('=')[1];
      config.refreshInterval = parseFloat(interval.replace('s', '')) * 1000;
    } else if (arg.startsWith('--sort=')) {
      config.sort = arg.split('=')[1];
    }
  });
}

// Simple ANSI colors (no external dependencies)
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  redBg: '\x1b[41m',
  yellowBg: '\x1b[43m'
};

// Status display functions
const STATUS_DISPLAY = {
  todo: (text) => `${colors.white}${colors.bold}${text}${colors.reset}`,
  in_progress: (text) => `${colors.cyan}${colors.bold}${text}${colors.reset}`,
  done: (text) => `${colors.green}${colors.bold}${text}${colors.reset}`,
  blocked: (text) => `${colors.red}${colors.bold}${text}${colors.reset}`
};

const PRIORITY_DISPLAY = {
  urgent: (text) => `${colors.redBg}${colors.white}${colors.bold} 🔥 ${text} ${colors.reset}`,
  high: (text) => `${colors.yellowBg}${colors.bold} ⚡ ${text} ${colors.reset}`,
  medium: (text) => `${colors.blue}${colors.bold}${text}${colors.reset}`,
  low: (text) => `${colors.gray}${text}${colors.reset}`
};

// Load tasks from local project files with detailed debugging
function loadLocalTasks() {
  const tasksDir = path.join(projectRoot, 'tasks');
  
  console.log(`\n🔍 DEBUG: Looking for tasks in: ${tasksDir}`);
  console.log(`📁 DEBUG: Project root: ${projectRoot}`);
  
  if (!fs.existsSync(tasksDir)) {
    console.log(`❌ DEBUG: Tasks directory does not exist!`);
    return [];
  }
  
  let allTasks = [];
  
  try {
    const subDirs = fs.readdirSync(tasksDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`📂 DEBUG: Found ${subDirs.length} subdirectories: [${subDirs.join(', ')}]`);
    
    for (const subDir of subDirs) {
      const tasksFile = path.join(tasksDir, subDir, 'tasks.json');
      console.log(`📄 DEBUG: Checking: ${tasksFile}`);
      
      if (fs.existsSync(tasksFile)) {
        const fileStats = fs.statSync(tasksFile);
        console.log(`✅ DEBUG: File found! Modified: ${fileStats.mtime.toLocaleTimeString()}, Size: ${fileStats.size} bytes`);
        
        const fileContent = fs.readFileSync(tasksFile, 'utf8');
        console.log(`📝 DEBUG: File content preview: ${fileContent.slice(0, 100)}...`);
        
        const tasksData = JSON.parse(fileContent);
        const tasks = Array.isArray(tasksData) ? tasksData : [tasksData];
        
        console.log(`📋 DEBUG: Parsed ${tasks.length} tasks from ${subDir}:`);
        tasks.forEach(task => {
          console.log(`   - ${task.id}: "${task.title}" [${task.status}/${task.priority}]`);
        });
        
        allTasks.push(...tasks);
      } else {
        console.log(`❌ DEBUG: File not found: ${tasksFile}`);
      }
    }
  } catch (error) {
    console.error('❌ DEBUG: Error reading local tasks:', error);
  }
  
  console.log(`🎯 DEBUG: Total raw tasks loaded: ${allTasks.length}`);
  return allTasks;
}

// Filter tasks based on status with debugging
function filterTasks(tasks) {
  console.log(`\n🔄 DEBUG: Filtering ${tasks.length} tasks (filter: ${config.filter})`);
  
  // Step 1: Remove completed tasks
  let filtered = tasks.filter(task => task.status !== 'done');
  console.log(`📊 DEBUG: After removing 'done': ${filtered.length} tasks`);
  
  // Step 2: Apply filter
  if (config.filter === 'active') {
    filtered = filtered.filter(task => ['todo', 'in_progress'].includes(task.status));
    console.log(`📊 DEBUG: After 'active' filter (todo + in_progress): ${filtered.length} tasks`);
  } else if (config.filter !== 'all') {
    filtered = filtered.filter(task => task.status === config.filter);
    console.log(`📊 DEBUG: After '${config.filter}' filter: ${filtered.length} tasks`);
  }
  
  console.log(`✅ DEBUG: Final filtered tasks: ${filtered.length}`);
  filtered.forEach(task => {
    console.log(`   → ${task.id}: "${task.title}" [${task.status}/${task.priority}]`);
  });
  
  return filtered;
}

// Sort tasks for optimal productivity viewing
function sortTasks(tasks) {
  console.log(`\n🔄 DEBUG: Sorting ${tasks.length} tasks (sort: ${config.sort})`);
  
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const statusOrder = { in_progress: 0, todo: 1, blocked: 2 };
  
  return tasks.sort((a, b) => {
    switch (config.sort) {
      case 'priority':
        // Primary: Status (in_progress first)
        const statusDiff = (statusOrder[a.status] || 1) - (statusOrder[b.status] || 1);
        if (statusDiff !== 0) return statusDiff;
        
        // Secondary: Priority (urgent first) 
        const priorityDiff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
        if (priorityDiff !== 0) return priorityDiff;
        
        // Tertiary: Title alphabetical
        return (a.title || '').localeCompare(b.title || '');
        
      case 'status':
        // Sort by status only
        const statusDiff2 = (statusOrder[a.status] || 1) - (statusOrder[b.status] || 1);
        if (statusDiff2 !== 0) return statusDiff2;
        return (a.title || '').localeCompare(b.title || '');
        
      case 'created':
        // Sort by creation date (newest first)
        const dateA = new Date(a.created || 0);
        const dateB = new Date(b.created || 0);
        return dateB - dateA;
        
      case 'alpha':
        // Sort alphabetically by title
        return (a.title || '').localeCompare(b.title || '');
        
      default:
        return 0; // No sorting
    }
  });
}

// Format and display tasks
function displayTasks(tasks) {
  const projectName = path.basename(projectRoot);
  
  console.clear();
  
  // Header with correct task count and update tracking
  const taskChange = lastTaskCount > 0 ? ` (${tasks.length - lastTaskCount >= 0 ? '+' : ''}${tasks.length - lastTaskCount})` : '';
  
  console.log(`${colors.blue}${colors.bold}🔥 LIVE Task Dashboard - ${projectName} (${config.filter})${colors.reset}`);
  console.log(`${colors.gray}⏰ Last updated: ${new Date().toLocaleTimeString()} | Refresh: ${config.refreshInterval/1000}s | Updates: ${updateCounter} | Tasks: ${tasks.length}${taskChange}${colors.reset}`);
  console.log('─'.repeat(100));
  console.log();
  
  if (tasks.length === 0) {
    console.log(`${colors.green}✨ No active tasks! You're all caught up.${colors.reset}`);
    console.log();
    console.log('💡 Press Ctrl+C to exit');
    return;
  }
  
  // Display tasks
  tasks.forEach(task => {
    const statusFn = STATUS_DISPLAY[task.status] || STATUS_DISPLAY.todo;
    const priorityFn = PRIORITY_DISPLAY[task.priority] || PRIORITY_DISPLAY.medium;
    
    const statusIcon = task.status === 'in_progress' ? '▶' : '●';
    const statusLabel = task.status === 'in_progress' ? 'ACTIVE' : task.status.toUpperCase();
    const priorityLabel = (task.priority || 'medium').toUpperCase();
    
    console.log(
      statusFn(`${statusIcon} ${statusLabel.padEnd(10)}`) + ' │ ' +
      priorityFn(`${priorityLabel.padEnd(8)}`) + ' │ ' +
      `${colors.blue}${task.id || 'NO-ID'}${colors.reset}` + ' │ ' +
      `${colors.white}${colors.bold}${task.title || 'Untitled'}${colors.reset}`
    );
    
    if (task.description) {
      const desc = task.description.slice(0, 120) + (task.description.length > 120 ? '...' : '');
      console.log(`${colors.gray}    ${desc}${colors.reset}`);
    }
    console.log();
  });
  
  console.log('💡 Press Ctrl+C to exit');
}

// Main monitoring loop
async function monitorTasks() {
  while (true) {
    try {
      const allTasks = loadLocalTasks();
      const activeTasks = filterTasks(allTasks);
      const sortedTasks = sortTasks(activeTasks);
      
      // Track updates and changes
      lastTaskCount = sortedTasks.length;
      updateCounter++;
      
      displayTasks(sortedTasks);
      
      await new Promise(resolve => setTimeout(resolve, config.refreshInterval));
    } catch (error) {
      console.error('❌ Monitor error:', error.message);
      await new Promise(resolve => setTimeout(resolve, config.refreshInterval));
    }
  }
}

// Graceful exit
process.on('SIGINT', () => {
  console.clear();
  console.log('👋 Task Monitor stopped');
  process.exit(0);
});

// Start monitoring
parseArgs();
console.log(`🚀 Starting Local Task Monitor for ${path.basename(projectRoot)}...`);
console.log(`📁 Reading from: ${path.join(projectRoot, 'tasks')}`);
monitorTasks();