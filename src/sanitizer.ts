/**
 * Input sanitization utility for security
 */

/**
 * Patterns that could indicate injection attempts
 */
const DANGEROUS_PATTERNS = [
  // Script injection
  /<script\b[^>]*>/i,
  /<\/script>/i,
  /javascript:/i,
  /on\w+\s*=/i,
  // SQL injection patterns (basic)
  /(['";])\s*(OR|AND)\s+\1?\s*\d+\s*=\s*\d+/i,
  /UNION\s+SELECT/i,
  /DROP\s+TABLE/i,
  // Command injection
  /[;&|`$]/,
  /\$\(/,
  /`.*`/,
];

/**
 * Maximum lengths for different field types
 */
const MAX_LENGTHS = {
  owner: 39, // GitHub username max length
  repo: 100, // GitHub repo name max length
  body: 65536, // Comment body max length
  title: 256, // PR title max length
  path: 1000, // File path max length
  default: 10000,
};

/**
 * Sanitization result
 */
export interface SanitizeResult {
  isValid: boolean;
  sanitized: string;
  warnings: string[];
}

/**
 * Sanitize a string input
 */
export function sanitizeString(
  input: string,
  fieldName: string,
  options: {
    maxLength?: number;
    allowHtml?: boolean;
    trim?: boolean;
  } = {}
): SanitizeResult {
  const warnings: string[] = [];
  let sanitized = input;

  // Trim whitespace
  if (options.trim !== false) {
    sanitized = sanitized.trim();
  }

  // Check max length
  const maxLength =
    options.maxLength ??
    MAX_LENGTHS[fieldName as keyof typeof MAX_LENGTHS] ??
    MAX_LENGTHS.default;

  if (sanitized.length > maxLength) {
    warnings.push(
      `${fieldName} exceeds maximum length (${maxLength}), truncating`
    );
    sanitized = sanitized.substring(0, maxLength);
  }

  // Check for dangerous patterns (unless HTML is explicitly allowed)
  if (!options.allowHtml) {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(sanitized)) {
        warnings.push(
          `${fieldName} contains potentially dangerous pattern, sanitizing`
        );
        // Replace the dangerous content
        sanitized = sanitized.replace(pattern, "[SANITIZED]");
      }
    }
  }

  return {
    isValid: warnings.length === 0,
    sanitized,
    warnings,
  };
}

/**
 * Sanitize GitHub owner/org name
 */
export function sanitizeOwner(owner: string): SanitizeResult {
  const warnings: string[] = [];
  let sanitized = owner.trim();

  // GitHub username rules: alphanumeric and hyphens, cannot start with hyphen
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(sanitized)) {
    warnings.push("Invalid owner name format");
    // Remove invalid characters
    sanitized = sanitized.replace(/[^a-zA-Z0-9-]/g, "");
    if (sanitized.startsWith("-")) {
      sanitized = sanitized.substring(1);
    }
  }

  if (sanitized.length > MAX_LENGTHS.owner) {
    warnings.push("Owner name too long, truncating");
    sanitized = sanitized.substring(0, MAX_LENGTHS.owner);
  }

  return {
    isValid: warnings.length === 0,
    sanitized,
    warnings,
  };
}

/**
 * Sanitize GitHub repository name
 */
export function sanitizeRepo(repo: string): SanitizeResult {
  const warnings: string[] = [];
  let sanitized = repo.trim();

  // GitHub repo name rules: alphanumeric, hyphens, underscores, dots
  if (!/^[a-zA-Z0-9._-]+$/.test(sanitized)) {
    warnings.push("Invalid repository name format");
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "");
  }

  if (sanitized.length > MAX_LENGTHS.repo) {
    warnings.push("Repository name too long, truncating");
    sanitized = sanitized.substring(0, MAX_LENGTHS.repo);
  }

  return {
    isValid: warnings.length === 0,
    sanitized,
    warnings,
  };
}

/**
 * Sanitize file path
 */
export function sanitizePath(path: string): SanitizeResult {
  const warnings: string[] = [];
  let sanitized = path.trim();

  // Prevent path traversal
  if (sanitized.includes("..")) {
    warnings.push("Path traversal detected, sanitizing");
    sanitized = sanitized.replace(/\.\./g, "");
  }

  // Remove null bytes
  if (sanitized.includes("\0")) {
    warnings.push("Null bytes detected, removing");
    sanitized = sanitized.replace(/\0/g, "");
  }

  if (sanitized.length > MAX_LENGTHS.path) {
    warnings.push("Path too long, truncating");
    sanitized = sanitized.substring(0, MAX_LENGTHS.path);
  }

  return {
    isValid: warnings.length === 0,
    sanitized,
    warnings,
  };
}

/**
 * Sanitize comment/review body
 * Note: We allow markdown and code blocks, but sanitize potential XSS
 */
export function sanitizeBody(body: string): SanitizeResult {
  const warnings: string[] = [];
  let sanitized = body;

  // Remove script tags
  if (/<script\b[^>]*>[\s\S]*?<\/script>/gi.test(sanitized)) {
    warnings.push("Script tags detected, removing");
    sanitized = sanitized.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  }

  // Remove event handlers
  if (/on\w+\s*=\s*["'][^"']*["']/gi.test(sanitized)) {
    warnings.push("Event handlers detected, removing");
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  }

  // Remove javascript: URLs
  if (/javascript:/gi.test(sanitized)) {
    warnings.push("JavaScript URLs detected, removing");
    sanitized = sanitized.replace(/javascript:/gi, "");
  }

  if (sanitized.length > MAX_LENGTHS.body) {
    warnings.push("Body too long, truncating");
    sanitized = sanitized.substring(0, MAX_LENGTHS.body);
  }

  return {
    isValid: warnings.length === 0,
    sanitized,
    warnings,
  };
}

/**
 * Sanitize PR params
 */
export interface SanitizedPRParams {
  owner: string;
  repo: string;
  prNumber: number;
  warnings: string[];
}

export function sanitizePRParams(params: {
  owner?: string;
  repo?: string;
  prNumber?: number;
}): SanitizedPRParams {
  const warnings: string[] = [];

  // Handle missing required fields
  if (!params.owner) {
    warnings.push("Missing owner");
  }
  if (!params.repo) {
    warnings.push("Missing repo");
  }
  if (params.prNumber === undefined) {
    warnings.push("Missing prNumber");
  }

  const ownerResult = sanitizeOwner(params.owner ?? "");
  const repoResult = sanitizeRepo(params.repo ?? "");
  warnings.push(...ownerResult.warnings, ...repoResult.warnings);

  // Validate prNumber
  const prNum = params.prNumber ?? 0;
  if (!Number.isInteger(prNum) || prNum <= 0) {
    warnings.push("Invalid PR number");
  }

  return {
    owner: ownerResult.sanitized,
    repo: repoResult.sanitized,
    prNumber: Math.max(1, Math.floor(prNum)),
    warnings,
  };
}
