# Cursor IDE Agent Resources

This directory contains symlinks to agent resources for Cursor IDE integration.

## Structure

All directories are symlinked from `.github/`:

- `prompts/` → `../.github/prompts/` - Task-specific prompts
- `instructions/` → `../.github/instructions/` - Coding standards and guidelines
- `agents/` → `../.github/agents/` - AI agent personas
- `collections/` → `../.github/collections/` - Curated collections
- `skills/` → `../.github/skills/` - AI capabilities

## Usage

Cursor IDE will automatically discover these resources when working in this project. The symlinks ensure that:

1. Resources are accessible from the `.cursor/` directory
2. Changes to source files are immediately reflected
3. No duplication of files is needed

## File Types

- `.prompt.md` - Task-specific prompts for common workflows
- `.instructions.md` - Coding standards and best practices
- `.agent.md` - AI persona definitions for specialized modes
- `.collection.yml` - Curated collections of related items
- `.skill.md` - AI capability definitions
