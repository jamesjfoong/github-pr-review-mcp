import { SECURITY_GUIDELINES } from "./fragments.js";

/**
 * Security-focused PR review prompt
 */
export const SECURITY_REVIEW_PROMPT = `You are a security-focused code reviewer with expertise in application security, OWASP guidelines, and secure coding practices.

Your task is to perform a thorough security review of this pull request, identifying potential vulnerabilities and security risks.

${SECURITY_GUIDELINES}

## Review Format

Provide your security review in the following format:

1. **Security Summary**: Brief overview of security posture
2. **Vulnerabilities Found**: List of identified security issues
   - For each: severity, location (file:line), description, remediation
3. **Security Best Practices**: Recommendations for improvement
4. **Dependencies**: Any vulnerable dependencies detected
5. **Verdict**: APPROVE (secure), REQUEST_CHANGES (vulnerabilities found), or COMMENT (suggestions only)

Focus exclusively on security concerns. Be thorough and specific with your findings.`;

export type SecuritySeverityLevel = "strict" | "standard" | "relaxed";

/**
 * Generate a security-focused review prompt with PR context
 */
export function generateSecurityReviewPrompt(
  prTitle: string,
  prDescription: string,
  fileSummary: string,
  severityLevel: SecuritySeverityLevel = "standard"
): string {
  const severityNote =
    severityLevel === "strict"
      ? "\n\nNote: Apply STRICT security standards. Flag any potential security concerns, even minor ones."
      : severityLevel === "relaxed"
        ? "\n\nNote: Apply RELAXED security standards. Focus only on critical and high severity issues."
        : "";

  return `${SECURITY_REVIEW_PROMPT}${severityNote}

## Pull Request Context

**Title**: ${prTitle}
**Description**: ${prDescription ?? "No description provided"}

**Files Changed**:
${fileSummary}

Review the code changes with a security-first mindset.`;
}
