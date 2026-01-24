# MCP Tool Definition Skill

## Capability

Define and implement MCP tools using FastMCP framework with proper validation and error handling.

## Tool Structure

```typescript
server.addTool({
  name: "tool_name",
  description: "Clear description",
  parameters: ZodSchema,
  execute: async (params: ValidatedParams) => {
    // Implementation
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
});
```

## Components

### Schema Definition

- Use Zod for parameter validation
- Provide clear field descriptions
- Define required vs optional fields
- Use appropriate Zod types

### Tool Implementation

- Validate inputs automatically
- Handle errors gracefully
- Return standard MCP format
- Provide meaningful responses

### Response Format

```typescript
{
  content: [
    {
      type: "text",
      text: JSON.stringify(data, null, 2),
    },
  ],
}
```

## Best Practices

- **Clear Names**: Use descriptive, action-oriented names
- **Comprehensive Descriptions**: Explain what the tool does
- **Proper Validation**: Use Zod schemas for all parameters
- **Error Handling**: Catch and handle errors appropriately
- **Consistent Format**: Use standard response format
- **Type Safety**: Use TypeScript types throughout

## Common Patterns

### Simple Read Operation

```typescript
server.addTool({
  name: "get_resource",
  description: "Get resource details",
  parameters: ResourceSchema,
  execute: async (params) => {
    const data = await service.getResource(params);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
});
```

### Write Operation with Confirmation

```typescript
server.addTool({
  name: "update_resource",
  description: "Update a resource",
  parameters: UpdateSchema,
  execute: async (params) => {
    await service.updateResource(params);
    return {
      content: [{ type: "text", text: "✅ Resource updated successfully" }],
    };
  },
});
```

## Error Handling

- Validate at schema level
- Handle service errors
- Provide user-friendly messages
- Log errors for debugging
