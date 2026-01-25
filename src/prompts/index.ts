/**
 * Prompt module exports
 */

export {
  type AnalysisPromptParams,
  CODE_ANALYSIS_SYSTEM_PROMPT,
  generateAnalysisUserMessage,
} from "./analysis.js";

export {
  buildPromptFromFragments,
  CODE_QUALITY_GUIDELINES,
  DOCUMENTATION_GUIDELINES,
  IMPROVEMENT_SUGGESTIONS_GUIDELINES,
  PERFORMANCE_GUIDELINES,
  SECURITY_GUIDELINES,
} from "./fragments.js";

export {
  type DocumentationReviewOptions,
  type DocumentationType,
  DOCUMENTATION_REVIEW_PROMPT,
  generateDocumentationReviewPrompt,
} from "./documentation.js";

export {
  generateImprovementSuggestionsPrompt,
  IMPROVEMENT_SUGGESTIONS_PROMPT,
  type ImprovementSuggestionsOptions,
  type SuggestionLevel,
} from "./improvements.js";

export {
  generatePerformanceReviewPrompt,
  PERFORMANCE_REVIEW_PROMPT,
  type PerformanceFocusArea,
  type PerformanceReviewOptions,
} from "./performance.js";

export {
  generateSecurityReviewPrompt,
  SECURITY_REVIEW_PROMPT,
  type SecurityReviewOptions,
  type SecuritySeverityLevel,
} from "./security.js";
