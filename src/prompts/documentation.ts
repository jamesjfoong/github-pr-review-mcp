import { DOCUMENTATION_GUIDELINES } from "./fragments.js";

/**
 * Documentation-focused PR review prompt
 */
export const DOCUMENTATION_REVIEW_PROMPT = `You are a documentation-focused code reviewer ensuring code changes are properly documented for maintainability.

Your task is to review this pull request for documentation completeness and quality.

${DOCUMENTATION_GUIDELINES}

## Review Format

Provide your documentation review in the following format:

1. **Documentation Summary**: Brief overview of documentation status
2. **Missing Documentation**: List of areas needing documentation
   - For each: requirement level, location (file:line), what's needed
3. **Documentation Quality**: Assessment of existing documentation
4. **Suggestions**: Recommended documentation improvements
5. **Verdict**: APPROVE (well-documented), REQUEST_CHANGES (critical gaps), or COMMENT (suggestions only)

Focus exclusively on documentation concerns. Be specific about what documentation is needed.`;

export type DocumentationType = "code" | "api" | "readme" | "all";

/**
 * Generate a documentation-focused review prompt with PR context
 */
export function generateDocumentationReviewPrompt(
  prTitle: string,
  prDescription: string,
  fileSummary: string,
  docType: DocumentationType = "all"
): string {
  const focusNote =
    docType !== "all"
      ? `\n\nNote: Focus primarily on ${docType.toUpperCase()} documentation.`
      : "";

  return `${DOCUMENTATION_REVIEW_PROMPT}${focusNote}

## Pull Request Context

**Title**: ${prTitle}
**Description**: ${prDescription ?? "No description provided"}

**Files Changed**:
${fileSummary}

Review the code changes for documentation completeness.`;
}
