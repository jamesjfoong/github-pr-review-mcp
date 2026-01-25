# AI Code Editor Guide

Comprehensive guidelines for AI code editors working with this repository.

## Project Overview

**GitHub PR Review MCP Server** - A Model Context Protocol (MCP) server providing GitHub PR review capabilities to AI clients. Built with TypeScript (ES2022), FastMCP framework, and GitHub REST API.

## Architecture

```
src/
├── index.ts          # MCP server entry point (register tools)
├── github-service.ts # GitHub API layer (ALL API calls here)
├── code-analyzer.ts  # Static analysis (pure functions)
├── review-prompt.ts  # Prompt generation
└── types.ts          # Zod schemas + TypeScript types
```

## Adding New MCP Tools

### 1. Define Schema (`src/types.ts`)

```typescript
export const NewToolSchema = z.object({
  owner: z.string().describe("Repository owner"),
  repo: z.string().describe("Repository name"),
  prNumber: z.number().describe("Pull request number"),
});
export type NewToolParams = z.infer<typeof NewToolSchema>;
```

### 2. Add Service Method (`src/github-service.ts`)

```typescript
async newMethod(params: NewToolParams): Promise<ResultType> {
  try {
    const result = await this.octokit.rest.pulls.get({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
    });
    return result.data;
  } catch (error) {
    console.error("Error:", error);
    throw new Error(`Failed: ${error.message}`);
  }
}
```

### 3. Register Tool (`src/index.ts`)

```typescript
server.addTool({
  name: "new_tool",
  description: "Tool description",
  parameters: NewToolSchema,
  execute: async (params) => {
    const result = await githubService.newMethod(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
});
```

### 4. Update Documentation

Update `README.md` tool table.

## Code Standards

### TypeScript

- **Strict mode**: Always enabled
- **Strong typing**: Avoid `any`, use `z.infer<typeof Schema>`
- **No excessive unions**: Use `?` instead of `| null | undefined`
- **Zod schemas**: Required for all tool parameters
- **ES2022 modules**: Use `import`/`export`
- **Import extensions**: Use `.js` for compiled output

### Style (Auto-enforced)

- 2 spaces indentation
- Double quotes
- Semicolons required
- 80 character max line length
- LF line endings

### Naming

- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

## Critical Rules

### DO

- Use `GitHubService` for all GitHub API calls
- Define Zod schemas in `types.ts`
- Run `npm run validate` before committing
- Handle errors with try-catch
- Log errors with `console.error`
- Update README when adding tools

### DON'T

- Edit `dist/` files
- Use `any` unnecessarily
- Bypass service layer
- Skip validation
- Expose sensitive info in errors

## Commands

| Command            | Purpose                    |
| ------------------ | -------------------------- |
| `npm run validate` | Type-check + lint + format |
| `npm run dev`      | Development mode           |
| `npm run build`    | Production build           |
| `npm run lint:fix` | Auto-fix linting           |
| `npm run format`   | Format code                |

## Error Handling

```typescript
try {
  const result = await this.octokit.rest.pulls.get({...});
  return result.data;
} catch (error) {
  console.error("Error:", error);
  throw new Error(`Failed: ${error.message}`);
}
```

## Environment

- **Node.js**: 20.19.0+ (or 22.12.0+, 23+)
- **Required**: `GITHUB_TOKEN` environment variable

## AI Configuration Files

| File                              | Purpose              |
| --------------------------------- | -------------------- |
| `.cursor/rules/main.mdc`          | Cursor project rules |
| `.cursor/agents/*.md`             | Cursor subagents     |
| `.cursor/skills/*/SKILL.md`       | Cursor skills        |
| `.github/copilot-instructions.md` | GitHub Copilot       |
| `AGENTS.md`                       | General AI editors   |
