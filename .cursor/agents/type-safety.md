---
name: type-safety
description: "Ensures type safety and proper TypeScript usage. Use when adding features, modifying types, or fixing type errors."
---

# Type Safety Agent

**Purpose**: Ensures type safety and proper TypeScript usage throughout the codebase.

## Responsibilities

- Verify all tool parameters have Zod schemas
- Prefer explicit `interface` or `type` definitions over `z.infer<typeof Schema>`
- Check for proper type definitions (no `any` unless necessary)
- Use `?` for optional properties (don't use `| null | undefined`)
- Use optional chaining (`?.`) when accessing values
- Verify all exports have proper types

## When to Use

When adding new features, modifying types, or fixing type errors.

## Key Rules

- All parameters must have Zod schemas in `src/types.ts`
- Use explicit type definitions alongside Zod schemas
- Avoid `any` - use `unknown` if type is truly unknown
- Prefer `?` over `| undefined` for optional fields
- Use `| null` when external APIs can return null
- Strong typing: Always use explicit, strong types

## Examples

```typescript
// CORRECT - Explicit type definition with Zod schema
export const PRParamsSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  prNumber: z.number(),
});

export interface PRParams {
  owner: string;
  repo: string;
  prNumber: number;
}

// CORRECT - Use optional property
interface GoodType {
  value?: string;
}

// CORRECT - Use optional chaining when accessing
const result = obj?.value ?? "default";
```
