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
- Validate no excessive union types like `| null | undefined`
- Ensure optional properties use `?` instead of unions
- Verify all exports have proper types

## When to Use

When adding new features, modifying types, or fixing type errors.

## Key Rules

- All parameters must have Zod schemas in `src/types.ts`
- Use explicit type definitions alongside Zod schemas
- Avoid `any` - use `unknown` if type is truly unknown
- Use optional properties (`?`) instead of `| null | undefined`
- Strong typing: Always use explicit, strong types
- TypeScript strict mode handles nullability - don't add redundant unions

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

// WRONG - Excessive union
type BadType = string | null | undefined;

// CORRECT - Use optional property
interface GoodType {
  value?: string;
}
```
