#!/bin/bash
# Generate documentation from prompts, instructions, and agents

set -e

DOCS_DIR="docs/agent-docs"
mkdir -p "$DOCS_DIR"

echo "📚 Generating agent documentation..."

# Combine prompts
echo "# Prompts Reference" > "$DOCS_DIR/prompts.md"
echo "" >> "$DOCS_DIR/prompts.md"
for file in .github/prompts/*.prompt.md; do
    if [ -f "$file" ]; then
        echo "## $(basename "$file" .prompt.md)" >> "$DOCS_DIR/prompts.md"
        echo "" >> "$DOCS_DIR/prompts.md"
        cat "$file" >> "$DOCS_DIR/prompts.md"
        echo "" >> "$DOCS_DIR/prompts.md"
    fi
done

# Combine instructions
echo "# Coding Standards and Guidelines" > "$DOCS_DIR/instructions.md"
echo "" >> "$DOCS_DIR/instructions.md"
for file in .github/instructions/*.instructions.md; do
    if [ -f "$file" ]; then
        echo "## $(basename "$file" .instructions.md)" >> "$DOCS_DIR/instructions.md"
        echo "" >> "$DOCS_DIR/instructions.md"
        cat "$file" >> "$DOCS_DIR/instructions.md"
        echo "" >> "$DOCS_DIR/instructions.md"
    fi
done

# Combine agents
echo "# AI Agent Personas" > "$DOCS_DIR/agents.md"
echo "" >> "$DOCS_DIR/agents.md"
for file in .github/agents/*.agent.md; do
    if [ -f "$file" ]; then
        echo "## $(basename "$file" .agent.md)" >> "$DOCS_DIR/agents.md"
        echo "" >> "$DOCS_DIR/agents.md"
        cat "$file" >> "$DOCS_DIR/agents.md"
        echo "" >> "$DOCS_DIR/agents.md"
    fi
done

# Combine skills
echo "# AI Skills and Capabilities" > "$DOCS_DIR/skills.md"
echo "" >> "$DOCS_DIR/skills.md"
for file in .github/skills/*.skill.md; do
    if [ -f "$file" ]; then
        echo "## $(basename "$file" .skill.md)" >> "$DOCS_DIR/skills.md"
        echo "" >> "$DOCS_DIR/skills.md"
        cat "$file" >> "$DOCS_DIR/skills.md"
        echo "" >> "$DOCS_DIR/skills.md"
    fi
done

echo "✅ Documentation generated in $DOCS_DIR"

