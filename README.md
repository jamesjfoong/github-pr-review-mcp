# GitHub PR Review MCP

A **Model Context Protocol (MCP) server** that provides GitHub PR review capabilities to LLMs in VSCode/Cursor and other compatible AI clients.

## Features

- **PR Review & Analysis** - Fetch reviews, comments, and perform AI-powered code analysis
- **Feedback Management** - Submit reviews, add comments, and update PRs
- **Diff-Aware Comments** - Precise inline comments with diff hunk validation
- **MCP Resources** - Read-only context data for efficient LLM consumption
- **Specialized Prompts** - Security, performance, and documentation review templates
- **Observability** - Structured logging, audit trails, and input sanitization

## Quick Start

### Prerequisites

- Node.js 20.19.0 or higher
- GitHub Personal Access Token with `repo` and `read:user` scopes

### Installation

#### Option 1: Global Installation (Recommended)

```bash
npm install -g github-pr-review-mcp
```

#### Option 2: Development Setup

```bash
git clone https://github.com/jamesjfoong/github-pr-review-mcp.git
cd github-pr-review-mcp
npm install
npm run build
```

### Setup

1. **Get GitHub Token**: Generate a [Personal Access Token](https://github.com/settings/tokens) with scopes:
   - `repo` (full repository access)
   - `read:user` (read user profile data)

2. **Configure Environment**:

   ```bash
   cp .env.example .env
   # Edit .env and add your token:
   GITHUB_TOKEN=your_github_token_here
   ```

3. **Configure in Cursor/VSCode**:
   Add to your MCP settings:

   ```json
   {
     "mcpServers": {
       "github-pr-review": {
         "command": "npx",
         "args": ["github-pr-review-mcp"]
       }
     }
   }
   ```

## Available Tools

| Tool                           | Description                                       | Parameters                                                            |
| ------------------------------ | ------------------------------------------------- | --------------------------------------------------------------------- |
| `get_pr_details`               | Get comprehensive PR information                  | `owner`, `repo`, `prNumber`                                           |
| `get_pr_files`                 | List changed files with stats                     | `owner`, `repo`, `prNumber`                                           |
| `get_pr_reviews`               | Get all reviews for a PR                          | `owner`, `repo`, `prNumber`                                           |
| `get_pr_comments`              | Get all comments on a PR                          | `owner`, `repo`, `prNumber`                                           |
| `get_pr_feedback`              | Get reviews and/or comments with summary          | `owner`, `repo`, `prNumber`, `type?`                                  |
| `get_pr_context`               | Get details and/or files with statistics          | `owner`, `repo`, `prNumber`, `include?`                               |
| `analyze_pr_code`              | AI code analysis with security/quality checks     | `owner`, `repo`, `prNumber`                                           |
| `submit_pr_review`             | Submit a review (approve/request changes/comment) | `owner`, `repo`, `prNumber`, `body`, `event`, `comments?`             |
| `add_pr_comment`               | Add general or line-specific comments             | `owner`, `repo`, `prNumber`, `body`, `path?`, `line?`, `in_reply_to?` |
| `update_pr`                    | Update PR title, description, or state            | `owner`, `repo`, `prNumber`, `title?`, `body?`, `state?`              |
| `get_pr_diff_hunks`            | Get diff hunks with line mapping                  | `owner`, `repo`, `prNumber`                                           |
| `validate_pr_comment_target`   | Validate if a comment target exists in the diff   | `owner`, `repo`, `prNumber`, `path`, `line`, `side?`                  |
| `ensure_pending_review`        | Create or reuse a pending review for drafts       | `owner`, `repo`, `prNumber`, `body?`                                  |
| `get_pending_review`           | Get the current pending review (if any)           | `owner`, `repo`, `prNumber`                                           |
| `list_pending_review_comments` | List all draft comments in the pending review     | `owner`, `repo`, `prNumber`                                           |
| `review_pr_with_prompt`        | Get PR context and review prompt for AI review    | `owner`, `repo`, `prNumber`, `customPrompt?`                          |

### Tool Arguments

**Get PR Feedback (`get_pr_feedback`)**:

- `type`: `"reviews"` | `"comments"` | `"all"` (default: `"all"`)

**Get PR Context (`get_pr_context`)**:

- `include`: `"details"` | `"files"` | `"all"` (default: `"all"`)

## Available Resources

MCP Resources provide read-only access to PR and repository data.

| Resource URI                             | Description                                      |
| ---------------------------------------- | ------------------------------------------------ |
| `pr://{owner}/{repo}/{prNumber}`         | PR metadata (title, description, state, metrics) |
| `pr://{owner}/{repo}/{prNumber}/files`   | Changed files with additions, deletions, patches |
| `pr://{owner}/{repo}/{prNumber}/reviews` | Historical reviews and comments                  |
| `repo://{owner}/{repo}`                  | Repository info (branches, settings, metadata)   |

## Available Prompts

Specialized review prompt templates for focused analysis.

| Prompt                    | Description                               | Arguments                                       |
| ------------------------- | ----------------------------------------- | ----------------------------------------------- |
| `review_pr_security`      | Security-focused review with OWASP checks | `owner`, `repo`, `prNumber`, `severityLevel?`   |
| `review_pr_performance`   | Performance bottleneck and optimization   | `owner`, `repo`, `prNumber`, `focusArea?`       |
| `review_pr_documentation` | Documentation completeness review         | `owner`, `repo`, `prNumber`, `docType?`         |
| `suggest_pr_improvements` | Constructive suggestions (non-blocking)   | `owner`, `repo`, `prNumber`, `suggestionLevel?` |

### Prompt Arguments

- **Security**: `severityLevel` - `"strict"` | `"standard"` | `"relaxed"`
- **Performance**: `focusArea` - `"database"` | `"algorithm"` | `"memory"` | `"network"` | `"all"`
- **Documentation**: `docType` - `"code"` | `"api"` | `"readme"` | `"all"`
- **Improvements**: `suggestionLevel` - `"high"` | `"medium"` | `"low"` | `"all"`

## Usage Examples

### Review a PR

```
1. get_pr_context(owner: "microsoft", repo: "vscode", prNumber: 123)
2. analyze_pr_code(owner: "microsoft", repo: "vscode", prNumber: 123)
3. submit_pr_review(owner: "microsoft", repo: "vscode", prNumber: 123, body: "LGTM!", event: "APPROVE")
```

### Draft Review with Inline Comments

```
1. ensure_pending_review(owner: "owner", repo: "repo", prNumber: 123)
2. validate_pr_comment_target(owner: "owner", repo: "repo", prNumber: 123, path: "src/main.ts", line: 45)
3. add_pr_comment(owner: "owner", repo: "repo", prNumber: 123, body: "Consider refactoring", path: "src/main.ts", line: 45)
4. submit_pr_review(owner: "owner", repo: "repo", prNumber: 123, body: "See inline comments", event: "COMMENT")
```

### Security-Focused Review

```
1. review_pr_security(owner: "owner", repo: "repo", prNumber: 123, severityLevel: "strict")
2. submit_pr_review(..., event: "REQUEST_CHANGES")
```

## Observability

### Structured Logging

All tool operations are logged in JSON format to stderr:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "tool": "submit_pr_review",
  "action": "submit",
  "duration": 1250,
  "success": true
}
```

### Debug Mode

Enable verbose logging:

```bash
DEBUG=true npx github-pr-review-mcp
```

## Development

### Project Structure

```
github-pr-review-mcp/
├── src/
│   ├── index.ts          # Main MCP server entry point
│   ├── github-service.ts # GitHub API integration
│   ├── code-analyzer.ts  # Code analysis engine
│   ├── types.ts          # TypeScript type definitions
│   ├── logger.ts         # Structured logging
│   ├── sanitizer.ts      # Input sanitization
│   └── prompts/          # Specialized prompt templates
├── dist/                 # Compiled output
└── package.json
```

### Scripts

- `npm run build` - Compile TypeScript
- `npm run dev` - Development mode with auto-reload
- `npm run validate` - Type-check, lint, and format check
- `npm start` - Run compiled server

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run `npm run validate` before committing
4. Submit a pull request

## Troubleshooting

**"GITHUB_TOKEN environment variable is required"**

- Copy `.env.example` to `.env` and add your GitHub token

**Rate limiting**

- The server includes automatic rate limiting and retry logic
- GitHub API: 5,000 requests/hour for authenticated requests

**Permission errors**

- Ensure your token has `repo` scope for the target repositories

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**James Jeremy Foong** - [@jamesjfoong](https://github.com/jamesjfoong)
