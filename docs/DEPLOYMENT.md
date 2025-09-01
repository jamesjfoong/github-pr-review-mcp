# Deployment Guide

This guide covers how to deploy the GitHub PR Review MCP server to various platforms.

## 🚀 Quick Deployment

### GitHub Repository Setup

1. **Create GitHub Repository**

   ```bash
   # Create repo on GitHub: https://github.com/new
   # Name: github-pr-review-mcp
   # Description: MCP server for GitHub PR reviews and code analysis
   ```

2. **Push Code**

   ```bash
   git init
   git add .
   git commit -m "feat: initial release v1.0.0"
   git branch -M main
   git remote add origin https://github.com/jamesjfoong/github-pr-review-mcp.git
   git push -u origin main
   ```

3. **Enable GitHub Features**
   - Go to Settings → General → Features
   - ✅ Enable Issues
   - ✅ Enable Discussions
   - ✅ Enable Wiki
   - Go to Settings → Pages → Enable GitHub Pages (optional)

## 📦 NPM Publishing

### Setup NPM Account

1. Create account at https://www.npmjs.com/
2. Enable 2FA for security
3. Generate access token: https://www.npmjs.com/settings/tokens
4. Add token to GitHub Secrets

### Manual Publish

```bash
# Set NPM token for authentication
export NPM_TOKEN=your_npm_access_token

# Login to npm (alternative to token)
npm login

# Publish (runs validation automatically via prepublishOnly)
npm publish --access public
```

### Automated Publishing via GitHub Actions

1. **Add NPM Token to GitHub Secrets**
   - Go to repo Settings → Secrets and variables → Actions
   - Add secret: `NPM_TOKEN` = your npm access token

2. **Create Release Tag**

   ```bash
   # Tag version (triggers automated release)
   git tag v1.0.0
   git push origin v1.0.0

   # GitHub Actions will:
   # ✅ Run CI pipeline (test, lint, build)
   # ✅ Create GitHub release
   # ✅ Publish to npm automatically
   ```

3. **Future Releases**

   ```bash
   # Update version in package.json
   npm version patch   # 1.0.0 → 1.0.1
   npm version minor   # 1.0.0 → 1.1.0
   npm version major   # 1.0.0 → 2.0.0

   # Push tag
   git push origin v1.0.1
   ```

## 🔧 CI/CD Pipeline Details

### GitHub Actions Workflows

**`.github/workflows/ci.yml`** - Continuous Integration

- Triggers: Push to main/develop, PRs to main
- Node.js versions: 20.19.0, 20.x, 22.x
- Steps: Install → Type-check → Lint → Format → Build → Test
- Security audit and dependency checks

**`.github/workflows/release.yml`** - Automated Releases

- Triggers: Git tags (`v*`)
- Steps: Validate → Build → Create GitHub Release → Publish to npm
- Automatic release notes from CHANGELOG.md

### Required GitHub Secrets

| Secret         | Purpose         | How to Get                            |
| -------------- | --------------- | ------------------------------------- |
| `NPM_TOKEN`    | npm publishing  | https://www.npmjs.com/settings/tokens |
| `GITHUB_TOKEN` | GitHub releases | Automatically provided                |

## 📊 Monitoring & Maintenance

### NPM Package Stats

- View downloads: https://www.npmjs.com/package/github-pr-review-mcp
- Monitor usage trends
- Check for security advisories

### GitHub Repository Health

- **Issues**: Monitor and respond to bug reports
- **Discussions**: Community Q&A and feature requests
- **Pull Requests**: Review contributions
- **Security**: Regular dependency updates via Dependabot

### Version Management

```bash
# Check current version
npm version

# View all versions
npm view github-pr-review-mcp versions --json

# Deprecate old version (if needed)
npm deprecate github-pr-review-mcp@1.0.0 "Please upgrade to 1.1.0"
```

## 🛡️ Security Considerations

### Secrets Management

- Never commit API tokens
- Use GitHub Secrets for CI/CD
- Rotate tokens regularly
- Monitor for token exposure

### Package Security

- Enable npm 2FA
- Use `npm audit` regularly
- Monitor security advisories
- Keep dependencies updated

### Repository Security

- Enable branch protection rules
- Require PR reviews
- Enable security alerts
- Use signed commits (optional)

## 🌐 Distribution Platforms

### Primary Distribution

- **npm Registry**: https://www.npmjs.com/package/github-pr-review-mcp
- **GitHub Releases**: https://github.com/jamesjfoong/github-pr-review-mcp/releases

### Alternative Distributions (Future)

- **GitHub Packages**: npm registry alternative
- **Docker Hub**: Containerized distribution
- **Homebrew**: macOS package manager
- **Snap Store**: Linux universal packages

## 📈 Release Checklist

Before each release:

- [ ] Update CHANGELOG.md with new features/fixes
- [ ] Bump version in package.json
- [ ] Run `npm run validate` locally
- [ ] Test with real GitHub repositories
- [ ] Update documentation if needed
- [ ] Create and push git tag
- [ ] Verify CI/CD pipeline success
- [ ] Monitor npm download stats
- [ ] Announce release (Twitter, Discord, etc.)

## 🚨 Rollback Procedure

If a release has issues:

1. **Immediate Response**

   ```bash
   # Deprecate problematic version
   npm deprecate github-pr-review-mcp@1.0.1 "Has critical bug, use 1.0.0"
   ```

2. **Quick Fix**

   ```bash
   # Fix issue, bump patch version
   npm version patch
   git push origin v1.0.2
   ```

3. **Communication**
   - Post GitHub issue explaining the problem
   - Update CHANGELOG.md
   - Notify users via release notes

---

**Ready to deploy!** 🎉

Follow the steps above to get your MCP server live and available to the community.
