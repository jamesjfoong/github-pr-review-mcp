# MCP Server Development Guidelines

## FastMCP Framework

This project uses FastMCP for building MCP servers. Follow these patterns:

## Tool Definition

- Use Zod schemas for parameter validation
- Provide clear, descriptive tool names
- Include comprehensive descriptions
- Use proper TypeScript types

## Tool Structure

```typescript
server.addTool({
  name: "tool_name",
  description: "Clear description of what the tool does",
  parameters: ZodSchema,
  execute: async (params: ValidatedParams) => {
    // Implementation
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
});
```

## Error Handling

- Validate all inputs using Zod schemas
- Handle API errors gracefully
- Return meaningful error messages
- Log errors to stderr (console.error)

## Response Format

- Always return content in the standard MCP format
- Use JSON.stringify with proper formatting
- Include relevant metadata when useful
- Keep responses concise but informative

## Environment Variables

- Load environment variables using dotenv
- Validate required environment variables at startup
- Provide clear error messages for missing variables
- Never commit secrets to version control

## Rate Limiting

- Implement rate limiting for external APIs
- Use exponential backoff for retries
- Handle rate limit errors gracefully
- Log rate limit events

## Testing

- Test each tool independently
- Mock external API calls
- Test error scenarios
- Validate parameter schemas

## Best Practices

- Keep tools focused on single responsibilities
- Reuse common patterns across tools
- Document complex logic
- Use TypeScript strict mode
- Follow the existing code structure
