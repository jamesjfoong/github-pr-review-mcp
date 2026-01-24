# Security Audit for Pull Request

## Task

Perform a focused security audit of a pull request, identifying vulnerabilities and security risks.

## Steps

1. Get PR files using `get_pr_files` to see all changes
2. Run code analysis using `analyze_pr_code` for automated security checks
3. Manually review code for:
   - Hardcoded credentials, API keys, or secrets
   - SQL injection vulnerabilities
   - XSS vulnerabilities
   - Insecure authentication/authorization
   - Unsafe deserialization
   - Missing input validation
   - Insecure dependencies
   - Exposed sensitive data
4. Check for security-related patterns:
   - Environment variable usage (should not be hardcoded)
   - Password handling
   - Token management
   - Encryption/decryption
   - File upload handling
   - API endpoint security
5. Submit security review using `submit_pr_review` with inline comments

## Security Checklist

- [ ] No hardcoded secrets or credentials
- [ ] Input validation present
- [ ] Authentication/authorization properly implemented
- [ ] No SQL injection risks
- [ ] No XSS vulnerabilities
- [ ] Secure error handling (no sensitive data leakage)
- [ ] Dependencies are up-to-date and secure
- [ ] Sensitive data properly encrypted

## Severity Levels

- **Critical**: Must fix before merge (secrets, injection vulnerabilities)
- **High**: Should fix before merge (authentication issues, XSS)
- **Medium**: Should address soon (missing validation, weak encryption)
- **Low**: Best practice improvements (logging, error messages)
