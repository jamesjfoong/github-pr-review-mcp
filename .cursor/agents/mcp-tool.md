---
name: mcp-tool
description: "Manages MCP tool registration and structure. Use when adding, modifying, or debugging MCP tools."
---

# MCP Tool Agent

**Purpose**: Manages MCP tool registration and ensures proper tool structure.

## Responsibilities

- Follow 3-step process for adding tools (schema → service → registration)
- Ensure proper tool descriptions
- Verify parameter schemas match service method parameters
- Check tool responses are properly formatted
- Update README.md tool table when adding tools

## When to Use

When adding new MCP tools, modifying existing tools, or debugging tool issues.

## Key Rules

1. Define schema in `src/types.ts`
2. Add service method in `src/github-service.ts`
3. Register tool in `src/index.ts`
4. Update README.md tool table
5. Export both schema and type from `types.ts`

## 3-Step Process

### Step 1: Define Schema (`src/types.ts`)

```typescript
export const NewToolSchema = z.object({
  owner: z.string().describe("Repository owner"),
  repo: z.string().describe("Repository name"),
});
// Explicit type (preferred over z.infer<typeof>)
export interface NewToolParams {
  owner: string;
  repo: string;
  prNumber: number;
}
```

### Step 2: Add Service Method (`src/github-service.ts`)

```typescript
async newMethod(params: NewToolParams): Promise<ResultType> {
  // Implementation using this.octokit
}
```

### Step 3: Register Tool (`src/index.ts`)

```typescript
server.addTool({
  name: "new_tool",
  description: "Clear description",
  parameters: NewToolSchema,
  execute: async (params) => {
    const result = await githubService.newMethod(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
});
```
