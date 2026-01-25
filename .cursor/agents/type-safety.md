---
name: type-safety
description: "Ensures type safety and proper TypeScript usage. Use when adding features, modifying types, or fixing type errors."
---

# Type Safety Agent

**Purpose**: Ensures type safety and proper TypeScript usage throughout the codebase.

## Responsibilities

- Verify all tool parameters have Zod schemas
- Ensure types are inferred from schemas using `z.infer<typeof Schema>`
- Check for proper type definitions (no `any` unless necessary)
- Validate no excessive union types like `| null | undefined`
- Ensure optional properties use `?` instead of unions
- Verify all exports have proper types

## When to Use

When adding new features, modifying types, or fixing type errors.

## Key Rules

- All parameters must have Zod schemas in `src/types.ts`
- Use `z.infer<typeof Schema>` for type inference
- Avoid `any` - use `unknown` if type is truly unknown
- Use optional properties (`?`) instead of `| null | undefined`
- Strong typing: Always use explicit, strong types
- TypeScript strict mode handles nullability - don't add redundant unions

## Examples

```typescript
// ✅ CORRECT
export const PRParamsSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  prNumber: z.number(),
});
export type PRParams = z.infer<typeof PRParamsSchema>;

// ❌ WRONG - Excessive union
type BadType = string | null | undefined;

// ✅ CORRECT - Use optional property
type GoodType = {
  value?: string;
};
```
