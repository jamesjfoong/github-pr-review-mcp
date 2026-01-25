---
name: add-mcp-tool
description: "Add new MCP tools to the server. Use when creating new GitHub PR review capabilities."
---

# Add MCP Tool

## When to Use

When adding a new GitHub PR review capability to the MCP server.

## Steps

### 1. Define Schema (`src/types.ts`)

```typescript
// Schema for runtime validation
export const NewToolSchema = z.object({
  owner: z.string().describe("Repository owner/organization"),
  repo: z.string().describe("Repository name"),
  prNumber: z.number().describe("Pull request number"),
});

// Explicit type definition (preferred)
export interface NewToolParams {
  owner: string;
  repo: string;
  prNumber: number;
}
```

### 2. Add Service Method (`src/github-service.ts`)

```typescript
async newMethod(params: NewToolParams): Promise<ResultType> {
  try {
    const result = await this.octokit.pulls.get({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
    });
    return result.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in newMethod:", message);
    throw new Error(`Failed to execute newMethod: ${message}`);
  }
}
```

### 3. Register Tool (`src/index.ts`)

```typescript
server.addTool({
  name: "new_tool_name",
  description: "Clear description of what this tool does",
  parameters: NewToolSchema,
  execute: async (params: NewToolParams) => {
    const result = await githubService.newMethod(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
});
```

### 4. Update Documentation

Update `README.md` tool table with the new tool.
