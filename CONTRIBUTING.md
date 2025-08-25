# Contributing to GitHub PR Review MCP

Thank you for your interest in contributing! This document outlines the process and guidelines for contributing to this project.

## Development Setup

### Prerequisites

- Node.js 20.19.0 or higher
- npm 10+
- Git
- A GitHub account and Personal Access Token

### Setup Steps

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/github-pr-review-mcp.git
   cd github-pr-review-mcp
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   # Add your GitHub token to .env
   ```

4. **Build and Test**

   ```bash
   npm run build          # Build TypeScript
   npm run validate       # Run all checks (type-check, lint, format)
   npm run dev            # Test in development mode
   ```

## Development Workflow

### Making Changes

1. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow TypeScript best practices
   - Add type definitions for new functionality
   - Update documentation as needed

3. **Test and Validate Your Changes**

   ```bash
   npm run validate    # Run type-check, linting, and format check
   npm run build       # Ensure TypeScript compiles
   npm run dev         # Test in development mode
   ```

4. **Commit Changes** (Husky hooks will run automatically)

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   # Pre-commit hook runs: lint-staged (ESLint + Prettier)
   # Pre-push hook runs: type-check
   ```

### Commit Message Convention

We use conventional commits. Format: `type(scope): description`

**Types:**

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```cli
feat(github): add support for draft PRs
fix(analyzer): resolve security pattern false positives
docs(readme): update installation instructions
```

## Code Standards

### Development Workflow

Our project uses automated tools to maintain code quality:

- **ESLint**: Catches code issues and enforces standards
- **Prettier**: Automatic code formatting
- **Husky**: Git hooks for pre-commit/pre-push checks
- **TypeScript**: Strict type checking

### Available Scripts

| Script                 | Description                           |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Development mode with hot reload      |
| `npm run build`        | Build TypeScript to JavaScript        |
| `npm run lint`         | Check code with ESLint                |
| `npm run lint:fix`     | Fix ESLint issues automatically       |
| `npm run format`       | Format code with Prettier             |
| `npm run format:check` | Check if code is formatted            |
| `npm run type-check`   | Run TypeScript type checking          |
| `npm run validate`     | Run all checks (type + lint + format) |

### Git Hooks (Automatic)

- **Pre-commit**: Runs `lint-staged` (ESLint + Prettier on changed files)
- **Pre-push**: Runs `type-check` to ensure no TypeScript errors

### TypeScript Guidelines

- Use strict TypeScript settings (already configured)
- Prefer explicit types over `any` (warnings are acceptable for external APIs)
- Add JSDoc comments for public APIs
- Follow existing code style and naming conventions

### Code Style

Our ESLint and Prettier configurations handle most formatting automatically:

- **Indentation**: 2 spaces
- **Quotes**: Double quotes for strings
- **Semicolons**: Always required
- **Line endings**: LF (Unix-style)
- **Max line length**: 80 characters
- **Trailing commas**: ES5 style

### File Structure

```bash
src/
├── index.ts          # Main MCP server - add new tools here
├── github-service.ts # GitHub API methods - add new API calls here
├── code-analyzer.ts  # Code analysis logic - add new analyzers here
├── types.ts         # Type definitions - add new schemas/types here
```

### Adding New MCP Tools

1. **Define Schema** in `types.ts`:

   ```typescript
   export const NewToolSchema = z.object({
     param1: z.string().describe("Parameter description"),
     param2: z.number().optional().describe("Optional parameter"),
   });

   export type NewToolParams = z.infer<typeof NewToolSchema>;
   ```

2. **Add Service Method** in `github-service.ts`:

   ```typescript
   async newMethod(params: NewToolParams): Promise<ResultType> {
     // Implementation using this.octokit
   }
   ```

3. **Register MCP Tool** in `index.ts`:

   ```typescript
   server.addTool({
     name: "new_tool_name",
     description: "Clear description of what this tool does",
     parameters: NewToolSchema,
     execute: async (params: NewToolParams) => {
       const result = await githubService.newMethod(params);
       return {
         content: [
           {
             type: "text",
             text: JSON.stringify(result, null, 2),
           },
         ],
       };
     },
   });
   ```

## Testing

Currently, testing is manual. To test your changes:

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Test with a real PR** (use your own test repository):

   ```bash
   # Test the built server
   echo '{"method": "tools/call", "params": {"name": "get_pr_details", "arguments": {"owner": "your-user", "repo": "test-repo", "prNumber": 1}}}' | node dist/index.js
   ```

3. **Test in Cursor/VSCode** by configuring the MCP server and trying the tools

## Documentation

### When to Update Documentation

- **Adding new tools**: Update README.md tool table and examples
- **Changing existing behavior**: Update relevant documentation
- **Bug fixes**: Update troubleshooting section if applicable

### Documentation Style

- Use clear, concise language
- Include code examples where helpful
- Use emoji sparingly and consistently
- Keep examples up-to-date with actual API

## Pull Request Process

### Before Submitting

1. ✅ All checks pass (`npm run validate`)
2. ✅ Code compiles without errors (`npm run build`)
3. ✅ Code is properly formatted (`npm run format`)
4. ✅ No linting errors (`npm run lint`)
5. ✅ Follows TypeScript and code standards
6. ✅ Documentation updated if needed
7. ✅ Tested manually with real GitHub repositories

### PR Guidelines

1. **Use the PR template** (if available)
2. **Clear title and description** explaining the change
3. **Reference issues** with `Fixes #123` or `Closes #123`
4. **Keep PRs focused** - one feature/fix per PR
5. **Update CHANGELOG** for user-facing changes

### Review Process

1. Maintainer will review within 3-7 days
2. Address any feedback or requested changes
3. Once approved, maintainer will merge

## Issue Reporting

### Bug Reports

Include:

- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS)
- Error messages/logs
- Example repository/PR if possible

### Feature Requests

Include:

- Use case description
- Proposed solution
- Alternative solutions considered
- Implementation willingness

## Architecture Notes

### MCP Server Structure

The server follows FastMCP patterns:

- **Tools** are the main interface - each tool does one thing well
- **GitHub Service** abstracts GitHub API complexity
- **Code Analyzer** provides intelligent analysis features
- **Type-safe** with Zod schemas for all parameters

### Key Dependencies

- **FastMCP**: MCP server framework
- **@octokit/rest**: GitHub API client
- **Zod**: Runtime type validation
- **TypeScript**: Type safety and modern JavaScript

### Extension Points

- **New analyzers**: Add to `code-analyzer.ts`
- **New GitHub APIs**: Add to `github-service.ts`
- **New MCP tools**: Add to `index.ts`
- **New parameter types**: Add to `types.ts`

## Questions?

- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Bug reports**: Use GitHub Issues
- 📧 **Direct contact**: Email maintainer for sensitive issues

Thank you for contributing! 🎉
