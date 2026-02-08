/**
 * Structured logging utility for MCP server observability
 */

import { type AuditEntry, type LogEntry, LogLevel } from "./types.js";

/**
 * Logger configuration
 */
interface LoggerConfig {
  minLevel: LogLevel;
  enableAudit: boolean;
  enableMetrics: boolean;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

/**
 * Structured logger for MCP server
 */
export class Logger {
  private config: LoggerConfig;
  private metrics: Map<string, { count: number; totalDuration: number }>;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: config.minLevel ?? LogLevel.INFO,
      enableAudit: config.enableAudit ?? true,
      enableMetrics: config.enableMetrics ?? true,
    };
    this.metrics = new Map();
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return (
      LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel]
    );
  }

  /**
   * Format and output a log entry
   */
  private output(entry: LogEntry | AuditEntry): void {
    // MCP servers use stderr for logging
    const formatted = JSON.stringify(entry);
    console.error(formatted);
  }

  /**
   * Update metrics for a tool call
   */
  private updateMetrics(tool: string, duration: number): void {
    if (!this.config.enableMetrics) return;

    const existing = this.metrics.get(tool) ?? { count: 0, totalDuration: 0 };
    this.metrics.set(tool, {
      count: existing.count + 1,
      totalDuration: existing.totalDuration + duration,
    });
  }

  /**
   * Log a tool invocation
   */
  logToolCall(
    tool: string,
    action: string,
    params: Record<string, unknown>,
    options: {
      level?: LogLevel;
      metadata?: Record<string, unknown>;
    } = {}
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: options.level ?? LogLevel.INFO,
      tool,
      action,
      params: this.sanitizeParams(params),
      success: true,
      metadata: options.metadata,
    };

    if (this.shouldLog(entry.level)) {
      this.output(entry);
    }

    return entry;
  }

  /**
   * Log a tool completion (success or error)
   */
  logToolResult(
    entry: LogEntry,
    result: {
      success: boolean;
      duration: number;
      error?: string;
      metadata?: Record<string, unknown>;
    }
  ): void {
    const completedEntry: LogEntry = {
      ...entry,
      duration: result.duration,
      success: result.success,
      error: result.error,
      metadata: { ...entry.metadata, ...result.metadata },
    };

    if (this.shouldLog(result.success ? LogLevel.INFO : LogLevel.ERROR)) {
      this.output(completedEntry);
    }

    this.updateMetrics(entry.tool, result.duration);
  }

  /**
   * Log an audit entry for state-changing operations
   */
  logAudit(
    tool: string,
    operation: AuditEntry["operation"],
    resource: string,
    params: Record<string, unknown>,
    options: {
      resourceId?: string | number;
      changes?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    } = {}
  ): void {
    if (!this.config.enableAudit) return;

    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      tool,
      action: `audit:${operation}`,
      params: this.sanitizeParams(params),
      success: true,
      operation,
      resource,
      resourceId: options.resourceId,
      changes: options.changes,
      metadata: options.metadata,
    };

    this.output(entry);
  }

  /**
   * Log an error
   */
  error(tool: string, message: string, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      tool,
      action: "error",
      params: {},
      success: false,
      error: error?.message ?? message,
      metadata: error?.stack ? { stack: error.stack } : undefined,
    };

    this.output(entry);
  }

  /**
   * Log a warning
   */
  warn(
    tool: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      tool,
      action: "warning",
      params: {},
      success: true,
      metadata: { message, ...metadata },
    };

    this.output(entry);
  }

  /**
   * Log debug information
   */
  debug(
    tool: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      tool,
      action: "debug",
      params: {},
      success: true,
      metadata: { message, ...metadata },
    };

    this.output(entry);
  }

  /**
   * Get metrics summary
   */
  getMetrics(): Record<string, { count: number; avgDuration: number }> {
    const result: Record<string, { count: number; avgDuration: number }> = {};

    for (const [tool, data] of this.metrics) {
      result[tool] = {
        count: data.count,
        avgDuration: data.count > 0 ? data.totalDuration / data.count : 0,
      };
    }

    return result;
  }

  /**
   * Sanitize params to remove sensitive data
   */
  private sanitizeParams(
    params: Record<string, unknown>
  ): Record<string, unknown> {
    const sensitiveKeys = ["token", "password", "secret", "key", "auth"];
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(params)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof value === "string" && value.length > 500) {
        // Truncate long strings
        sanitized[key] = `${value.substring(0, 500)}...[truncated]`;
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

// Singleton logger instance
export const logger = new Logger({
  minLevel: process.env.DEBUG === "true" ? LogLevel.DEBUG : LogLevel.INFO,
  enableAudit: true,
  enableMetrics: true,
});

/**
 * Wrapper to add logging to tool execution
 */
export async function withLogging<T>(
  tool: string,
  action: string,
  params: Record<string, unknown>,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  const logEntry = logger.logToolCall(tool, action, params);

  try {
    const result = await fn();
    logger.logToolResult(logEntry, {
      success: true,
      duration: Date.now() - startTime,
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.logToolResult(logEntry, {
      success: false,
      duration: Date.now() - startTime,
      error: message,
    });
    throw error;
  }
}
