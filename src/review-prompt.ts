import type { CodeFile, PRDetails } from "./types.js";

/**
 * Default PR review guidelines and prompt template
 */
export const DEFAULT_PR_REVIEW_PROMPT = `You are an experienced code reviewer. Review this pull request thoroughly and provide constructive feedback.

## Review Guidelines

### 1. Code Quality
- Check for code smells, anti-patterns, and technical debt
- Verify code follows best practices and conventions
- Look for potential bugs, edge cases, and error handling
- Assess code readability and maintainability

### 2. Security
- Identify security vulnerabilities (XSS, SQL injection, etc.)
- Check for exposed secrets, API keys, or credentials
- Review authentication and authorization logic
- Verify input validation and sanitization

### 3. Performance
- Identify potential performance bottlenecks
- Check for inefficient algorithms or database queries
- Look for unnecessary computations or memory leaks
- Consider scalability implications

### 4. Testing
- Verify adequate test coverage
- Check test quality and edge cases
- Ensure tests are maintainable and readable

### 5. Documentation
- Check if code changes are properly documented
- Verify README updates if needed
- Ensure API documentation is updated

### 6. Architecture & Design
- Assess if changes align with project architecture
- Check for proper separation of concerns
- Verify design patterns are used appropriately
- Consider impact on existing codebase

## Review Format

Provide your review in the following format:

1. **Summary**: Brief overview of the PR and your overall assessment
2. **Strengths**: What was done well
3. **Issues**: List of issues found (categorized by severity: Critical, High, Medium, Low)
4. **Suggestions**: Recommendations for improvement
5. **Verdict**: APPROVE, REQUEST_CHANGES, or COMMENT

For each issue, provide:
- File and line number (if applicable)
- Issue description
- Suggested fix or improvement

Be constructive, specific, and actionable in your feedback.`;

/**
 * Generate a review prompt with PR context
 */
export function generateReviewPrompt(
  prDetails: PRDetails,
  files: CodeFile[],
  customPrompt?: string
): string {
  const prompt = customPrompt ?? DEFAULT_PR_REVIEW_PROMPT;

  const fileSummary = files
    .map(
      (f) =>
        `- ${f.filename} (${f.status}): +${f.additions}/-${f.deletions} lines`
    )
    .join("\n");

  const context = `
## Pull Request Context

**Title**: ${prDetails.title}
**Author**: ${prDetails.author ?? "Unknown"}
**State**: ${prDetails.state}
**Changes**: ${prDetails.additions} additions, ${prDetails.deletions} deletions across ${prDetails.changed_files} files

**Description**:
${prDetails.body ?? "No description provided"}

**Files Changed**:
${fileSummary}

## Code Changes

Review the following code changes and provide feedback based on the guidelines above.
`;

  return `${prompt}\n\n${context}`;
}

/**
 * Format PR files for review prompt
 */
export function formatFilesForReview(files: CodeFile[]): string {
  return files
    .map((file) => {
      if (!file.patch) {
        return `\n### ${file.filename} (${file.status})\nNo diff available (binary or too large)\n`;
      }

      return `\n### ${file.filename} (${file.status})\n\`\`\`diff\n${file.patch}\n\`\`\`\n`;
    })
    .join("\n");
}
