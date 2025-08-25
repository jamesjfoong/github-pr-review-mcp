# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-08-25

### Added
- **MVP Feature 1: Review PRs in GitHub**
  - `get_pr_reviews` - Get all reviews for a GitHub pull request
  - `get_pr_comments` - Get all comments on a GitHub pull request  
  - `analyze_pr_code` - AI-powered code analysis with security checks and suggestions
  - `get_pr_files` - Get list of files changed in a pull request
  - `get_pr_details` - Get detailed information about a pull request

- **MVP Feature 2: Implement feedback & reply to reviews**
  - `submit_pr_review` - Submit a review to a pull request (approve/request changes/comment)
  - `add_pr_comment` - Add comments to PRs (general or line-specific)
  - `update_pr` - Update PR title, description, or state

- **Code Analysis Features**
  - Security pattern detection (API keys, passwords, secrets)
  - Code smell detection (console statements, debugger, any types)
  - Quality metrics (large file changes, missing tests)
  - Automated suggestions for improvements

- **Developer Tools & Infrastructure**
  - ESLint configuration with TypeScript support
  - Prettier code formatting
  - Husky git hooks (pre-commit, pre-push)
  - GitHub Actions CI/CD pipeline
  - Automated npm publishing on tag release
  - VSCode/Cursor workspace settings
  - EditorConfig for consistent development

- **Documentation**
  - Comprehensive README with installation and usage examples
  - Contributing guidelines with development workflow
  - GitHub issue templates for bugs and feature requests
  - MIT license
  - Complete API documentation for all MCP tools

### Technical Details
- FastMCP framework for MCP server implementation
- GitHub REST API integration with Octokit
- TypeScript strict mode with comprehensive type safety
- Rate limiting and error handling for GitHub API calls
- Zod schemas for runtime parameter validation
- Support for Node.js 20.19.0+

[Unreleased]: https://github.com/jamesjfoong/github-pr-review-mcp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/jamesjfoong/github-pr-review-mcp/releases/tag/v1.0.0
