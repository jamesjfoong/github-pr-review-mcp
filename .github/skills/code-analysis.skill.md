# Code Analysis Skill

## Capability

Automated static code analysis for security vulnerabilities, code quality issues, and best practices violations.

## Input

- Code files (with patches/diffs)
- File metadata (additions, deletions, status)

## Process

1. **Pattern Matching**: Apply security and quality patterns
2. **Line Analysis**: Scan added lines for issues
3. **File Analysis**: Check file-level metrics
4. **Aggregation**: Compile findings into structured report

## Output

- Structured analysis result with:
  - Summary statistics
  - List of issues (type, severity, location)
  - Suggestions for improvement
  - Overall assessment

## Patterns Detected

### Security

- API key exposure
- Hardcoded passwords
- Secret leakage
- Dangerous eval() usage
- XSS vulnerabilities

### Quality

- Console statements
- Debugger statements
- TypeScript any types
- TODO/FIXME comments

### Metrics

- Large file changes
- Large PR size
- Missing tests

## Assessment Logic

- **approved**: No critical issues
- **needs-work**: Some issues found
- **requires-changes**: Critical security issues

## Limitations

- Pattern-based (not semantic analysis)
- Cannot detect runtime issues
- May have false positives/negatives
- Should complement manual review

## Usage

```typescript
const analyzer = new CodeAnalyzer();
const result = analyzer.analyze(files);
```
