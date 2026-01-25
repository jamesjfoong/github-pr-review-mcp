# GitHub PR Review MCP - Agent Instructions

MCP server providing GitHub PR review capabilities. Built with TypeScript, FastMCP, and GitHub API.

## Quick Reference

| File                    | Purpose                               |
| ----------------------- | ------------------------------------- |
| `src/index.ts`          | Register MCP tools                    |
| `src/github-service.ts` | GitHub API calls (use `this.octokit`) |
| `src/code-analyzer.ts`  | Static analysis (pure functions)      |
| `src/types.ts`          | Zod schemas + TypeScript types        |

## Core Rules

- **All GitHub API calls** go through `GitHubService`
- **All tool parameters** need Zod schemas in `types.ts`
- **Strong typing** - avoid `any`, use explicit `interface` or `type` definitions
- **No excessive unions** - use `?` instead of `| null | undefined`
- **Run `npm run validate`** before committing

## Adding Tools (3 Steps)

1. Schema in `types.ts`
2. Service method in `github-service.ts`
3. Register in `index.ts`

## Code Style

- 2 spaces, double quotes, semicolons
- kebab-case files, PascalCase classes, camelCase functions
- 80 char max line length

## Commands

```bash
npm run validate  # Type-check + lint + format
npm run dev       # Development mode
npm run build     # Production build
```

## Error Handling

```typescript
try {
  const result = await this.octokit.pulls.get({...});
  return result.data;
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Error fetching PR:", message);
  throw new Error(`Failed to fetch PR: ${message}`);
}
```

## Documentation

- `README.md` - Update tool table when adding tools
- `docs/AI_CODE_EDITOR_GUIDE.md` - Full guidelines
