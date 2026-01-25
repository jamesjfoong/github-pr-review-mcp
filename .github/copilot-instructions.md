# GitHub Copilot Instructions for GitHub PR Review MCP

## Project Context

This is a **Model Context Protocol (MCP) server** that provides GitHub PR review capabilities to AI clients. Built with TypeScript, FastMCP, and GitHub API.

## Architecture

### Core Files

- `src/index.ts` - Register MCP tools here
- `src/github-service.ts` - All GitHub API calls go through this service
- `src/code-analyzer.ts` - Static code analysis (pure functions)
- `src/types.ts` - Zod schemas and TypeScript types
- `src/review-prompt.ts` - Review prompt generation

### Adding New Tools (3 Steps)

1. Define Zod schema in `types.ts`
2. Add service method in `github-service.ts` using `this.octokit`
3. Register tool in `index.ts` with `server.addTool()`

## Code Standards

- **TypeScript**: Strict mode, ES2022 modules
- **Strong typing**: Always use explicit, strong types. Use Zod schemas for runtime validation, define explicit `interface` or `type` for TypeScript
- **Use `?` for optional**: Use optional properties (`?`) and optional chaining for accessing values
- **Style**: 2 spaces, double quotes, semicolons required, 80 char max line
- **Naming**: kebab-case files, PascalCase classes, camelCase functions
- **Imports**: External → internal, sorted alphabetically, use `.js` extension

## Critical Rules

**DO:**

- Use `GitHubService` for all GitHub API calls
- Define Zod schemas in `types.ts` for all parameters
- Run `npm run validate` before committing
- Handle errors with try-catch, log with `console.error`
- Update README.md when adding tools

**DON'T:**

- Edit `dist/` files (generated)
- Use `any` unnecessarily
- Bypass service layer
- Skip validation
- Break existing functionality

## Error Handling

Always wrap GitHub API calls in try-catch:

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

## Commands

- `npm run validate` - Run all checks
- `npm run build` - Compile TypeScript
- `npm run dev` - Development mode

## Documentation

See `README.md` for comprehensive project documentation.
