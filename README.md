# GitHub PR Review MCP

A **Model Context Protocol (MCP) server** that provides GitHub PR review capabilities to LLMs in VSCode/Cursor and other compatible AI clients.

## Features

### 🔍 **MVP Feature 1: Review PRs in GitHub**

- **Get PR Reviews** - Fetch all existing reviews for analysis
- **Get PR Comments** - Retrieve all comments and discussions
- **Analyze PR Code** - AI-powered code analysis with security checks and suggestions
- **Get PR Files** - List all changed files with additions/deletions
- **Get PR Details** - Comprehensive PR information including status, author, metrics

### ✍️ **MVP Feature 2: Implement Feedback & Reply to Reviews**

- **Submit PR Review** - Submit complete reviews with approval/changes/comments
- **Add Comments** - Add general or line-specific comments to PRs
- **Reply to Reviews** - Respond to existing review comments
- **Update PRs** - Modify PR title, description, or state

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
   Add to your MCP settings (usually in `~/Library/Application Support/Cursor/User/globalStorage/rooveterinaryinc.cursor-small/settings/cline_mcp_settings.json`):

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

| Tool               | Description                                       | Parameters                                                            |
| ------------------ | ------------------------------------------------- | --------------------------------------------------------------------- |
| `get_pr_reviews`   | Get all reviews for a PR                          | `owner`, `repo`, `prNumber`                                           |
| `get_pr_comments`  | Get all comments on a PR                          | `owner`, `repo`, `prNumber`                                           |
| `analyze_pr_code`  | AI code analysis with security/quality checks     | `owner`, `repo`, `prNumber`                                           |
| `get_pr_files`     | List changed files with stats                     | `owner`, `repo`, `prNumber`                                           |
| `get_pr_details`   | Get comprehensive PR information                  | `owner`, `repo`, `prNumber`                                           |
| `submit_pr_review` | Submit a review (approve/request changes/comment) | `owner`, `repo`, `prNumber`, `body`, `event`, `comments?`             |
| `add_pr_comment`   | Add general or line-specific comments             | `owner`, `repo`, `prNumber`, `body`, `path?`, `line?`, `in_reply_to?` |
| `update_pr`        | Update PR title, description, or state            | `owner`, `repo`, `prNumber`, `title?`, `body?`, `state?`              |

## Usage Examples

### Example 1: Review a PR

```
🤖: Please review PR #123 in microsoft/vscode

1. Get PR details: get_pr_details(owner: "microsoft", repo: "vscode", prNumber: 123)
2. Get changed files: get_pr_files(owner: "microsoft", repo: "vscode", prNumber: 123)
3. Analyze code: analyze_pr_code(owner: "microsoft", repo: "vscode", prNumber: 123)
4. Submit review: submit_pr_review(owner: "microsoft", repo: "vscode", prNumber: 123, body: "LGTM! Great work on...", event: "APPROVE")
```

### Example 2: Implement Feedback

```
🤖: The reviewer asked me to fix the error handling in line 45 of src/utils.ts

1. Add line comment: add_pr_comment(owner: "owner", repo: "repo", prNumber: 123, body: "Fixed error handling as requested", path: "src/utils.ts", line: 45)
2. Update PR description: update_pr(owner: "owner", repo: "repo", prNumber: 123, body: "Updated PR description with changes made...")
```

### Example 3: Automated Code Analysis

The `analyze_pr_code` tool automatically detects:

- 🔒 **Security issues**: API key exposure, hardcoded passwords, XSS vulnerabilities
- 🧹 **Code smells**: Console statements, debugger statements, TypeScript `any` types
- 📊 **Quality metrics**: Large file changes, missing tests, complexity analysis
- ✅ **Suggestions**: Breaking large PRs, adding tests, security improvements

## Development

### Project Structure

```
github-pr-review-mcp/
├── src/
│   ├── index.ts          # Main MCP server entry point
│   ├── github-service.ts # GitHub API integration
│   ├── code-analyzer.ts  # Code analysis engine
│   └── types.ts          # TypeScript type definitions
├── dist/                 # Compiled JavaScript output
├── scripts/
│   └── setup.sh          # Automated setup script
└── package.json
```

### Scripts

- `npm run build` - Compile TypeScript
- `npm run dev` - Development mode with auto-reload
- `npm start` - Run compiled server
- `npm run prepublishOnly` - Build before publishing

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Run `npm run build` to ensure it compiles
6. Submit a pull request

### API Requirements

Your GitHub token needs these permissions:

- **Repository access**: `repo` scope for private repos, or `public_repo` for public repos only
- **User data**: `read:user` for accessing user profile information
- **Optional**: `write:discussion` for advanced discussion features

## Troubleshooting

### Common Issues

**1. "GITHUB_TOKEN environment variable is required"**

- Solution: Copy `.env.example` to `.env` and add your GitHub token

**2. "Cannot find module" errors**

- Solution: Run `npm install` to install dependencies

**3. Rate limiting**

- The server includes automatic rate limiting and retry logic
- GitHub API has limits: 5,000 requests/hour for authenticated requests

**4. Permission errors**

- Ensure your GitHub token has `repo` scope for the repositories you want to access
- For organization repos, you may need additional permissions

### Debug Mode

Enable debug logging by setting in your `.env`:

```bash
DEBUG=true
```

## Roadmap

### Future Features

- 🔄 **Auto-merge** capabilities
- 🧪 **Test execution** integration
- 📈 **PR metrics** and analytics
- 🤖 **Automated code fixes** based on review comments
- 🔍 **Advanced search** and filtering
- 📊 **Reporting** and dashboards

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📚 **Documentation**: [GitHub Wiki](https://github.com/jamesjfoong/github-pr-review-mcp/wiki)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/jamesjfoong/github-pr-review-mcp/discussions)
- 🐛 **Issues**: [Report bugs](https://github.com/jamesjfoong/github-pr-review-mcp/issues)
- 🔒 **Security**: See [SECURITY.md](SECURITY.md)

## Author

**James Jeremy Foong** - [@jamesjfoong](https://github.com/jamesjfoong)

---

⭐ **Star this repo** if you find it useful!

🐛 **Report issues** on [GitHub Issues](https://github.com/jamesjfoong/github-pr-review-mcp/issues)

🤝 **Contributing** is welcome! See our contributing guidelines above.
