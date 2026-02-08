# Project Rules

## TypeScript Configuration

- **Strict Null Checks**: `strictNullChecks` is intentionally DISABLED (`false`) in `tsconfig.json`. Do not enable it or suggest enabling it.
- **Type Definitions**:
  - **Avoid Unions**: Do not use verbose type unions like `string | null | undefined`. Prefer strict base types (`string`, `number`) in interfaces where possible.
  - **Boundary Handling**: Handle null/undefined checks at the data boundary (e.g., API response mapping) rather than propagating potential nulls throughout the application logic.

## Code Style

- Keep interfaces clean and readable.
- Prioritize developer experience over strict type purity.
