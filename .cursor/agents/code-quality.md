---
name: code-quality
description: "Ensures code follows project standards. Use before committing, when reviewing PRs, or fixing code quality issues."
---

# Code Quality Agent

**Purpose**: Ensures code follows project standards and best practices.

## Responsibilities

- Verify code follows ESLint rules
- Check Prettier formatting
- Ensure naming conventions are followed
- Validate import organization
- Check for unused variables
- Verify error handling patterns

## When to Use

Before committing code, when reviewing PRs, or when fixing code quality issues.

## Key Rules

- Run `npm run validate` before committing
- Fix linting issues with `npm run lint:fix`
- Format code with `npm run format`
- Follow naming conventions (kebab-case files, PascalCase classes, camelCase functions)
- Organize imports: external → internal, sorted alphabetically
- Use 2 spaces indentation
- Double quotes for strings
- Semicolons required
- 80 character max line length

## Validation Checklist

- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Prettier formatting applied
- [ ] No unused variables
- [ ] Proper error handling
- [ ] Naming conventions followed
- [ ] Imports organized correctly
