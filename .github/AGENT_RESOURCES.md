# Agent Resources for Cursor and VS Code

This directory contains agent resources that work with both Cursor IDE and VS Code.

## Structure

```
.github/
├── agents/          # AI agent personas (.agent.md)
├── collections/     # Curated collections (.collection.yml)
├── instructions/    # Coding standards (.instructions.md)
├── prompts/         # Task-specific prompts (.prompt.md)
└── skills/          # AI capabilities (.skill.md)
```

## IDE Integration

### Cursor IDE

- Resources are symlinked to `.cursor/` directory
- Cursor automatically discovers resources in `.cursor/`
- Single source of truth: edit files in `.github/`, changes reflect in `.cursor/`

### VS Code

- VS Code can read directly from `.github/` directory
- Some VS Code extensions may also check `.vscode/` (can be symlinked if needed)
- Configuration typically in `.vscode/settings.json` if needed

## File Types

### Prompts (`.prompt.md`)

Task-specific instructions for common workflows:

- `review-pr.prompt.md` - PR review workflow
- `implement-feedback.prompt.md` - Implementing review feedback
- `security-audit.prompt.md` - Security audit workflow

### Instructions (`.instructions.md`)

Coding standards and best practices:

- `typescript-standards.instructions.md` - TypeScript guidelines
- `mcp-server-guidelines.instructions.md` - MCP server patterns
- `github-api-patterns.instructions.md` - GitHub API integration

### Agents (`.agent.md`)

AI persona definitions:

- `pr-reviewer.agent.md` - General code review persona
- `security-auditor.agent.md` - Security-focused persona
- `code-analyzer.agent.md` - Automated analysis persona

### Collections (`.collection.yml`)

Curated collections of related items:

- `mcp-tools.collection.yml` - All MCP tools reference
- `security-patterns.collection.yml` - Security patterns catalog
- `typescript-patterns.collection.yml` - TypeScript patterns

### Skills (`.skill.md`)

AI capability definitions:

- `code-analysis.skill.md` - Code analysis capability
- `github-api-integration.skill.md` - GitHub API integration
- `mcp-tool-definition.skill.md` - MCP tool definition patterns

## Maintenance

**Single Source of Truth**: All files are maintained in `.github/` directory only.

- Edit files in `.github/` directories
- Changes automatically reflect in `.cursor/` via symlinks
- No need to maintain duplicate files
- Git tracks only the `.github/` files

## Verification

To verify symlinks are working:

```bash
# Check symlinks
ls -la .cursor/

# Test file access
cat .cursor/prompts/review-pr.prompt.md
cat .github/prompts/review-pr.prompt.md
# Both should show same content
```

## Adding New Resources

1. Create file in appropriate `.github/` subdirectory
2. Symlink will automatically work (already set up)
3. Update `.cursorrules` if referencing new resource
4. Test in both Cursor and VS Code
