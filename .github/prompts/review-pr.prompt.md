# Review Pull Request

## Task

Perform a comprehensive code review of a GitHub pull request, analyzing code quality, security, and best practices.

## Steps

1. Get PR details using `get_pr_details` to understand the context
2. Retrieve changed files using `get_pr_files` to see what was modified
3. Run automated code analysis using `analyze_pr_code` for security and quality checks
4. Review existing comments and reviews using `get_pr_comments` and `get_pr_reviews`
5. Analyze the code changes for:
   - Security vulnerabilities (API keys, secrets, XSS, injection)
   - Code quality issues (console.logs, debugger statements, TypeScript any types)
   - Best practices violations
   - Performance concerns
   - Test coverage gaps
6. Provide constructive feedback with specific line references
7. Submit review using `submit_pr_review` with appropriate event (APPROVE, REQUEST_CHANGES, or COMMENT)

## Output Format

- Summary of changes
- Security issues (if any) - must be addressed
- Code quality concerns
- Suggestions for improvement
- Overall assessment

## Guidelines

- Be constructive and specific
- Reference exact file paths and line numbers
- Prioritize security issues
- Consider the PR size and complexity
- Check for test coverage
