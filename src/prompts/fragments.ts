/**
 * Reusable prompt fragments for composable review prompts
 */

export const SECURITY_GUIDELINES = `
### Security Review Guidelines

Focus on identifying security vulnerabilities and risks:

- **Input Validation**: Check for missing or improper validation of user input
- **Injection Attacks**: Look for SQL injection, XSS, command injection risks
- **Authentication**: Verify proper authentication and session management
- **Authorization**: Check for broken access control and privilege escalation
- **Secrets Exposure**: Look for hardcoded credentials, API keys, tokens
- **Cryptography**: Verify proper use of encryption and secure algorithms
- **Error Handling**: Check that errors don't leak sensitive information
- **Dependencies**: Flag known vulnerable dependencies
- **OWASP Top 10**: Apply OWASP security best practices

Severity Levels:
- CRITICAL: Exploitable vulnerability that could lead to data breach
- HIGH: Security flaw that could be exploited with some effort
- MEDIUM: Security weakness that should be addressed
- LOW: Minor security improvement opportunity
`;

export const PERFORMANCE_GUIDELINES = `
### Performance Review Guidelines

Focus on identifying performance bottlenecks and optimization opportunities:

- **Algorithm Efficiency**: Check time and space complexity
- **Database Queries**: Look for N+1 queries, missing indexes, inefficient joins
- **Memory Management**: Identify memory leaks, excessive allocations
- **Network Calls**: Check for unnecessary or unoptimized API calls
- **Caching**: Identify opportunities for caching
- **Async Operations**: Verify proper use of async/await and parallelization
- **Resource Usage**: Check for proper cleanup and resource management
- **Scalability**: Consider impact under high load
- **Bundle Size**: For frontend, check for code splitting opportunities

Impact Levels:
- CRITICAL: Major performance issue affecting user experience
- HIGH: Significant performance degradation under load
- MEDIUM: Performance improvement opportunity
- LOW: Minor optimization suggestion
`;

export const DOCUMENTATION_GUIDELINES = `
### Documentation Review Guidelines

Focus on ensuring code is properly documented:

- **Code Comments**: Check for clear inline comments where needed
- **Function/Method Docs**: Verify JSDoc/docstrings with params and returns
- **README Updates**: Check if README needs updates for new features
- **API Documentation**: Verify endpoints are documented
- **Type Definitions**: Check for proper TypeScript types/interfaces
- **Examples**: Look for missing usage examples
- **Changelog**: Verify changes are documented in changelog
- **Migration Guides**: Check if breaking changes need migration docs

Documentation Levels:
- REQUIRED: Critical documentation missing
- RECOMMENDED: Documentation would improve clarity
- OPTIONAL: Nice-to-have documentation enhancement
`;

export const CODE_QUALITY_GUIDELINES = `
### Code Quality Review Guidelines

Focus on code maintainability and best practices:

- **Code Smells**: Identify anti-patterns and technical debt
- **DRY Principle**: Look for code duplication
- **SOLID Principles**: Check adherence to SOLID design principles
- **Naming**: Verify clear, descriptive variable and function names
- **Complexity**: Flag overly complex functions (high cyclomatic complexity)
- **Testing**: Check for adequate test coverage
- **Error Handling**: Verify proper error handling and recovery
- **Consistency**: Check for consistent code style
- **Readability**: Ensure code is easy to understand

Quality Levels:
- CRITICAL: Must fix before merge
- HIGH: Should fix, affects maintainability
- MEDIUM: Recommended improvement
- LOW: Style preference or minor enhancement
`;

export const IMPROVEMENT_SUGGESTIONS_GUIDELINES = `
### Improvement Suggestions Guidelines

Focus on constructive, actionable suggestions without blocking:

- **Refactoring Opportunities**: Suggest ways to improve code structure
- **Design Patterns**: Recommend applicable design patterns
- **Best Practices**: Share industry best practices
- **Testing Improvements**: Suggest better test coverage or strategies
- **Future-Proofing**: Recommend changes for better extensibility
- **Developer Experience**: Suggest improvements for DX
- **Code Organization**: Recommend better file/module organization

Note: These are suggestions only, not blockers. Be positive and constructive.

Suggestion Categories:
- ARCHITECTURE: Structural improvements
- PATTERNS: Design pattern recommendations
- TESTING: Test coverage and quality
- REFACTORING: Code cleanup opportunities
- DOCUMENTATION: Documentation enhancements
`;

/**
 * Build a composite prompt from multiple fragments
 */
export function buildPromptFromFragments(
  fragments: string[],
  basePrompt: string
): string {
  return `${basePrompt}\n\n${fragments.join("\n\n")}`;
}
