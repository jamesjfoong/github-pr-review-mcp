# Implement PR Review Feedback

## Task

Implement changes requested in PR review comments and respond to reviewers.

## Steps

1. Get PR reviews using `get_pr_reviews` to see all feedback
2. Get PR comments using `get_pr_comments` for additional context
3. Get PR files using `get_pr_files` to understand current state
4. For each review comment:
   - Identify the file and line number
   - Understand the requested change
   - Implement the fix in the codebase
   - Verify the change addresses the concern
5. Add comments using `add_pr_comment` to:
   - Acknowledge feedback
   - Explain implemented changes
   - Ask clarifying questions if needed
6. Update PR description using `update_pr` if significant changes were made

## Best Practices

- Address all security-related feedback immediately
- Test changes before responding
- Be specific in your responses
- Reference the original comment when replying
- Use line-specific comments for code changes

## Response Template

```
✅ Fixed: [Brief description]
- Changed [specific change]
- Addresses concern from [reviewer] about [issue]
```
