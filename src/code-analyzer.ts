import type { AnalysisResult, CodeFile, CodeIssue } from "./types";

export class CodeAnalyzer {
  private securityPatterns = [
    {
      pattern: /api[_-]?key\s*[:=]\s*["'][^"']+["']/gi,
      message: "Potential API key exposure",
    },
    {
      pattern: /password\s*[:=]\s*["'][^"']+["']/gi,
      message: "Hardcoded password detected",
    },
    {
      pattern: /(secret|token)\s*[:=]\s*["'][^"']+["']/gi,
      message: "Potential secret exposure",
    },
    { pattern: /eval\s*\(/g, message: "Dangerous eval() usage" },
    { pattern: /innerHTML\s*=/g, message: "Potential XSS vulnerability" },
  ];

  private codeSmellPatterns = [
    {
      pattern: /console\.(log|error|warn|debug)/g,
      message: "Console statement left in code",
    },
    { pattern: /debugger/g, message: "Debugger statement found" },
    { pattern: /:\s*any\s*[,;)]/g, message: 'TypeScript "any" type used' },
    { pattern: /TODO|FIXME|HACK/gi, message: "TODO/FIXME comment found" },
  ];

  analyze(files: CodeFile[]): AnalysisResult {
    const issues: CodeIssue[] = [];
    let totalAdditions = 0;
    let totalDeletions = 0;

    for (const file of files) {
      totalAdditions += file.additions;
      totalDeletions += file.deletions;

      if (!file.patch || this.isBinaryFile(file.filename)) continue;

      // Analyze added lines only
      const lines = file.patch.split("\n");
      let currentLine = 0;

      for (const line of lines) {
        if (line.startsWith("@@")) {
          const match = line.match(/@@ -\d+,?\d* \+(\d+)/);
          if (match) currentLine = parseInt(match[1]) - 1;
          continue;
        }

        if (line.startsWith("+") && !line.startsWith("+++")) {
          currentLine++;
          const content = line.substring(1);

          // Check security patterns
          this.checkPatterns(
            content,
            file.filename,
            currentLine,
            this.securityPatterns,
            "security",
            "high",
            issues
          );

          // Check code smells
          this.checkPatterns(
            content,
            file.filename,
            currentLine,
            this.codeSmellPatterns,
            "warning",
            "medium",
            issues
          );
        } else if (!line.startsWith("-")) {
          currentLine++;
        }
      }

      // File-level checks
      if (file.additions > 300) {
        issues.push({
          type: "suggestion",
          severity: "medium",
          file: file.filename,
          message: "Large file change (>300 lines)",
          suggestion: "Consider breaking into smaller commits",
        });
      }
    }

    const securityIssues = issues.filter((i) => i.type === "security").length;
    const suggestions = this.generateSuggestions(files, issues);
    const assessment = this.determineAssessment(issues);

    return {
      summary: {
        totalFiles: files.length,
        totalAdditions,
        totalDeletions,
        issuesFound: issues.length,
        securityIssues,
      },
      issues,
      suggestions,
      assessment,
    };
  }

  private checkPatterns(
    content: string,
    filename: string,
    line: number,
    patterns: Array<{ pattern: RegExp; message: string }>,
    type: CodeIssue["type"],
    severity: CodeIssue["severity"],
    issues: CodeIssue[]
  ): void {
    for (const { pattern, message } of patterns) {
      if (pattern.test(content)) {
        issues.push({ type, severity, file: filename, line, message });
      }
    }
  }

  private generateSuggestions(
    files: CodeFile[],
    issues: CodeIssue[]
  ): string[] {
    const suggestions: string[] = [];

    if (issues.some((i) => i.type === "security")) {
      suggestions.push("⚠️ Security issues detected - fix before merging");
    }

    const totalChanges = files.reduce(
      (sum, f) => sum + f.additions + f.deletions,
      0
    );
    if (totalChanges > 500) {
      suggestions.push("📦 Large PR - consider splitting into smaller changes");
    }

    const hasTests = files.some(
      (f) => f.filename.includes("test") || f.filename.includes("spec")
    );
    if (!hasTests && totalChanges > 50) {
      suggestions.push("🧪 Consider adding tests for these changes");
    }

    return suggestions;
  }

  private determineAssessment(
    issues: CodeIssue[]
  ): AnalysisResult["assessment"] {
    if (issues.some((i) => i.type === "security")) return "requires-changes";
    if (issues.filter((i) => i.severity === "high").length > 0)
      return "requires-changes";
    if (issues.length > 5) return "needs-work";
    return "approved";
  }

  private isBinaryFile(filename: string): boolean {
    return /\.(jpg|jpeg|png|gif|pdf|zip|exe|bin)$/i.test(filename);
  }
}
