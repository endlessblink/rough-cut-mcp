/**
 * Comprehensive Error Context System for Rough Cut MCP
 * Provides detailed, actionable error messages with troubleshooting guidance
 */

import { getLogger } from './logger.js';

const logger = getLogger().service('ErrorContext');

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Error categories for better organization
 */
export enum ErrorCategory {
  CONFIGURATION = 'configuration',
  FILESYSTEM = 'filesystem',
  NETWORK = 'network',
  TOOL_ACTIVATION = 'tool_activation',
  STUDIO = 'studio',
  DEPENDENCY = 'dependency',
  API = 'api',
  VALIDATION = 'validation',
  RENDER = 'render',
  UNKNOWN = 'unknown'
}

/**
 * Troubleshooting suggestion
 */
export interface TroubleshootingSuggestion {
  action: string;
  command?: string;
  documentation?: string;
  priority: number;
}

/**
 * Error context information
 */
export interface ErrorContext {
  category: ErrorCategory;
  severity: ErrorSeverity;
  code?: string;
  component: string;
  operation: string;
  details?: Record<string, any>;
  timestamp: Date;
  stack?: string;
}

/**
 * Enhanced MCP Error with context and suggestions
 */
export class MCPError extends Error {
  public readonly context: ErrorContext;
  public readonly suggestions: TroubleshootingSuggestion[];
  public readonly userMessage: string;
  
  constructor(
    message: string,
    context: Partial<ErrorContext>,
    suggestions: TroubleshootingSuggestion[] = []
  ) {
    super(message);
    this.name = 'MCPError';
    
    // Complete context with defaults
    this.context = {
      category: context.category || ErrorCategory.UNKNOWN,
      severity: context.severity || ErrorSeverity.ERROR,
      component: context.component || 'unknown',
      operation: context.operation || 'unknown',
      timestamp: new Date(),
      ...context
    };
    
    // Sort suggestions by priority
    this.suggestions = suggestions.sort((a, b) => a.priority - b.priority);
    
    // Generate user-friendly message
    this.userMessage = this.generateUserMessage();
    
    // Capture stack trace
    Error.captureStackTrace(this, MCPError);
    
    // Log the error
    this.logError();
  }
  
  /**
   * Generate user-friendly error message
   */
  private generateUserMessage(): string {
    const parts: string[] = [];
    
    // Severity indicator
    const severityIcon = {
      [ErrorSeverity.INFO]: 'ℹ️',
      [ErrorSeverity.WARNING]: '⚠️',
      [ErrorSeverity.ERROR]: '❌',
      [ErrorSeverity.CRITICAL]: '🔴'
    }[this.context.severity];
    
    parts.push(`${severityIcon} ${this.message}`);
    
    // Add context details
    if (this.context.details) {
      const detailsStr = Object.entries(this.context.details)
        .map(([key, value]) => `  ${key}: ${value}`)
        .join('\n');
      parts.push(`\nDetails:\n${detailsStr}`);
    }
    
    // Add suggestions
    if (this.suggestions.length > 0) {
      parts.push('\n💡 Suggestions:');
      this.suggestions.forEach((suggestion, i) => {
        parts.push(`${i + 1}. ${suggestion.action}`);
        if (suggestion.command) {
          parts.push(`   Command: ${suggestion.command}`);
        }
        if (suggestion.documentation) {
          parts.push(`   See: ${suggestion.documentation}`);
        }
      });
    }
    
    return parts.join('\n');
  }
  
  /**
   * Log the error with appropriate level
   */
  private logError(): void {
    const logData = {
      message: this.message,
      context: this.context,
      suggestions: this.suggestions,
      stack: this.stack
    };
    
    switch (this.context.severity) {
      case ErrorSeverity.INFO:
        logger.info('Error occurred', logData);
        break;
      case ErrorSeverity.WARNING:
        logger.warn('Warning occurred', logData);
        break;
      case ErrorSeverity.ERROR:
        logger.error('Error occurred', logData);
        break;
      case ErrorSeverity.CRITICAL:
        logger.error('Critical error occurred', logData);
        break;
    }
  }
  
  /**
   * Convert to JSON for serialization
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      userMessage: this.userMessage,
      context: this.context,
      suggestions: this.suggestions,
      stack: this.stack
    };
  }
}

/**
 * Error factory for common error scenarios
 */
export class ErrorFactory {
  /**
   * Create a filesystem error
   */
  static filesystem(
    operation: string,
    path: string,
    error: Error
  ): MCPError {
    return new MCPError(
      `Filesystem operation failed: ${operation} on ${path}`,
      {
        category: ErrorCategory.FILESYSTEM,
        severity: ErrorSeverity.ERROR,
        component: 'filesystem',
        operation,
        details: { path, originalError: error.message }
      },
      [
        {
          action: 'Check if the path exists and you have permission to access it',
          command: `ls -la "${path}"`,
          priority: 1
        },
        {
          action: 'Ensure the directory exists',
          command: `mkdir -p "${path}"`,
          priority: 2
        },
        {
          action: 'Check disk space',
          command: 'df -h',
          priority: 3
        }
      ]
    );
  }
  
