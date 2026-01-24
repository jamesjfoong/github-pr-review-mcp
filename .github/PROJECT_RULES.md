# Project Rules Overview

This directory contains project rules and configuration for IDEs and development tools.

## Rule Files

### IDE-Specific Rules

- **`cursorrules`** - Cursor IDE rules (symlinked to `.cursorrules` at root)
- **`vscode-rules.md`** - VS Code IDE rules

### Code Quality Rules

- **`.editorconfig`** (at root) - Editor configuration for all IDEs
- **`.prettierrc`** (at root) - Prettier code formatting rules
- **`eslint.config.js`** (at root) - ESLint linting rules
- **`tsconfig.json`** (at root) - TypeScript compiler configuration

## Maintenance

### Single Source of Truth

- **Cursor rules**: Maintained in `.github/cursorrules`, symlinked to `.cursorrules`
- **VS Code rules**: Maintained in `.github/vscode-rules.md`
- **Code quality configs**: Maintained at project root (standard locations)

### Updating Rules

1. **Cursor rules**: Edit `.github/cursorrules` (changes reflect in `.cursorrules` via symlink)
2. **VS Code rules**: Edit `.github/vscode-rules.md`
3. **Code quality**: Edit respective config files at root

## Rule Categories

### 1. IDE Rules (`.github/`)

- Project context and standards
- Agent persona guidance
- Task-specific instructions
- File organization

### 2. Code Quality (root)

- Formatting (Prettier)
- Linting (ESLint)
- Type checking (TypeScript)
- Editor settings (EditorConfig)

## Structure

```
.github/
├── cursorrules          # Cursor IDE rules (→ .cursorrules)
├── vscode-rules.md      # VS Code IDE rules
└── PROJECT_RULES.md     # This file

Root:
├── .cursorrules         # Symlink to .github/cursorrules
├── .editorconfig        # Editor settings
├── .prettierrc          # Prettier config
├── eslint.config.js     # ESLint config
└── tsconfig.json        # TypeScript config
```

## Best Practices

1. **Keep IDE rules in sync**: When updating project standards, update both `cursorrules` and `vscode-rules.md`
2. **Reference instructions**: Link to `.github/instructions/` files for detailed guidelines
3. **Maintain consistency**: Ensure all rule files align with project standards
4. **Document changes**: Update this file when adding new rule files
