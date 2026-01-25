/**
 * Prompt module exports
 * All specialized review prompts and fragment utilities
 */

// Fragments
export {
  buildPromptFromFragments,
  CODE_QUALITY_GUIDELINES,
  DOCUMENTATION_GUIDELINES,
  IMPROVEMENT_SUGGESTIONS_GUIDELINES,
  PERFORMANCE_GUIDELINES,
  SECURITY_GUIDELINES,
} from "./fragments.js";

// Security prompt
export {
  generateSecurityReviewPrompt,
  SECURITY_REVIEW_PROMPT,
  type SecuritySeverityLevel,
} from "./security.js";

// Performance prompt
export {
  generatePerformanceReviewPrompt,
  PERFORMANCE_REVIEW_PROMPT,
  type PerformanceFocusArea,
} from "./performance.js";

// Documentation prompt
export {
  DOCUMENTATION_REVIEW_PROMPT,
  type DocumentationType,
  generateDocumentationReviewPrompt,
} from "./documentation.js";

// Improvement suggestions prompt
export {
  generateImprovementSuggestionsPrompt,
  IMPROVEMENT_SUGGESTIONS_PROMPT,
  type SuggestionLevel,
} from "./improvements.js";
