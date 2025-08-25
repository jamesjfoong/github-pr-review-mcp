# Security Policy

## Supported Versions

We actively support and provide security updates for the following versions:

| Version | Supported |
| ------- | --------- |
| 1.x.x   | ✅ Yes    |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

### 🔒 Private Disclosure

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please:

1. **Email**: Send details to [security@yourdomain.com] or create a private vulnerability report on GitHub
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

### 🕒 Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Varies by severity (1-30 days)

### 🏆 Recognition

We appreciate security researchers and will:

- Acknowledge your responsible disclosure
- Keep you updated on our progress
- Credit you in our security advisory (if desired)

## Security Best Practices

### For Users

1. **Environment Variables**: Never commit `.env` files or expose GitHub tokens
2. **Token Scope**: Use minimal required scopes for GitHub Personal Access Tokens
3. **Regular Updates**: Keep the package updated to the latest version
4. **Network Security**: Use in trusted environments only

### For Contributors

1. **Code Review**: All code changes require review
2. **Dependency Auditing**: Run `npm audit` regularly
3. **Static Analysis**: Use ESLint rules to catch potential issues
4. **Input Validation**: All user inputs are validated with Zod schemas

## Common Security Considerations

### GitHub Token Security

- **Required Scopes**: `repo`, `read:user`
- **Storage**: Store in environment variables, never in code
- **Rotation**: Regularly rotate tokens
- **Access**: Use organization tokens for org repos

### API Rate Limiting

- Built-in rate limiting protection
- Automatic retry with exponential backoff
- Graceful degradation on API limits

### Data Handling

- No sensitive data stored locally
- All GitHub API calls use HTTPS
- Minimal data retention (in-memory only)

## Vulnerability Examples

### ❌ Insecure

```typescript
// Never do this
const token = "ghp_xxxxxxxxxxxx";
console.log("Using token:", token);
```

### ✅ Secure

```typescript
// Always do this
const token = process.env.GITHUB_TOKEN;
if (!token) {
  throw new Error("GITHUB_TOKEN required");
}
// Use token without logging
```

## Security Updates

Security updates will be:

- Released as patch versions (x.x.1)
- Documented in CHANGELOG.md
- Announced in GitHub releases
- Tagged with `security` label

Stay updated by:

- Watching this repository
- Subscribing to release notifications
- Following security advisories