  /**
   * Create a studio launch error
   */
  static studioLaunch(
    projectPath: string,
    error: Error
  ): MCPError {
    return new MCPError(
      `Failed to launch Remotion Studio for project: ${projectPath}`,
      {
        category: ErrorCategory.STUDIO,
        severity: ErrorSeverity.ERROR,
        component: 'studio',
        operation: 'launch',
        details: { projectPath, originalError: error.message }
      },
      [
        {
          action: 'Ensure project has package.json',
          command: `cat "${projectPath}/package.json"`,
          priority: 1
        },
        {
          action: 'Install project dependencies',
          command: `cd "${projectPath}" && npm install`,
          priority: 2
        },
        {
          action: 'Check if Remotion is installed',
          command: `cd "${projectPath}" && npx remotion --version`,
          priority: 3
        },
        {
          action: 'Try launching manually to see detailed errors',
          command: `cd "${projectPath}" && npx remotion studio`,
          priority: 4
        }
      ]
    );
  }
  
  /**
   * Create a tool activation error
   */
  static toolActivation(
    toolName: string,
    reason: string
  ): MCPError {
    return new MCPError(
      `Failed to activate tool: ${toolName}`,
      {
        category: ErrorCategory.TOOL_ACTIVATION,
        severity: ErrorSeverity.WARNING,
        component: 'tool-registry',
        operation: 'activate',
        details: { toolName, reason }
      },
      [
        {
          action: 'Check available tools',
          command: 'Use "discover" tool with type:"active"',
          priority: 1
        },
        {
          action: 'Search for the tool',
          command: `Use "search" tool with query:"${toolName}"`,
          priority: 2
        },
        {
          action: 'Check tool categories',
          command: 'Use "discover" tool with type:"categories"',
          priority: 3
        }
      ]
    );
  }
  
  /**
   * Create an API key missing error
   */
  static missingApiKey(
    service: string,
    envVar: string
  ): MCPError {
    return new MCPError(
      `API key missing for ${service}`,
      {
        category: ErrorCategory.CONFIGURATION,
        severity: ErrorSeverity.WARNING,
        component: 'configuration',
        operation: 'validate-api-key',
        details: { service, envVar }
      },
      [
        {
          action: `Set the ${envVar} environment variable`,
          command: `export ${envVar}="your-api-key"`,
          priority: 1
        },
        {
          action: 'Add to .env file',
          command: `echo '${envVar}=your-api-key' >> .env`,
          priority: 2
        },
        {
          action: `Get an API key from ${service}`,
          documentation: getServiceUrl(service),
          priority: 3
        }
      ]
    );
  }
  
  /**
   * Create a dependency error
   */
  static dependency(
    packageName: string,
    projectPath: string
  ): MCPError {
    return new MCPError(
      `Missing dependency: ${packageName}`,
      {
        category: ErrorCategory.DEPENDENCY,
        severity: ErrorSeverity.ERROR,
        component: 'dependencies',
        operation: 'check',
        details: { packageName, projectPath }
      },
      [
        {
          action: 'Install the dependency',
          command: `cd "${projectPath}" && npm install ${packageName}`,
          priority: 1
        },
        {
          action: 'Install all dependencies',
          command: `cd "${projectPath}" && npm install`,
          priority: 2
        },
        {
          action: 'Clear npm cache if installation fails',
          command: 'npm cache clean --force',
          priority: 3
        }
      ]
    );
  }
  
  /**
   * Create a validation error
   */
  static validation(
    field: string,
    value: any,
    requirement: string
  ): MCPError {
    return new MCPError(
      `Validation failed for ${field}: ${requirement}`,
      {
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.WARNING,
        component: 'validation',
        operation: 'validate',
        details: { field, value, requirement }
      },
      [
        {
          action: `Ensure ${field} meets requirement: ${requirement}`,
          priority: 1
        },
        {
          action: 'Check the documentation for valid values',
          documentation: 'https://github.com/roughcut-mcp/docs',
          priority: 2
        }
      ]
    );
  }
}

/**
 * Get service documentation URL
 */
function getServiceUrl(service: string): string {
  const urls: Record<string, string> = {
    'ElevenLabs': 'https://elevenlabs.io/api',
    'Freesound': 'https://freesound.org/docs/api/',
    'Flux': 'https://flux.ai/docs',
    'Google': 'https://cloud.google.com/apis'
  };
  
  return urls[service] || 'https://github.com/roughcut-mcp/docs';
}

/**
 * Wrap async functions with error context
 */
export function withErrorContext<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  component: string,
  operation: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof MCPError) {
        throw error;
      }
      
      throw new MCPError(
        error instanceof Error ? error.message : String(error),
        {
          category: ErrorCategory.UNKNOWN,
          severity: ErrorSeverity.ERROR,
          component,
          operation,
          details: { args }
        }
      );
    }
  }) as T;
}