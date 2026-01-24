# TypeScript Coding Standards

## Type Safety

- **Never use `any` type** - Use `unknown` or proper types instead
- Prefer type inference where possible
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use Zod schemas for runtime validation

## Code Organization

- One class/interface per file
- Use named exports over default exports
- Group related functionality together
- Keep functions focused and single-purpose

## Naming Conventions

- Classes: PascalCase (`GitHubService`)
- Functions/Methods: camelCase (`getPRDetails`)
- Constants: UPPER_SNAKE_CASE (`GITHUB_TOKEN`)
- Interfaces/Types: PascalCase (`PRParams`)
- Private members: camelCase with underscore prefix (`private _octokit`)

## Error Handling

- Always handle errors explicitly
- Use try-catch blocks for async operations
- Provide meaningful error messages
- Log errors appropriately
- Never swallow errors silently

## Async/Await

- Prefer async/await over promises
- Handle promise rejections properly
- Use Promise.all for parallel operations
- Avoid nested async/await when possible

## Code Quality

- Maximum function length: 50 lines
- Maximum file length: 300 lines
- Use early returns to reduce nesting
- Extract complex logic into helper functions
- Add JSDoc comments for public APIs

## Examples

### Good

```typescript
interface PRParams {
  owner: string;
  repo: string;
  prNumber: number;
}

async function getPRDetails(params: PRParams): Promise<PRDetails> {
  try {
    const response = await octokit.pulls.get(params);
    return transformResponse(response.data);
  } catch (error) {
    throw new Error(`Failed to get PR details: ${error}`);
  }
}
```

### Bad

```typescript
async function getPRDetails(params: any): Promise<any> {
  const response = await octokit.pulls.get(params);
  return response.data;
}
```
