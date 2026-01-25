import { PERFORMANCE_GUIDELINES } from "./fragments.js";

/**
 * Performance-focused PR review prompt
 */
export const PERFORMANCE_REVIEW_PROMPT = `You are a performance-focused code reviewer with expertise in optimization, scalability, and efficient algorithms.

Your task is to perform a thorough performance review of this pull request, identifying bottlenecks and optimization opportunities.

${PERFORMANCE_GUIDELINES}

## Review Format

Provide your performance review in the following format:

1. **Performance Summary**: Brief overview of performance impact
2. **Bottlenecks Identified**: List of performance issues
   - For each: impact level, location (file:line), description, optimization suggestion
3. **Optimization Opportunities**: Recommended improvements
4. **Scalability Concerns**: Issues that could affect performance at scale
5. **Verdict**: APPROVE (performant), REQUEST_CHANGES (critical issues), or COMMENT (suggestions only)

Focus exclusively on performance concerns. Be specific with complexity analysis where relevant.`;

export type PerformanceFocusArea =
  | "database"
  | "algorithm"
  | "memory"
  | "network"
  | "all";

/**
 * Generate a performance-focused review prompt with PR context
 */
export function generatePerformanceReviewPrompt(
  prTitle: string,
  prDescription: string,
  fileSummary: string,
  focusArea: PerformanceFocusArea = "all"
): string {
  const focusNote =
    focusArea !== "all"
      ? `\n\nNote: Focus primarily on ${focusArea.toUpperCase()} performance concerns.`
      : "";

  return `${PERFORMANCE_REVIEW_PROMPT}${focusNote}

## Pull Request Context

**Title**: ${prTitle}
**Description**: ${prDescription ?? "No description provided"}

**Files Changed**:
${fileSummary}

Review the code changes with a performance-first mindset.`;
}
