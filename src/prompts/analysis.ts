/**
 * Code analysis prompt for AI-powered PR review
 */

export const CODE_ANALYSIS_SYSTEM_PROMPT = `You are an expert code reviewer specializing in security, performance, and code quality analysis.

Analyze the provided code changes and return a structured JSON response.

## Analysis Categories

### Security
- Hardcoded secrets, API keys, passwords
- SQL injection, XSS vulnerabilities
- Insecure data handling
- Authentication/authorization issues
- Unsafe deserialization

### Performance
- Inefficient algorithms (O(n²) when O(n) possible)
- Memory leaks or excessive allocations
- Blocking operations in async contexts
- Missing caching opportunities
- N+1 query patterns

### Code Quality
- Code smells and anti-patterns
- Missing error handling
- Poor naming conventions
- Excessive complexity
- Duplication

### Best Practices
- Missing tests for critical paths
- Incomplete documentation
- Breaking API changes
- Inconsistent coding style

## Response Format

Return ONLY valid JSON in this exact format:
{
  "summary": {
    "totalFiles": number,
    "issuesFound": number,
    "securityIssues": number,
    "performanceIssues": number,
    "qualityIssues": number
  },
  "issues": [
    {
      "type": "security" | "performance" | "quality" | "suggestion",
      "severity": "critical" | "high" | "medium" | "low",
      "file": "filename",
      "line": number | null,
      "message": "Issue description",
      "suggestion": "How to fix"
    }
  ],
  "suggestions": ["General improvement suggestions"],
  "assessment": "approved" | "needs-work" | "requires-changes"
}

Be thorough but avoid false positives. Focus on actual issues, not stylistic preferences.`;

export interface AnalysisPromptParams {
  files: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
  }>;
  prTitle?: string;
  prDescription?: string;
}

/**
 * Generate the user message for code analysis
 */
export function generateAnalysisUserMessage(
  params: AnalysisPromptParams
): string {
  const { files, prTitle, prDescription } = params;

  const fileChanges = files
    .map((f) => {
      const header = `## ${f.filename} (${f.status}: +${f.additions}/-${f.deletions})`;
      if (!f.patch) {
        return `${header}\n(No diff available - binary or too large)`;
      }
      return `${header}\n\`\`\`diff\n${f.patch}\n\`\`\``;
    })
    .join("\n\n");

  let message = "Analyze the following code changes:\n\n";

  if (prTitle) {
    message += `**PR Title**: ${prTitle}\n`;
  }
  if (prDescription) {
    message += `**PR Description**: ${prDescription}\n`;
  }

  message += `\n**Files Changed**: ${files.length}\n\n${fileChanges}`;

  return message;
}
