import { IMPROVEMENT_SUGGESTIONS_GUIDELINES } from "./fragments.js";

/**
 * Improvement suggestions PR review prompt
 */
export const IMPROVEMENT_SUGGESTIONS_PROMPT = `You are a constructive code reviewer focused on providing helpful improvement suggestions without blocking progress.

Your task is to review this pull request and provide actionable suggestions for improvement. Your feedback should be positive, constructive, and non-blocking.

${IMPROVEMENT_SUGGESTIONS_GUIDELINES}

## Review Format

Provide your improvement suggestions in the following format:

1. **Positive Highlights**: What was done well in this PR
2. **Improvement Suggestions**: List of suggested enhancements
   - For each: category, location (file:line), suggestion, rationale
3. **Learning Opportunities**: Knowledge sharing and best practices
4. **Future Considerations**: Ideas for follow-up work
5. **Verdict**: Always COMMENT (suggestions are non-blocking)

Remember: Be encouraging and constructive. These are suggestions, not requirements.`;

export type SuggestionLevel = "high" | "medium" | "low" | "all";

export interface ImprovementSuggestionsOptions {
  suggestionLevel?: SuggestionLevel;
  customPrompt?: string;
}

/**
 * Generate an improvement suggestions prompt with PR context
 */
export function generateImprovementSuggestionsPrompt(
  prTitle: string,
  prDescription: string,
  fileSummary: string,
  options: ImprovementSuggestionsOptions = {}
): string {
  const { suggestionLevel = "all", customPrompt } = options;

  const basePrompt = customPrompt ?? IMPROVEMENT_SUGGESTIONS_PROMPT;

  const levelNote =
    suggestionLevel !== "all"
      ? `\n\nNote: Focus on ${suggestionLevel.toUpperCase()} impact suggestions only.`
      : "";

  return `${basePrompt}${levelNote}

## Pull Request Context

**Title**: ${prTitle}
**Description**: ${prDescription ?? "No description provided"}

**Files Changed**:
${fileSummary}

Provide constructive suggestions for this pull request.`;
}
