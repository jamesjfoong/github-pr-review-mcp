# VS Code Project Rules

This file contains project rules for VS Code IDE. For Cursor IDE, see `cursorrules` (symlinked to `.cursorrules`).

## Project Context

This is a GitHub PR Review MCP server built with TypeScript, FastMCP, and Octokit.

## Code Standards

- Follow TypeScript best practices (see `instructions/typescript-standards.instructions.md`)
- Use Zod schemas for validation
- Implement proper error handling
- Follow MCP server guidelines (see `instructions/mcp-server-guidelines.instructions.md`)

## Agent Personas

When reviewing code or PRs, use the appropriate agent persona:

- `agents/pr-reviewer.agent.md` - General code review
- `agents/security-auditor.agent.md` - Security-focused review
- `agents/code-analyzer.agent.md` - Automated analysis

## Common Tasks

- Use prompts from `prompts/` directory for task-specific guidance
- Reference collections in `collections/` for patterns and tools
- Apply skills from `skills/` for specialized capabilities

## File Organization

- Source code in `src/`
- Compiled output in `dist/`
- Documentation in `docs/`
- Agent resources in `.github/` (this directory)

## Key Dependencies

- FastMCP for MCP server framework
- Octokit for GitHub API
- Zod for validation
- TypeScript for type safety

## Editor Configuration

- Use `.editorconfig` for editor settings
- Use `.prettierrc` for code formatting
- Use `eslint.config.js` for linting rules
